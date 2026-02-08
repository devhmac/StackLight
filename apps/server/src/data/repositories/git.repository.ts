import { z } from "zod";
import { createGitParser, DELIMITER, runGit } from "../../lib/git";
import { Branch, parseBranches } from "../schema/git.schema";

export const gitRepository = {
  async syncRepo(repoPath: string): Promise<void> {
    await runGit(repoPath, ["fetch", "--all"]);
  },
  // use this hash to mark "Last SEEN" commit, store this in the db along with repo path
  async getOriginDefaultBranch(repoPath: string): Promise<string> {
    // Fastest path: symbolic ref is set
    const symbolicRef = await runGit(repoPath, [
      "symbolic-ref",
      "refs/remotes/origin/HEAD",
      "--short",
    ]).catch(() => null);

    if (symbolicRef) {
      return symbolicRef.trim().replace("origin/", "");
    }

    // Check for common default branch names
    for (const candidate of ["main", "master", "develop"]) {
      const exists = await runGit(repoPath, [
        "rev-parse",
        "--verify",
        "--quiet",
        `refs/remotes/origin/${candidate}`,
      ]).catch(() => null);

      if (exists) return candidate;
    }

    // Slowest path: query the remote directly
    const remoteInfo = await runGit(repoPath, [
      "remote",
      "show",
      "origin",
    ]).catch(() => null);
    const match = remoteInfo?.match(/HEAD branch:\s*(\S+)/);

    if (match?.[1]) return match[1];

    throw new Error(`Could not determine default branch for repo: ${repoPath}`);
  },
  async getMainHead(repoPath: string): Promise<string> {
    const defaultBranch = await this.getOriginDefaultBranch(repoPath);
    return runGit(repoPath, ["rev-parse", `origin/${defaultBranch}`]);
  },
  async getBranches(repoPath: string): Promise<Branch[]> {
    const output = await runGit(repoPath, getBranchesQuery);
    return parseBranches(output);
  },
  async getBranchDivergence(
    repoPath: string,
    originDefault: string,
    branchName: string,
  ) {
    const output = await runGit(repoPath, [
      "rev-list",
      "--left-right",
      "--count",
      `origin/${originDefault}...origin/${branchName}`,
    ]);
    console.log(output);
    const [behind, ahead] = output.trim().split(/\s+/);
    return {
      commitsAhead: ahead ? Number(ahead) : undefined,
      commitsBehind: behind ? Number(behind) : undefined,
    };
  },
  async getBranchForkTimestamp(
    repoPath: string,
    originDefault: string,
    branchName: string,
  ): Promise<{ forkedAt: number; mergeBaseSha: string }> {
    const mergeBaseSha = (
      await runGit(repoPath, [
        "merge-base",
        `origin/${originDefault}`,
        `origin/${branchName}`,
      ])
    ).trim();

    const rawForkTimestamp = await runGit(repoPath, [
      "show",
      "-s",
      `--format=%ct`,
      mergeBaseSha,
    ]);
    return { forkedAt: parseInt(rawForkTimestamp.trim(), 10), mergeBaseSha };

    // could also add the fork commit for ontext
    // const raw = (await git(repoPath, [
    //   'show',
    //   '-s',
    //   `--format=%ct${DELIMITER}%s`,
    //   mergeBaseSha,
    // ])).trim();

    // const [timestampStr, message] = raw.split(DELIMITER);
  },
  async getRepoName(path: string): Promise<string | null> {
    try {
      const url = await runGit(path, ["remote", "get-url", "origin"]);
      const name = url
        .split("/")
        .pop()
        ?.replace(/\.git$/, "");
      if (name) return name;
    } catch (err) {
      // Expected: repo may have no remote configured.
      // Fall through to directory name fallback.
      console.debug(`Could not get remote name for ${path}: ${err}`);
    }

    return path.split("/").pop() ?? null;
  },
};

// - Git Queries
//
const getBranchesQuery = [
  "for-each-ref",
  "--sort=-committerdate",
  `--format=%(refname:short)${DELIMITER}%(authorname)${DELIMITER}%(authoremail)${DELIMITER}%(committerdate:unix)${DELIMITER}%(subject)`,
  "refs/remotes/origin",
];
