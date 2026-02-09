"use server";

import { updateTag } from "next/cache";
import { fetchApi } from "./api";
import { redirect } from "next/navigation";

export async function syncRepo(repoId: string): Promise<void> {
  await fetchApi(`/api/repos/${repoId}/sync`);
  updateTag(`repo-${repoId}`);
  // redirect(currentPath); // triggers navigation → loading.tsx
}
