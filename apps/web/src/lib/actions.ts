"use server";

import { updateTag } from "next/cache";
import { fetchApi } from "./api";
import { redirect } from "next/navigation";
import { invalidatePrCache } from "./pr-actions";

export async function syncRepo(repoId: string): Promise<void> {
  await fetchApi(`/api/repos/${repoId}/sync`);
  updateTag(`repo-${repoId}`);
  updateTag(`prs-${repoId}`);
  await invalidatePrCache(repoId);
  // redirect(currentPath); // triggers navigation → loading.tsx
}
