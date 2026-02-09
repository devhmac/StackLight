import { Hono } from "hono";
import { ReposController } from "./repo.controller";

export const repoRouter = new Hono()
  .basePath("/api/repos")
  .get("/", ReposController.listRepos)
  .post("/", ReposController.addRepo)
  .get("/:id", ReposController.getRepoDetails)
  .delete("/:id", ReposController.deleteRepo)
  .get("/:id/sync", ReposController.syncRepo);

export type RepoRouter = typeof repoRouter;
