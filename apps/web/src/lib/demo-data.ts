import type { CollisionItem, RiskItem, TimelinePoint, BranchDetail } from "@/types/digest";

export const demoRisks: RiskItem[] = [
  {
    id: "risk-1",
    type: "divergence",
    severity: "high",
    title: "Feature branches drifting from main",
    description: "feature/checkout-flow-v2 is 18 commits behind main and growing.",
    branches: ["feature/checkout-flow-v2"],
    suggestedAction: "Rebase onto main before the next deploy window.",
  },
  {
    id: "risk-2",
    type: "collision",
    severity: "medium",
    title: "Possible file collisions",
    description: "Two active branches modify shared checkout components.",
    branches: ["feature/checkout-flow-v2", "feature/cart-persistence"],
    files: ["src/components/checkout/PaymentStep.tsx", "src/hooks/useCheckout.ts"],
  },
  {
    id: "risk-3",
    type: "stale",
    severity: "low",
    title: "Stale branch",
    description: "feature/analytics-dashboard has been inactive for 21 days.",
    branches: ["feature/analytics-dashboard"],
  },
];

export const demoCollisions: CollisionItem[] = [
  {
    branchA: "feature/checkout-flow-v2",
    branchB: "feature/cart-persistence",
    overlappingFiles: ["src/components/checkout/PaymentStep.tsx"],
    conflictLikelihood: "high",
  },
  {
    branchA: "feature/analytics-dashboard",
    branchB: "chore/deps-update-q4",
    overlappingFiles: ["package.json"],
    conflictLikelihood: "medium",
  },
];

export const demoTimeline: TimelinePoint[] = [
  {
    branch: "feature/checkout-flow-v2",
    startedAt: "2025-01-01T12:00:00.000Z",
    lastCommitAt: "2025-01-14T12:00:00.000Z",
    commitsAhead: 12,
    commitsBehind: 3,
  },
  {
    branch: "feature/cart-persistence",
    startedAt: "2024-12-20T12:00:00.000Z",
    lastCommitAt: "2025-01-07T12:00:00.000Z",
    commitsAhead: 6,
    commitsBehind: 12,
  },
  {
    branch: "feature/analytics-dashboard",
    startedAt: "2024-12-10T12:00:00.000Z",
    lastCommitAt: "2025-01-03T12:00:00.000Z",
    commitsAhead: 15,
    commitsBehind: 8,
  },
];

export const demoBranchDetail: BranchDetail = {
  name: "feature/checkout-flow-v2",
  author: "Sarah Chen",
  email: "schen@example.com",
  forkedAt: "2025-01-01T12:00:00.000Z",
  mergeBaseSha: "abc123",
  commitsAhead: 12,
  commitsBehind: 3,
  lastCommitTimestamp: "2025-01-14T12:00:00.000Z",
  lastCommitMessage: "feat: add payment retry logic with exponential backoff",
  filesChanged: [
    "src/components/checkout/CheckoutForm.tsx",
    "src/components/checkout/PaymentStep.tsx",
    "src/hooks/useCheckout.ts",
  ],
  linesAdded: 340,
  linesRemoved: 120,
  recentCommits: [
    {
      sha: "a5b3262",
      message: "feat: add payment retry logic with exponential backoff",
      author: "Sarah Chen",
      timestamp: "2025-01-14T12:00:00.000Z",
    },
    {
      sha: "c7d5482",
      message: "refactor: extract validation logic into shared utils",
      author: "Sarah Chen",
      timestamp: "2025-01-13T12:00:00.000Z",
    },
  ],
  files: [
    { path: "src/components/checkout/PaymentStep.tsx", added: 120, removed: 30 },
    { path: "src/hooks/useCheckout.ts", added: 80, removed: 20 },
    { path: "src/api/checkout.ts", added: 140, removed: 70 },
  ],
};
