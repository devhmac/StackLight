import { $ } from "bun";
import z, { ZodObject, ZodRawShape } from "zod";

const ALLOWED_COMMANDS = [
  "rev-parse",
  "log",
  "symbolic-ref",
  "for-each-ref",
  "shortlog",
  "diff",
  "merge-base",
  "rev-list",
  "fetch",
];

export async function runGit(
  repoPath: string,
  args: string[],
): Promise<string> {
  const command = args[0];

  if (!ALLOWED_COMMANDS.includes(command)) {
    throw new Error(`Git Command not whitelisted: ${command}`);
  }

  if (!(await isGitRepo(repoPath))) {
    throw new Error(`Not a git repository: ${repoPath}`);
  }

  const proc = Bun.spawn(["git", "-C", repoPath, ...args], {
    stdout: "pipe",
    stderr: "pipe",
  });

  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    const stderr = await new Response(proc.stderr).text();
    throw new Error(`Git failed (exit ${exitCode}): ${stderr.trim()}`);
  }

  const stdout = await new Response(proc.stdout).text();
  return stdout.trim();
}

async function isGitRepo(repoPath: string): Promise<boolean> {
  const { exitCode, stdout } =
    await Bun.$`git -C ${repoPath} rev-parse --is-inside-work-tree`.quiet();
  return exitCode === 0 && stdout.toString().trim() === "true";
}

// GIT PARSE FUNCTIONS

export const DELIMITER = "|~|";

export function createGitParser<T extends ZodRawShape>(
  schema: ZodObject<T>,
  fields: (keyof z.infer<ZodObject<T>>)[],
) {
  return (output: string): z.infer<ZodObject<T>>[] => {
    if (!output.trim()) return [];

    return output
      .trim()
      .split("\n")
      .map((line) => {
        const values = line.split(DELIMITER);
        const raw: Record<string, string> = {};
        fields.forEach((field, i) => {
          raw[field as string] = values[i] ?? "";
        });
        return schema.parse(raw);
      });
  };
}
