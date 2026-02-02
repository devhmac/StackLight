"use client";

import { TrendingUp, TrendingDown, Minus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ChurnHotspot } from "@/types/digest";
import { cn } from "@/lib/utils";

interface ChurnHotspotsProps {
  hotspots: ChurnHotspot[];
  maxItems?: number;
}

const trendIcons = {
  increasing: TrendingUp,
  decreasing: TrendingDown,
  stable: Minus,
};

const trendColors = {
  increasing: "text-red-500",
  decreasing: "text-green-500",
  stable: "text-muted-foreground",
};

export function ChurnHotspots({ hotspots, maxItems = 5 }: ChurnHotspotsProps) {
  const displayHotspots = hotspots.slice(0, maxItems);

  if (hotspots.length === 0) {
    return (
      <div className="text-muted-foreground py-4 text-center text-sm">
        No churn hotspots detected
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayHotspots.map((hotspot) => {
        const TrendIcon = trendIcons[hotspot.trend];
        return (
          <div
            key={hotspot.path}
            className="hover:bg-muted/50 flex items-center justify-between rounded-md p-2 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-sm">{hotspot.path}</p>
              <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
                <span>{hotspot.changeCount} changes</span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {hotspot.contributorCount} contributors
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <TrendIcon
                  className={cn("mr-1 h-3 w-3", trendColors[hotspot.trend])}
                />
                {hotspot.trend}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}
