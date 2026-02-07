export interface BranchInfo {
  forkedAt: number;
  mergeBaseSha: string;
  commitsAhead: number | undefined;
  commitsBehind: number | undefined;
  name: string;
  author: string;
  email: string;
  lastCommitTimestamp: number;
  lastCommitMessage: string;
}

export interface BranchError {
  name: string;
  error: string;
}

export interface GetAllBranchesResponse {
  data: BranchInfo[];
  errors: BranchError[] | null;
}
