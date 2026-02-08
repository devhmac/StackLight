import { cache } from "react";
import type {
  BranchDetail,
  CollisionItem,
  DataSource,
  RepoSummary,
  RiskItem,
  TimelinePoint,
  UiBranch,
} from "@/types/digest";
import { demoBranchDetail, demoCollisions, demoRisks, demoTimeline } from "./demo-data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ===== Helpers =====
export function selectRepoId(
  searchParams?: { repo?: string },
  repos?: RepoSummary[],
): string | null {
  return searchParams?.repo ?? repos?.[0]?.id ?? null;
}

// ===== Data Fetchers =====

export const getRepos = cache(async (): Promise<RepoSummary[]> => {
  const response = await fetch(`${API_BASE_URL}/api/repos`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch repos: ${response.statusText}`);
  }

  const { data } = await response.json();
  return data;
});

export const getRepoBranches = cache(
  async (repoId: string): Promise<UiBranch[]> => {
    const response = await fetch(`${API_BASE_URL}/api/repos/${repoId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) return [];
      throw new Error(`Failed to fetch repo ${repoId}: ${response.statusText}`);
    }

    const { data } = await response.json();
    const branches: UiBranch[] = (data?.branches ?? []).map((b: UiBranch) => ({
      filesChanged: [],
      ...b,
    }));

    return branches;
  },
);

export const getRiskSnapshot = cache(
  async (_repoId: string, source: DataSource = "demo"): Promise<RiskItem[]> => {
    if (source === "api") {
      // Placeholder for future API endpoint
      return [];
    }
    return demoRisks;
  },
);

export const getCollisions = cache(
  async (_repoId: string, source: DataSource = "demo"): Promise<CollisionItem[]> => {
    if (source === "api") return [];
    return demoCollisions;
  },
);

export const getTimeline = cache(
  async (_repoId: string, source: DataSource = "demo"): Promise<TimelinePoint[]> => {
    if (source === "api") return [];
    return demoTimeline;
  },
);

export const getBranchDetail = cache(
  async (branchName: string, source: DataSource = "demo"): Promise<BranchDetail | null> => {
    if (source === "demo") {
      if (demoBranchDetail.name === branchName) return demoBranchDetail;
      return { ...demoBranchDetail, name: branchName };
    }

    const response = await fetch(
      `${API_BASE_URL}/api/branches/${encodeURIComponent(branchName)}/detail`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch branch detail: ${response.statusText}`);
    }

    return response.json();
  },
);
