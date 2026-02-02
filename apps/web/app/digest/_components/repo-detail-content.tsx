"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import {
  FolderGit2,
  ArrowLeft,
  GitBranch,
  Users,
  AlertTriangle,
  GitCommit,
  Clock,
} from "lucide-react";
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
import type { RepoDigest, Branch } from "@/types/digest";
import { MarkSeenButton } from "./mark-seen-button";
import { BranchDetailDialog } from "./branch-detail-dialog";

interface RepoDetailContentProps {
  digest: RepoDigest;
}

export function RepoDetailContent({ digest }: RepoDetailContentProps) {
  const { repo, summary, main, lastSeen, contributors, activeBranches, risks } =
    digest;
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleBranchClick = (branch: Branch) => {
    setSelectedBranch(branch);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/digest/repos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <FolderGit2 className="h-6 w-6" />
              {repo.name}
            </h1>
            <p className="text-muted-foreground font-mono text-sm">
              {repo.path}
            </p>
          </div>
        </div>
        <MarkSeenButton
          repoId={repo.id}
          currentHead={main.currentHead}
          newCommitCount={summary.newCommitCount}
        />
      </div>

      {/* Last seen info */}
      {lastSeen && (
        <Card className="border-muted bg-muted/30">
          <CardContent className="flex items-center gap-3 py-3">
            <Clock className="text-muted-foreground h-4 w-4" />
            <span className="text-muted-foreground text-sm">
              Last checked{" "}
              {formatDistanceToNow(new Date(lastSeen.timestamp), {
                addSuffix: true,
              })}
            </span>
            <Badge variant="outline" className="font-mono text-xs">
              {lastSeen.commit.slice(0, 7)}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="gap-2 py-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Branches</CardTitle>
            <GitBranch className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalBranches}</div>
            <p className="text-muted-foreground text-xs">
              {summary.staleBranchCount} stale
            </p>
          </CardContent>
        </Card>
        <Card className="gap-2 py-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Commits</CardTitle>
            <GitCommit className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.newCommitCount}</div>
            <p className="text-muted-foreground text-xs">since last check</p>
          </CardContent>
        </Card>
        <Card className="gap-2 py-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Risk Alerts</CardTitle>
            <AlertTriangle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{risks.length}</div>
            <p className="text-muted-foreground text-xs">
              {summary.highRiskCount} high priority
            </p>
          </CardContent>
        </Card>
        <Card className="gap-2 py-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Contributors</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contributors.length}</div>
            <p className="text-muted-foreground text-xs">
              {summary.activeContributorCount} active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main info and current head */}
      <Card>
        <CardHeader>
          <CardTitle>Current State</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">
              Current HEAD (main)
            </span>
            <Badge variant="outline" className="font-mono">
              {main.currentHead.slice(0, 7)}
            </Badge>
          </div>
          {main.newCommits.length > 0 && (
            <div>
              <p className="text-muted-foreground mb-2 text-sm">
                New commits since last check:
              </p>
              <div className="space-y-2">
                {main.newCommits.slice(0, 5).map((commit) => (
                  <div
                    key={commit.sha}
                    className="bg-muted/50 flex items-center gap-3 rounded-md p-2"
                  >
                    <Badge variant="outline" className="font-mono text-xs">
                      {commit.sha.slice(0, 7)}
                    </Badge>
                    <span className="flex-1 truncate text-sm">
                      {commit.message}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {commit.author}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contributors table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Contributors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Commits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contributors.map((contributor) => (
                <TableRow key={contributor.name}>
                  <TableCell className="font-medium">
                    {contributor.name}
                  </TableCell>
                  <TableCell className="text-right">
                    {contributor.commitCount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Active branches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Active Branches
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
              {activeBranches.slice(0, 10).map((branch) => (
                <TableRow
                  key={branch.name}
                  className="cursor-pointer"
                  onClick={() => handleBranchClick(branch)}
                >
                  <TableCell className="font-medium">{branch.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {branch.author}
                  </TableCell>
                  <TableCell className="text-right text-green-600 dark:text-green-400">
                    +{branch.commitsAhead}
                  </TableCell>
                  <TableCell className="text-right text-red-600 dark:text-red-400">
                    -{branch.commitsBehind}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right">
                    {format(new Date(branch.lastCommit), "MMM d")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {branch.isNew && <Badge>New</Badge>}
                      {branch.isStale && (
                        <Badge variant="secondary">Stale</Badge>
                      )}
                      {branch.commitsBehind > 30 && (
                        <Badge variant="destructive">Critical</Badge>
                      )}
                      {!branch.isNew &&
                        !branch.isStale &&
                        branch.commitsBehind <= 30 && (
                          <Badge variant="outline">Active</Badge>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {activeBranches.length > 10 && (
            <p className="text-muted-foreground mt-4 text-center text-sm">
              Showing 10 of {activeBranches.length} branches
            </p>
          )}
        </CardContent>
      </Card>

      <BranchDetailDialog
        branch={selectedBranch}
        allBranches={activeBranches}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
