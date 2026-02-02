"use client";

import { GitBranch, AlertTriangle, GitCommit, Users, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RepoDigest } from "@/types/digest";
import { MetricCard } from "./metric-card";
import { RiskSummary } from "./risk-summary";
import { RecentCommits } from "./recent-commits";
import { ChurnHotspots } from "./churn-hotspots";
import { MarkSeenButton } from "./mark-seen-button";

interface OverviewContentProps {
  digest: RepoDigest;
}

export function OverviewContent({ digest }: OverviewContentProps) {
  const { repo, summary, risks, main, churnHotspots } = digest;

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
              repoId={repo.id}
              currentHead={main.currentHead}
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
