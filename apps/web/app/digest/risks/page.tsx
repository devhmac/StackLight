"use client";

import { AlertTriangle, GitMerge, Clock, GitFork, Expand } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useDigest, useSelectedRepo } from "@/hooks/use-digest";
import { RiskList } from "../_components/risk-list";
import { CollisionTable } from "../_components/collision-table";
import type { RiskType } from "@/types/digest";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="gap-2 py-4">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertTriangle className="text-muted-foreground/50 mb-4 h-12 w-12" />
      <h2 className="text-lg font-semibold">No repository selected</h2>
      <p className="text-muted-foreground mt-1">
        Select a repository from the sidebar to view risks
      </p>
    </div>
  );
}

export default function RisksPage() {
  const { selectedRepoId } = useSelectedRepo();
  const { digest, loading, error } = useDigest(selectedRepoId);

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

  const { risks, collisions, activeBranches } = digest;

  // Count risks by type
  const riskCounts: Record<RiskType, number> = {
    divergence: risks.filter((r) => r.type === "divergence").length,
    collision: risks.filter((r) => r.type === "collision").length,
    stale: risks.filter((r) => r.type === "stale").length,
    scope_creep: risks.filter((r) => r.type === "scope_creep").length,
  };

  // Count by severity
  const highCount = risks.filter((r) => r.severity === "high").length;
  const mediumCount = risks.filter((r) => r.severity === "medium").length;
  const lowCount = risks.filter((r) => r.severity === "low").length;

  // Stale branches list
  const staleBranches = activeBranches.filter((b) => b.isStale);

  return (
    <div className="space-y-6">
      {/* Risk summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="gap-2 py-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="text-destructive h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-destructive text-2xl font-bold">
              {highCount}
            </div>
          </CardContent>
        </Card>
        <Card className="gap-2 py-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Medium Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {mediumCount}
            </div>
          </CardContent>
        </Card>
        <Card className="gap-2 py-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {lowCount}
            </div>
          </CardContent>
        </Card>
        <Card className="gap-2 py-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              File Collisions
            </CardTitle>
            <GitMerge className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collisions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Risk alerts with tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risk Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="flex-wrap">
              <TabsTrigger value="all">
                All
                <Badge variant="secondary" className="ml-2">
                  {risks.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="divergence">
                <GitFork className="mr-1 h-3 w-3" />
                Divergence
                <Badge variant="secondary" className="ml-2">
                  {riskCounts.divergence}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="collision">
                <GitMerge className="mr-1 h-3 w-3" />
                Collision
                <Badge variant="secondary" className="ml-2">
                  {riskCounts.collision}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="stale">
                <Clock className="mr-1 h-3 w-3" />
                Stale
                <Badge variant="secondary" className="ml-2">
                  {riskCounts.stale}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="scope_creep">
                <Expand className="mr-1 h-3 w-3" />
                Scope Creep
                <Badge variant="secondary" className="ml-2">
                  {riskCounts.scope_creep}
                </Badge>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <RiskList risks={risks} filterType="all" />
            </TabsContent>
            <TabsContent value="divergence" className="mt-4">
              <RiskList risks={risks} filterType="divergence" />
            </TabsContent>
            <TabsContent value="collision" className="mt-4">
              <RiskList risks={risks} filterType="collision" />
            </TabsContent>
            <TabsContent value="stale" className="mt-4">
              <RiskList risks={risks} filterType="stale" />
            </TabsContent>
            <TabsContent value="scope_creep" className="mt-4">
              <RiskList risks={risks} filterType="scope_creep" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Collision pairs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitMerge className="h-5 w-5" />
            File Collision Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CollisionTable collisions={collisions} />
        </CardContent>
      </Card>

      {/* Stale branches */}
      {staleBranches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Stale Branches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {staleBranches.map((branch) => (
                <div
                  key={branch.name}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{branch.name}</p>
                    <p className="text-muted-foreground text-sm">
                      by {branch.author}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-muted-foreground text-sm">
                        {branch.staleDays} days inactive
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {branch.commitsBehind} commits behind
                      </p>
                    </div>
                    <Badge variant="secondary">Stale</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
