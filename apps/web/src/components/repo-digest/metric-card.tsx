"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number | React.ReactNode;
  description?: string;
  variant?: "neutral" | "stale" | "error" | "warn" | "success";
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function MetricCard({
  title,
  value,
  description,
  icon = "neutral",
  variant,
  trend,
  className,
}: MetricCardProps) {
  const valueVariant = {
    neutral: "",
    stale: "text-muted-foreground",
    error: "text-destructive",
    warn: "text-yellow-600",
    success: "text-green-600",
  };
  return (
    <Card className={cn("gap-2 py-4", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div
          className={`text-2xl font-bold ${valueVariant[variant ?? "neutral"]}`}
        >
          {value}
        </div>
        {description && (
          <p
            className={cn("text-muted-foreground text-xs", {
              "text-green-600 dark:text-green-400": trend === "up",
              "text-red-600 dark:text-red-400": trend === "down",
            })}
          >
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
