import React from "react";
import { Box, Text } from "ink";
import type { RepoDetails } from "../api.js";

interface RepoCardProps {
  repo: RepoDetails;
  isSelected: boolean;
}

export function RepoCard({ repo, isSelected }: RepoCardProps) {
  const { branches } = repo;
  const total = branches.length;
  const active = branches.filter((b) => !b.isStale && !b.isMerged).length;
  const stale = branches.filter((b) => b.isStale).length;
  const newBranches = branches.filter((b) => b.isNew).length;
  const merged = branches.filter((b) => b.isMerged).length;

  const totalAhead = branches.reduce(
    (sum, b) => sum + (b.commitsAhead ?? 0),
    0,
  );
  const totalBehind = branches.reduce(
    (sum, b) => sum + (b.commitsBehind ?? 0),
    0,
  );

  const mostRecent = branches.length
    ? branches.reduce((latest, b) =>
        new Date(b.lastCommitTimestamp) > new Date(latest.lastCommitTimestamp)
          ? b
          : latest,
      )
    : null;

  const displayName = repo.name || repo.path;

  return (
    <Box
      flexDirection="column"
      borderStyle={isSelected ? "bold" : "single"}
      borderColor={isSelected ? "cyan" : "gray"}
      paddingX={1}
    >
      <Box justifyContent="space-between">
        <Text bold color={isSelected ? "cyan" : undefined}>
          {isSelected ? "> " : "  "}
          {displayName}
        </Text>
        <Text dimColor>{total} branches</Text>
      </Box>

      <Box gap={2} paddingLeft={2}>
        <Text>
          <Text color="green">{active}</Text>
          <Text dimColor> active</Text>
        </Text>
        <Text>
          <Text color="yellow">{stale}</Text>
          <Text dimColor> stale</Text>
        </Text>
        <Text>
          <Text color="cyan">{newBranches}</Text>
          <Text dimColor> new</Text>
        </Text>
        <Text>
          <Text dimColor>
            {merged} merged
          </Text>
        </Text>
        <Text>
          <Text color="green">+{totalAhead}</Text>
          <Text dimColor>/</Text>
          <Text color="red">-{totalBehind}</Text>
        </Text>
      </Box>

      {mostRecent && (
        <Box paddingLeft={2}>
          <Text dimColor>
            latest: <Text color="white">{mostRecent.name}</Text> —{" "}
            {mostRecent.lastCommitMessage.slice(0, 50)}
            {mostRecent.lastCommitMessage.length > 50 ? "..." : ""}
          </Text>
        </Box>
      )}
    </Box>
  );
}
