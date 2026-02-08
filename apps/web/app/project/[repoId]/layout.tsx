import { DigestShell } from "@/components/repo-digest/digest-shell";
import { getRepos } from "@/lib/data";

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ repoId: string }>;
}

export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  const { repoId } = await params;
  const repos = await getRepos();
  return (
    <DigestShell repos={repos} selectedRepoId={repoId}>
      {children}
    </DigestShell>
  );
}
