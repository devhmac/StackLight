"use client";

import { useState } from "react";
import { Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarkSeenButtonProps {
  onMarkSeen: () => Promise<boolean>;
  newCommitCount: number;
}

export function MarkSeenButton({
  onMarkSeen,
  newCommitCount,
}: MarkSeenButtonProps) {
  const [loading, setLoading] = useState(false);
  const [marked, setMarked] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const success = await onMarkSeen();
    setLoading(false);
    if (success) {
      setMarked(true);
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
    <Button variant="default" size="sm" onClick={handleClick} disabled={loading}>
      <Eye className="mr-2 h-4 w-4" />
      {loading ? "Marking..." : `Mark ${newCommitCount} commits as seen`}
    </Button>
  );
}
