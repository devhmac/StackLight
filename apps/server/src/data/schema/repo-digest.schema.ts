import z from "zod";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const repoDigests = sqliteTable("repo_digests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  repoId: text("repo_id").notNull().unique(),
  repoPath: text("repo_path").notNull(),
  lastSeenCommit: text("last_seen_commit"),
  lastSeenTimestamp: text("last_seen_timestamp"),
  digestJson: text("digest_json").notNull(),
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
  timestamp: z.iso.datetime(), // ISO 8601                                                                                                                                              filesChanged: z.number().int().nonnegative(),
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
const LastSeenSchema = z.object({
  commit: z.string(),
  timestamp: z.iso.datetime(),
});
const RepoSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
});
const MainBranchSchema = z.object({
  currentHead: z.string(),
  newCommits: z.array(CommitSchema),
});
// Top-level digest schema
export const RepoActivityDigestSchema = z.object({
  repo: RepoSchema,
  lastSeen: LastSeenSchema.nullable(),
  main: MainBranchSchema,
  activeBranches: z.array(BranchSchema),
  contributors: z.array(ContributorSchema),
});

export type RepoActivityDigest = z.infer<typeof RepoActivityDigestSchema>;
