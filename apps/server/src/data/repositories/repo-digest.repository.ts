import { eq } from "drizzle-orm";
import {
  RepoActivityDigest,
  RepoActivityDigestSchema,
  repoDigests,
} from "../schema";
import { db } from "..";

export interface IDigestRepository {
  upsert(repoDigest: RepoActivityDigest): Promise<void>;
  findRepoById(repoId: string): Promise<RepoActivityDigest | null>;
  findAllDigests(): Promise<RepoActivityDigest[]>;
  delete(repoId: string): Promise<boolean>;
}

export const digestRepository = {
  async upsert(repoDigest: RepoActivityDigest): Promise<void> {
    const validated = RepoActivityDigestSchema.parse(repoDigest);

    db.insert(repoDigests)
      .values({
        repoId: validated.repo.id,
        repoPath: validated.repo.path,
        lastSeenCommit: validated.lastSeen?.commit ?? null,
        lastSeenTimestamp: validated.lastSeen?.timestamp ?? null,
        digestJson: JSON.stringify(validated),
      })
      .onConflictDoUpdate({
        target: repoDigests.repoId,
        set: {
          repoPath: validated.repo.path,
          lastSeenCommit: validated.lastSeen?.commit ?? null,
          lastSeenTimestamp: validated.lastSeen?.timestamp ?? null,
          digestJson: JSON.stringify(validated),
          updatedAt: new Date().toISOString(),
        },
      });
  },
  async findRepoById(repoId: string): Promise<RepoActivityDigest | null> {
    const row = db
      .select()
      .from(repoDigests)
      .where(eq(repoDigests.repoId, repoId))
      .get();

    if (!row) return null;
    return RepoActivityDigestSchema.parse(JSON.parse(row.digestJson));
  },
  async findAllDigests(): Promise<RepoActivityDigest[]> {
    const rows = db.select().from(repoDigests).all();
    return rows.map((row) => {
      return RepoActivityDigestSchema.parse(JSON.parse(row.digestJson));
    });
  },
  async delete(repoId: string): Promise<boolean> {
    const result = db
      .delete(repoDigests)
      .where(eq(repoDigests.repoId, repoId))
      .returning();

    return result.values.length > 0;
  },
};
