"use server";

import { updateTag } from "next/cache";
import { fetchApi } from "./api";

export async function syncRepo(repoId: string): Promise<void> {
  await fetchApi(`/api/repos/${repoId}/sync`);
  updateTag(`repo-${repoId}`);
}
