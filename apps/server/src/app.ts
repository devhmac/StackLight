import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { exampleRouter } from "./routes/index.routes";
import { logger } from "./middleware/logger";
import { gitRepository } from "./db/repositories/git.repository";
import { getAllBranches } from "./services/git.service";

export const app = new Hono()
  .use(requestId())
  .use("*", cors())
  .use("*", logger())

  //health check
  .get("/health", (c) =>
    c.json({ status: "ok", timestamp: new Date().toISOString() }),
  )
  .route("/", exampleRouter)
  .get("/git", async (c) => {
    const repoPath = c.req.query("repo") || "/Users/devpra/repos/idify";
    const mainBranch = await gitRepository.getOriginMainBranch(repoPath);
    const mainRef = await gitRepository.getMainHead(repoPath);
    console.log("main head ref:", mainBranch);
    const response = await getAllBranches(repoPath);
    console.log(response);
    return c.json({ data: response });
  });

app.notFound((c) => {
  return c.json({ success: false, error: "Not Found" }, 404);
});

export type AppType = typeof app;
