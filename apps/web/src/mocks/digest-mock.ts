import type {
  Repo,
  Commit,
  Contributor,
  Branch,
  BranchDetail,
  RiskAlert,
  CollisionPair,
  ChurnHotspot,
  Stream,
  RepoDigest,
} from "@/types/digest";

// Pre-computed fixed dates to avoid SSR/client mismatch (reference: Jan 15, 2025)
const FIXED_DATES = {
  day0: "2025-01-15T12:00:00.000Z",
  day1: "2025-01-14T12:00:00.000Z",
  day2: "2025-01-13T12:00:00.000Z",
  day3: "2025-01-12T12:00:00.000Z",
  day4: "2025-01-11T12:00:00.000Z",
  day5: "2025-01-10T12:00:00.000Z",
  day6: "2025-01-09T12:00:00.000Z",
  day8: "2025-01-07T12:00:00.000Z",
  day9: "2025-01-06T12:00:00.000Z",
  day10: "2025-01-05T12:00:00.000Z",
  day12: "2025-01-03T12:00:00.000Z",
  day14: "2025-01-01T12:00:00.000Z",
  day15: "2024-12-31T12:00:00.000Z",
  day16: "2024-12-30T12:00:00.000Z",
  day18: "2024-12-28T12:00:00.000Z",
  day20: "2024-12-26T12:00:00.000Z",
  day21: "2024-12-25T12:00:00.000Z",
  day22: "2024-12-24T12:00:00.000Z",
  day30: "2024-12-16T12:00:00.000Z",
  day35: "2024-12-11T12:00:00.000Z",
  day45: "2024-12-01T12:00:00.000Z",
};

// ========== Mock Repos ==========
export const mockRepos: Repo[] = [
  {
    id: "repo-1",
    name: "stacklight",
    path: "/Users/devpra/repos/stacklight",
  },
  {
    id: "repo-2",
    name: "acme-frontend",
    path: "/Users/devpra/repos/acme-frontend",
  },
  {
    id: "repo-3",
    name: "payment-service",
    path: "/Users/devpra/repos/payment-service",
  },
];

// ========== Mock Commits ==========
export const mockCommits: Commit[] = [
  {
    sha: "a5b3262f8c4e1d9a7b6c5d4e3f2a1b0c9d8e7f6a",
    message: "feat: add payment retry logic with exponential backoff",
    author: "Sarah Chen",
    timestamp: FIXED_DATES.day0,
    filesChanged: 4,
  },
  {
    sha: "b6c4371e9d5f2e0b8c7d6e5f4a3b2c1d0e9f8a7b",
    message: "fix: handle null user session in checkout flow",
    author: "Marcus Johnson",
    timestamp: FIXED_DATES.day1,
    filesChanged: 2,
  },
  {
    sha: "c7d5482f0e6a3f1c9d8e7f6a5b4c3d2e1f0a9b8c",
    message: "refactor: extract validation logic into shared utils",
    author: "Sarah Chen",
    timestamp: FIXED_DATES.day1,
    filesChanged: 7,
  },
  {
    sha: "d8e6593a1f7b4a2d0e9f8a7b6c5d4e3f2a1b0c9d",
    message: "chore: update dependencies to latest versions",
    author: "Alex Rivera",
    timestamp: FIXED_DATES.day2,
    filesChanged: 3,
  },
  {
    sha: "e9f7604b2a8c5b3e1f0a9b8c7d6e5f4a3b2c1d0e",
    message: "feat: implement user preferences API endpoint",
    author: "Jordan Lee",
    timestamp: FIXED_DATES.day3,
    filesChanged: 5,
  },
  {
    sha: "f0a8715c3b9d6c4f2a1b0c9d8e7f6a5b4c3d2e1f",
    message: "fix: resolve race condition in cart updates",
    author: "Marcus Johnson",
    timestamp: FIXED_DATES.day4,
    filesChanged: 2,
  },
  {
    sha: "a1b9826d4c0e7d5a3b2c1d0e9f8a7b6c5d4e3f2a",
    message: "docs: update API documentation for v2 endpoints",
    author: "Taylor Kim",
    timestamp: FIXED_DATES.day5,
    filesChanged: 8,
  },
  {
    sha: "b2c0937e5d1f8e6b4c3d2e1f0a9b8c7d6e5f4a3b",
    message: "feat: add analytics tracking for checkout funnel",
    author: "Sarah Chen",
    timestamp: FIXED_DATES.day6,
    filesChanged: 6,
  },
];

