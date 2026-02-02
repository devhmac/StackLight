import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getRepos, getDefaultRepoId } from "@/lib/data";
import { ReposContent } from "../_components/repos-content";

interface PageProps {
  searchParams: Promise<{ repo?: string }>;
}

function ReposSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-32" />
          <Skeleton className="mt-1 h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// Async Server Component that fetches repos
async function ReposData({ selectedRepoId }: { selectedRepoId: string | null }) {
  const repos = await getRepos();
  return <ReposContent repos={repos} selectedRepoId={selectedRepoId} />;
}

export default async function ReposPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedRepoId = params.repo || (await getDefaultRepoId());

  return (
    <Suspense fallback={<ReposSkeleton />}>
      <ReposData selectedRepoId={selectedRepoId} />
    </Suspense>
  );
}
