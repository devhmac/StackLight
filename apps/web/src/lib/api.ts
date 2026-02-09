import type {
  RepoSummary,
  AddRepoRequest,
  MarkSeenRequest,
} from "@/types/digest";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `API error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}

// ========== Repo API ==========
export async function getRepos(): Promise<RepoSummary[]> {
  const { data } = await fetchApi<{ data: RepoSummary[] }>("/api/repos");
  return data;
}

export async function addRepo(data: AddRepoRequest): Promise<RepoSummary> {
  const response = await fetchApi<{ data: RepoSummary }>("/api/repos", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function deleteRepo(id: string): Promise<void> {
  await fetchApi<void>(`/api/repos/${id}`, {
    method: "DELETE",
  });
}

export async function markSeen(
  repoId: string,
  data: MarkSeenRequest,
): Promise<void> {
  await fetchApi<void>(`/api/repos/${repoId}/mark-seen`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export { ApiError };
