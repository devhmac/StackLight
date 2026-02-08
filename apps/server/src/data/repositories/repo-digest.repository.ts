import { eq } from "drizzle-orm";
import {
  RegisteredRepositorySchema,
  RegisteredRepository,
  repoDigests,
  rowToRepoMapper,
} from "../schema";
import { db } from "../db";

export interface IDigestRepository {
  upsert(repoDigest: RegisteredRepository): Promise<void>;
  getRepoById(repoId: string): Promise<RegisteredRepository | null>;
  getRepoByPath(repoId: string): Promise<RegisteredRepository | null>;
  getAllRepos(): Promise<RegisteredRepository[]>;
  delete(repoId: string): Promise<boolean>;
}

export const digestRepository: IDigestRepository = {
  async upsert(repoDigest: RegisteredRepository): Promise<void> {
    const validated = RegisteredRepositorySchema.parse(repoDigest);

    db.insert(repoDigests)
      .values({
        repoId: validated.id,
        repoPath: validated.path,
        repoName: validated.name,
        lastSeenCommit: validated.lastSeen?.lastSeenCommit ?? null,
        lastSeenTimestamp: validated.lastSeen?.lastSeenTimestamp ?? null,
        digestJson: JSON.stringify(validated.digestJson),
      })
      .onConflictDoUpdate({
        target: repoDigests.repoId,
        set: {
          repoPath: validated.path,
          repoName: validated.name,
          lastSeenCommit: validated.lastSeen?.lastSeenCommit ?? null,
          lastSeenTimestamp: validated.lastSeen?.lastSeenTimestamp ?? null,
          digestJson: JSON.stringify(validated.digestJson),
          updatedAt: new Date().toISOString(),
        },
      })
      .run();
  },
  async getRepoById(repoId: string): Promise<RegisteredRepository | null> {
    const row = db
      .select()
      .from(repoDigests)
      .where(eq(repoDigests.repoId, repoId))
      .get();

    if (!row) return null;
    return rowToRepoMapper(row);
  },
  async getRepoByPath(path: string): Promise<RegisteredRepository | null> {
    const row = db
      .select()
      .from(repoDigests)
      .where(eq(repoDigests.repoPath, path))
      .get();

    if (!row) return null;
    return rowToRepoMapper(row);
  },
  async getAllRepos(): Promise<RegisteredRepository[]> {
    const rows = db.select().from(repoDigests).all();
    return rows.map(rowToRepoMapper);
  },
  async delete(repoId: string): Promise<boolean> {
    const result = db
      .delete(repoDigests)
      .where(eq(repoDigests.repoId, repoId))
      .returning();

    return result.values.length > 0;
  },
};
