import React, { Suspense } from "react";
import { GitBranch } from "lucide-react";
import { getRepoDetails, getRiskSnapshot } from "@/lib/data";
import { OverviewContent } from "@/components/repo-digest/overview-content";
import {
  PrOverviewSection,
  PrOverviewSkeleton,
} from "@/components/repo-digest/overview/pr-overview-section";

interface ProjectOverviewPageProps {
  params: Promise<{ repoId: string }>;
}

export default async function ProjectOverviewPage({
  params,
}: ProjectOverviewPageProps) {
  const { repoId } = await params;
  const [repo, risks] = await Promise.all([
    getRepoDetails(repoId),
    getRiskSnapshot(repoId),
  ]);

  if (!repo) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <GitBranch className="text-muted-foreground/50 mb-4 h-12 w-12" />
        <h2 className="text-lg font-semibold">Repository not found</h2>
        <p className="text-muted-foreground mt-1">
          The selected repository could not be loaded
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OverviewContent repo={repo} risks={risks} />
      <Suspense fallback={<PrOverviewSkeleton />}>
        <PrOverviewSection repoId={repoId} />
      </Suspense>
    </div>
  );
}
