import type { BranchInfo } from "@repo/types/git";

// Core repo metadata returned by /api/repos
export interface RepoSummary {
  id: string;
  name: string;
  path: string;
  lastSeen?: {
    lastSeenCommit: string;
    lastSeenTimestamp: string;
  } | null;
}
export interface RepoDetails extends RepoSummary {
  branches: UiBranch[];
}

// UI-friendly branch type that extends the backend shape with optional flags
export type UiBranch = BranchInfo & {
  filesChanged?: string[];
};

// Optional detail payload for branch dialog (demo-friendly today)
export interface BranchDetail extends UiBranch {
  linesAdded?: number;
  linesRemoved?: number;
  recentCommits?: Array<{
    sha: string;
    message: string;
    author?: string;
    timestamp: string;
  }>;
  files?: Array<{
    path: string;
    added: number;
    removed: number;
  }>;
}

export interface FileDiff {
  path: string;
  added: number;
  removed: number;
}

// Risk & collision demo types
export type RiskSeverity = "high" | "medium" | "low";
export type RiskType = "divergence" | "collision" | "stale" | "scope_creep";

export interface RiskItem {
  id: string;
  type: RiskType;
  severity: RiskSeverity;
  title: string;
  description: string;
  branches: string[];
  files?: string[];
  suggestedAction?: string;
}

export interface CollisionItem {
  branchA: string;
  branchB: string;
  overlappingFiles: string[];
  conflictLikelihood: "high" | "medium" | "low";
}

export interface TimelinePoint {
  branch: string;
  startedAt: string; // ISO
  lastCommitAt: string; // ISO
  commitsAhead: number;
  commitsBehind: number;
}

export type DataSource = "demo" | "api";

// Mutations
export interface AddRepoRequest {
  path: string;
}

export interface MarkSeenRequest {
  commit: string;
}

// Legacy aliases (kept for mocks/demo compatibility)
export type Repo = RepoSummary;
export interface Commit {
  sha: string;
  message: string;
  author: string;
  timestamp: string;
  filesChanged: number;
}
export interface Contributor {
  name: string;
  commitCount: number;
}
export type Branch = UiBranch;
export type RiskAlert = RiskItem;
export type CollisionPair = CollisionItem;
export interface ChurnHotspot {
  path: string;
  changeCount: number;
  contributorCount: number;
  trend: "increasing" | "decreasing" | "stable";
}
export interface Stream {
  id: string;
  name: string;
  pattern?: string;
  branches: string[];
  lead?: string;
  metrics: {
    branchCount: number;
    commitCount: number;
    maxDivergence: number;
  };
}
export type RepoDigest = any;

// ===== PR Visibility Types =====
// TODO: These types support server actions that will migrate to Hono API endpoints

export interface GhPrReview {
  author: { login: string };
  state: "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED" | "DISMISSED" | "PENDING";
  submittedAt: string;
}

export interface GhPullRequest {
  number: number;
  title: string;
  state: "OPEN" | "CLOSED" | "MERGED";
  isDraft: boolean;
  author: { login: string };
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  mergedAt: string | null;
  additions: number;
  deletions: number;
  changedFiles: number;
  headRefName: string;
  baseRefName: string;
  url: string;
  bodyText: string;
  reviewDecision: "APPROVED" | "CHANGES_REQUESTED" | "REVIEW_REQUIRED" | null;
  reviews: GhPrReview[];
  commentCount: number;
}

export interface PrMetrics {
  changeRequestCycles: number;
  timeOpenMs: number;
  timeToMergeMs: number | null;
  commentCount: number;
  reviewers: string[];
}

export interface PrWithMetrics extends GhPullRequest {
  metrics: PrMetrics;
}

export interface PrPage {
  prs: PrWithMetrics[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}

export type PrFilter = "open" | "closed" | "all";
export type PrSort = "updated" | "created";

export interface PrBranchInfo {
  number: number;
  headRefName: string;
  reviewDecision: "APPROVED" | "CHANGES_REQUESTED" | "REVIEW_REQUIRED" | null;
}
