import { gitRepository } from "../db/repositories/git.repository";

export async function getAllBranches(repoPath: string) {
  const branches = await gitRepository.getBranches(repoPath);
  const branchData = await Promise.all(
    branches.map(async (branch) => {
      console.log(branch);
      try {
        const divergence = await gitRepository.getBranchDivergence(
          repoPath,
          branch.name,
        );
        console.log(divergence);
        return { ...branch, ...divergence };
      } catch (error) {
        console.error(`Failed to get divergence for ${branch.name}:`, error);

        return {
          ...branch,
          commitsAhead: undefined,
          commitsBehind: undefined,
          error: String(error),
        };
      }
    }),
  );
  return branchData;
}
