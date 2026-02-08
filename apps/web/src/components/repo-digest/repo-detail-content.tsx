"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { FolderGit2, ArrowLeft, GitBranch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RepoSummary, UiBranch } from "@/types/digest";
import { BranchDetailDialog } from "./branch-detail-dialog";

interface RepoDetailContentProps {
  repo: RepoSummary;
  branches: UiBranch[];
}

export function RepoDetailContent({ repo, branches }: RepoDetailContentProps) {
  const [selectedBranch, setSelectedBranch] = useState<UiBranch | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleBranchClick = (branch: UiBranch) => {
    setSelectedBranch(branch);
    setDialogOpen(true);
  };

  const avgAhead =
    branches.length === 0
      ? 0
      : Math.round(
          branches.reduce((sum, b) => sum + (b.commitsAhead ?? 0), 0) /
            branches.length,
        );
  const avgBehind =
    branches.length === 0
      ? 0
      : Math.round(
          branches.reduce((sum, b) => sum + (b.commitsBehind ?? 0), 0) /
            branches.length,
        );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/project">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <FolderGit2 className="h-6 w-6" />
              {repo.name}
            </h1>
            <p className="text-muted-foreground font-mono text-sm">{repo.path}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="gap-2 py-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Branches</CardTitle>
            <GitBranch className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branches.length}</div>
            <p className="text-muted-foreground text-xs">tracked from default origin</p>
          </CardContent>
        </Card>
        <Card className="gap-2 py-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Ahead</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgAhead}</div>
            <p className="text-muted-foreground text-xs">commits</p>
          </CardContent>
        </Card>
        <Card className="gap-2 py-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Behind</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgBehind}</div>
            <p className="text-muted-foreground text-xs">commits</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Branches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch</TableHead>
                <TableHead>Author</TableHead>
                <TableHead className="text-right">Ahead</TableHead>
                <TableHead className="text-right">Behind</TableHead>
                <TableHead className="text-right">Last Commit</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.slice(0, 20).map((branch) => (
                <TableRow
                  key={branch.name}
                  className="cursor-pointer"
                  onClick={() => handleBranchClick(branch)}
                >
                  <TableCell className="font-medium">{branch.name}</TableCell>
                  <TableCell className="text-muted-foreground">{branch.author}</TableCell>
                  <TableCell className="text-right text-green-600 dark:text-green-400">
                    +{branch.commitsAhead ?? 0}
                  </TableCell>
                  <TableCell className="text-right text-red-600 dark:text-red-400">
                    -{branch.commitsBehind ?? 0}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right">
                    {branch.lastCommitTimestamp
                      ? format(new Date(branch.lastCommitTimestamp), "MMM d")
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {branch.isNew && <Badge>New</Badge>}
                      {branch.isStale && <Badge variant="secondary">Stale</Badge>}
                      {!branch.isNew && !branch.isStale && <Badge variant="outline">Active</Badge>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {branches.length > 20 && (
            <p className="text-muted-foreground mt-4 text-center text-sm">
              Showing 20 of {branches.length} branches
            </p>
          )}
        </CardContent>
      </Card>

      <BranchDetailDialog
        branch={selectedBranch}
        allBranches={branches}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
