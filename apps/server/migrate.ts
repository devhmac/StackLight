import { migrate } from "drizzle-orm/bun-sqlite/migrator";

import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import env from "./src/config/env";

const sqlite = new Database(env.DATABASE_PATH);
const db = drizzle(sqlite);
migrate(db, { migrationsFolder: "./drizzle" });
