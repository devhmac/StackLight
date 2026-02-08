import { GitBranch } from "lucide-react";
import { getTimeline, getRepos, getRepoDetails } from "@/lib/data";
import { TimelineContent } from "@/components/repo-digest/timeline-content";

interface ProjectTimelinePageProps {
  params: Promise<{ repoId: string }>;
}

export default async function ProjectTimelinePage({
  params,
}: ProjectTimelinePageProps) {
  const { repoId } = await params;
  const [repo, timeline] = await Promise.all([
    getRepoDetails(repoId),
    getTimeline(repoId),
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

  return <TimelineContent branches={repo.branches} timeline={timeline} />;
}
