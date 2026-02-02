"use client";

import { useState, useCallback } from "react";
import type { Repo } from "@/types/digest";

// Set to true to use mock data, false for real API
const USE_MOCK_DATA = true;

// ========== useRepoActions Hook ==========
// Client-side mutations only - data fetching happens server-side
interface UseRepoActionsResult {
  addRepo: (path: string) => Promise<Repo | null>;
  deleteRepo: (id: string) => Promise<boolean>;
  isPending: boolean;
  error: Error | null;
}

export function useRepoActions(): UseRepoActionsResult {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addRepo = useCallback(async (path: string): Promise<Repo | null> => {
    setError(null);
    setIsPending(true);

    try {
      if (USE_MOCK_DATA) {
        const newRepo: Repo = {
          id: `repo-${Date.now()}`,
          name: path.split("/").pop() || "unknown",
          path,
        };
        // In real implementation, this would call revalidatePath after mutation
        return newRepo;
      } else {
        const { addRepo: apiAddRepo } = await import("@/lib/api");
        return await apiAddRepo({ path });
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to add repo");
      setError(error);
      return null;
    } finally {
      setIsPending(false);
    }
  }, []);

  const deleteRepo = useCallback(async (id: string): Promise<boolean> => {
    setError(null);
    setIsPending(true);

    try {
      if (USE_MOCK_DATA) {
        // In real implementation, this would call revalidatePath after mutation
        return true;
      } else {
        const { deleteRepo: apiDeleteRepo } = await import("@/lib/api");
        await apiDeleteRepo(id);
        return true;
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to delete repo");
      setError(error);
      return false;
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    addRepo,
    deleteRepo,
    isPending,
    error,
  };
}

// ========== useMarkSeen Hook ==========
// Client-side action to mark commits as seen
interface UseMarkSeenResult {
  markSeen: (repoId: string, commitSha: string) => Promise<boolean>;
  isPending: boolean;
  error: Error | null;
}

export function useMarkSeen(): UseMarkSeenResult {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const markSeen = useCallback(
    async (repoId: string, commitSha: string): Promise<boolean> => {
      setError(null);
      setIsPending(true);

      try {
        if (USE_MOCK_DATA) {
          // Simulate marking as seen
          await new Promise((resolve) => setTimeout(resolve, 200));
          // In real implementation, this would call revalidatePath after mutation
          return true;
        } else {
          const { markSeen: apiMarkSeen } = await import("@/lib/api");
          await apiMarkSeen(repoId, { commit: commitSha });
          return true;
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to mark as seen");
        setError(error);
        return false;
      } finally {
        setIsPending(false);
      }
    },
    []
  );

  return {
    markSeen,
    isPending,
    error,
  };
}
