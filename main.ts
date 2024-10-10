import {
  Application,
  Router,
  Context,
  type RouterContext,
} from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { client } from "./db.ts";
import { REQUEST_LIMIT } from "./secret.ts";

const app = new Application();
const router = new Router();

const requestCounts = new Map<
  string,
  { count: number; lastRequestTime: number }
>();

const RATE_LIMIT = Number(REQUEST_LIMIT) || 10;
const TIME_WINDOW = 24 * 60 * 60 * 1000;

async function rateLimit(context: Context, next: () => Promise<void>) {
  const ip = context.request.ip;
  const currentTime = Date.now();

  if (requestCounts.has(ip)) {
    const { count, lastRequestTime } = requestCounts.get(ip)!;

    if (currentTime - lastRequestTime < TIME_WINDOW) {
      if (count >= RATE_LIMIT) {
        context.response.status = 429;
        context.response.body = {
          message: "Rate limit exceeded. Try again later.",
        };
        return;
      }
      requestCounts.set(ip, { count: count + 1, lastRequestTime });
    } else {
      requestCounts.set(ip, { count: 1, lastRequestTime: currentTime });
    }
  } else {
    requestCounts.set(ip, { count: 1, lastRequestTime: currentTime });
  }

  await next();
}

function isValidDate(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const dateObj = new Date(dateString);
  return (
    dateRegex.test(dateString) &&
    dateObj instanceof Date &&
    !isNaN(dateObj.getTime())
  );
}

router.get(
  "/jft/:date",
  rateLimit,
  async (context: RouterContext<"/jft/:date">) => {
    const date = context.params.date;

    if (!date || !isValidDate(date)) {
      context.response.status = 400;
      context.response.body = {
        message: "Invalid date format. Please use YYYY-MM-DD.",
      };
      return;
    }

    try {
      const result = await client.queryObject<{
        id: number;
        date: string;
        title: string;
        page: number;
        quote: string;
        content: string[];
        just_for_today: string;
        basic_text: string;
      }>("SELECT * FROM jft WHERE date = $1;", [date]);

      if (result.rows.length > 0) {
        context.response.status = 200;
        context.response.body = result.rows[0];
      } else {
        context.response.status = 404;
        context.response.body = {
          message: "Entry not found for the given date",
        };
      }
    } catch (error) {
      context.response.status = 500;
      context.response.body = { message: "Internal server error" };
      console.error(error);
    }
  }
);
app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server is running on http://localhost:8000");
await app.listen({ port: 8000 });
