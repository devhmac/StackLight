import { serve } from "bun";
import { app } from "./app";
import env from "./config/env";

import { db } from "./data/db";
import { sql } from "drizzle-orm";

console.log(`🚀 Server starting on port: ${env.PORT}`);

const query = sql`select "hello world" as text`;
const result = db.get<{ text: string }>(query);

console.log(result);
serve({
  fetch: app.fetch,
  port: env.PORT,
});

// export default app;
