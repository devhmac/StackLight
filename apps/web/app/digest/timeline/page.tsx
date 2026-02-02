import { Suspense } from "react";
import { GitBranch } from "lucide-react";
import { getRepoDigest, getDefaultRepoId } from "@/lib/data";
import { TimelineContent } from "../_components/timeline-content";
import { TimelineSkeleton } from "../_components/timeline-skeleton";

interface PageProps {
  searchParams: Promise<{ repo?: string }>;
}

// Async Server Component that fetches and displays timeline data
async function TimelineData({ repoId }: { repoId: string }) {
  const digest = await getRepoDigest(repoId);

  if (!digest) {
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

  return <TimelineContent digest={digest} />;
}

export default async function TimelinePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const repoId = params.repo || (await getDefaultRepoId());

  if (!repoId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <GitBranch className="text-muted-foreground/50 mb-4 h-12 w-12" />
        <h2 className="text-lg font-semibold">No repository selected</h2>
        <p className="text-muted-foreground mt-1">
          Select a repository from the sidebar to view branch timeline
        </p>
      </div>
    );
  }

  return (
    <Suspense fallback={<TimelineSkeleton />}>
      <TimelineData repoId={repoId} />
    </Suspense>
  );
}
