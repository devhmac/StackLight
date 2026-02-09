import { AlertTriangle } from "lucide-react";
import {
  getCollisions,
  getRepoDetails,
  getRepos,
  getRiskSnapshot,
} from "@/lib/data";
import { RisksContent } from "@/components/repo-digest/risks-content";

interface ProjectRisksPageProps {
  params: Promise<{ repoId: string }>;
}

export default async function ProjectRisksPage({
  params,
}: ProjectRisksPageProps) {
  const { repoId } = await params;
  const [repo, risks, collisions] = await Promise.all([
    getRepoDetails(repoId),
    getRiskSnapshot(repoId),
    getCollisions(repoId),
  ]);

  if (!repo) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertTriangle className="text-muted-foreground/50 mb-4 h-12 w-12" />
        <h2 className="text-lg font-semibold">Repository not found</h2>
        <p className="text-muted-foreground mt-1">
          The selected repository could not be loaded
        </p>
      </div>
    );
  }

  return (
    <RisksContent
      branches={repo.branches}
      risks={risks}
      collisions={collisions}
    />
  );
}
