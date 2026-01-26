import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";
import env from "../config/env";

const sqlite = new Database(env.DATABASE_PATH, { create: true });

// SQLite optimizations
sqlite.run("PRAGMA journal_mode = WAL");
sqlite.run("PRAGMA foreign_keys = ON");
sqlite.run("PRAGMA busy_timeout = 5000");

export const db = drizzle(sqlite, { schema });
export { sqlite };
