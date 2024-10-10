import { config } from "./deps.ts";
const env = config();

const  DATABASE_URL = env.DATABASE_URL
const REQUEST_LIMIT = 5
export {DATABASE_URL,REQUEST_LIMIT}