import { $ } from "bun";

const ALLOWED_COMMANDS = [
  "rev-parse",
  "log",
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
): Promise<String> {
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
