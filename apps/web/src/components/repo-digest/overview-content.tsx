import { GitBranch, AlertTriangle, GitFork, GitMerge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RepoDetails, RiskItem } from "@/types/digest";
import { MetricCard } from "./metric-card";
import { DemoNotice } from "./demo-notice";
import Inbox from "./overview/inbox";
import { isActive } from "@/lib/utils";

interface OverviewContentProps {
  repo: RepoDetails;
  risks?: RiskItem[];
}
export function OverviewContent({ repo, risks = [] }: OverviewContentProps) {
  const branches = repo?.branches ?? [];

  const activeBranches = branches.filter((b) => isActive(b));
  const staleBranches = branches.filter((b) => b.isStale);
  const criticalBranches = branches.filter(
    (b) => (b.commitsBehind ?? 0) > 30 && !b.isStale,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {repo?.name ?? "Selected Repo"}
          </h1>
          {repo?.path && (
            <p className="text-muted-foreground text-sm">{repo.path}</p>
          )}
        </div>
      </div>
      <Inbox repo={repo} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Branches"
          variant={activeBranches.length > 0 ? "success" : "stale"}
          value={`${activeBranches.length} `}
          description={`${branches.length} Total Branches`}
          icon={<GitBranch className="h-4 w-4" />}
        />
        <MetricCard
          title="Stale Branches"
          variant="stale"
          value={staleBranches.length}
          description="commits ahead of default"
          icon={<GitFork className="h-4 w-4" />}
        />
        <MetricCard
          title="Critical Divergence"
          variant={criticalBranches.length > 0 ? "error" : "stale"}
          value={criticalBranches.length}
          description="commits behind default"
          icon={<GitMerge className="h-4 w-4" />}
        />
        <MetricCard
          title="High-Risk (demo)"
          variant="error"
          value={risks.filter((r) => r.severity === "high").length}
          description={`${risks.length} total demo risks`}
          icon={<AlertTriangle className="h-4 w-4" />}
          trend="neutral"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Demo Risk Highlights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <DemoNotice message="Risks are stubbed until the backend exposes a dedicated endpoint." />
          <ul className="space-y-2 text-sm">
            {risks.slice(0, 3).map((risk) => (
              <li
                key={risk.id}
                className="flex items-start gap-2 rounded-md border p-2"
              >
                <span className="font-medium">{risk.title}</span>
                <span className="text-muted-foreground">· {risk.severity}</span>
              </li>
            ))}
            {risks.length === 0 && (
              <li className="text-muted-foreground">
                No risk data available yet.
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
