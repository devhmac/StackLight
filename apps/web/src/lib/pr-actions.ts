"use server";

import { updateTag } from "next/cache";
import type { PrFilter, PrSort, PrWithMetrics, PrPage } from "@/types/digest";
import { getRepoPullRequests, getRepoPullRequestsPage } from "./github-pr";

export async function fetchPrsAction(
  repoPath: string,
  state: PrFilter,
  sort: PrSort = "updated",
): Promise<PrWithMetrics[]> {
  return getRepoPullRequests(repoPath, state, sort);
}

export async function fetchPrsPageAction(
  repoPath: string,
  state: PrFilter,
  sort: PrSort,
  cursor: string | null,
): Promise<PrPage> {
  return getRepoPullRequestsPage(repoPath, state, sort, cursor);
}

export async function invalidatePrCache(repoId: string): Promise<void> {
  updateTag(`prs-${repoId}`);
}
