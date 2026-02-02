"use client";

import {
  GitBranch,
  AlertTriangle,
  GitCommit,
  Users,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDigest, useSelectedRepo } from "@/hooks/use-digest";
import { MetricCard } from "./_components/metric-card";
import { RiskSummary } from "./_components/risk-summary";
import { RecentCommits } from "./_components/recent-commits";
import { ChurnHotspots } from "./_components/churn-hotspots";
import { MarkSeenButton } from "./_components/mark-seen-button";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
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
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <GitBranch className="text-muted-foreground/50 mb-4 h-12 w-12" />
      <h2 className="text-lg font-semibold">No repository selected</h2>
      <p className="text-muted-foreground mt-1">
        Select a repository from the sidebar to view its digest
      </p>
    </div>
  );
}

export default function DigestOverviewPage() {
  const { selectedRepoId } = useSelectedRepo();
  const { digest, loading, error, markSeen } = useDigest(selectedRepoId);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-destructive py-8 text-center">
        Error loading digest: {error.message}
      </div>
    );
  }

  if (!digest) {
    return <EmptyState />;
  }

  const { summary, risks, main, churnHotspots } = digest;

  return (
    <div className="space-y-6">
      {/* New commits banner */}
      {summary.newCommitCount > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <GitCommit className="text-primary h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">
                  {summary.newCommitCount} new{" "}
                  {summary.newCommitCount === 1 ? "commit" : "commits"} since
                  last check
                </p>
                <p className="text-muted-foreground text-sm">
                  Review the changes below
                </p>
              </div>
            </div>
            <MarkSeenButton
              onMarkSeen={markSeen}
              newCommitCount={summary.newCommitCount}
            />
          </CardContent>
        </Card>
      )}

      {/* Key metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Branches"
          value={summary.totalBranches}
          description={`${summary.staleBranchCount} stale`}
          icon={<GitBranch className="h-4 w-4" />}
        />
        <MetricCard
          title="Risk Alerts"
          value={summary.highRiskCount}
          description={`${risks.length} total risks`}
          icon={<AlertTriangle className="h-4 w-4" />}
          trend={summary.highRiskCount > 0 ? "down" : "neutral"}
        />
        <MetricCard
          title="New Commits"
          value={summary.newCommitCount}
          description="since last check"
          icon={<GitCommit className="h-4 w-4" />}
        />
        <MetricCard
          title="Active Contributors"
          value={summary.activeContributorCount}
          description="with 10+ commits"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      {/* Main content grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Risk alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risk Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RiskSummary risks={risks} maxItems={3} />
          </CardContent>
        </Card>

        {/* Churn hotspots */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Churn Hotspots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChurnHotspots hotspots={churnHotspots} maxItems={5} />
          </CardContent>
        </Card>
      </div>

      {/* Recent commits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCommit className="h-5 w-5" />
            {main.newCommits.length > 0 ? "New Commits" : "Recent Activity"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RecentCommits
            commits={main.newCommits.length > 0 ? main.newCommits : []}
            isNew={main.newCommits.length > 0}
          />
        </CardContent>
      </Card>
    </div>
  );
}
