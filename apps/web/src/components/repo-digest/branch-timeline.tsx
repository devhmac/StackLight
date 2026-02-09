"use client";

import { useMemo, useState } from "react";
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
  type GanttFeature,
  type GanttStatus,
} from "@/components/kibo-ui/gantt";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import type { TimelinePoint, UiBranch } from "@/types/digest";
import { BranchDetailDialog } from "./branch-detail-dialog";

interface BranchTimelineProps {
  branches: UiBranch[];
  timeline: TimelinePoint[];
}

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

function getBranchStatus(branch: UiBranch): GanttStatus {
  if ((branch.commitsBehind ?? 0) > 30) return STATUS_CRITICAL;
  if (branch.isStale) return STATUS_STALE;
  return STATUS_ACTIVE;
}

function branchToFeature(branch: UiBranch): GanttFeature {
  return {
    id: branch.name,
    name: branch.name.replace(/^(feature|fix|chore|experiment)\//, ""),
    startAt: new Date(branch.forkedAt),
    endAt: new Date(branch.lastCommitTimestamp),
    status: getBranchStatus(branch),
  };
}

export function BranchTimeline({ branches, timeline }: BranchTimelineProps) {
  const [selectedBranch, setSelectedBranch] = useState<UiBranch | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const timelineMap = useMemo(() => {
    const map = new Map<string, TimelinePoint>();
    for (const item of timeline) {
      map.set(item.branch, item);
    }
    return map;
  }, [timeline]);

  const handleOpenDetail = (branch: UiBranch) => {
    setSelectedBranch(branch);
    setDialogOpen(true);
  };

  // Group branches by prefix (feature/, fix/, etc.)
  const groupedBranches = useMemo(() => {
    const groups = new Map<string, UiBranch[]>([
      ["feature", []],
      ["fix", []],
      ["chore", []],
      ["experiment", []],
      ["other", []],
    ]);

    for (const branch of branches) {
      const prefix = branch.name.split("/")[0] ?? "other";
      const targetGroup = groups.has(prefix) ? prefix : "other";
      const group = groups.get(targetGroup);
      if (group) {
        group.push(branch);
      }
    }

    // Filter out empty groups and convert to array
    return Array.from(groups.entries()).filter(([, items]) => items.length > 0);
  }, [branches]);

  const handleSelectItem = (id: string) => {
    const branch = branches.find((b) => b.name === id);
    setSelectedBranch(branch ?? null);
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
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

      {/* Gantt Chart */}
      <div className="h-[500px] overflow-hidden rounded-lg border">
        <GanttProvider range="daily" zoom={100}>
          <GanttSidebar>
            {groupedBranches.map(([groupName, groupBranches]) => (
              <GanttSidebarGroup key={groupName} name={groupName}>
                {groupBranches.map((branch) => {
                  const override = timelineMap.get(branch.name);
                  const feature = override
                    ? {
                        ...branchToFeature(branch),
                        startAt: new Date(override.startedAt),
                        endAt: new Date(override.lastCommitAt),
                      }
                    : branchToFeature(branch);
                  return (
                    <GanttSidebarItem
                      key={branch.name}
                      feature={feature}
                      onSelectItem={handleSelectItem}
                    />
                  );
                })}
              </GanttSidebarGroup>
            ))}
          </GanttSidebar>
          <GanttTimeline>
            <GanttHeader />
            <GanttFeatureList>
              {groupedBranches.map(([groupName, groupBranches]) => (
                <GanttFeatureListGroup key={groupName}>
                  {groupBranches.map((branch) => {
                    const override = timelineMap.get(branch.name);
                    const feature = override
                      ? {
                          ...branchToFeature(branch),
                          startAt: new Date(override.startedAt),
                          endAt: new Date(override.lastCommitAt),
                        }
                      : branchToFeature(branch);
                    return (
                      <GanttFeatureItem key={branch.name} {...feature}>
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{
                              backgroundColor: getBranchStatus(branch).color,
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
                    );
                  })}
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
