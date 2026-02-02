import type {
  Repo,
  RepoDigest,
  AddRepoRequest,
  MarkSeenRequest,
} from "@/types/digest";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
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
      `API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

// ========== Repo API ==========
export async function getRepos(): Promise<Repo[]> {
  return fetchApi<Repo[]>("/api/repos");
}

export async function addRepo(data: AddRepoRequest): Promise<Repo> {
  return fetchApi<Repo>("/api/repos", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteRepo(id: string): Promise<void> {
  await fetchApi<void>(`/api/repos/${id}`, {
    method: "DELETE",
  });
}

// ========== Digest API ==========
export async function getRepoDigest(repoId: string): Promise<RepoDigest> {
  return fetchApi<RepoDigest>(`/api/repos/${repoId}/digest`);
}

export async function markSeen(
  repoId: string,
  data: MarkSeenRequest
): Promise<void> {
  await fetchApi<void>(`/api/repos/${repoId}/mark-seen`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export { ApiError };