// ========== Mock Branches ==========
export const mockBranches: Branch[] = [
  {
    name: "feature/checkout-flow-v2",
    author: "Sarah Chen",
    lastCommit: FIXED_DATES.day1,
    commitsAhead: 12,
    commitsBehind: 3,
    isNew: false,
    isStale: false,
    forkedAt: FIXED_DATES.day14,
    filesChanged: [
      "src/components/checkout/CheckoutForm.tsx",
      "src/components/checkout/PaymentStep.tsx",
      "src/api/checkout.ts",
      "src/hooks/useCheckout.ts",
      "src/types/checkout.ts",
    ],
  },
  {
    name: "feature/user-preferences",
    author: "Jordan Lee",
    lastCommit: FIXED_DATES.day2,
    commitsAhead: 8,
    commitsBehind: 5,
    isNew: false,
    isStale: false,
    forkedAt: FIXED_DATES.day10,
    filesChanged: [
      "src/api/preferences.ts",
      "src/components/settings/PreferencesPanel.tsx",
      "src/hooks/usePreferences.ts",
      "src/types/user.ts",
    ],
  },
  {
    name: "fix/auth-redirect-loop",
    author: "Marcus Johnson",
    lastCommit: FIXED_DATES.day0,
    commitsAhead: 3,
    commitsBehind: 1,
    isNew: true,
    isStale: false,
    forkedAt: FIXED_DATES.day2,
    filesChanged: [
      "src/middleware/auth.ts",
      "src/components/auth/LoginForm.tsx",
    ],
  },
  {
    name: "feature/analytics-dashboard",
    author: "Taylor Kim",
    lastCommit: FIXED_DATES.day3,
    commitsAhead: 15,
    commitsBehind: 8,
    isNew: false,
    isStale: false,
    forkedAt: FIXED_DATES.day21,
    filesChanged: [
      "src/components/analytics/Dashboard.tsx",
      "src/components/analytics/MetricsCard.tsx",
      "src/components/analytics/ChartWrapper.tsx",
      "src/api/analytics.ts",
      "src/hooks/useAnalytics.ts",
    ],
  },
  {
    name: "chore/deps-update-q4",
    author: "Alex Rivera",
    lastCommit: FIXED_DATES.day1,
    commitsAhead: 2,
    commitsBehind: 0,
    isNew: true,
    isStale: false,
    forkedAt: FIXED_DATES.day3,
    filesChanged: ["package.json", "bun.lockb", "tsconfig.json"],
  },
  {
    name: "feature/cart-persistence",
    author: "Sarah Chen",
    lastCommit: FIXED_DATES.day8,
    commitsAhead: 6,
    commitsBehind: 12,
    isNew: false,
    isStale: false,
    forkedAt: FIXED_DATES.day18,
    filesChanged: [
      "src/components/cart/CartProvider.tsx",
      "src/hooks/useCart.ts",
      "src/api/cart.ts",
      "src/types/cart.ts",
    ],
  },
  {
    name: "fix/mobile-nav-overflow",
    author: "Jordan Lee",
    lastCommit: FIXED_DATES.day16,
    commitsAhead: 2,
    commitsBehind: 25,
    isNew: false,
    isStale: true,
    staleDays: 16,
    forkedAt: FIXED_DATES.day20,
    filesChanged: ["src/components/nav/MobileNav.tsx", "src/styles/nav.css"],
  },
  {
    name: "feature/order-history",
    author: "Marcus Johnson",
    lastCommit: FIXED_DATES.day5,
    commitsAhead: 9,
    commitsBehind: 4,
    isNew: false,
    isStale: false,
    forkedAt: FIXED_DATES.day12,
    filesChanged: [
      "src/components/orders/OrderHistory.tsx",
      "src/components/orders/OrderCard.tsx",
      "src/api/orders.ts",
      "src/types/order.ts",
    ],
  },
  {
    name: "experiment/ai-recommendations",
    author: "Taylor Kim",
    lastCommit: FIXED_DATES.day22,
    commitsAhead: 18,
    commitsBehind: 45,
    isNew: false,
    isStale: true,
    staleDays: 22,
    forkedAt: FIXED_DATES.day35,
    filesChanged: [
      "src/components/recommendations/AIPanel.tsx",
      "src/api/recommendations.ts",
      "src/hooks/useRecommendations.ts",
      "src/types/recommendations.ts",
    ],
  },
  {
    name: "feature/payment-methods",
    author: "Alex Rivera",
    lastCommit: FIXED_DATES.day4,
    commitsAhead: 7,
    commitsBehind: 2,
    isNew: false,
    isStale: false,
    forkedAt: FIXED_DATES.day9,
    filesChanged: [
      "src/components/checkout/PaymentMethods.tsx",
      "src/api/checkout.ts",
      "src/types/checkout.ts",
    ],
  },
  {
    name: "fix/search-performance",
    author: "Sarah Chen",
    lastCommit: FIXED_DATES.day30,
    commitsAhead: 4,
    commitsBehind: 52,
    isNew: false,
    isStale: true,
    staleDays: 30,
    forkedAt: FIXED_DATES.day45,
    filesChanged: [
      "src/components/search/SearchBar.tsx",
      "src/hooks/useSearch.ts",
    ],
  },
  {
    name: "feature/wishlist",
    author: "Jordan Lee",
    lastCommit: FIXED_DATES.day6,
    commitsAhead: 11,
    commitsBehind: 6,
    isNew: false,
    isStale: false,
    forkedAt: FIXED_DATES.day15,
    filesChanged: [
      "src/components/wishlist/WishlistPage.tsx",
      "src/components/wishlist/WishlistItem.tsx",
      "src/api/wishlist.ts",
      "src/hooks/useWishlist.ts",
    ],
  },
];

