"use client";

import { formatDistanceToNow } from "date-fns";
import {
  GitPullRequest,
  ArrowRight,
  ExternalLink,
  Clock,
  MessageSquare,
  FileCode,
  Plus,
  Minus,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { PrWithMetrics } from "@/types/digest";
import { getPrStatusBadge } from "./pr-list-content";
import { formatDurationFrom } from "@/lib/utils";

interface PrDetailDialogProps {
  pr: PrWithMetrics | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getReviewStateBadge(state: string) {
  switch (state) {
    case "APPROVED":
      return <Badge variant="success">Approved</Badge>;
    case "CHANGES_REQUESTED":
      return <Badge variant="destructive">Changes Requested</Badge>;
    case "COMMENTED":
      return <Badge variant="outline">Commented</Badge>;
    case "DISMISSED":
      return <Badge variant="secondary">Dismissed</Badge>;
    default:
      return <Badge variant="outline">{state}</Badge>;
  }
}

export function PrDetailDialog({ pr, open, onOpenChange }: PrDetailDialogProps) {
  if (!pr) return null;

  const sortedReviews = [...pr.reviews].sort(
    (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <GitPullRequest className="h-5 w-5 shrink-0" />
                <span className="truncate">#{pr.number} {pr.title}</span>
              </DialogTitle>
              <DialogDescription className="mt-1 flex flex-wrap items-center gap-1.5">
                <span>by {pr.author.login}</span>
                <span>&middot;</span>
                <span>
                  opened{" "}
                  {formatDistanceToNow(new Date(pr.createdAt), { addSuffix: true })}
                </span>
                <span>&middot;</span>
                <span className="inline-flex items-center gap-1 font-mono text-xs">
                  {pr.headRefName}
                  <ArrowRight className="h-3 w-3" />
                  {pr.baseRefName}
                </span>
              </DialogDescription>
            </div>
            <div className="flex shrink-0 gap-1.5">
              {getPrStatusBadge(pr)}
              {pr.isDraft && pr.state === "OPEN" && (
                <Badge variant="secondary">Draft</Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Stats bar */}
        <div className="bg-muted/50 flex flex-wrap items-center gap-4 rounded-lg px-4 py-3 text-sm">
          <div className="flex items-center gap-1.5">
            <Clock className="text-muted-foreground h-4 w-4" />
            <span className="font-medium">{formatDurationFrom(pr.metrics.timeOpenMs)}</span>
            <span className="text-muted-foreground">open</span>
          </div>
          {pr.metrics.timeToMergeMs !== null && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1.5">
                <span className="font-medium">{formatDurationFrom(pr.metrics.timeToMergeMs)}</span>
                <span className="text-muted-foreground">to merge</span>
              </div>
            </>
          )}
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-1.5">
            <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="font-medium text-green-600 dark:text-green-400">
              {pr.additions.toLocaleString()}
            </span>
            <Minus className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span className="font-medium text-red-600 dark:text-red-400">
              {pr.deletions.toLocaleString()}
            </span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-1.5">
            <FileCode className="text-muted-foreground h-4 w-4" />
            <span className="font-medium">{pr.changedFiles}</span>
            <span className="text-muted-foreground">files</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-1.5">
            <MessageSquare className="text-muted-foreground h-4 w-4" />
            <span className="font-medium">{pr.metrics.commentCount}</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-1.5">
            <Users className="text-muted-foreground h-4 w-4" />
            <span className="font-medium">{pr.metrics.reviewers.length}</span>
            <span className="text-muted-foreground">reviewers</span>
          </div>
        </div>

        {/* Body */}
        <div>
          <h3 className="mb-2 text-sm font-medium">Description</h3>
          <div className="rounded-lg border p-3">
            {pr.bodyText ? (
              <p className="whitespace-pre-wrap text-sm">{pr.bodyText}</p>
            ) : (
              <p className="text-muted-foreground text-sm italic">No description provided.</p>
            )}
          </div>
        </div>

        {/* Review timeline */}
        {sortedReviews.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-medium">Reviews</h3>
            <div className="space-y-1 rounded-lg border">
              {sortedReviews.map((review, i) => (
                <div
                  key={`${review.author.login}-${review.submittedAt}-${i}`}
                  className="flex items-center gap-3 border-b px-3 py-2 last:border-b-0"
                >
                  <span className="text-sm font-medium">{review.author.login}</span>
                  <div className="flex-1">{getReviewStateBadge(review.state)}</div>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {formatDistanceToNow(new Date(review.submittedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" asChild>
            <a href={pr.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1.5 h-4 w-4" />
              View on GitHub
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
