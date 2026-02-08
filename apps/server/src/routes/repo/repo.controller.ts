import { Context } from "hono";
import { HttpError } from "../../lib/http-errors";
import { digestRepository } from "../../data/repositories/repo-digest.repository";
import { isGitRepo } from "../../lib/git";
import { addNewRepo } from "../../services/git.service";

export const ReposController = {
  async listRepos(c: Context) {
    const repos = await digestRepository.getAllRepos();
    return c.json({ data: repos });
  },

  async getRepoDetails(c: Context) {
    const id = c.req.param("id");
    const repo = await digestRepository.getRepoById(id);

    if (!repo) {
      throw HttpError.notFound();
    }
    return c.json({ data: repo });
  },
  async addRepo(c: Context) {
    const { path } = await c.req.json<{ path: string }>();

    if (!path.trim()) {
      throw HttpError.badRequest("path is required");
    }

    const isValidRepo = await isGitRepo(path);
    if (!isValidRepo) {
      throw HttpError.badRequest(`${path} is not a valid git repository`);
    }

    const existing = await digestRepository.getRepoByPath(path);
    if (existing) {
      return c.json({ data: existing }, 200);
    }

    const { data } = await addNewRepo(path);
    return c.json({ data: data }, 201);
  },
  async deleteRepo(c: Context) {
    const id = c.req.param("id");
    const deleted = await digestRepository.delete(id);

    if (!deleted) {
      throw HttpError.internal("There was an issue deleting that resource");
    }

    return c.body(null, 204);
  },
};
