"use server";

import { updateTag } from "next/cache";
import type { PrFilter, PrSort, PrWithMetrics } from "@/types/digest";
import { getRepoPullRequests } from "./github-pr";

export async function fetchPrsAction(
  repoPath: string,
  state: PrFilter,
  sort: PrSort = "updated",
): Promise<PrWithMetrics[]> {
  return getRepoPullRequests(repoPath, state, sort);
}

export async function invalidatePrCache(repoId: string): Promise<void> {
  updateTag(`prs-${repoId}`);
}
