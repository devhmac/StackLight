"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import {
  GanttProvider,
  GanttSidebar,
  GanttSidebarGroup,
  GanttSidebarItem,
  GanttTimeline,
  GanttHeader,
  GanttFeatureList,
  GanttFeatureListGroup,
  GanttFeatureItem,
  GanttToday,
  type GanttApi,
  type GanttFeature,
  type GanttStatus,
} from "@/components/kibo-ui/gantt";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import type { TimelinePoint, UiBranch } from "@/types/digest";
import { BranchDetailDialog } from "./branch-detail-dialog";
import { isActive } from "@/lib/utils";

interface BranchTimelineProps {
  branches: UiBranch[];
  timeline: TimelinePoint[];
}

type GroupedBranchItem = {
  branch: UiBranch;
  feature: GanttFeature;
};

// Define statuses for branch health
const STATUS_ACTIVE: GanttStatus = {
  id: "active",
  name: "Active",
  color: "hsl(142, 76%, 36%)", // green
};

const STATUS_STALE: GanttStatus = {
  id: "stale",
  name: "Stale",
  color: "hsl(220, 9%, 46%)", // muted gray
};

const STATUS_CRITICAL: GanttStatus = {
  id: "critical",
  name: "Critical",
  color: "hsl(0, 84%, 60%)", // red/destructive
};
const STATUS_MERGED: GanttStatus = {
  id: "merged",
  name: "Merged",
  color: "hsl(220, 9%, 46%)", // red/destructive
};

function getBranchStatus(branch: UiBranch): GanttStatus | undefined {
  if ((branch.commitsBehind ?? 0) > 30) return STATUS_CRITICAL;
  if (branch.isStale) return STATUS_STALE;
  if (isActive(branch)) return STATUS_ACTIVE;
  if (branch.isMerged) return STATUS_MERGED;
  return;
}