// ========== Mock Contributors ==========
export const mockContributors: Contributor[] = [
  { name: "Sarah Chen", commitCount: 142 },
  { name: "Marcus Johnson", commitCount: 98 },
  { name: "Jordan Lee", commitCount: 76 },
  { name: "Alex Rivera", commitCount: 54 },
  { name: "Taylor Kim", commitCount: 41 },
  { name: "Casey Morgan", commitCount: 23 },
  { name: "Jamie Park", commitCount: 12 },
];

// ========== Mock Risk Alerts ==========
export const mockRisks: RiskAlert[] = [
  {
    id: "risk-1",
    type: "divergence",
    severity: "high",
    title: "Critical divergence on experiment/ai-recommendations",
    description:
      "Branch is 45 commits behind main and hasn't been updated in 22 days. Merge conflicts are likely.",
    branches: ["experiment/ai-recommendations"],
    suggestedAction: "Rebase or close this branch if work is abandoned",
  },
  {
    id: "risk-2",
    type: "collision",
    severity: "high",
    title: "File collision: checkout-flow-v2 & payment-methods",
    description:
      "Both branches modify src/api/checkout.ts and src/types/checkout.ts. Coordinate merges to avoid conflicts.",
    branches: ["feature/checkout-flow-v2", "feature/payment-methods"],
    files: ["src/api/checkout.ts", "src/types/checkout.ts"],
    suggestedAction:
      "Coordinate with Alex Rivera before merging either branch",
  },
  {
    id: "risk-3",
    type: "stale",
    severity: "medium",
    title: "Stale branch: fix/search-performance",
    description:
      "No commits in 30 days. Branch is 52 commits behind main and may contain outdated code.",
    branches: ["fix/search-performance"],
    suggestedAction: "Review if this work is still needed, otherwise archive",
  },
  {
    id: "risk-4",
    type: "scope_creep",
    severity: "medium",
    title: "Large scope on feature/analytics-dashboard",
    description:
      "Branch has 15 commits and touches 5 files across multiple domains. Consider breaking into smaller PRs.",
    branches: ["feature/analytics-dashboard"],
    files: [
      "src/components/analytics/Dashboard.tsx",
      "src/components/analytics/MetricsCard.tsx",
      "src/components/analytics/ChartWrapper.tsx",
      "src/api/analytics.ts",
      "src/hooks/useAnalytics.ts",
    ],
    suggestedAction: "Split into separate PRs for components, API, and hooks",
  },
  {
    id: "risk-5",
    type: "divergence",
    severity: "low",
    title: "Minor divergence on feature/cart-persistence",
    description:
      "Branch is 12 commits behind main. Should sync soon to avoid larger conflicts.",
    branches: ["feature/cart-persistence"],
    suggestedAction: "Rebase on main at next convenient point",
  },
  {
    id: "risk-6",
    type: "stale",
    severity: "medium",
    title: "Stale branch: fix/mobile-nav-overflow",
    description:
      "No commits in 16 days. Branch is 25 commits behind main.",
    branches: ["fix/mobile-nav-overflow"],
    suggestedAction: "Check with Jordan Lee on status",
  },
];

