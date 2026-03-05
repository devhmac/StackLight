import { NextRequest, NextResponse } from "next/server";
import { getRepoDetails } from "@/lib/data";
import { getRepoPullRequests, getRepoPullRequestsPage } from "@/lib/github-pr";
import type { PrFilter, PrSort } from "@/types/digest";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ repoId: string }> },
) {
  const { repoId } = await params;
  const { searchParams } = request.nextUrl;
  const state = (searchParams.get("state") ?? "open") as PrFilter;
  const sort = (searchParams.get("sort") ?? "updated") as PrSort;
  const cursor = searchParams.get("cursor");

  const repo = await getRepoDetails(repoId);
  if (!repo) {
    return NextResponse.json({ error: "Repo not found" }, { status: 404 });
  }

  if (cursor) {
    const page = await getRepoPullRequestsPage(repo.path, state, sort, cursor);
    return NextResponse.json(page);
  }

  const prs = await getRepoPullRequests(repo.path, state, sort);
  return NextResponse.json(prs);
}
