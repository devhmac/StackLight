"use client";

import { useState } from "react";

import { format, formatDistance } from "date-fns";
import { GitBranch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RepoDetails, UiBranch } from "@/types/digest";
import { BranchDetailDialog } from "./branch-detail-dialog";
import { isActive } from "@/lib/utils";

interface RepoDetailContentProps {
  repo: RepoDetails;
}

export function BranchTableCard({ repo }: RepoDetailContentProps) {
  const branches = repo.branches;
  const currentPage = branches;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Branches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BranchTable branches={branches} />
          {branches.length > 20 && (
            <p className="text-muted-foreground mt-4 text-center text-sm">
              Showing {currentPage.length} of {branches.length} branches
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export const BranchTable = ({ branches }: { branches: UiBranch[] }) => {
  const [selectedBranch, setSelectedBranch] = useState<UiBranch | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleBranchClick = (branch: UiBranch) => {
    setSelectedBranch(branch);
    setDialogOpen(true);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Branch</TableHead>
            <TableHead>Author</TableHead>
            <TableHead className="text-right">Ahead / Behind</TableHead>
            <TableHead className="text-right">Last Commit</TableHead>
            <TableHead className="text-right">Duraton</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {branches.map((branch) => (
            <TableRow
              key={branch.name}
              className="cursor-pointer"
              onClick={() => handleBranchClick(branch)}
            >
              <TableCell className="font-medium">{branch.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {branch.author}
              </TableCell>
              <TableCell className="text-right ">
                <span className="text-green-600 dark:text-green-400">
                  +{branch.commitsAhead ?? 0}
                </span>{" "}
                /{" "}
                <span className="text-red-600 dark:text-red-400">
                  -{branch.commitsBehind ?? 0}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground text-right">
                {branch.lastCommitTimestamp
                  ? format(new Date(branch.lastCommitTimestamp), "MMM d")
                  : "N/A"}
              </TableCell>
              <TableCell className="text-muted-foreground text-right">
                {!branch.forkedAt
                  ? "N/A"
                  : formatDistance(
                      new Date(branch.lastCommitTimestamp),
                      new Date(branch.forkedAt),
                    )}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {branch.isMerged && <Badge>Merged</Badge>}
                  {branch.isNew && <Badge className="bg-blue-500">New</Badge>}
                  {branch.isStale && <Badge variant="secondary">Stale</Badge>}
                  {isActive(branch) && <Badge variant="success">Active</Badge>}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <BranchDetailDialog
        branch={selectedBranch}
        allBranches={branches}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
};
