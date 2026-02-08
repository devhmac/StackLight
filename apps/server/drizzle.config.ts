import { defineConfig } from "drizzle-kit";
import env from "./src/config/env";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/data/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: env.DATABASE_PATH,
    // url: "file:./sqlite.db",
  },
  verbose: true,
});
