"use client";

import { GitBranch, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useDigest, useSelectedRepo } from "@/hooks/use-digest";
import { BranchTimeline } from "../_components/branch-timeline";

function LoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[400px] w-full" />
      </CardContent>
    </Card>
  );
}

function EmptyState() {
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

export default function TimelinePage() {
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

  const { activeBranches, streams } = digest;

  // Filter branches by status
  const activeBranchList = activeBranches.filter(
    (b) => !b.isStale && b.commitsBehind <= 30
  );
  const staleBranchList = activeBranches.filter(
    (b) => b.isStale && b.commitsBehind <= 30
  );
  const criticalBranchList = activeBranches.filter(
    (b) => b.commitsBehind > 30
  );

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="gap-2 py-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Branches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {activeBranchList.length}
            </div>
          </CardContent>
        </Card>
        <Card className="gap-2 py-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stale Branches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-2xl font-bold">
              {staleBranchList.length}
            </div>
          </CardContent>
        </Card>
        <Card className="gap-2 py-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Critical Divergence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-destructive text-2xl font-bold">
              {criticalBranchList.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Branch Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">
                All
                <Badge variant="secondary" className="ml-2">
                  {activeBranches.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="active">
                Active
                <Badge variant="secondary" className="ml-2">
                  {activeBranchList.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="stale">
                Stale
                <Badge variant="secondary" className="ml-2">
                  {staleBranchList.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="critical">
                Critical
                <Badge variant="secondary" className="ml-2">
                  {criticalBranchList.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <BranchTimeline branches={activeBranches} />
            </TabsContent>
            <TabsContent value="active" className="mt-4">
              {activeBranchList.length > 0 ? (
                <BranchTimeline branches={activeBranchList} />
              ) : (
                <div className="text-muted-foreground py-8 text-center">
                  No active branches
                </div>
              )}
            </TabsContent>
            <TabsContent value="stale" className="mt-4">
              {staleBranchList.length > 0 ? (
                <BranchTimeline branches={staleBranchList} />
              ) : (
                <div className="text-muted-foreground py-8 text-center">
                  No stale branches
                </div>
              )}
            </TabsContent>
            <TabsContent value="critical" className="mt-4">
              {criticalBranchList.length > 0 ? (
                <BranchTimeline branches={criticalBranchList} />
              ) : (
                <div className="text-muted-foreground py-8 text-center">
                  No critical branches
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Streams */}
      {streams && streams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Work Streams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {streams.map((stream) => (
                <Card key={stream.id} className="gap-2 py-3">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-sm">{stream.name}</CardTitle>
                    {stream.pattern && (
                      <p className="text-muted-foreground font-mono text-xs">
                        {stream.pattern}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-muted-foreground space-y-1 text-xs">
                      <p>{stream.metrics.branchCount} branches</p>
                      <p>{stream.metrics.commitCount} commits</p>
                      <p>Max divergence: {stream.metrics.maxDivergence}</p>
                      {stream.lead && <p>Lead: {stream.lead}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
