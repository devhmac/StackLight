import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { exampleRouter } from "./routes/index.routes";
import { logger } from "./middleware/logger";
import { runGit } from "./lib/git";
import {
  getDefaultBranch,
  getMainHead,
  listBranches,
} from "./services/git-service";

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
    // const response = await runGit("/Users/devpra/repos/idify", ["log"]);
    const mainBranch = await getDefaultBranch(repoPath);
    const mainRef = await getMainHead(repoPath);
    console.log("main head ref", mainBranch);
    const response = await listBranches(repoPath);
    console.log(response);
    return c.json({ data: response });
  });

app.notFound((c) => {
  return c.json({ success: false, error: "Not Found" }, 404);
});

export type AppType = typeof app;
