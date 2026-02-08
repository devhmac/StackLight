export interface BranchInfo {
  forkedAt: string;
  mergeBaseSha: string;
  commitsAhead: number | undefined;
  commitsBehind: number | undefined;
  name: string;
  author: string;
  email: string;
  lastCommitTimestamp: string;
  lastCommitMessage: string;
}

export interface BranchError {
  name: string;
  error: string;
}

export interface GetAllBranchesResponse {
  branches: BranchInfo[];
  errors: BranchError[] | null;
}
