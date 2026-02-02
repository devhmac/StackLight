"use client";

import { useState, useEffect, useCallback } from "react";
import type { Repo, RepoDigest } from "@/types/digest";
import { mockRepos, getMockDigestByRepoId } from "@/mocks/digest-mock";

// Set to true to use real API, false to use mock data
const USE_MOCK_DATA = true;

// ========== useRepos Hook ==========
interface UseReposResult {
  repos: Repo[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  addRepo: (path: string) => Promise<Repo | null>;
  deleteRepo: (id: string) => Promise<boolean>;
}

export function useRepos(): UseReposResult {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRepos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK_DATA) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 300));
        setRepos(mockRepos);
      } else {
        const { getRepos } = await import("@/lib/api");
        const data = await getRepos();
        setRepos(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch repos"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  const addRepo = useCallback(async (path: string): Promise<Repo | null> => {
    try {
      if (USE_MOCK_DATA) {
        const newRepo: Repo = {
          id: `repo-${Date.now()}`,
          name: path.split("/").pop() || "unknown",
          path,
        };
        setRepos((prev) => [...prev, newRepo]);
        return newRepo;
      } else {
        const { addRepo: apiAddRepo } = await import("@/lib/api");
        const newRepo = await apiAddRepo({ path });
        setRepos((prev) => [...prev, newRepo]);
        return newRepo;
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to add repo"));
      return null;
    }
  }, []);

  const deleteRepo = useCallback(async (id: string): Promise<boolean> => {
    try {
      if (USE_MOCK_DATA) {
        setRepos((prev) => prev.filter((r) => r.id !== id));
        return true;
      } else {
        const { deleteRepo: apiDeleteRepo } = await import("@/lib/api");
        await apiDeleteRepo(id);
        setRepos((prev) => prev.filter((r) => r.id !== id));
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to delete repo"));
      return false;
    }
  }, []);

  return {
    repos,
    loading,
    error,
    refetch: fetchRepos,
    addRepo,
    deleteRepo,
  };
}

// ========== useDigest Hook ==========
interface UseDigestResult {
  digest: RepoDigest | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  markSeen: () => Promise<boolean>;
}

export function useDigest(repoId: string | null): UseDigestResult {
  const [digest, setDigest] = useState<RepoDigest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDigest = useCallback(async () => {
    if (!repoId) {
      setDigest(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK_DATA) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        const data = getMockDigestByRepoId(repoId);
        if (!data) {
          throw new Error("Repo not found");
        }
        setDigest(data);
      } else {
        const { getRepoDigest } = await import("@/lib/api");
        const data = await getRepoDigest(repoId);
        setDigest(data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch digest")
      );
    } finally {
      setLoading(false);
    }
  }, [repoId]);

  useEffect(() => {
    fetchDigest();
  }, [fetchDigest]);

  const markSeen = useCallback(async (): Promise<boolean> => {
    if (!repoId || !digest) return false;

    try {
      if (USE_MOCK_DATA) {
        // Update local state to reflect mark as seen
        setDigest((prev) =>
          prev
            ? {
                ...prev,
                lastSeen: {
                  commit: prev.main.currentHead,
                  timestamp: new Date().toISOString(),
                },
                main: {
                  ...prev.main,
                  newCommits: [],
                },
                summary: {
                  ...prev.summary,
                  newCommitCount: 0,
                },
              }
            : null
        );
        return true;
      } else {
        const { markSeen: apiMarkSeen } = await import("@/lib/api");
        await apiMarkSeen(repoId, { commit: digest.main.currentHead });
        await fetchDigest();
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to mark as seen"));
      return false;
    }
  }, [repoId, digest, fetchDigest]);

  return {
    digest,
    loading,
    error,
    refetch: fetchDigest,
    markSeen,
  };
}

// ========== useSelectedRepo Hook ==========
// Manages which repo is currently selected in the UI
interface UseSelectedRepoResult {
  selectedRepoId: string | null;
  setSelectedRepoId: (id: string | null) => void;
}

export function useSelectedRepo(): UseSelectedRepoResult {
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);

  // Auto-select first repo on initial load
  const { repos, loading } = useRepos();

  useEffect(() => {
    if (!loading && repos.length > 0 && !selectedRepoId) {
      setSelectedRepoId(repos[0]!.id);
    }
  }, [loading, repos, selectedRepoId]);

  return {
    selectedRepoId,
    setSelectedRepoId,
  };
}
