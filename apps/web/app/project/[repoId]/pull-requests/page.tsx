import { GitPullRequest } from "lucide-react";
import { getRepoDetails } from "@/lib/data";
import { getCachedPullRequests } from "@/lib/github-pr";
import { PrListContent } from "@/components/repo-digest/pr-list-content";

interface PullRequestsPageProps {
  params: Promise<{ repoId: string }>;
}

export default async function PullRequestsPage({
  params,
}: PullRequestsPageProps) {
  const { repoId } = await params;
  const repo = await getRepoDetails(repoId);

  if (!repo) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <GitPullRequest className="text-muted-foreground/50 mb-4 h-12 w-12" />
        <h2 className="text-lg font-semibold">Repository not found</h2>
        <p className="text-muted-foreground mt-1">
          The selected repository could not be loaded
        </p>
      </div>
    );
  }

  const prs = await getCachedPullRequests(repoId);

  return <PrListContent initialPrs={prs} repoPath={repo.path} />;
}
