import type { GetAllBranchesResponse } from "@repo/types/git";
import { gitRepository } from "../data/repositories/git.repository";
import { logger } from "../middleware/logger";
import { digestRepository } from "../data/repositories/repo-digest.repository";
import { randomUUIDv7 } from "bun";

export async function getAllBranches(
  repoPath: string,
): Promise<GetAllBranchesResponse> {
  const branches = await gitRepository.getBranches(repoPath);
  const originDefault = await gitRepository.getOriginDefaultBranch(repoPath);
  const branchErrors: {
    name: string;
    error: string;
  }[] = [];
  const branchData = await Promise.all(
    branches.map(async (branch) => {
      console.log(branch);
      try {
        // if (
        //   branch.name.replace("origin/", "") === originDefault ||
        //   branch.name === "origin/HEAD"
        // ) {
        //   return null;
        // }

        const divergence = await gitRepository.getBranchDivergence(
          repoPath,
          originDefault,
          branch.name,
        );
        const forkedAt = await gitRepository.getBranchForkTimestamp(
          repoPath,
          originDefault,
          branch.name,
        );
        return { ...branch, ...divergence, ...forkedAt };
      } catch (error) {
        console.error(`Failed to get divergence for ${branch.name}:`, error);
        branchErrors.push({
          name: branch.name,
          error: error instanceof Error ? error.message : String(error),
        });
        return null;
      }
    }),
  );
  return {
    data: branchData.filter((branch) => branch !== null),
    errors: branchErrors.length > 0 ? branchErrors : null,
  };
}

export async function addNewRepo(repoPath: string, digestJson = {}) {
  // Assumes Repository/path is valid because controller checks

  const name = await gitRepository.getRepoName(repoPath);
  const upsert = await digestRepository.upsert({
    id: randomUUIDv7(),
    name: name,
    path: repoPath,
    lastSeen: {
      lastSeenTimestamp: new Date().toISOString(),
      lastSeenCommit: "test",
    },
    digestJson: digestJson,
  });
}
