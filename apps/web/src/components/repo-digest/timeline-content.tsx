"use client";

import dynamic from "next/dynamic";
import { GitBranch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { TimelinePoint, UiBranch } from "@/types/digest";
import { DemoNotice } from "./demo-notice";

const BranchTimeline = dynamic(
  () => import("./branch-timeline").then((m) => m.BranchTimeline),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full" />,
  },
);

interface TimelineContentProps {
  branches: UiBranch[];
  timeline: TimelinePoint[];
}

export function TimelineContent({ branches, timeline }: TimelineContentProps) {
  const activeBranchList = branches.filter((b) => !b.isStale);
  const staleBranchList = branches.filter((b) => b.isStale);
  const criticalBranchList = branches.filter(
    (b) => (b.commitsBehind ?? 0) > 30 && !b.isStale,
  );

  return (
    <div className="space-y-6">
      <DemoNotice message="Timeline chart uses demo data until timeline API ships." />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Branch Timeline (demo)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">
                All
                <Badge variant="secondary" className="ml-2">
                  {branches.length}
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
              <BranchTimeline branches={branches} timeline={timeline} />
            </TabsContent>
            <TabsContent value="active" className="mt-4">
              {activeBranchList.length > 0 ? (
                <BranchTimeline
                  branches={activeBranchList}
                  timeline={timeline}
                />
              ) : (
                <div className="text-muted-foreground py-8 text-center">
                  No active branches
                </div>
              )}
            </TabsContent>
            <TabsContent value="stale" className="mt-4">
              {staleBranchList.length > 0 ? (
                <BranchTimeline
                  branches={staleBranchList}
                  timeline={timeline}
                />
              ) : (
                <div className="text-muted-foreground py-8 text-center">
                  No stale branches
                </div>
              )}
            </TabsContent>
            <TabsContent value="critical" className="mt-4">
              {criticalBranchList.length > 0 ? (
                <BranchTimeline
                  branches={criticalBranchList}
                  timeline={timeline}
                />
              ) : (
                <div className="text-muted-foreground py-8 text-center">
                  No critical branches
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
