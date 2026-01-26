import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { exampleRouter } from "./routes/index.routes";
import { logger } from "./middleware/logger";

export const app = new Hono()
  .use(requestId())
  .use("*", cors())
  .use("*", logger())

  //health check
  .get("/health", (c) =>
    c.json({ status: "ok", timestamp: new Date().toISOString() }),
  )
  .route("/", exampleRouter);

app.notFound((c) => {
  return c.json({ success: false, error: "Not Found" }, 404);
});

export type AppType = typeof app;
