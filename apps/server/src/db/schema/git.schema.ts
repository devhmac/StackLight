import z from "zod";
import { createGitParser } from "../../lib/git";

export const BranchSchema = z.object({
  name: z.string().transform((s) => s.replace("origin/", "")),
  author: z.string(),
  email: z.string(),
  lastCommitTimestamp: z.coerce.number(),
  lastCommitMessage: z.string().default(""),
});

export const parseBranches = createGitParser(BranchSchema, [
  "name",
  "author",
  "email",
  "lastCommitTimestamp",
  "lastCommitMessage",
]);
export type Branch = z.infer<typeof BranchSchema>;
