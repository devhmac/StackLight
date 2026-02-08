import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { logger } from "./middleware/logger";
import { gitRepository } from "./data/repositories/git.repository";
import { getAllBranches } from "./services/git.service";
import { repoRouter } from "./routes/repo/repo.routes";

export const app = new Hono()
  .use(requestId())
  .use("*", cors())
  .use("*", logger())

  //health check
  .get("/health", (c) =>
    c.json({ status: "ok", timestamp: new Date().toISOString() }),
  )
  // --- Routes ---
  .route("/", repoRouter)
  .get("/git", async (c) => {
    const repoPath = c.req.query("repo") || "/Users/devpra/repos/idify";
    const mainBranch = await gitRepository.getOriginDefaultBranch(repoPath);
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
