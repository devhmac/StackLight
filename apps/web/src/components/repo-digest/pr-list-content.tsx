"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDistance } from "date-fns";
import { useInView } from "react-intersection-observer";
import { GitPullRequest } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PrWithMetrics, PrFilter, PrSort, PrPage } from "@/types/digest";
import { fetchPrsPageAction } from "@/lib/pr-actions";
import { formatDurationFrom } from "@/lib/utils";
import { PrDetailDialog } from "./pr-detail-dialog";

interface PrListContentProps {
  initialPage: PrPage;
  repoPath: string;
}

export function getPrStatusBadge(pr: PrWithMetrics) {
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

const FILTER_OPTIONS: { label: string; value: PrFilter }[] = [
  { label: "Open", value: "open" },
  { label: "Closed", value: "closed" },
  { label: "All", value: "all" },
];

const SORT_OPTIONS: { label: string; value: PrSort }[] = [
  { label: "Recently Updated", value: "updated" },
  { label: "Newest", value: "created" },
];

function SkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-3 w-32" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16 rounded-full" />
          </TableCell>
          <TableCell className="text-center">
            <Skeleton className="mx-auto h-5 w-8 rounded-full" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="ml-auto h-4 w-12" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="ml-auto h-4 w-16" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="ml-auto h-4 w-24" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="ml-auto h-4 w-6" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function PrListContent({ initialPage, repoPath }: PrListContentProps) {
  const [filter, setFilter] = useState<PrFilter>("open");
  const [sort, setSort] = useState<PrSort>("updated");
  const [prs, setPrs] = useState<PrWithMetrics[]>(initialPage.prs);
  const [cursor, setCursor] = useState<string | null>(initialPage.pageInfo.endCursor);
  const [hasNextPage, setHasNextPage] = useState(initialPage.pageInfo.hasNextPage);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Dialog state
  const [selectedPr, setSelectedPr] = useState<PrWithMetrics | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { ref: sentinelRef, inView } = useInView({ threshold: 0 });

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasNextPage) return;
    setIsLoadingMore(true);
    try {
      const page = await fetchPrsPageAction(repoPath, filter, sort, cursor);
      setPrs((prev) => [...prev, ...page.prs]);
      setCursor(page.pageInfo.endCursor);
      setHasNextPage(page.pageInfo.hasNextPage);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasNextPage, repoPath, filter, sort, cursor]);

  // Auto-load when sentinel comes into view
  useEffect(() => {
    if (inView && hasNextPage && !isLoadingMore && !isResetting) {
      loadMore();
    }
  }, [inView, hasNextPage, isLoadingMore, isResetting, loadMore]);

  const resetAndFetch = useCallback(
    async (newFilter: PrFilter, newSort: PrSort) => {
      setIsResetting(true);
      setPrs([]);
      setCursor(null);
      setHasNextPage(false);
      try {
        const page = await fetchPrsPageAction(repoPath, newFilter, newSort, null);
        setPrs(page.prs);
        setCursor(page.pageInfo.endCursor);
        setHasNextPage(page.pageInfo.hasNextPage);
      } finally {
        setIsResetting(false);
      }
    },
    [repoPath],
  );

  const handleFilterChange = (newFilter: PrFilter) => {
    setFilter(newFilter);
    resetAndFetch(newFilter, sort);
  };

  const handleSortChange = (newSort: PrSort) => {
    setSort(newSort);
    resetAndFetch(filter, newSort);
  };

  const handlePrClick = (pr: PrWithMetrics) => {
    setSelectedPr(pr);
    setDialogOpen(true);
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
                disabled={isResetting}
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
                disabled={isResetting}
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
              ({prs.length} loaded{hasNextPage ? "+" : ""})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PR</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Cycles</TableHead>
                <TableHead className="text-right">Time Open</TableHead>
                <TableHead className="text-right">Last Updated</TableHead>
                <TableHead className="text-right">Changes</TableHead>
                <TableHead className="text-right">Comments</TableHead>
                <TableHead>Reviewers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isResetting ? (
                <SkeletonRows count={8} />
              ) : prs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-muted-foreground py-8 text-center"
                  >
                    No {filter === "all" ? "" : filter} pull requests found.
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {prs.map((pr) => (
                    <TableRow
                      key={pr.number}
                      className="cursor-pointer"
                      onClick={() => handlePrClick(pr)}
                    >
                      <TableCell>
                        <div className="flex max-w-xs flex-col">
                          <span className="truncate text-sm font-medium">{pr.title}</span>
                          <span className="text-muted-foreground text-xs">
                            #{pr.number}
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
                        {formatDurationFrom(pr.metrics.timeOpenMs)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-right text-sm">
                        {formatDistance(new Date(pr.updatedAt), new Date(), {
                          addSuffix: true,
                        })}
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
                  {isLoadingMore && <SkeletonRows count={3} />}
                </>
              )}
            </TableBody>
          </Table>

          {/* Sentinel for infinite scroll */}
          {hasNextPage && !isResetting && (
            <div ref={sentinelRef} className="h-1" />
          )}
        </CardContent>
      </Card>

      <PrDetailDialog
        pr={selectedPr}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
