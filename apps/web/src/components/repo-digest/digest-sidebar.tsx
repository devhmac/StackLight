"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  AlertTriangle,
  FolderGit2,
  ChevronDown,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { RepoSummary } from "@/types/digest";
import { Button } from "../ui/button";
import { useTransition } from "react";
import { syncRepo } from "@/lib/actions";
import { Spinner } from "../ui/spinner";

interface DigestSidebarProps {
  repos: RepoSummary[];
  selectedRepoId: string | null;
}

export function DigestSidebar({ repos, selectedRepoId }: DigestSidebarProps) {
  const pathname = usePathname();
  const selectedRepo = repos.find((r) => r.id === selectedRepoId);
  const basePath = selectedRepoId ? `/project/${selectedRepoId}` : "/project";

  const navItems = selectedRepoId
    ? [
        {
          title: "Overview",
          href: basePath,
          icon: LayoutDashboard,
        },
        {
          title: "Timeline",
          href: `${basePath}/timeline`,
          icon: GitBranch,
        },
        {
          title: "Risks",
          href: `${basePath}/risks`,
          icon: AlertTriangle,
        },
        {
          title: "Repos",
          href: "/project",
          icon: FolderGit2,
        },
      ]
    : [
        {
          title: "Repos",
          href: "/project",
          icon: FolderGit2,
        },
      ];

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <FolderGit2 className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {selectedRepo?.name || "Select repo"}
                    </span>
                    <span className="text-muted-foreground truncate text-xs">
                      Repo Digest
                    </span>
                  </div>
                  <ChevronDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                align="start"
                side="bottom"
                sideOffset={4}
              >
                {repos.map((repo) => (
                  <DropdownMenuItem key={repo.id} asChild className="gap-2 p-2">
                    <Link href={`/project/${repo.id}`}>
                      <div className="flex size-6 items-center justify-center rounded-sm border">
                        <FolderGit2 className="size-4 shrink-0" />
                      </div>
                      {repo.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem asChild className="gap-2 p-2">
                  <Link href="/project">
                    <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                      <span className="text-muted-foreground">+</span>
                    </div>
                    <span className="text-muted-foreground">Manage repos</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {selectedRepoId && <SyncButton repoId={selectedRepoId} />}
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.href === "/project"
                    ? pathname === "/project"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function SyncButton({ repoId }: { repoId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      disabled={isPending}
      onClick={() => startTransition(() => syncRepo(repoId))}
    >
      {isPending ? <Spinner className="animate-spin" /> : "Fetch Latest"}
    </Button>
  );
}
