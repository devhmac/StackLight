"use client";

import { AlertTriangle, Lightbulb } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type { RiskItem, RiskType } from "@/types/digest";
import { cn } from "@/lib/utils";

interface RiskListProps {
  risks: RiskItem[];
  filterType?: RiskType | "all";
}

const severityColors = {
  high: "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400",
  medium:
    "bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:text-yellow-400",
  low: "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400",
};

const severityBadge = {
  high: "destructive" as const,
  medium: "secondary" as const,
  low: "outline" as const,
};

const typeLabels: Record<RiskType, string> = {
  divergence: "Divergence",
  collision: "Collision",
  stale: "Stale Branch",
  scope_creep: "Scope Creep",
};

export function RiskList({ risks, filterType = "all" }: RiskListProps) {
  const filteredRisks =
    filterType === "all"
      ? risks
      : risks.filter((r) => r.type === filterType);

  const sortedRisks = [...filteredRisks].sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  if (sortedRisks.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
        <AlertTriangle className="text-muted-foreground/50 mb-2 h-8 w-8" />
        <p>No risks found</p>
        {filterType !== "all" && (
          <p className="text-sm">Try selecting a different filter</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedRisks.map((risk) => (
        <Alert
          key={risk.id}
          className={cn("border", severityColors[risk.severity])}
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            <span className="flex-1">{risk.title}</span>
            <Badge variant="outline" className="text-xs">
              {typeLabels[risk.type]}
            </Badge>
            <Badge variant={severityBadge[risk.severity]}>{risk.severity}</Badge>
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p className="text-muted-foreground">{risk.description}</p>

            {/* Affected branches */}
            <div>
              <p className="mb-1 text-xs font-medium">Affected branches:</p>
              <div className="flex flex-wrap gap-1">
                {risk.branches.map((branch) => (
                  <Badge key={branch} variant="secondary" className="text-xs">
                    {branch}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Affected files */}
            {risk.files && risk.files.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium">Affected files:</p>
                <div className="flex flex-wrap gap-1">
                  {risk.files.map((file) => (
                    <Badge
                      key={file}
                      variant="outline"
                      className="font-mono text-xs"
                    >
                      {file}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested action */}
            {risk.suggestedAction && (
              <div className="bg-muted/50 flex items-start gap-2 rounded-md p-2">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                <p className="text-sm">{risk.suggestedAction}</p>
              </div>
            )}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
