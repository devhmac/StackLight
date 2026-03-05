"use client";

import { useState, useTransition } from "react";
import { formatDistance } from "date-fns";
import { GitPullRequest } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PrWithMetrics, PrFilter, PrSort } from "@/types/digest";
import { fetchPrsAction } from "@/lib/pr-actions";

interface PrListContentProps {
  initialPrs: PrWithMetrics[];
  repoPath: string;
}

function getPrStatusBadge(pr: PrWithMetrics) {
  if (pr.isDraft) return <Badge variant="secondary">Draft</Badge>;
  if (pr.state === "MERGED") return <Badge>Merged</Badge>;
  if (pr.state === "CLOSED") return <Badge variant="secondary">Closed</Badge>;
  if (pr.reviewDecision === "CHANGES_REQUESTED")
    return <Badge variant="destructive">Changes Requested</Badge>;
  if (pr.reviewDecision === "APPROVED")
    return <Badge variant="success">Approved</Badge>;
  return <Badge variant="outline">Open</Badge>;
}

function getCycleBadgeClass(cycles: number): string {
  if (cycles <= 1)
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  if (cycles <= 3)
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
}

function formatDuration(ms: number): string {
  const now = new Date();
  return formatDistance(new Date(now.getTime() - ms), now);
}

const FILTER_OPTIONS: { label: string; value: PrFilter }[] = [
  { label: "Open", value: "open" },
  { label: "Closed", value: "closed" },
  { label: "All", value: "all" },
];

const SORT_OPTIONS: { label: string; value: PrSort }[] = [
  { label: "Recently Updated", value: "updated" },
  { label: "Newest", value: "created" },
];

export function PrListContent({ initialPrs, repoPath }: PrListContentProps) {
  const [filter, setFilter] = useState<PrFilter>("open");
  const [sort, setSort] = useState<PrSort>("updated");
  const [prs, setPrs] = useState(initialPrs);
  const [isPending, startTransition] = useTransition();

  const refetchPrs = (newFilter: PrFilter, newSort: PrSort) => {
    startTransition(async () => {
      const result = await fetchPrsAction(repoPath, newFilter, newSort);
      setPrs(result);
    });
  };

  const handleFilterChange = (newFilter: PrFilter) => {
    setFilter(newFilter);
    refetchPrs(newFilter, sort);
  };

  const handleSortChange = (newSort: PrSort) => {
    setSort(newSort);
    refetchPrs(filter, newSort);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pull Requests</h1>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {SORT_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={sort === opt.value ? "default" : "ghost"}
                size="sm"
                onClick={() => handleSortChange(opt.value)}
                disabled={isPending}
              >
                {opt.label}
              </Button>
            ))}
          </div>
          <div className="bg-border h-6 w-px" />
          <div className="flex gap-1">
            {FILTER_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={filter === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange(opt.value)}
                disabled={isPending}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitPullRequest className="h-5 w-5" />
            {filter === "open"
              ? "Open"
              : filter === "closed"
                ? "Closed"
                : "All"}{" "}
            Pull Requests
            <span className="text-muted-foreground text-sm font-normal">
              ({prs.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {prs.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No {filter === "all" ? "" : filter} pull requests found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PR</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Cycles</TableHead>
                  <TableHead className="text-right">Time Open</TableHead>
                  <TableHead className="text-right">Changes</TableHead>
                  <TableHead className="text-right">Comments</TableHead>
                  <TableHead>Reviewers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prs.map((pr) => (
                  <TableRow key={pr.number}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">#{pr.number}</span>
                        <span className="text-muted-foreground max-w-[200px] truncate text-xs">
                          {pr.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {pr.author.login}
                    </TableCell>
                    <TableCell>{getPrStatusBadge(pr)}</TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getCycleBadgeClass(pr.metrics.changeRequestCycles)}`}
                      >
                        {pr.metrics.changeRequestCycles}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right text-sm">
                      {formatDuration(pr.metrics.timeOpenMs)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-green-600 dark:text-green-400">
                        +{pr.additions}
                      </span>
                      {" / "}
                      <span className="text-red-600 dark:text-red-400">
                        -{pr.deletions}
                      </span>
                      <span className="text-muted-foreground ml-1 text-xs">
                        ({pr.changedFiles} files)
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right">
                      {pr.metrics.commentCount}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {pr.metrics.reviewers.join(", ") || "\u2014"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
