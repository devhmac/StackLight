"use client";

import { format } from "date-fns";
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

interface TimelineEvent {
  type: "opened" | "review" | "changes_requested" | "merged" | "closed";
  date: string;
  actor: string;
  commentsBetween: number;
}

function buildTimeline(pr: PrWithMetrics): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // 1. Opened
  events.push({
    type: "opened",
    date: pr.createdAt,
    actor: pr.author.login,
    commentsBetween: 0,
  });

  // 2. Review events — filter to significant states, count COMMENTED between them
  const sorted = [...pr.reviews].sort(
    (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
  );

  let commentCount = 0;
  for (const review of sorted) {
    if (review.state === "COMMENTED" || review.state === "PENDING" || review.state === "DISMISSED") {
      commentCount++;
      continue;
    }
    events.push({
      type: review.state === "CHANGES_REQUESTED" ? "changes_requested" : "review",
      date: review.submittedAt,
      actor: review.author.login,
      commentsBetween: commentCount,
    });
    commentCount = 0;
  }

  // 3. Merged or Closed
  if (pr.mergedAt) {
    events.push({
      type: "merged",
      date: pr.mergedAt,
      actor: pr.author.login,
      commentsBetween: commentCount,
    });
  } else if (pr.closedAt) {
    events.push({
      type: "closed",
      date: pr.closedAt,
      actor: pr.author.login,
      commentsBetween: commentCount,
    });
  }

  return events;
}

const DOT_COLORS: Record<TimelineEvent["type"], string> = {
  opened: "bg-blue-500",
  review: "bg-green-500",
  changes_requested: "bg-red-500",
  merged: "bg-purple-500",
  closed: "bg-gray-400",
};

function timelineLabel(event: TimelineEvent): string {
  switch (event.type) {
    case "opened":
      return `Opened by @${event.actor}`;
    case "review":
      return `Approved by @${event.actor}`;
    case "changes_requested":
      return `Changes requested by @${event.actor}`;
    case "merged":
      return "Merged";
    case "closed":
      return "Closed";
  }
}

export function PrDetailDialog({ pr, open, onOpenChange }: PrDetailDialogProps) {
  if (!pr) return null;

  const timeline = buildTimeline(pr);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <DialogTitle className="flex min-w-0 items-start gap-2 text-lg">
                <GitPullRequest className="mt-1 h-5 w-5 shrink-0" />
                <span className="min-w-0 break-words [overflow-wrap:anywhere]">#{pr.number} {pr.title}</span>
              </DialogTitle>
              <DialogDescription className="mt-1 flex flex-wrap items-center gap-1.5">
                <span>by {pr.author.login}</span>
                <span>&middot;</span>
                <span>
                  opened {format(new Date(pr.createdAt), "MMM d, yyyy")}
                </span>
                <span>&middot;</span>
                <span className="inline-flex min-w-0 items-center gap-1 font-mono text-xs">
                  <span className="truncate">{pr.headRefName}</span>
                  <ArrowRight className="h-3 w-3 shrink-0" />
                  <span className="truncate">{pr.baseRefName}</span>
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
              <p className="break-words text-sm [overflow-wrap:anywhere] whitespace-pre-wrap">{pr.bodyText}</p>
            ) : (
              <p className="text-muted-foreground text-sm italic">No description provided.</p>
            )}
          </div>
        </div>

        {/* Lifecycle timeline */}
        {timeline.length > 1 && (
          <div>
            <h3 className="mb-2 text-sm font-medium">Timeline</h3>
            <div className="rounded-lg border p-4">
              <div className="relative">
                {timeline.map((event, i) => (
                  <div key={`${event.type}-${event.date}-${i}`} className="relative flex gap-3">
                    {/* Connector line + dot */}
                    <div className="flex flex-col items-center">
                      <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT_COLORS[event.type]}`} />
                      {i < timeline.length - 1 && (
                        <div className="border-border w-px flex-1 border-l-2" />
                      )}
                    </div>
                    {/* Content */}
                    <div className={`${i < timeline.length - 1 ? "pb-4" : ""} -mt-0.5 min-w-0 flex-1`}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-medium">{timelineLabel(event)}</span>
                        <span className="text-muted-foreground shrink-0 text-xs">
                          {format(new Date(event.date), "MMM d")}
                        </span>
                      </div>
                      {event.commentsBetween > 0 && (
                        <p className="text-muted-foreground text-xs">
                          {event.commentsBetween} comment{event.commentsBetween !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
