import React from "react";
import { Box, Text } from "ink";
import type { RepoDetails } from "../api.js";
import type { BranchInfo } from "@repo/types/git";

interface RepoDetailProps {
  repo: RepoDetails;
}

function BranchRow({ branch }: { branch: BranchInfo }) {
  const statusColor = branch.isMerged
    ? "gray"
    : branch.isStale
      ? "yellow"
      : branch.isNew
        ? "cyan"
        : "green";

  const statusLabel = branch.isMerged
    ? "merged"
    : branch.isStale
      ? "stale"
      : branch.isNew
        ? "new"
        : "active";

  return (
    <Box paddingLeft={1} gap={1}>
      <Text color={statusColor}>
        {statusLabel.padEnd(7)}
      </Text>
      <Text bold>{branch.name.padEnd(30)}</Text>
      <Box gap={1}>
        {branch.commitsAhead !== undefined && (
          <Text color="green">+{String(branch.commitsAhead).padEnd(3)}</Text>
        )}
        {branch.commitsBehind !== undefined && (
          <Text color="red">-{String(branch.commitsBehind).padEnd(3)}</Text>
        )}
      </Box>
      <Text dimColor>
        {branch.lastCommitMessage.slice(0, 40)}
        {branch.lastCommitMessage.length > 40 ? "..." : ""}
      </Text>
    </Box>
  );
}

export function RepoDetail({ repo }: RepoDetailProps) {
  const displayName = repo.name || repo.path;
  const { branches } = repo;

  const active = branches.filter((b) => !b.isStale && !b.isMerged);
  const stale = branches.filter((b) => b.isStale && !b.isMerged);
  const newBranches = branches.filter((b) => b.isNew && !b.isStale && !b.isMerged);
  const merged = branches.filter((b) => b.isMerged);

  const sorted = [...branches].sort(
    (a, b) =>
      new Date(b.lastCommitTimestamp).getTime() -
      new Date(a.lastCommitTimestamp).getTime(),
  );

  return (
    <Box flexDirection="column">
      <Box
        borderStyle="round"
        borderColor="cyan"
        paddingX={2}
        justifyContent="space-between"
      >
        <Text bold color="cyan">
          {displayName}
        </Text>
        <Text dimColor>esc to go back</Text>
      </Box>

      <Box paddingX={1} gap={3} marginTop={1}>
        <Box borderStyle="round" borderColor="green" paddingX={2}>
          <Text>
            <Text color="green" bold>
              {active.length}
            </Text>{" "}
            active
          </Text>
        </Box>
        <Box borderStyle="round" borderColor="yellow" paddingX={2}>
          <Text>
            <Text color="yellow" bold>
              {stale.length}
            </Text>{" "}
            stale
          </Text>
        </Box>
        <Box borderStyle="round" borderColor="cyan" paddingX={2}>
          <Text>
            <Text color="cyan" bold>
              {newBranches.length}
            </Text>{" "}
            new
          </Text>
        </Box>
        <Box borderStyle="round" borderColor="gray" paddingX={2}>
          <Text>
            <Text dimColor bold>
              {merged.length}
            </Text>{" "}
            merged
          </Text>
        </Box>
      </Box>

      <Box
        flexDirection="column"
        borderStyle="single"
        borderColor="gray"
        marginTop={1}
        paddingY={1}
      >
        <Box paddingLeft={1} gap={1} marginBottom={1}>
          <Text dimColor>
            {"status".padEnd(8)}
            {"branch".padEnd(30)}
            {"+/-".padEnd(9)}
            last commit
          </Text>
        </Box>
        {sorted.map((branch) => (
          <BranchRow key={branch.name} branch={branch} />
        ))}
      </Box>

      {repo.path && (
        <Box marginTop={1} paddingX={1}>
          <Text dimColor>path: {repo.path}</Text>
        </Box>
      )}
    </Box>
  );
}
