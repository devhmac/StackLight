"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RiskAlert } from "@/types/digest";
import { cn } from "@/lib/utils";

interface RiskSummaryProps {
  risks: RiskAlert[];
  maxItems?: number;
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

export function RiskSummary({ risks, maxItems = 3 }: RiskSummaryProps) {
  const sortedRisks = [...risks].sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  const displayRisks = sortedRisks.slice(0, maxItems);
  const remainingCount = risks.length - maxItems;

  if (risks.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
        <AlertTriangle className="text-muted-foreground/50 mb-2 h-8 w-8" />
        <p>No risks detected</p>
        <p className="text-sm">Your repository is looking healthy</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayRisks.map((risk) => (
        <Alert key={risk.id} className={cn("border", severityColors[risk.severity])}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            {risk.title}
            <Badge variant={severityBadge[risk.severity]} className="ml-auto">
              {risk.severity}
            </Badge>
          </AlertTitle>
          <AlertDescription className="text-muted-foreground mt-1">
            {risk.description}
          </AlertDescription>
        </Alert>
      ))}
      {remainingCount > 0 && (
        <Button variant="ghost" size="sm" asChild className="w-full">
          <Link href="/digest/risks">
            View {remainingCount} more {remainingCount === 1 ? "risk" : "risks"}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}
