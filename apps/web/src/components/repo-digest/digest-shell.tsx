"use client";

import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { DigestSidebar } from "./digest-sidebar";
import type { RepoSummary } from "@/types/digest";

import { Spinner } from "../ui/spinner";
import { useEffect, useRef, useState, useTransition } from "react";
import { syncRepo } from "@/lib/actions";
import { Button } from "../ui/button";

interface DigestShellProps {
  repos: RepoSummary[];
  selectedRepoId: string | null;
  children: React.ReactNode;
}

export function DigestShell({
  repos,
  selectedRepoId,
  children,
}: DigestShellProps) {
  const pathname = usePathname();
  const title = (() => {
    if (pathname === "/project") return "Projects";
    if (pathname.startsWith("/project/")) {
      const parts = pathname.split("/").filter(Boolean);
      const section = parts[2] ?? "overview";
      if (section === "timeline") return "Timeline";
      if (section === "risks") return "Risks";
      if (section === "details") return "Details";
      return "Overview";
    }
    return "Digest";
  })();

  return (
    <SidebarProvider>
      <DigestSidebar repos={repos} selectedRepoId={selectedRepoId} />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
          {selectedRepoId && <SyncButton repoId={selectedRepoId} />}
        </header>
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function SyncButton({ repoId }: { repoId: string }) {
  const [isPending, startTransition] = useTransition();
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPending) {
      setProgress(0);
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p < 30) return p + 3;
          if (p < 60) return p + 2;
          if (p < 85) return p + 0.5;
          if (p < 95) return p + 0.1;
          return p;
        });
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progress > 0) {
        setProgress(100);
        setTimeout(() => setProgress(0), 300);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPending]);

  return (
    <Button
      disabled={isPending}
      className="relative overflow-hidden"
      onClick={() => startTransition(() => syncRepo(repoId))}
    >
      {progress > 0 && (
        <span
          className="absolute inset-y-0 left-0 bg-white/25"
          style={{ width: `${progress}%`, transition: "width 200ms ease-out" }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {isPending ? (
          <>
            <Spinner className="animate-spin" />
            Syncing...
          </>
        ) : (
          "Fetch Latest"
        )}
      </span>
    </Button>
  );
}
