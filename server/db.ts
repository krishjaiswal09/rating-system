import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let db;
let sqliteDb: Database | undefined;

if (process.env.DATABASE_URL) {
  // Use PostgreSQL with Neon when DATABASE_URL is provided
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
  console.log("Using PostgreSQL database");
} else {
  // Use in-memory SQLite for development when DATABASE_URL is not provided
  sqliteDb = new Database(':memory:');
  db = drizzleSQLite(sqliteDb, { schema });
  console.log("Using in-memory SQLite database for development");
}

// Helper function to execute raw SQL for SQLite
const executeSql = (sql, params = []) => {
  if (sqliteDb) {
    return sqliteDb.prepare(sql).run(params);
  } else {
    throw new Error("SQLite database not initialized");
  }
};

export { db, sqliteDb, executeSql };