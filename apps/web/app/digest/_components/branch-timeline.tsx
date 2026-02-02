"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";
import { format, differenceInDays } from "date-fns";
import { ChartContainer } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import type { Branch } from "@/types/digest";
import { cn } from "@/lib/utils";

interface BranchTimelineProps {
  branches: Branch[];
}

interface TimelineDataPoint {
  name: string;
  start: number;
  duration: number;
  branch: Branch;
  status: "active" | "stale" | "critical";
}

function getBranchStatus(branch: Branch): "active" | "stale" | "critical" {
  if (branch.commitsBehind > 30) return "critical";
  if (branch.isStale) return "stale";
  return "active";
}

const statusColors = {
  active: "hsl(var(--chart-2))",
  stale: "hsl(var(--muted-foreground))",
  critical: "hsl(var(--destructive))",
};

const chartConfig = {
  duration: {
    label: "Duration",
  },
  active: {
    label: "Active",
    color: "hsl(var(--chart-2))",
  },
  stale: {
    label: "Stale",
    color: "hsl(var(--muted-foreground))",
  },
  critical: {
    label: "Critical",
    color: "hsl(var(--destructive))",
  },
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: TimelineDataPoint;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  const { branch } = data;

  return (
    <div className="bg-popover text-popover-foreground rounded-lg border p-3 shadow-md">
      <p className="font-semibold">{branch.name}</p>
      <div className="text-muted-foreground mt-2 space-y-1 text-sm">
        <p>Author: {branch.author}</p>
        <p>Forked: {format(new Date(branch.forkedAt), "MMM d, yyyy")}</p>
        <p>Last commit: {format(new Date(branch.lastCommit), "MMM d, yyyy")}</p>
        <p>
          {branch.commitsAhead} ahead, {branch.commitsBehind} behind
        </p>
        {branch.staleDays && <p className="text-yellow-600">Stale: {branch.staleDays} days</p>}
      </div>
    </div>
  );
}

export function BranchTimeline({ branches }: BranchTimelineProps) {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // Calculate timeline data
  const { data, minDate, maxDate } = useMemo(() => {
    const now = new Date().getTime();
    const allDates = branches.flatMap((b) => [
      new Date(b.forkedAt).getTime(),
      new Date(b.lastCommit).getTime(),
    ]);
    const min = Math.min(...allDates);
    const max = Math.max(...allDates, now);

    const timelineData: TimelineDataPoint[] = branches.map((branch) => {
      const startTime = new Date(branch.forkedAt).getTime();
      const endTime = new Date(branch.lastCommit).getTime();

      return {
        name: branch.name.replace(/^(feature|fix|chore|experiment)\//, ""),
        start: startTime - min,
        duration: endTime - startTime,
        branch,
        status: getBranchStatus(branch),
      };
    });

    // Sort by fork date
    timelineData.sort((a, b) => a.start - b.start);

    return { data: timelineData, minDate: min, maxDate: max };
  }, [branches]);

  const totalDays = differenceInDays(maxDate, minDate);

  // Format x-axis ticks
  const formatXAxis = (value: number) => {
    const date = new Date(minDate + value);
    return format(date, "MMM d");
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded"
            style={{ backgroundColor: statusColors.active }}
          />
          <span>Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded"
            style={{ backgroundColor: statusColors.stale }}
          />
          <span>Stale (14+ days)</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded"
            style={{ backgroundColor: statusColors.critical }}
          />
          <span>Critical (30+ behind)</span>
        </div>
      </div>

      {/* Chart */}
      <ChartContainer config={chartConfig} className="h-[400px] w-full">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
        >
          <XAxis
            type="number"
            domain={[0, maxDate - minDate]}
            tickFormatter={formatXAxis}
            tickCount={Math.min(totalDays, 8)}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            x={Date.now() - minDate}
            stroke="hsl(var(--primary))"
            strokeDasharray="3 3"
            label={{ value: "Today", position: "top", fontSize: 10 }}
          />
          <Bar
            dataKey="duration"
            radius={[0, 4, 4, 0]}
            onClick={(data) => setSelectedBranch(data.branch)}
            className="cursor-pointer"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={statusColors[entry.status]}
                x={entry.start}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>

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
            <div className="flex gap-2">
              {selectedBranch.isNew && <Badge>New</Badge>}
              {selectedBranch.isStale && (
                <Badge variant="secondary">Stale</Badge>
              )}
              {selectedBranch.commitsBehind > 30 && (
                <Badge variant="destructive">Critical</Badge>
              )}
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
                className={cn(
                  "font-medium",
                  selectedBranch.commitsBehind > 30 && "text-destructive"
                )}
              >
                {selectedBranch.commitsBehind}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Files Changed</p>
              <p className="font-medium">{selectedBranch.filesChanged.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Activity</p>
              <p className="font-medium">
                {format(new Date(selectedBranch.lastCommit), "MMM d, yyyy")}
              </p>
            </div>
          </div>
          {selectedBranch.filesChanged.length > 0 && (
            <div className="mt-3">
              <p className="text-muted-foreground mb-1 text-sm">Files touched:</p>
              <div className="flex flex-wrap gap-1">
                {selectedBranch.filesChanged.slice(0, 5).map((file) => (
                  <Badge key={file} variant="outline" className="font-mono text-xs">
                    {file.split("/").pop()}
                  </Badge>
                ))}
                {selectedBranch.filesChanged.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{selectedBranch.filesChanged.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
