"use client";

import { formatDistanceToNow } from "date-fns";
import { GitCommit, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Commit } from "@/types/digest";

interface RecentCommitsProps {
  commits: Commit[];
  isNew?: boolean;
}

export function RecentCommits({ commits, isNew = false }: RecentCommitsProps) {
  if (commits.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
        <GitCommit className="text-muted-foreground/50 mb-2 h-8 w-8" />
        <p>No recent commits</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">SHA</TableHead>
          <TableHead>Message</TableHead>
          <TableHead>Author</TableHead>
          <TableHead className="text-right">Files</TableHead>
          <TableHead className="text-right">When</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {commits.map((commit) => (
          <TableRow key={commit.sha}>
            <TableCell className="font-mono text-xs">
              <div className="flex items-center gap-2">
                {commit.sha.slice(0, 7)}
                {isNew && (
                  <Badge variant="default" className="text-xs">
                    new
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell className="max-w-[300px] truncate">
              {commit.message}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {commit.author}
            </TableCell>
            <TableCell className="text-right">
              <div className="text-muted-foreground flex items-center justify-end gap-1">
                <FileText className="h-3 w-3" />
                {commit.filesChanged}
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground text-right text-sm">
              {formatDistanceToNow(new Date(commit.timestamp), {
                addSuffix: true,
              })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
