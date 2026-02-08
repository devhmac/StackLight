import z from "zod";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const repoDigests = sqliteTable("repo_digests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  repoId: text("repo_id").notNull().unique(),
  repoPath: text("repo_path").notNull().unique(),
  lastSeenCommit: text("last_seen_commit"),
  lastSeenTimestamp: text("last_seen_timestamp"),
  digestJson: text("digest_json").notNull().default("{}"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

export type RepoDigestRow = typeof repoDigests.$inferSelect;
export type NewRepoDigestRow = typeof repoDigests.$inferInsert;

// Nested schemas
const CommitSchema = z.object({
  sha: z.string(),
  message: z.string(),
  author: z.string(),
  timestamp: z.iso.datetime(),
  filesChanged: z.number().int().nonnegative(),
});

const BranchSchema = z.object({
  name: z.string(),
  author: z.string(),
  lastCommit: z.iso.datetime(),
  commitsAhead: z.number().int().nonnegative(),
  isNew: z.boolean(),
});
const ContributorSchema = z.object({
  name: z.string(),
  commitCount: z.number().int().nonnegative(),
});

const MainBranchSchema = z.object({
  currentHead: z.string(),
  newCommits: z.array(CommitSchema),
});
// Top-level digest schema
const LastSeenSchema = z.object({
  lastSeenCommit: z.string(),
  lastSeenTimestamp: z.iso.datetime(),
});

export const RegisteredRepositorySchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  path: z.string(),
  lastSeen: LastSeenSchema.nullable(),
  digestJson: z.json().default({}),
});

export const rowToRepoMapper = (row: RepoDigestRow) => {
  return RegisteredRepositorySchema.parse({
    id: row.repoId,
    path: row.repoPath,
    lastSeen: row.lastSeenCommit
      ? {
          lastSeenCommit: row.lastSeenCommit,
          lastSeenTimestamp: row.lastSeenTimestamp,
        }
      : null,
    digestJson: JSON.parse(row.digestJson),
  });
};

// export const RepoActivityDigestSchema = z.object({
//   repo: RegisteredRepoSchema,
//   lastSeen: LastSeenSchema.nullable(),
//   // main: MainBranchSchema,
//   // activeBranches: z.array(BranchSchema),
//   // contributors: z.array(ContributorSchema),
// });

// export type RepoActivityDigest = z.infer<typeof RepoActivityDigestSchema>;
export type RegisteredRepository = z.infer<typeof RegisteredRepositorySchema>;
