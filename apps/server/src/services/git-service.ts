// src/schemas/git.ts
import { z } from "zod";
import { createGitParser, DELIMITER, runGit } from "../lib/git";

export async function listBranches(repoPath: string): Promise<Branch[]> {
  const output = await runGit(repoPath, listBranchesArgs);
  return parseBranches(output);
}

// use this hash to mark "Last SEEN" commit, store this in the db along with repo path
export async function getMainHead(repoPath: string): Promise<string> {
  const defaultBranch = await getDefaultBranch(repoPath);
  return runGit(repoPath, ["rev-parse", `origin/${defaultBranch}`]);
}

export async function getDefaultBranch(repoPath: string): Promise<string> {
  const ref = await runGit(repoPath, [
    "symbolic-ref",
    "refs/remotes/origin/HEAD",
    "--short",
  ]);
  return ref.replace("origin/", "");
}

export const BranchSchema = z.object({
  name: z.string().transform((s) => s.replace("origin/", "")),
  author: z.string(),
  timestamp: z.coerce.number(),
});

export const parseBranches = createGitParser(BranchSchema, [
  "name",
  "author",
  "timestamp",
]);
export type Branch = z.infer<typeof BranchSchema>;

const listBranchesArgs = [
  "for-each-ref",
  "--sort=-committerdate",
  `--format=%(refname:short)${DELIMITER}%(authorname)${DELIMITER}%(committerdate:unix)`,
  "refs/remotes/origin",
];
