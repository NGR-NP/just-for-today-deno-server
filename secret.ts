import { config } from "https://deno.land/x/dotenv/mod.ts";
const env = config();

const DATABASE_URL = env.DATABASE_URL;
const REQUEST_LIMIT = Number(env.REQUEST_LIMIT) || 5; // Ensure it's a number
export { DATABASE_URL, REQUEST_LIMIT };
