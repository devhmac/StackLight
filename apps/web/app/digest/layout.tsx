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
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useRepos, useSelectedRepo } from "@/hooks/use-digest";

const navItems = [
  {
    title: "Overview",
    href: "/digest",
    icon: LayoutDashboard,
  },
  {
    title: "Timeline",
    href: "/digest/timeline",
    icon: GitBranch,
  },
  {
    title: "Risks",
    href: "/digest/risks",
    icon: AlertTriangle,
  },
  {
    title: "Repos",
    href: "/digest/repos",
    icon: FolderGit2,
  },
];

export default function DigestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { repos, loading: reposLoading } = useRepos();
  const { selectedRepoId, setSelectedRepoId } = useSelectedRepo();

  const selectedRepo = repos.find((r) => r.id === selectedRepoId);

  return (
    <SidebarProvider>
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
                        {reposLoading
                          ? "Loading..."
                          : selectedRepo?.name || "Select repo"}
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
                    <DropdownMenuItem
                      key={repo.id}
                      onClick={() => setSelectedRepoId(repo.id)}
                      className="gap-2 p-2"
                    >
                      <div className="flex size-6 items-center justify-center rounded-sm border">
                        <FolderGit2 className="size-4 shrink-0" />
                      </div>
                      {repo.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem asChild className="gap-2 p-2">
                    <Link href="/digest/repos">
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
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive =
                    item.href === "/digest"
                      ? pathname === "/digest"
                      : pathname.startsWith(item.href);
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
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">
            {navItems.find(
              (item) =>
                item.href === "/digest"
                  ? pathname === "/digest"
                  : pathname.startsWith(item.href)
            )?.title || "Digest"}
          </h1>
        </header>
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