function branchToFeature(branch: UiBranch): GanttFeature {
  return {
    id: branch.name,
    name: branch.name.replace(/^(feature|fix|chore|experiment)\//, ""),
    //If no forked at then branch is already merged and wont have a start date
    startAt: branch.forkedAt
      ? new Date(branch.forkedAt)
      : new Date(branch.lastCommitTimestamp),
    endAt: new Date(branch.lastCommitTimestamp),
    status: getBranchStatus(branch),
  };
}

export function BranchTimeline({ branches, timeline }: BranchTimelineProps) {
  const [selectedBranch, setSelectedBranch] = useState<UiBranch | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  // NOTE: Used by the "Today" button to jump back to the current date.
  const ganttApiRef = useRef<GanttApi | null>(null);

  const timelineMap = useMemo(() => {
    const map = new Map<string, TimelinePoint>();
    for (const item of timeline) {
      map.set(item.branch, item);
    }
    return map;
  }, [timeline]);

  // NOTE: Stable handler to avoid rebinding for every list item render.
  const handleOpenDetail = useCallback((branch: UiBranch) => {
    setSelectedBranch(branch);
    setDialogOpen(true);
  }, []);

  // Group branches by prefix (feature/, fix/, etc.) and keep merged separate.
  // NOTE: We build the feature payloads here so we don't duplicate the override logic.
  const groupedBranches = useMemo(() => {
    const groups = new Map<string, GroupedBranchItem[]>([
      ["merged", []],
      ["feature", []],
      ["fix", []],
      ["chore", []],
      ["experiment", []],
      ["other", []],
    ]);

    for (const branch of branches) {
      // NOTE: Merged branches are intentionally kept out of prefix groups.
      const targetGroup = branch.isMerged
        ? "merged"
        : (branch.name.split("/")[0] ?? "other");
      const groupKey = groups.has(targetGroup) ? targetGroup : "other";
      const group = groups.get(groupKey);
      const override = timelineMap.get(branch.name);
      const baseFeature = branchToFeature(branch);
      const feature = override
        ? {
            ...baseFeature,
            startAt: new Date(override.startedAt),
            endAt: new Date(override.lastCommitAt),
          }
        : baseFeature;
      if (group) {
        group.push({ branch, feature });
      }
    }

    // Filter out empty groups and convert to array
    return Array.from(groups.entries()).filter(([, items]) => items.length > 0);
  }, [branches, timelineMap]);

  // NOTE: Stable handler used by sidebar items.
  const handleSelectItem = useCallback(
    (id: string) => {
      const branch = branches.find((b) => b.name === id);
      setSelectedBranch(branch ?? null);
    },
    [branches],
  );

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded"
              style={{ backgroundColor: STATUS_ACTIVE.color }}
            />
            <span>Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded"
              style={{ backgroundColor: STATUS_STALE.color }}
            />
            <span>Stale (14+ days)</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded"
              style={{ backgroundColor: STATUS_CRITICAL.color }}
            />
            <span>Critical (Active & 30+ behind)</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          // NOTE: Jump back to the Today marker on demand.
          onClick={() => ganttApiRef.current?.scrollToToday()}
        >
          Today
        </Button>
      </div>

      {/* Gantt Chart */}
      <div className="h-[500px] overflow-hidden rounded-lg border">
        {/* NOTE: This sets the initial auto-scroll target for the Gantt. */}
        <GanttProvider
          range="daily"
          zoom={100}
          initialScrollTo="today"
          apiRef={ganttApiRef}
        >
          <GanttSidebar>
            {groupedBranches.map(([groupName, groupBranches]) => (
              <GanttSidebarGroup key={groupName} name={groupName}>
                {groupBranches.map(({ branch, feature }) => (
                  <GanttSidebarItem
                    key={branch.name}
                    feature={feature}
                    onSelectItem={handleSelectItem}
                  />
                ))}
              </GanttSidebarGroup>
            ))}
          </GanttSidebar>
          <GanttTimeline>
            <GanttHeader />
            <GanttFeatureList>
              {groupedBranches.map(([groupName, groupBranches]) => (
                <GanttFeatureListGroup key={groupName}>
                  {groupBranches.map(({ branch, feature }) => (
                    <GanttFeatureItem key={branch.name} {...feature}>
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{
                            backgroundColor: getBranchStatus(branch)?.color,
                          }}
                        />
                        <span className="truncate text-xs">
                          {branch.name.replace(
                            /^(feature|fix|chore|experiment)\//,
                            "",
                          )}
                        </span>
                      </div>
                    </GanttFeatureItem>
                  ))}
                </GanttFeatureListGroup>
              ))}
            </GanttFeatureList>
            <GanttToday />
          </GanttTimeline>
        </GanttProvider>
      </div>

      {/* Selected branch details */}
      {selectedBranch && (
        <div className="bg-muted/50 rounded-lg border p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{selectedBranch.name}</h3>
              <p className="text-muted-foreground text-sm">
                by {selectedBranch.author}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedBranch.isNew && <Badge>New</Badge>}
              {selectedBranch.isStale && (
                <Badge variant="secondary">Stale</Badge>
              )}
              {(selectedBranch.commitsBehind ?? 0) > 30 && (
                <Badge variant="destructive">Critical</Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenDetail(selectedBranch)}
              >
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                View Details
              </Button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Commits Ahead</p>
              <p className="font-medium">{selectedBranch.commitsAhead}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Commits Behind</p>
              <p
                className={
                  (selectedBranch.commitsBehind ?? 0) > 30
                    ? "text-destructive font-medium"
                    : "font-medium"
                }
              >
                {selectedBranch.commitsBehind ?? 0}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Files Changed</p>
              <p className="font-medium">
                {selectedBranch.filesChanged?.length ?? 0}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Activity</p>
              <p className="font-medium">
                {format(
                  new Date(selectedBranch.lastCommitTimestamp),
                  "MMM d, yyyy",
                )}
              </p>
            </div>
          </div>
          {(selectedBranch.filesChanged?.length ?? 0) > 0 && (
            <div className="mt-3">
              <p className="text-muted-foreground mb-1 text-sm">
                Files touched:
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedBranch.filesChanged
                  ?.slice(0, 5)
                  .map((file: string) => (
                    <Badge
                      key={file}
                      variant="outline"
                      className="font-mono text-xs"
                    >
                      {file.split("/").pop()}
                    </Badge>
                  ))}
                {(selectedBranch.filesChanged?.length ?? 0) > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{(selectedBranch.filesChanged?.length ?? 0) - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
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
