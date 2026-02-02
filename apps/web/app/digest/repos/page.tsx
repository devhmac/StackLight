"use client";

import { FolderGit2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepos, useSelectedRepo } from "@/hooks/use-digest";
import { RepoCard } from "../_components/repo-card";
import { AddRepoDialog } from "../_components/add-repo-dialog";

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-32 w-full rounded-xl" />
      ))}
    </div>
  );
}

export default function ReposPage() {
  const { repos, loading, error, addRepo, deleteRepo } = useRepos();
  const { selectedRepoId, setSelectedRepoId } = useSelectedRepo();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive py-8 text-center">
        Error loading repos: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Repositories</h2>
          <p className="text-muted-foreground text-sm">
            Manage the repositories you&apos;re tracking
          </p>
        </div>
        <AddRepoDialog onAdd={addRepo} />
      </div>

      {repos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FolderGit2 className="text-muted-foreground/50 mb-4 h-12 w-12" />
          <h3 className="text-lg font-semibold">No repositories</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            Add a repository to start tracking its activity
          </p>
          <AddRepoDialog onAdd={addRepo} />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {repos.map((repo) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              isSelected={repo.id === selectedRepoId}
              onSelect={() => setSelectedRepoId(repo.id)}
              onDelete={() => deleteRepo(repo.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
