import Link from "next/link";
import { FolderGit2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRepoDetails } from "@/lib/data";
import { RepoDetailContent } from "@/components/repo-digest/repo-detail-content";

interface ProjectDetailsPageProps {
  params: Promise<{ repoId: string }>;
}

export default async function ProjectDetailsPage({
  params,
}: ProjectDetailsPageProps) {
  const { repoId } = await params;
  const repo = await getRepoDetails(repoId);

  if (!repo) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderGit2 className="text-muted-foreground/50 mb-4 h-12 w-12" />
        <h2 className="text-lg font-semibold">Repository not found</h2>
        <p className="text-muted-foreground mt-1">
          The requested repository could not be found
        </p>
        <Button asChild className="mt-4">
          <Link href="/project">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to repositories
          </Link>
        </Button>
      </div>
    );
  }

  return <RepoDetailContent repo={repo} />;
}
