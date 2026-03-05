/**
 * PR Data Layer — GitHub GraphQL API via gh CLI
 *
 * READ-ONLY: This module only executes GraphQL queries (never mutations).
 * All queries are validated before execution to enforce this.
 *
 * TODO: FUTURE HONO API MIGRATION
 * Each exported function in this file maps to a future Hono API endpoint.
 * When migrating:
 *   - getRepoPullRequests()  → GET /api/repos/:id/pull-requests?state=open
 *   - getRepoOwner()         → internal helper (already have repo path in server)
 * The computePrMetrics() function is pure and can be shared via @repo/utils.
 */

import { cache } from "react";
import { execFile, exec } from "child_process";
import { promisify } from "util";
import type { GhPullRequest, GhPrReview, PrMetrics, PrWithMetrics, PrFilter, PrSort, PrBranchInfo } from "@/types/digest";

function getAppBaseUrl(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT || 3000}`;
}

const execFileAsync = promisify(execFile);
const execAsync = promisify(exec);

const GH_EXEC_TIMEOUT_MS = 30_000;
const GH_MAX_BUFFER = 10 * 1024 * 1024; // 10MB — large repos with many reviews
const PAGE_SIZE = 50;

// ===== Safety =====

function assertReadOnlyQuery(query: string): void {
  if (/\bmutation\b/i.test(query)) {
    throw new Error("Blocked: GraphQL mutations are not permitted. Read-only queries only.");
  }
}

// ===== Helpers =====

async function getRepoOwner(repoPath: string): Promise<{ owner: string; name: string }> {
  const { stdout } = await execAsync(`git -C "${repoPath}" remote get-url origin`);
  const url = stdout.trim();

  // SSH: git@github.com:owner/repo.git
  const sshMatch = url.match(/github\.com[:/](.+?)\/(.+?)(?:\.git)?$/);
  if (sshMatch) return { owner: sshMatch[1]!, name: sshMatch[2]! };

  // HTTPS: https://github.com/owner/repo.git
  const httpsMatch = url.match(/github\.com\/(.+?)\/(.+?)(?:\.git)?$/);
  if (httpsMatch) return { owner: httpsMatch[1]!, name: httpsMatch[2]! };

  throw new Error(`Could not parse GitHub owner/repo from remote URL: ${url}`);
}

async function execGraphQL(query: string): Promise<unknown> {
  assertReadOnlyQuery(query);
  // execFile avoids shell — no escaping issues
  const { stdout, stderr } = await execFileAsync(
    "gh", ["api", "graphql", "-f", `query=${query}`],
    { timeout: GH_EXEC_TIMEOUT_MS, maxBuffer: GH_MAX_BUFFER },
  );

  if (!stdout.trim()) {
    throw new Error(`gh api graphql returned empty response. stderr: ${stderr}`);
  }

  const result = JSON.parse(stdout);
  if (result.errors?.length) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }
  return result;
}

// ===== GraphQL =====

const STATE_MAP: Record<PrFilter, string> = {
  open: "OPEN",
  closed: "CLOSED, MERGED",
  all: "OPEN, CLOSED, MERGED",
};

const SORT_FIELD_MAP: Record<PrSort, string> = {
  updated: "UPDATED_AT",
  created: "CREATED_AT",
};

function buildPrQuery(owner: string, name: string, states: string, cursor: string | null, sortField: string = "UPDATED_AT"): string {
  const afterArg = cursor ? `, after: "${cursor}"` : "";
  return `{
    repository(owner: "${owner}", name: "${name}") {
      pullRequests(first: ${PAGE_SIZE}, states: [${states}], orderBy: {field: ${sortField}, direction: DESC}${afterArg}) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          number
          title
          state
          isDraft
          author { login }
          createdAt
          updatedAt
          closedAt
          mergedAt
          additions
          deletions
          changedFiles
          headRefName
          reviewDecision
          reviews(first: 100) {
            nodes {
              author { login }
              state
              submittedAt
            }
          }
          comments(first: 1) {
            totalCount
          }
        }
      }
    }
  }`;
}

interface GraphQLPrNode {
  number: number;
  title: string;
  state: "OPEN" | "CLOSED" | "MERGED";
  isDraft: boolean;
  author: { login: string } | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  mergedAt: string | null;
  additions: number;
  deletions: number;
  changedFiles: number;
  headRefName: string;
  reviewDecision: "APPROVED" | "CHANGES_REQUESTED" | "REVIEW_REQUIRED" | null;
  reviews: { nodes: GhPrReview[] };
  comments: { totalCount: number };
}

function transformNode(node: GraphQLPrNode): GhPullRequest {
  return {
    number: node.number,
    title: node.title,
    state: node.state,
    isDraft: node.isDraft,
    author: node.author ?? { login: "unknown" },
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
    closedAt: node.closedAt,
    mergedAt: node.mergedAt,
    additions: node.additions,
    deletions: node.deletions,
    changedFiles: node.changedFiles,
    headRefName: node.headRefName,
    reviewDecision: node.reviewDecision,
    reviews: node.reviews.nodes,
    commentCount: node.comments.totalCount,
  };
}

// ===== Data Fetchers =====
// TODO: Each of these becomes a Hono route handler

export const getRepoPullRequests = cache(
  async (repoPath: string, state: PrFilter = "open", sort: PrSort = "updated"): Promise<PrWithMetrics[]> => {
    const { owner, name } = await getRepoOwner(repoPath);
    const states = STATE_MAP[state];
    const sortField = SORT_FIELD_MAP[sort];

    const allPrs: GhPullRequest[] = [];
    let cursor: string | null = null;
    let hasNextPage = true;

    while (hasNextPage) {
      const query = buildPrQuery(owner, name, states, cursor, sortField);
      const result = await execGraphQL(query) as {
        data: {
          repository: {
            pullRequests: {
              pageInfo: { hasNextPage: boolean; endCursor: string };
              nodes: GraphQLPrNode[];
            };
          };
        };
      };

      const page = result.data.repository.pullRequests;
      allPrs.push(...page.nodes.map(transformNode));
      hasNextPage = page.pageInfo.hasNextPage;
      cursor = page.pageInfo.endCursor;
    }

    return allPrs.map((pr) => ({ ...pr, metrics: computePrMetrics(pr) }));
  },
);

// ===== Lightweight Branch PR Fetcher =====
// Minimal query for branch badge display — no reviews, comments, additions, deletions.

export const getOpenPrBranches = cache(
  async (repoPath: string): Promise<PrBranchInfo[]> => {
    const { owner, name } = await getRepoOwner(repoPath);
    const query = `{
      repository(owner: "${owner}", name: "${name}") {
        pullRequests(first: 100, states: [OPEN], orderBy: {field: UPDATED_AT, direction: DESC}) {
          nodes {
            number
            headRefName
            reviewDecision
          }
        }
      }
    }`;

    const result = await execGraphQL(query) as {
      data: {
        repository: {
          pullRequests: {
            nodes: PrBranchInfo[];
          };
        };
      };
    };

    return result.data.repository.pullRequests.nodes;
  },
);

// ===== Cached Fetcher (via Route Handler) =====

export async function getCachedPullRequests(
  repoId: string,
  state: PrFilter = "open",
  sort: PrSort = "updated",
): Promise<PrWithMetrics[]> {
  const url = `${getAppBaseUrl()}/api/repos/${repoId}/pull-requests?state=${state}&sort=${sort}`;
  const res = await fetch(url, {
    cache: "force-cache",
    next: { tags: [`prs-${repoId}`] },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch cached PRs: ${res.statusText}`);
  }

  return res.json();
}

// ===== Metric Computation =====
// This is pure — no side effects, no I/O. Reusable in Hono server.

export function computePrMetrics(pr: GhPullRequest): PrMetrics {
  const changeRequestCycles = pr.reviews.filter(
    (r) => r.state === "CHANGES_REQUESTED",
  ).length;

  const createdMs = new Date(pr.createdAt).getTime();
  const now = Date.now();
  const timeOpenMs = (pr.mergedAt ? new Date(pr.mergedAt).getTime() : pr.closedAt ? new Date(pr.closedAt).getTime() : now) - createdMs;
  const timeToMergeMs = pr.mergedAt
    ? new Date(pr.mergedAt).getTime() - createdMs
    : null;

  const reviewerSet = new Set<string>();
  for (const review of pr.reviews) {
    if (review.author?.login) {
      reviewerSet.add(review.author.login);
    }
  }

  return {
    changeRequestCycles,
    timeOpenMs,
    timeToMergeMs,
    commentCount: pr.commentCount,
    reviewers: Array.from(reviewerSet),
  };
}
