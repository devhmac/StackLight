"use client";

import { useState } from "react";
import { FolderGit2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddRepoDialogProps {
  onAdd: (path: string) => Promise<unknown>;
  trigger?: React.ReactNode;
}

export function AddRepoDialog({ onAdd, trigger }: AddRepoDialogProps) {
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!path.trim()) {
      setError("Path is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onAdd(path.trim());
      setPath("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add repository");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Repository
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderGit2 className="h-5 w-5" />
              Add Repository
            </DialogTitle>
            <DialogDescription>
              Enter the local path to a git repository you want to track.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="path">Repository Path</Label>
              <Input
                id="path"
                placeholder="/path/to/your/repo"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="font-mono"
              />
              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Repository"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
