"use client";

import { GitMerge } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CollisionItem } from "@/types/digest";

interface CollisionTableProps {
  collisions: CollisionItem[];
  onBranchClick?: (branchName: string) => void;
}

const likelihoodBadge = {
  high: "destructive" as const,
  medium: "secondary" as const,
  low: "outline" as const,
};

export function CollisionTable({ collisions, onBranchClick }: CollisionTableProps) {
  if (collisions.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
        <GitMerge className="text-muted-foreground/50 mb-2 h-8 w-8" />
        <p>No file collisions detected</p>
        <p className="text-sm">Branches are working on separate files</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Branch A</TableHead>
          <TableHead>Branch B</TableHead>
          <TableHead>Overlapping Files</TableHead>
          <TableHead>Conflict Likelihood</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {collisions.map((collision, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">
              {onBranchClick ? (
                <Button
                  variant="link"
                  className="h-auto p-0 font-medium"
                  onClick={() => onBranchClick(collision.branchA)}
                >
                  {collision.branchA}
                </Button>
              ) : (
                collision.branchA
              )}
            </TableCell>
            <TableCell className="font-medium">
              {onBranchClick ? (
                <Button
                  variant="link"
                  className="h-auto p-0 font-medium"
                  onClick={() => onBranchClick(collision.branchB)}
                >
                  {collision.branchB}
                </Button>
              ) : (
                collision.branchB
              )}
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {collision.overlappingFiles.map((file) => (
                  <Badge
                    key={file}
                    variant="outline"
                    className="font-mono text-xs"
                  >
                    {file.split("/").pop()}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={likelihoodBadge[collision.conflictLikelihood]}>
                {collision.conflictLikelihood}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
