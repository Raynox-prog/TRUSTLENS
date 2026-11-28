import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export const isDatabaseConfigured = Boolean(process.env.DATABASE_URL?.trim());

const databaseUrl = process.env.DATABASE_URL?.trim() || "";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: isDatabaseConfigured
      ? databaseUrl
      : "postgresql://dummy:dummy@127.0.0.1:5432/none",
    connectionTimeoutMillis: 2000,
  });

// Suppress unhandled pool error events when running locally without PostgreSQL
pool.on("error", () => {
  // Silent fallback
});

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
