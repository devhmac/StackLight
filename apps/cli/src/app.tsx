import React, { useState, useEffect, useCallback } from "react";
import { Box, Text, useInput, useApp } from "ink";
import Spinner from "ink-spinner";
import { Header } from "./components/header.js";
import { RepoCard } from "./components/repo-card.js";
import { RepoDetail } from "./components/repo-detail.js";
import {
  checkHealth,
  listRepos,
  getRepoDetails,
  type HealthResponse,
  type RepoDetails,
} from "./api.js";

export function App() {
  const { exit } = useApp();

  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [repoList, setRepoList] = useState<RepoDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewingRepo, setViewingRepo] = useState<RepoDetails | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [h, repos] = await Promise.all([checkHealth(), listRepos()]);
    setHealth(h);
    if (repos.length > 0) {
      const results = await Promise.all(
        repos.map((r) => getRepoDetails(r.id)),
      );
      setRepoList(results.filter((r): r is RepoDetails => r !== null));
    } else {
      setRepoList([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useInput((input, key) => {
    if (loading) return;

    if (viewingRepo) {
      if (key.escape || input === "q") {
        setViewingRepo(null);
      }
      return;
    }

    if (input === "q") {
      exit();
      return;
    }

    if (input === "r") {
      refresh();
      return;
    }

    if (key.upArrow || input === "k") {
      setSelectedIndex((i) => Math.max(0, i - 1));
    }
    if (key.downArrow || input === "j") {
      setSelectedIndex((i) => Math.min(repoList.length - 1, i + 1));
    }
    if (key.return) {
      const repo = repoList[selectedIndex];
      if (repo) setViewingRepo(repo);
    }
  });

  if (viewingRepo) {
    return (
      <Box flexDirection="column" padding={1}>
        <RepoDetail repo={viewingRepo} />
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Header health={health} loading={loading} />

      {loading && (
        <Box marginTop={1}>
          <Text color="cyan">
            <Spinner type="dots" />
          </Text>
          <Text> Loading...</Text>
        </Box>
      )}

      {!loading && repoList.length === 0 && (
        <Box marginTop={1}>
          <Text dimColor>
            No repos registered. Add one via the server API.
          </Text>
        </Box>
      )}

      {!loading && repoList.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          {repoList.map((repo, i) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              isSelected={i === selectedIndex}
            />
          ))}
          <Box marginTop={1} paddingX={1}>
            <Text dimColor>
              j/k to navigate | enter to view | r to refresh | q to quit
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}
