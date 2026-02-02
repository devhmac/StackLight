import { Suspense } from "react";
import Link from "next/link";
import { FolderGit2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRepoDigest } from "@/lib/data";
import { RepoDetailContent } from "../../_components/repo-detail-content";
import { RepoDetailSkeleton } from "../../_components/repo-detail-skeleton";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Async Server Component that fetches repo detail
async function RepoDetailData({ repoId }: { repoId: string }) {
  const digest = await getRepoDigest(repoId);

  if (!digest) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderGit2 className="text-muted-foreground/50 mb-4 h-12 w-12" />
        <h2 className="text-lg font-semibold">Repository not found</h2>
        <p className="text-muted-foreground mt-1">
          The requested repository could not be found
        </p>
        <Button asChild className="mt-4">
          <Link href="/digest/repos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to repositories
          </Link>
        </Button>
      </div>
    );
  }

  return <RepoDetailContent digest={digest} />;
}

export default async function RepoDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<RepoDetailSkeleton />}>
      <RepoDetailData repoId={id} />
    </Suspense>
  );
}
