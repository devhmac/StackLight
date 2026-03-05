import { getCachedPullRequests } from "@/lib/github-pr";
import { PrWithMetrics } from "@/types/digest";
import { MetricCard } from "../metric-card";
import { GitPullRequest } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration } from "@/lib/utils";
import { formatDistance } from "date-fns";

export async function PrOverviewSection({ repoId }: { repoId: string }) {
  const openPrs = await getCachedPullRequests(repoId, "open");
  return <PrOverviewCards openPrs={openPrs} />;
}

function PrOverviewCards({ openPrs }: { openPrs: PrWithMetrics[] }) {
  const avgCycles =
    openPrs.length > 0
      ? openPrs.reduce((sum, pr) => sum + pr.metrics.changeRequestCycles, 0) /
        openPrs.length
      : 0;
  const avgTimeMs =
    openPrs.length > 0
      ? openPrs.reduce((sum, pr) => sum + pr.metrics.timeOpenMs, 0) /
        openPrs.length
      : 0;
  const prsNeedingAttention = [...openPrs]
    .sort(
      (a, b) => b.metrics.changeRequestCycles - a.metrics.changeRequestCycles,
    )
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
          variant={
            avgCycles <= 1 ? "success" : avgCycles <= 3 ? "warn" : "error"
          }
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
                    <div className="flex flex-col justify-center items-start mx-4">
                      <p>
                        Updated{" "}
                        {formatDistance(new Date(pr.updatedAt), new Date(), {
                          addSuffix: true,
                        })}
                      </p>
                      <p className="text-muted-foreground">
                        Opened {formatDuration(pr.metrics.timeOpenMs)} ago
                      </p>
                    </div>
                    <span
                      className={
                        pr.metrics.changeRequestCycles >= 4
                          ? "font-semibold text-red-600"
                          : pr.metrics.changeRequestCycles >= 2
                            ? "font-semibold text-yellow-600"
                            : "text-muted-foreground"
                      }
                    >
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

export function PrOverviewSkeleton() {
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
