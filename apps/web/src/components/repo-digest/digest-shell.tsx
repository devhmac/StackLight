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
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">{title}</h1>
        </header>
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
