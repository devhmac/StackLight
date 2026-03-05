import { Suspense } from "react";
import { GitBranch, GitPullRequest, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getRepoDetails, getRiskSnapshot } from "@/lib/data";
import { getRepoPullRequests } from "@/lib/github-pr";
import { OverviewContent } from "@/components/repo-digest/overview-content";
import { MetricCard } from "@/components/repo-digest/metric-card";
import type { PrWithMetrics } from "@/types/digest";

interface ProjectOverviewPageProps {
  params: Promise<{ repoId: string }>;
}

function PrOverviewSkeleton() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2].map((i) => (
          <Card key={i} className="gap-2 py-4">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="mt-1 h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function formatDuration(ms: number): string {
  if (ms === 0) return "—";
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days > 1) return `${days}d`;
  const hours = Math.floor(ms / (1000 * 60 * 60));
  return `${hours}h`;
}

function PrOverviewCards({ openPrs }: { openPrs: PrWithMetrics[] }) {
  const avgCycles = openPrs.length > 0
    ? openPrs.reduce((sum, pr) => sum + pr.metrics.changeRequestCycles, 0) / openPrs.length
    : 0;
  const avgTimeMs = openPrs.length > 0
    ? openPrs.reduce((sum, pr) => sum + pr.metrics.timeOpenMs, 0) / openPrs.length
    : 0;
  const prsNeedingAttention = [...openPrs]
    .sort((a, b) => b.metrics.changeRequestCycles - a.metrics.changeRequestCycles)
    .slice(0, 5);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Open PRs"
          variant={openPrs.length > 0 ? "neutral" : "stale"}
          value={openPrs.length}
          description={`${openPrs.filter((p) => p.reviewDecision === "CHANGES_REQUESTED").length} awaiting changes`}
          icon={<GitPullRequest className="h-4 w-4" />}
        />
        <MetricCard
          title="Avg Review Cycles"
          variant={avgCycles <= 1 ? "success" : avgCycles <= 3 ? "warn" : "error"}
          value={avgCycles.toFixed(1)}
          description={`avg ${formatDuration(avgTimeMs)} in review`}
          icon={<GitPullRequest className="h-4 w-4" />}
        />
      </div>

      {prsNeedingAttention.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitPullRequest className="h-5 w-5" />
              PRs Needing Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-sm">
              {prsNeedingAttention.map((pr) => (
                <li
                  key={pr.number}
                  className="flex items-start justify-between gap-2 rounded-md border p-2"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      #{pr.number} {pr.title}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      by {pr.author.login}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={
                      pr.metrics.changeRequestCycles >= 4
                        ? "font-semibold text-red-600"
                        : pr.metrics.changeRequestCycles >= 2
                          ? "font-semibold text-yellow-600"
                          : "text-muted-foreground"
                    }>
                      {pr.metrics.changeRequestCycles} cycles
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </>
  );
}

async function PrOverviewSection({ repoPath }: { repoPath: string }) {
  const openPrs = await getRepoPullRequests(repoPath, "open");
  return <PrOverviewCards openPrs={openPrs} />;
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
        <PrOverviewSection repoPath={repo.path} />
      </Suspense>
    </div>
  );
}
