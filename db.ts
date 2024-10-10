import { Client } from "./deps.ts";
import { DATABASE_URL } from "./secret.ts";

const client = new Client(DATABASE_URL);

await client.connect();

console.log("Connected to the database!");

export { client };
