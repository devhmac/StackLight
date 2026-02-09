import { UiBranch } from "@/types/digest";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isActive = (branch: UiBranch) => {
  return !branch.isMerged && !branch.isStale;
};
