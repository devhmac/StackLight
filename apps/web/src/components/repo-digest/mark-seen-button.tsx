"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarkSeen } from "@/hooks/use-digest";

interface MarkSeenButtonProps {
  repoId: string;
  currentHead: string;
  newCommitCount: number;
}

export function MarkSeenButton({
  repoId,
  currentHead,
  newCommitCount,
}: MarkSeenButtonProps) {
  const router = useRouter();
  const { markSeen, isPending } = useMarkSeen();
  const [marked, setMarked] = useState(false);

  const handleClick = async () => {
    const success = await markSeen(repoId, currentHead);
    if (success) {
      setMarked(true);
      // Refresh server data
      router.refresh();
    }
  };

  if (newCommitCount === 0 || marked) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Check className="mr-2 h-4 w-4" />
        Up to date
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
    >
      <Eye className="mr-2 h-4 w-4" />
      {isPending ? "Marking..." : `Mark ${newCommitCount} commits as seen`}
    </Button>
  );
}