// ========== Mock Collisions ==========
export const mockCollisions: CollisionPair[] = [
  {
    branchA: "feature/checkout-flow-v2",
    branchB: "feature/payment-methods",
    overlappingFiles: ["src/api/checkout.ts", "src/types/checkout.ts"],
    conflictLikelihood: "high",
  },
  {
    branchA: "feature/user-preferences",
    branchB: "feature/wishlist",
    overlappingFiles: ["src/types/user.ts"],
    conflictLikelihood: "low",
  },
  {
    branchA: "feature/cart-persistence",
    branchB: "feature/checkout-flow-v2",
    overlappingFiles: ["src/hooks/useCheckout.ts"],
    conflictLikelihood: "medium",
  },
];

// ========== Mock Churn Hotspots ==========
export const mockChurnHotspots: ChurnHotspot[] = [
  {
    path: "src/api/checkout.ts",
    changeCount: 28,
    contributorCount: 4,
    trend: "increasing",
  },
  {
    path: "src/components/checkout/CheckoutForm.tsx",
    changeCount: 22,
    contributorCount: 3,
    trend: "increasing",
  },
  {
    path: "src/hooks/useCart.ts",
    changeCount: 18,
    contributorCount: 2,
    trend: "stable",
  },
  {
    path: "src/types/user.ts",
    changeCount: 15,
    contributorCount: 4,
    trend: "stable",
  },
  {
    path: "src/middleware/auth.ts",
    changeCount: 12,
    contributorCount: 2,
    trend: "decreasing",
  },
];

// ========== Mock Streams ==========
export const mockStreams: Stream[] = [
  {
    id: "stream-1",
    name: "Checkout Improvements",
    pattern: "feature/checkout-*",
    branches: ["feature/checkout-flow-v2", "feature/payment-methods"],
    lead: "Sarah Chen",
    metrics: {
      branchCount: 2,
      commitCount: 19,
      maxDivergence: 3,
    },
  },
  {
    id: "stream-2",
    name: "User Experience",
    pattern: "feature/user-*",
    branches: ["feature/user-preferences", "feature/wishlist"],
    lead: "Jordan Lee",
    metrics: {
      branchCount: 2,
      commitCount: 19,
      maxDivergence: 6,
    },
  },
  {
    id: "stream-3",
    name: "Bug Fixes",
    pattern: "fix/*",
    branches: [
      "fix/auth-redirect-loop",
      "fix/mobile-nav-overflow",
      "fix/search-performance",
    ],
    metrics: {
      branchCount: 3,
      commitCount: 9,
      maxDivergence: 52,
    },
  },
];

// ========== Full Mock Digest ==========
export const mockDigest: RepoDigest = {
  repo: mockRepos[0]!,
  lastSeen: {
    commit: "d8e6593a1f7b4a2d0e9f8a7b6c5d4e3f2a1b0c9d",
    timestamp: FIXED_DATES.day2,
  },
  main: {
    currentHead: "a5b3262f8c4e1d9a7b6c5d4e3f2a1b0c9d8e7f6a",
    newCommits: mockCommits.slice(0, 3), // 3 new commits since last seen
  },
  activeBranches: mockBranches,
  contributors: mockContributors,
  risks: mockRisks,
  collisions: mockCollisions,
  churnHotspots: mockChurnHotspots,
  streams: mockStreams,
  summary: {
    totalBranches: mockBranches.length,
    staleBranchCount: mockBranches.filter((b) => b.isStale).length,
    highRiskCount: mockRisks.filter((r) => r.severity === "high").length,
    newCommitCount: 3,
    activeContributorCount: mockContributors.filter((c) => c.commitCount > 10)
      .length,
  },
};

