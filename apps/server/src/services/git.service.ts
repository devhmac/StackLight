import type { GetAllBranchesResponse } from "@repo/types/git";
import { gitRepository } from "../data/repositories/git.repository";
import { logger } from "../middleware/logger";
import { digestRepository } from "../data/repositories/repo-digest.repository";
import { randomUUIDv7 } from "bun";

const STALE_THRESHOLD_DAYS = 7;

export async function getAllBranches(
  repoPath: string,
  lastSeen?: string,
): Promise<GetAllBranchesResponse> {
  const branches = await gitRepository.getBranches(repoPath);
  const originDefault = await gitRepository.getOriginDefaultBranch(repoPath);

  const branchErrors: {
    name: string;
    error: string;
  }[] = [];
  const branchData = await Promise.all(
    branches.map(async (branch) => {
      try {
        if (
          branch.name.replace("origin/", "") === originDefault ||
          branch.name === "origin/HEAD"
        ) {
          return null;
        }

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

        const isStale =
          Date.now() - new Date(branch.lastCommitTimestamp).getTime() >
          STALE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

        return {
          ...branch,
          ...divergence,
          ...forkedAt,
          isStale,
          isNew: isNew(branch.lastCommitTimestamp, lastSeen),
        };
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
    branches: branchData.filter((branch) => branch !== null),
    errors: branchErrors.length > 0 ? branchErrors : null,
  };
}

export async function addNewRepo(repoPath: string, digestJson = {}) {
  // Assumes Repository/path is valid because controller checks
  const name = await gitRepository.getRepoName(repoPath);
  const newRepoId = randomUUIDv7();
  const newRepoData = {
    id: newRepoId,
    name: name,
    path: repoPath,
    lastSeen: {
      lastSeenTimestamp: new Date().toISOString(),
      lastSeenCommit: "test",
    },
    digestJson: digestJson,
  };
  const upsert = await digestRepository.upsert(newRepoData);
  return { success: true, data: newRepoData };
}

function isNew(
  lastCommitTimestamp: string,
  lastSeenTimestamp: string | null | undefined,
): boolean {
  if (!lastSeenTimestamp) return true; // first time viewing repo

  return (
    new Date(lastCommitTimestamp).getTime() >
    new Date(lastSeenTimestamp).getTime()
  );
}
