import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getRepos } from "@/lib/data";
import { DigestShell } from "./_components/digest-shell";

interface DigestLayoutProps {
  children: React.ReactNode;
}

// Loading skeleton for the shell
function ShellSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh">
      <div className="w-64 border-r p-4">
        <Skeleton className="h-12 w-full" />
        <div className="mt-4 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}

// Async Server Component that fetches repos for the sidebar
async function DigestShellWrapper({ children }: { children: React.ReactNode }) {
  const repos = await getRepos();
  // Default to first repo if available
  const defaultRepoId = repos[0]?.id ?? null;

  return (
    <DigestShell repos={repos} selectedRepoId={defaultRepoId}>
      {children}
    </DigestShell>
  );
}

export default function DigestLayout({ children }: DigestLayoutProps) {
  return (
    <Suspense fallback={<ShellSkeleton>{children}</ShellSkeleton>}>
      <DigestShellWrapper>{children}</DigestShellWrapper>
    </Suspense>
  );
}
