"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderGit2, Trash2, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { RepoSummary } from "@/types/digest";

interface RepoCardProps {
  repo: RepoSummary;
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete?: () => Promise<boolean>;
}

export function RepoCard({
  repo,
  isSelected,
  onSelect,
  onDelete,
}: RepoCardProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    await onDelete();
    setDeleting(false);
  };

  return (
    <Card
      className={`cursor-pointer transition-colors hover:border-primary/50 ${
        isSelected ? "border-primary bg-primary/5" : ""
      }`}
      onClick={onSelect}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderGit2 className="h-5 w-5" />
          {repo.name}
        </CardTitle>
        <CardAction>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" asChild onClick={(e) => e.stopPropagation()}>
              <Link href={`/project/${repo.id}/details`}>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Repository</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove &quot;{repo.name}&quot; from
                      tracking? This will not delete the actual repository, only
                      remove it from the digest.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deleting}
                      className="bg-destructive text-white hover:bg-destructive/90"
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground truncate font-mono text-sm">
          {repo.path}
        </p>
      </CardContent>
    </Card>
  );
}
