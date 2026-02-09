"use client";

import { useRouter } from "next/navigation";
import { FolderGit2 } from "lucide-react";
import type { RepoSummary } from "@/types/digest";
import { useRepoActions } from "@/hooks/use-digest";
import { RepoCard } from "./repo-card";
import { AddRepoDialog } from "./add-repo-dialog";

interface ReposContentProps {
  repos: RepoSummary[];
  selectedRepoId: string | null;
}

export function ReposContent({ repos, selectedRepoId }: ReposContentProps) {
  const router = useRouter();
  const { addRepo, deleteRepo } = useRepoActions();

  const handleAddRepo = async (path: string) => {
    const newRepo = await addRepo(path);
    if (newRepo) {
      router.refresh();
    }
    return newRepo;
  };

  const handleDeleteRepo = async (id: string) => {
    const success = await deleteRepo(id);
    if (success) {
      router.refresh();
    }
    return success;
  };

  const handleSelectRepo = (repoId: string) => {
    router.push(`/project/${repoId}`);
  };

  if (repos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderGit2 className="text-muted-foreground/50 mb-4 h-12 w-12" />
        <h3 className="text-lg font-semibold">No repositories</h3>
        <p className="text-muted-foreground mt-1 mb-4">
          Add a repository to start tracking its activity
        </p>
        <AddRepoDialog onAdd={handleAddRepo} />
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
        <AddRepoDialog onAdd={handleAddRepo} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {repos.map((repo) => (
          <RepoCard
            key={repo.id}
            repo={repo}
            isSelected={repo.id === selectedRepoId}
            onSelect={() => handleSelectRepo(repo.id)}
            onDelete={() => handleDeleteRepo(repo.id)}
          />
        ))}
      </div>
    </div>
  );
}
