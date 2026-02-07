import { gitRepository } from "../db/repositories/git.repository";
import { logger } from "../middleware/logger";

export async function getAllBranches(repoPath: string) {
  const branches = await gitRepository.getBranches(repoPath);
  const originDefault = await gitRepository.getOriginDefaultBranch(repoPath);
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

        return {
          ...branch,
          commitsAhead: undefined,
          commitsBehind: undefined,
          forkedAt: undefined,
          error: String(error),
        };
      }
    }),
  );
  return branchData.filter(Boolean);
}
