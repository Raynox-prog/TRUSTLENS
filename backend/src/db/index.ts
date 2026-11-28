import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export const isDatabaseConfigured = Boolean(process.env.DATABASE_URL?.trim());
const databaseUrl = process.env.DATABASE_URL?.trim() || "";

export const pool = new Pool({
  connectionString: isDatabaseConfigured
    ? databaseUrl
    : "postgresql://dummy:dummy@127.0.0.1:5432/none",
  connectionTimeoutMillis: 2000,
});

// Suppress unhandled pool error events if PostgreSQL is offline
pool.on("error", () => {
  // Silent fallback in local development
});

export const db = drizzle(pool);
