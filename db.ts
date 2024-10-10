import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
// import { DATABASE_URL } from "./secret.ts";
const connectionString = Deno.env.get("DATABASE_URL");
const client = new Client(connectionString);

await client.connect();

console.log("Connected to the database!");

export { client };
