import React from "react";
import { Box, Text } from "ink";
import type { HealthResponse } from "../api.js";

interface HeaderProps {
  health: HealthResponse | null;
  loading: boolean;
}

export function Header({ health, loading }: HeaderProps) {
  const connected = health !== null && health.status === "ok";

  return (
    <Box
      borderStyle="round"
      borderColor="cyan"
      paddingX={2}
      justifyContent="space-between"
    >
      <Text bold color="cyan">
        STACKLIGHT
      </Text>
      <Box gap={2}>
        {loading ? (
          <Text color="yellow">connecting...</Text>
        ) : connected ? (
          <Text>
            <Text color="green">●</Text> Connected
          </Text>
        ) : (
          <Text>
            <Text color="red">●</Text> Disconnected
          </Text>
        )}
        {health?.timestamp && (
          <Text dimColor>
            {new Date(health.timestamp).toLocaleTimeString()}
          </Text>
        )}
      </Box>
    </Box>
  );
}
