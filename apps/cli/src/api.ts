import type { RepoSummary, GetAllBranchesResponse } from "@repo/types/git";

const BASE_URL = "http://localhost:8080";

export interface HealthResponse {
  status: string;
  timestamp: string;
}

export type RepoDetails = RepoSummary & GetAllBranchesResponse;

export async function checkHealth(): Promise<HealthResponse | null> {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    return (await res.json()) as HealthResponse;
  } catch {
    return null;
  }
}

export async function listRepos(): Promise<RepoSummary[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/repos`);
    const json = (await res.json()) as { data: RepoSummary[] };
    return json.data;
  } catch {
    return [];
  }
}

export async function getRepoDetails(
  id: string,
): Promise<RepoDetails | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/repos/${id}`);
    const json = (await res.json()) as { data: RepoDetails };
    return json.data;
  } catch {
    return null;
  }
}
