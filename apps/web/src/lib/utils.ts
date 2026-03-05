import { UiBranch } from "@/types/digest";
import { clsx, type ClassValue } from "clsx";
import { formatDistance } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isActive = (branch: UiBranch) => {
  return !branch.isMerged && !branch.isStale;
};

export function formatDuration(ms: number): string {
  if (ms === 0) return "—";
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days > 1) return `${days}d`;
  const hours = Math.floor(ms / (1000 * 60 * 60));
  return `${hours}h`;
}

export function formatDurationFrom(ms: number): string {
  const now = new Date();
  return formatDistance(new Date(now.getTime() - ms), now);
}
