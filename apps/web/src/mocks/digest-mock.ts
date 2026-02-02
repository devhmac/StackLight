import type {
  Repo,
  Commit,
  Contributor,
  Branch,
  RiskAlert,
  CollisionPair,
  ChurnHotspot,
  Stream,
  RepoDigest,
} from "@/types/digest";

// Helper to generate ISO timestamps relative to now
function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

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
    timestamp: daysAgo(0),
    filesChanged: 4,
  },
  {
    sha: "b6c4371e9d5f2e0b8c7d6e5f4a3b2c1d0e9f8a7b",
    message: "fix: handle null user session in checkout flow",
    author: "Marcus Johnson",
    timestamp: daysAgo(1),
    filesChanged: 2,
  },
  {
    sha: "c7d5482f0e6a3f1c9d8e7f6a5b4c3d2e1f0a9b8c",
    message: "refactor: extract validation logic into shared utils",
    author: "Sarah Chen",
    timestamp: daysAgo(1),
    filesChanged: 7,
  },
  {
    sha: "d8e6593a1f7b4a2d0e9f8a7b6c5d4e3f2a1b0c9d",
    message: "chore: update dependencies to latest versions",
    author: "Alex Rivera",
    timestamp: daysAgo(2),
    filesChanged: 3,
  },
  {
    sha: "e9f7604b2a8c5b3e1f0a9b8c7d6e5f4a3b2c1d0e",
    message: "feat: implement user preferences API endpoint",
    author: "Jordan Lee",
    timestamp: daysAgo(3),
    filesChanged: 5,
  },
  {
    sha: "f0a8715c3b9d6c4f2a1b0c9d8e7f6a5b4c3d2e1f",
    message: "fix: resolve race condition in cart updates",
    author: "Marcus Johnson",
    timestamp: daysAgo(4),
    filesChanged: 2,
  },
  {
    sha: "a1b9826d4c0e7d5a3b2c1d0e9f8a7b6c5d4e3f2a",
    message: "docs: update API documentation for v2 endpoints",
    author: "Taylor Kim",
    timestamp: daysAgo(5),
    filesChanged: 8,
  },
  {
    sha: "b2c0937e5d1f8e6b4c3d2e1f0a9b8c7d6e5f4a3b",
    message: "feat: add analytics tracking for checkout funnel",
    author: "Sarah Chen",
    timestamp: daysAgo(6),
    filesChanged: 6,
  },
];

// ========== Mock Branches ==========
export const mockBranches: Branch[] = [
  {
    name: "feature/checkout-flow-v2",
    author: "Sarah Chen",
    lastCommit: daysAgo(1),
    commitsAhead: 12,
    commitsBehind: 3,
    isNew: false,
    isStale: false,
    forkedAt: daysAgo(14),
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
    lastCommit: daysAgo(2),
    commitsAhead: 8,
    commitsBehind: 5,
    isNew: false,
    isStale: false,
    forkedAt: daysAgo(10),
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
    lastCommit: daysAgo(0),
    commitsAhead: 3,
    commitsBehind: 1,
    isNew: true,
    isStale: false,
    forkedAt: daysAgo(2),
    filesChanged: [
      "src/middleware/auth.ts",
      "src/components/auth/LoginForm.tsx",
    ],
  },
  {
    name: "feature/analytics-dashboard",
    author: "Taylor Kim",
    lastCommit: daysAgo(3),
    commitsAhead: 15,
    commitsBehind: 8,
    isNew: false,
    isStale: false,
    forkedAt: daysAgo(21),
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
    lastCommit: daysAgo(1),
    commitsAhead: 2,
    commitsBehind: 0,
    isNew: true,
    isStale: false,
    forkedAt: daysAgo(3),
    filesChanged: ["package.json", "bun.lockb", "tsconfig.json"],
  },
  {
    name: "feature/cart-persistence",
    author: "Sarah Chen",
    lastCommit: daysAgo(8),
    commitsAhead: 6,
    commitsBehind: 12,
    isNew: false,
    isStale: false,
    forkedAt: daysAgo(18),
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
    lastCommit: daysAgo(16),
    commitsAhead: 2,
    commitsBehind: 25,
    isNew: false,
    isStale: true,
    staleDays: 16,
    forkedAt: daysAgo(20),
    filesChanged: ["src/components/nav/MobileNav.tsx", "src/styles/nav.css"],
  },
  {
    name: "feature/order-history",
    author: "Marcus Johnson",
    lastCommit: daysAgo(5),
    commitsAhead: 9,
    commitsBehind: 4,
    isNew: false,
    isStale: false,
    forkedAt: daysAgo(12),
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
    lastCommit: daysAgo(22),
    commitsAhead: 18,
    commitsBehind: 45,
    isNew: false,
    isStale: true,
    staleDays: 22,
    forkedAt: daysAgo(35),
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
    lastCommit: daysAgo(4),
    commitsAhead: 7,
    commitsBehind: 2,
    isNew: false,
    isStale: false,
    forkedAt: daysAgo(9),
    filesChanged: [
      "src/components/checkout/PaymentMethods.tsx",
      "src/api/checkout.ts",
      "src/types/checkout.ts",
    ],
  },
  {
    name: "fix/search-performance",
    author: "Sarah Chen",
    lastCommit: daysAgo(30),
    commitsAhead: 4,
    commitsBehind: 52,
    isNew: false,
    isStale: true,
    staleDays: 30,
    forkedAt: daysAgo(45),
    filesChanged: [
      "src/components/search/SearchBar.tsx",
      "src/hooks/useSearch.ts",
    ],
  },
  {
    name: "feature/wishlist",
    author: "Jordan Lee",
    lastCommit: daysAgo(6),
    commitsAhead: 11,
    commitsBehind: 6,
    isNew: false,
    isStale: false,
    forkedAt: daysAgo(15),
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
    timestamp: daysAgo(2),
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
