import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

config({ path: ".env" });

const client = postgres(process.env.DB_URL!);
export const db = drizzle(client, { schema });
