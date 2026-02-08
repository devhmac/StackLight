"use client";

import { useState, useEffect, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  GitCommit,
  GitBranch,
  FileCode,
  Plus,
  Minus,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { UiBranch, BranchDetail, FileDiff } from "@/types/digest";
import { getBranchDetail } from "@/lib/data";

interface BranchDetailDialogProps {
  branch: UiBranch | null;
  allBranches: UiBranch[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FilesByDirectory {
  [directory: string]: FileDiff[];
}

function groupFilesByDirectory(files: FileDiff[]): FilesByDirectory {
  const grouped: FilesByDirectory = {};

  for (const file of files) {
    const parts = file.path.split("/");
    const directory = parts.length > 1 ? parts.slice(0, -1).join("/") : ".";

    if (!grouped[directory]) {
      grouped[directory] = [];
    }
    grouped[directory].push(file);
  }

  return grouped;
}

function getDivergenceLevel(behind: number): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
} {
  if (behind > 30) return { label: "Critical", variant: "destructive" };
  if (behind > 15) return { label: "High", variant: "secondary" };
  if (behind > 5) return { label: "Moderate", variant: "outline" };
  return { label: "Low", variant: "outline" };
}

function DirectoryGroup({
  directory,
  files,
  defaultExpanded = true,
}: {
  directory: string;
  files: FileDiff[];
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const totalAdded = files.reduce((sum, f) => sum + f.added, 0);
  const totalRemoved = files.reduce((sum, f) => sum + f.removed, 0);

  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="hover:bg-muted/50 flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0" />
        )}
        <span className="text-muted-foreground flex-1 truncate font-mono text-xs">
          {directory}/
        </span>
        <span className="text-muted-foreground text-xs">
          {files.length} file{files.length !== 1 ? "s" : ""}
        </span>
        <span className="font-mono text-xs text-green-600 dark:text-green-400">
          +{totalAdded}
        </span>
        <span className="font-mono text-xs text-red-600 dark:text-red-400">
          -{totalRemoved}
        </span>
      </button>
      {expanded && (
        <div className="bg-muted/30 pb-1">
          {files.map((file: FileDiff) => {
            const fileName = file.path.split("/").pop() ?? file.path;
            return (
              <div
                key={file.path}
                className="flex items-center gap-2 px-3 py-1.5 pl-9"
              >
                <FileCode className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 truncate font-mono text-xs">
                  {fileName}
                </span>
                <span className="font-mono text-xs text-green-600 dark:text-green-400">
                  +{file.added}
                </span>
                <span className="font-mono text-xs text-red-600 dark:text-red-400">
                  -{file.removed}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function BranchDetailDialog({
  branch,
  allBranches,
  open,
  onOpenChange,
}: BranchDetailDialogProps) {
  const [detail, setDetail] = useState<BranchDetail | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch detail when dialog opens
  useEffect(() => {
    if (open && branch) {
      setLoading(true);
      setDetail(null);
      getBranchDetail(branch.name)
        .then(setDetail)
        .finally(() => setLoading(false));
    }
  }, [open, branch]);

  // Calculate potential conflicts with other branches
  const potentialConflicts = useMemo(() => {
    if (!branch) return [];

    const conflicts: { branch: string; sharedFiles: string[] }[] = [];

    for (const other of allBranches) {
      if (other.name === branch.name) continue;

      const sharedFiles =
        branch.filesChanged?.filter((file) =>
          (other.filesChanged ?? []).includes(file)
        ) ?? [];

      if (sharedFiles.length > 0) {
        conflicts.push({ branch: other.name, sharedFiles });
      }
    }

    return conflicts;
  }, [branch, allBranches]);

  // Group files by directory
  const groupedFiles = useMemo<FilesByDirectory>(() => {
    if (!detail?.files) return {};
    return groupFilesByDirectory(detail.files);
  }, [detail?.files]);

  if (!branch) return null;

  const divergence = getDivergenceLevel(branch.commitsBehind ?? 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <GitBranch className="h-5 w-5 shrink-0" />
                <span className="truncate">{branch.name}</span>
              </DialogTitle>
              <DialogDescription className="mt-1">
                by {branch.author} &middot; started{" "}
                {formatDistanceToNow(new Date(branch.forkedAt), {
                  addSuffix: true,
                })}
              </DialogDescription>
            </div>
            <div className="flex shrink-0 gap-1.5">
              {branch.isNew && <Badge>New</Badge>}
              {branch.isStale && <Badge variant="secondary">Stale</Badge>}
            </div>
          </div>
        </DialogHeader>

        {/* Stats bar */}
        <div className="bg-muted/50 flex flex-wrap items-center gap-4 rounded-lg px-4 py-3 text-sm">
          <div className="flex items-center gap-1.5">
            <GitCommit className="text-muted-foreground h-4 w-4" />
            <span className="font-medium">{branch.commitsAhead}</span>
            <span className="text-muted-foreground">commits</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-1.5">
            <FileCode className="text-muted-foreground h-4 w-4" />
            <span className="font-medium">{branch.filesChanged?.length ?? 0}</span>
            <span className="text-muted-foreground">files</span>
          </div>
          {detail && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-600 dark:text-green-400">
                  {(detail.linesAdded ?? 0).toLocaleString()}
                </span>
                <Minus className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="font-medium text-red-600 dark:text-red-400">
                  {(detail.linesRemoved ?? 0).toLocaleString()}
                </span>
              </div>
            </>
          )}
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-1.5">
            <Badge variant={divergence.variant} className="text-xs">
              {branch.commitsBehind ?? 0} behind
            </Badge>
          </div>
        </div>

        {/* Potential conflicts */}
        {potentialConflicts.length > 0 && (
          <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="h-4 w-4" />
              Potential Conflicts
            </div>
            <div className="space-y-1.5">
              {potentialConflicts.slice(0, 3).map(({ branch, sharedFiles }) => (
                <div key={branch} className="text-sm">
                  <span className="font-mono text-xs">{branch}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    touches {sharedFiles.length} shared file
                    {sharedFiles.length !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
              {potentialConflicts.length > 3 && (
                <p className="text-muted-foreground text-xs">
                  +{potentialConflicts.length - 3} more branches
                </p>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        ) : detail ? (
          <>
            {/* Recent commits */}
            <div>
              <h3 className="mb-2 text-sm font-medium">Recent Commits</h3>
              <div className="space-y-1 rounded-lg border">
                {(detail.recentCommits ?? []).slice(0, 5).map((commit) => (
                  <div
                    key={commit.sha}
                    className="flex items-center gap-3 border-b px-3 py-2 last:border-b-0"
                  >
                    <Badge variant="outline" className="shrink-0 font-mono text-xs">
                      {commit.sha.slice(0, 7)}
                    </Badge>
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {commit.message}
                    </span>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {formatDistanceToNow(new Date(commit.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Files changed grouped by directory */}
            <div>
              <h3 className="mb-2 text-sm font-medium">
                Files Changed ({detail.files?.length ?? 0})
              </h3>
              <div className="rounded-lg border">
                {Object.entries(groupedFiles).map(
                  ([directory, files]: [string, FileDiff[]]) => (
                  <DirectoryGroup
                    key={directory}
                    directory={directory}
                    files={files}
                  />
                  ),
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-muted-foreground py-8 text-center text-sm">
            No detail available for this branch
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
