import z from "zod";
import { createGitParser } from "../../lib/git";

export const BranchSchema = z.object({
  name: z.string().transform((s) => s.replace("origin/", "")),
  author: z.string(),
  email: z.string(),
  lastCommitTimestamp: z.coerce
    .number()
    .transform((unix) => new Date(unix * 1000).toISOString()),
  lastCommitMessage: z.string().default(""),
  commitsAhead: z.string().transform((s) => Number(s.split(" ")[0]) || 0),
  commitsBehind: z.string().transform((s) => Number(s.split(" ")[1]) || 0),
});

export const parseBranches = createGitParser(BranchSchema, [
  "name",
  "author",
  "email",
  "lastCommitTimestamp",
  "lastCommitMessage",
  "commitsAhead",
  "commitsBehind",
]);
export type Branch = z.infer<typeof BranchSchema>;
