export interface BranchInfo {
  forkedAt: string | null;
  commitsAhead: number | undefined;
  commitsBehind: number | undefined;
  name: string;
  author: string;
  email: string;
  lastCommitTimestamp: string;
  lastCommitMessage: string;
  isMerged: boolean;
  isStale: boolean;
  isNew: boolean;
}

export interface BranchError {
  name: string;
  error: string;
}

export interface GetAllBranchesResponse {
  branches: BranchInfo[];
  errors: BranchError[] | null;
}

export interface RepoSummary {
  id: string;
  name: string;
  path: string;
  lastSeen?: {
    lastSeenCommit: string;
    lastSeenTimestamp: string;
  } | null;
  digestJson?: unknown;
}
