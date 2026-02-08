import { Context } from "hono";
import { HttpError } from "../../lib/http-errors";
import { digestRepository } from "../../data/repositories/repo-digest.repository";
import { isGitRepo } from "../../lib/git";

export const listRepos = async (c: Context) => {
  const repos = await digestRepository.getAllRepos();
  return c.json({ data: repos });
};

export const getRegisteredRepo = async (c: Context) => {
  const id = c.req.param("id");
  const repo = await digestRepository.getRepoById(id);

  if (!repo) {
    throw HttpError.notFound();
  }
  return c.json({ data: repo });
};
export const addRepository = async (c: Context) => {
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

  // const repo = await digestRepository.upsert({});

  // const newRepo = await digestRepository.upsert({ repo: {} });
};