// Export function to get digest by repo ID (simulates API)
export function getMockDigestByRepoId(repoId: string): RepoDigest | null {
  const repo = mockRepos.find((r) => r.id === repoId);
  if (!repo) return null;

  return {
    ...mockDigest,
    repo,
  };
}

// ========== Mock Branch Details (on-demand data) ==========
export const mockBranchDetails: Record<string, BranchDetail> = {
  "feature/checkout-flow-v2": {
    ...mockBranches[0]!,
    linesAdded: 847,
    linesRemoved: 234,
    recentCommits: [
      {
        sha: "f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",
        message: "feat: add multi-step checkout wizard",
        author: "Sarah Chen",
        timestamp: FIXED_DATES.day1,
        filesChanged: 3,
      },
      {
        sha: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
        message: "feat: implement payment validation",
        author: "Sarah Chen",
        timestamp: FIXED_DATES.day2,
        filesChanged: 2,
      },
      {
        sha: "b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1",
        message: "fix: handle edge case in shipping calculation",
        author: "Sarah Chen",
        timestamp: FIXED_DATES.day3,
        filesChanged: 1,
      },
      {
        sha: "c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2",
        message: "refactor: extract address validation",
        author: "Sarah Chen",
        timestamp: FIXED_DATES.day4,
        filesChanged: 2,
      },
      {
        sha: "d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3",
        message: "test: add checkout flow tests",
        author: "Sarah Chen",
        timestamp: FIXED_DATES.day5,
        filesChanged: 1,
      },
    ],
    files: [
      { path: "src/components/checkout/CheckoutForm.tsx", added: 312, removed: 45 },
      { path: "src/components/checkout/PaymentStep.tsx", added: 245, removed: 89 },
      { path: "src/api/checkout.ts", added: 156, removed: 67 },
      { path: "src/hooks/useCheckout.ts", added: 89, removed: 23 },
      { path: "src/types/checkout.ts", added: 45, removed: 10 },
    ],
  },
  "feature/user-preferences": {
    ...mockBranches[1]!,
    linesAdded: 523,
    linesRemoved: 112,
    recentCommits: [
      {
        sha: "e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4",
        message: "feat: add user preferences API",
        author: "Jordan Lee",
        timestamp: FIXED_DATES.day2,
        filesChanged: 2,
      },
      {
        sha: "f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5",
        message: "feat: implement preferences UI panel",
        author: "Jordan Lee",
        timestamp: FIXED_DATES.day3,
        filesChanged: 1,
      },
      {
        sha: "a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6",
        message: "fix: persist preferences to localStorage",
        author: "Jordan Lee",
        timestamp: FIXED_DATES.day4,
        filesChanged: 2,
      },
    ],
    files: [
      { path: "src/api/preferences.ts", added: 178, removed: 34 },
      { path: "src/components/settings/PreferencesPanel.tsx", added: 234, removed: 56 },
      { path: "src/hooks/usePreferences.ts", added: 67, removed: 12 },
      { path: "src/types/user.ts", added: 44, removed: 10 },
    ],
  },
  "fix/auth-redirect-loop": {
    ...mockBranches[2]!,
    linesAdded: 67,
    linesRemoved: 23,
    recentCommits: [
      {
        sha: "b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7",
        message: "fix: prevent infinite redirect on auth failure",
        author: "Marcus Johnson",
        timestamp: FIXED_DATES.day0,
        filesChanged: 2,
      },
      {
        sha: "c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8",
        message: "fix: add redirect state tracking",
        author: "Marcus Johnson",
        timestamp: FIXED_DATES.day1,
        filesChanged: 1,
      },
    ],
    files: [
      { path: "src/middleware/auth.ts", added: 45, removed: 18 },
      { path: "src/components/auth/LoginForm.tsx", added: 22, removed: 5 },
    ],
  },
  "feature/analytics-dashboard": {
    ...mockBranches[3]!,
    linesAdded: 1245,
    linesRemoved: 89,
    recentCommits: [
      {
        sha: "d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9",
        message: "feat: add analytics dashboard shell",
        author: "Taylor Kim",
        timestamp: FIXED_DATES.day3,
        filesChanged: 2,
      },
      {
        sha: "e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
        message: "feat: implement metrics cards",
        author: "Taylor Kim",
        timestamp: FIXED_DATES.day4,
        filesChanged: 1,
      },
      {
        sha: "f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1",
        message: "feat: add chart visualizations",
        author: "Taylor Kim",
        timestamp: FIXED_DATES.day5,
        filesChanged: 2,
      },
      {
        sha: "a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
        message: "feat: connect to analytics API",
        author: "Taylor Kim",
        timestamp: FIXED_DATES.day6,
        filesChanged: 1,
      },
    ],
    files: [
      { path: "src/components/analytics/Dashboard.tsx", added: 456, removed: 23 },
      { path: "src/components/analytics/MetricsCard.tsx", added: 234, removed: 12 },
      { path: "src/components/analytics/ChartWrapper.tsx", added: 312, removed: 34 },
      { path: "src/api/analytics.ts", added: 145, removed: 12 },
      { path: "src/hooks/useAnalytics.ts", added: 98, removed: 8 },
    ],
  },
  "chore/deps-update-q4": {
    ...mockBranches[4]!,
    linesAdded: 234,
    linesRemoved: 198,
    recentCommits: [
      {
        sha: "b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
        message: "chore: update React to 19.x",
        author: "Alex Rivera",
        timestamp: FIXED_DATES.day1,
        filesChanged: 2,
      },
      {
        sha: "c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4",
        message: "chore: update TypeScript config",
        author: "Alex Rivera",
        timestamp: FIXED_DATES.day2,
        filesChanged: 1,
      },
    ],
    files: [
      { path: "package.json", added: 45, removed: 42 },
      { path: "bun.lockb", added: 156, removed: 145 },
      { path: "tsconfig.json", added: 33, removed: 11 },
    ],
  },
  "feature/cart-persistence": {
    ...mockBranches[5]!,
    linesAdded: 412,
    linesRemoved: 78,
    recentCommits: [
      {
        sha: "d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5",
        message: "feat: add cart persistence provider",
        author: "Sarah Chen",
        timestamp: FIXED_DATES.day8,
        filesChanged: 2,
      },
      {
        sha: "e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6",
        message: "feat: sync cart with localStorage",
        author: "Sarah Chen",
        timestamp: FIXED_DATES.day9,
        filesChanged: 2,
      },
    ],
    files: [
      { path: "src/components/cart/CartProvider.tsx", added: 189, removed: 23 },
      { path: "src/hooks/useCart.ts", added: 134, removed: 34 },
      { path: "src/api/cart.ts", added: 56, removed: 12 },
      { path: "src/types/cart.ts", added: 33, removed: 9 },
    ],
  },
  "fix/mobile-nav-overflow": {
    ...mockBranches[6]!,
    linesAdded: 34,
    linesRemoved: 12,
    recentCommits: [
      {
        sha: "f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7",
        message: "fix: prevent nav overflow on small screens",
        author: "Jordan Lee",
        timestamp: FIXED_DATES.day16,
        filesChanged: 2,
      },
    ],
    files: [
      { path: "src/components/nav/MobileNav.tsx", added: 23, removed: 8 },
      { path: "src/styles/nav.css", added: 11, removed: 4 },
    ],
  },
  "feature/order-history": {
    ...mockBranches[7]!,
    linesAdded: 678,
    linesRemoved: 145,
    recentCommits: [
      {
        sha: "a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8",
        message: "feat: add order history page",
        author: "Marcus Johnson",
        timestamp: FIXED_DATES.day5,
        filesChanged: 2,
      },
      {
        sha: "b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9",
        message: "feat: implement order card component",
        author: "Marcus Johnson",
        timestamp: FIXED_DATES.day6,
        filesChanged: 1,
      },
      {
        sha: "c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0",
        message: "feat: add order filtering and sorting",
        author: "Marcus Johnson",
        timestamp: FIXED_DATES.day8,
        filesChanged: 2,
      },
    ],
    files: [
      { path: "src/components/orders/OrderHistory.tsx", added: 289, removed: 56 },
      { path: "src/components/orders/OrderCard.tsx", added: 178, removed: 34 },
      { path: "src/api/orders.ts", added: 134, removed: 45 },
      { path: "src/types/order.ts", added: 77, removed: 10 },
    ],
  },
  "experiment/ai-recommendations": {
    ...mockBranches[8]!,
    linesAdded: 1567,
    linesRemoved: 234,
    recentCommits: [
      {
        sha: "d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1",
        message: "feat: add AI recommendation panel",
        author: "Taylor Kim",
        timestamp: FIXED_DATES.day22,
        filesChanged: 2,
      },
      {
        sha: "e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2",
        message: "feat: integrate with ML model API",
        author: "Taylor Kim",
        timestamp: FIXED_DATES.day30,
        filesChanged: 2,
      },
    ],
    files: [
      { path: "src/components/recommendations/AIPanel.tsx", added: 567, removed: 89 },
      { path: "src/api/recommendations.ts", added: 456, removed: 78 },
      { path: "src/hooks/useRecommendations.ts", added: 312, removed: 45 },
      { path: "src/types/recommendations.ts", added: 232, removed: 22 },
    ],
  },
  "feature/payment-methods": {
    ...mockBranches[9]!,
    linesAdded: 534,
    linesRemoved: 123,
    recentCommits: [
      {
        sha: "f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3",
        message: "feat: add payment method selector",
        author: "Alex Rivera",
        timestamp: FIXED_DATES.day4,
        filesChanged: 2,
      },
      {
        sha: "a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4",
        message: "feat: implement Apple Pay integration",
        author: "Alex Rivera",
        timestamp: FIXED_DATES.day5,
        filesChanged: 1,
      },
      {
        sha: "b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5",
        message: "feat: add Google Pay support",
        author: "Alex Rivera",
        timestamp: FIXED_DATES.day6,
        filesChanged: 2,
      },
    ],
    files: [
      { path: "src/components/checkout/PaymentMethods.tsx", added: 345, removed: 78 },
      { path: "src/api/checkout.ts", added: 123, removed: 34 },
      { path: "src/types/checkout.ts", added: 66, removed: 11 },
    ],
  },
  "fix/search-performance": {
    ...mockBranches[10]!,
    linesAdded: 89,
    linesRemoved: 156,
    recentCommits: [
      {
        sha: "c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
        message: "perf: debounce search input",
        author: "Sarah Chen",
        timestamp: FIXED_DATES.day30,
        filesChanged: 1,
      },
      {
        sha: "d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7",
        message: "perf: add search result caching",
        author: "Sarah Chen",
        timestamp: FIXED_DATES.day35,
        filesChanged: 1,
      },
    ],
    files: [
      { path: "src/components/search/SearchBar.tsx", added: 56, removed: 89 },
      { path: "src/hooks/useSearch.ts", added: 33, removed: 67 },
    ],
  },
  "feature/wishlist": {
    ...mockBranches[11]!,
    linesAdded: 756,
    linesRemoved: 98,
    recentCommits: [
      {
        sha: "e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8",
        message: "feat: add wishlist page",
        author: "Jordan Lee",
        timestamp: FIXED_DATES.day6,
        filesChanged: 2,
      },
      {
        sha: "f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9",
        message: "feat: implement wishlist item component",
        author: "Jordan Lee",
        timestamp: FIXED_DATES.day8,
        filesChanged: 1,
      },
      {
        sha: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
        message: "feat: add wishlist API integration",
        author: "Jordan Lee",
        timestamp: FIXED_DATES.day9,
        filesChanged: 2,
      },
    ],
    files: [
      { path: "src/components/wishlist/WishlistPage.tsx", added: 345, removed: 34 },
      { path: "src/components/wishlist/WishlistItem.tsx", added: 189, removed: 23 },
      { path: "src/api/wishlist.ts", added: 145, removed: 29 },
      { path: "src/hooks/useWishlist.ts", added: 77, removed: 12 },
    ],
  },
};

// Export function to get branch detail by name (simulates API)
export function getMockBranchDetail(branchName: string): BranchDetail | null {
  return mockBranchDetails[branchName] ?? null;
}
