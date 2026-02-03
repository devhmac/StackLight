import { z } from "zod";
import { createGitParser, DELIMITER, runGit } from "../../lib/git";
import { Branch, parseBranches } from "../schema/git.schema";

export const gitRepository = {
  async syncRepo(repoPath: string): Promise<void> {
    await runGit(repoPath, ["fetch", "--all"]);
  },
  // use this hash to mark "Last SEEN" commit, store this in the db along with repo path
  async getOriginMainBranch(repoPath: string): Promise<string> {
    const ref = await runGit(repoPath, [
      "symbolic-ref",
      "refs/remotes/origin/HEAD",
      "--short",
    ]);
    return ref.replace("origin/", "");
  },
  async getMainHead(repoPath: string): Promise<string> {
    const defaultBranch = await this.getOriginMainBranch(repoPath);
    return runGit(repoPath, ["rev-parse", `origin/${defaultBranch}`]);
  },
  async getBranches(repoPath: string): Promise<Branch[]> {
    const output = await runGit(repoPath, listBranchesArgs);
    return parseBranches(output);
  },
  async getBranchDivergence(repoPath: string, branchName: string) {
    const output = await runGit(repoPath, [
      "rev-list",
      "--left-right",
      "--count",
      `origin/main...origin/${branchName}`,
    ]);
    console.log(output);
    const [ahead, behind] = output.trim().split(/\s+/);
    return {
      commitsAhead: ahead ? Number(ahead) : undefined,
      commitsBehind: behind ? Number(behind) : undefined,
    };
  },
};

// - Git Queries
//
const listBranchesArgs = [
  "for-each-ref",
  "--sort=-committerdate",
  `--format=%(refname:short)${DELIMITER}%(authorname)${DELIMITER}%(committerdate:unix)`,
  "refs/remotes/origin",
];
