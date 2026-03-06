import { DigestShell } from "@/components/repo-digest/digest-shell";
import { ReposContent } from "@/components/repo-digest/repos-content";
import { getRepos } from "@/lib/data";

export default async function ProjectsPage() {
  const repos = await getRepos();
  return (
    <DigestShell repos={repos} selectedRepoId={null}>
      <ReposContent repos={repos} selectedRepoId={null} />
    </DigestShell>
  );
}
