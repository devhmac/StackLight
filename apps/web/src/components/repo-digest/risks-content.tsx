"use client";

import { useState } from "react";
import { AlertTriangle, GitMerge, Clock, GitFork, Expand } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { CollisionItem, RiskItem, RiskType, UiBranch } from "@/types/digest";
import { RiskList } from "./risk-list";
import { CollisionTable } from "./collision-table";
import { BranchDetailDialog } from "./branch-detail-dialog";
import { DemoNotice } from "./demo-notice";

interface RisksContentProps {
  branches: UiBranch[];
  risks: RiskItem[];
  collisions: CollisionItem[];
}

export function RisksContent({ branches, risks, collisions }: RisksContentProps) {
  const [selectedBranch, setSelectedBranch] = useState<UiBranch | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleBranchClick = (branch: UiBranch) => {
    setSelectedBranch(branch);
    setDialogOpen(true);
  };

  const handleBranchNameClick = (branchName: string) => {
    const branch = branches.find((b) => b.name === branchName);
    if (branch) handleBranchClick(branch);
  };

  const riskCounts: Record<RiskType, number> = {
    divergence: risks.filter((r) => r.type === "divergence").length,
    collision: risks.filter((r) => r.type === "collision").length,
    stale: risks.filter((r) => r.type === "stale").length,
    scope_creep: risks.filter((r) => r.type === "scope_creep").length,
  };

  const highCount = risks.filter((r) => r.severity === "high").length;
  const mediumCount = risks.filter((r) => r.severity === "medium").length;
  const lowCount = risks.filter((r) => r.severity === "low").length;

  const staleBranches = branches.filter((b) => b.isStale);

  return (
    <div className="space-y-6">
      <DemoNotice message="Risks and collisions are demo-only until backend endpoints land." />

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="gap-2 py-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="text-destructive h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-destructive text-2xl font-bold">{highCount}</div>
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
            <CardTitle className="text-sm font-medium">File Collisions</CardTitle>
            <GitMerge className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collisions.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risk Alerts (demo)
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitMerge className="h-5 w-5" />
            File Collision Details (demo)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CollisionTable collisions={collisions} onBranchClick={handleBranchNameClick} />
        </CardContent>
      </Card>

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
                  className="hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-md border p-3 transition-colors"
                  onClick={() => handleBranchClick(branch)}
                >
                  <div>
                    <p className="font-medium">{branch.name}</p>
                    <p className="text-muted-foreground text-sm">by {branch.author}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-muted-foreground text-sm">commits behind: {branch.commitsBehind ?? 0}</p>
                    </div>
                    <Badge variant="secondary">Stale</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <BranchDetailDialog
        branch={selectedBranch}
        allBranches={branches}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
