import { cache } from "react";
import type { Repo, RepoDigest, BranchDetail } from "@/types/digest";
import { mockRepos, getMockDigestByRepoId, getMockBranchDetail } from "@/mocks/digest-mock";

// Set to true to use mock data, false for real API
const USE_MOCK_DATA = true;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Per-request deduplication with React.cache()
// Multiple components calling these functions in the same request will share the result

export const getRepos = cache(async (): Promise<Repo[]> => {
  if (USE_MOCK_DATA) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    return mockRepos;
  }

  const response = await fetch(`${API_BASE_URL}/api/repos`, {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch repos: ${response.statusText}`);
  }

  return response.json();
});

export const getRepoDigest = cache(
  async (repoId: string): Promise<RepoDigest | null> => {
    if (USE_MOCK_DATA) {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 200));
      return getMockDigestByRepoId(repoId);
    }

    const response = await fetch(`${API_BASE_URL}/api/repos/${repoId}/digest`, {
      next: { revalidate: 30 }, // Cache for 30 seconds
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch digest: ${response.statusText}`);
    }

    return response.json();
  }
);

// Get the first repo ID (for default selection)
export const getDefaultRepoId = cache(async (): Promise<string | null> => {
  const repos = await getRepos();
  return repos[0]?.id ?? null;
});

// Get detailed branch info (on-demand, fetched when dialog opens)
export const getBranchDetail = cache(
  async (branchName: string): Promise<BranchDetail | null> => {
    if (USE_MOCK_DATA) {
      // Simulate network delay for on-demand fetch
      await new Promise((resolve) => setTimeout(resolve, 150));
      return getMockBranchDetail(branchName);
    }

    const response = await fetch(
      `${API_BASE_URL}/api/branches/${encodeURIComponent(branchName)}/detail`,
      {
        next: { revalidate: 30 },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch branch detail: ${response.statusText}`);
    }

    return response.json();
  }
);
