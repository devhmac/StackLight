// ========== Core Types ==========
export interface Repo {
  id: string;
  name: string;
  path: string;
}

export interface Commit {
  sha: string;
  message: string;
  author: string;
  timestamp: string; // ISO 8601
  filesChanged: number;
}

export interface Contributor {
  name: string;
  commitCount: number;
}

// ========== Extended Branch ==========
export interface Branch {
  name: string;
  author: string;
  lastCommit: string; // ISO timestamp
  commitsAhead: number;
  commitsBehind: number; // divergence from main
  isNew: boolean;
  isStale: boolean; // no activity in X days
  staleDays?: number; // days since last commit
  forkedAt: string; // timestamp when branch forked from main
  filesChanged: string[]; // list of files touched (for collision detection)
}

// ========== Risk Detection ==========
export type RiskSeverity = "high" | "medium" | "low";
export type RiskType = "divergence" | "collision" | "stale" | "scope_creep";

export interface RiskAlert {
  id: string;
  type: RiskType;
  severity: RiskSeverity;
  title: string;
  description: string;
  branches: string[];
  files?: string[];
  suggestedAction?: string;
}

export interface CollisionPair {
  branchA: string;
  branchB: string;
  overlappingFiles: string[];
  conflictLikelihood: "high" | "medium" | "low";
}

// ========== Churn & Hotspots ==========
export interface ChurnHotspot {
  path: string;
  changeCount: number;
  contributorCount: number;
  trend: "increasing" | "decreasing" | "stable";
}

// ========== Stream Organization ==========
export interface Stream {
  id: string;
  name: string;
  pattern?: string; // e.g., "feature/checkout-*"
  branches: string[];
  lead?: string;
  metrics: {
    branchCount: number;
    commitCount: number;
    maxDivergence: number;
  };
}

// ========== Full Digest Response ==========
export interface RepoDigest {
  repo: Repo;
  lastSeen: { commit: string; timestamp: string } | null;
  main: {
    currentHead: string;
    newCommits: Commit[];
  };
  activeBranches: Branch[];
  contributors: Contributor[];
  risks: RiskAlert[];
  collisions: CollisionPair[];
  churnHotspots: ChurnHotspot[];
  streams: Stream[];
  summary: {
    totalBranches: number;
    staleBranchCount: number;
    highRiskCount: number;
    newCommitCount: number;
    activeContributorCount: number;
  };
}

// ========== Branch Detail (on-demand) ==========
export interface FileDiff {
  path: string;
  added: number;
  removed: number;
}

export interface BranchDetail extends Branch {
  linesAdded: number;
  linesRemoved: number;
  recentCommits: Commit[];
  files: FileDiff[];
}

// ========== API Response Types ==========
export interface ReposListResponse {
  repos: Repo[];
}

export interface MarkSeenRequest {
  commit: string;
}

export interface AddRepoRequest {
  path: string;
}
