"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.pool = void 0;
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const databaseUrl = process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@127.0.0.1:5432/app_db";
exports.pool = new pg_1.Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 3500,
});
// Suppress unhandled pool error events if PostgreSQL is offline
exports.pool.on("error", (err) => {
    if (process.env.DEBUG) {
        console.warn("[SHIELDLY Pool] PG Connection notice:", err.message);
    }
});
exports.db = (0, node_postgres_1.drizzle)(exports.pool);
