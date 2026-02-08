import { redirect } from "next/navigation";
import { getRepos } from "@/lib/data";

export default async function Home() {
  const repos = await getRepos();
  const firstRepoId = repos[0]?.id;

  if (firstRepoId) {
    redirect(`/project/${firstRepoId}`);
  }

  redirect("/project");
}
