import z from "zod";
import { createGitParser } from "../../lib/git";

export const BranchSchema = z.object({
  name: z.string().transform((s) => s.replace("origin/", "")),
  author: z.string(),
  timestamp: z.coerce.number(),
});

export const parseBranches = createGitParser(BranchSchema, [
  "name",
  "author",
  "timestamp",
]);
export type Branch = z.infer<typeof BranchSchema>;
