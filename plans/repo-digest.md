# StackLight: Repo Activity Digest

## What This Is

A local-first situational awareness system for dev leads and principal engineers to understand the health, trajectory, and risks across their repositories—without reading every PR or asking for status updates.

Not a fancy `git log` viewer. A **codebase command center** for high-velocity, multi-stream projects.

## Why It's Valuable

As a dev lead on a large project (20+ devs, multiple streams), you need to answer:

- Is work actually flowing, or are things stalling?
- Which streams are shipping vs. spinning?
- What's about to cause pain? (merge conflicts, stale work, scope creep)
- Who's working on what, and is knowledge concentrated or distributed?
- What's landed since I last looked?

Currently this requires: reading PRs, checking GitHub, asking in Slack, or just being out of the loop. This tool gives you a single view by reading local git data after a fetch.

## How It Works

1. You register local repo paths with StackLight
2. StackLight runs git commands against those repos to gather activity data
3. It tracks what you've "seen" so it can show you what's new
4. You get multiple views into the work: digest, timeline, risks, team

---

## Core Views & Functionality

### 1. Overview Dashboard

The "morning standup in your terminal" view. At a glance:

- **Key metrics**: Active branches, open PRs, commit velocity (with trend), active devs, high-risk count, stale count
- **Attention alerts**: High-severity issues surfaced immediately
- **Stream health cards**: Each workstream's status—branch count, commits, max divergence, lead
- **Churn hotspots**: Which parts of the codebase are getting hammered with changes

### 2. Branch Timeline (Gantt View)

Visual timeline showing all branches across all streams:

- **Swimlanes by stream**: See checkout work vs. auth work vs. infra at a glance
- **Branch lifespans**: When each branch forked from main, how long it's been running, last activity
- **Visual risk indicators**: Red borders on high-divergence branches, dimmed stale branches
- **PR status**: Icons showing which branches have open pull requests

This answers: "What's the shape of all concurrent work right now?"

### 3. Risk Detection

Proactive identification of problems before they become painful:

**Collision Radar**
- Identify branches touching the same files
- Rank by conflict likelihood (number of overlapping files, how different the changes are)
- Surface before developers discover conflicts at merge time

**Divergence Tracking**
- How far each branch has drifted from main (commits behind)
- Flag branches that haven't rebased/merged main recently
- Prevent "merge hell" from branches that live too long in isolation

**Stale Branch Detection**
- Branches with no commits in X days
- Work that started but went quiet
- Potential blocked work or abandoned experiments

**Scope Creep Signals**
- Branches that keep growing in commit count without merging
- Long-running branches with expanding file footprints

**Alert System**
- Categorized by severity (high/medium/low)
- Typed by issue (divergence, collision, stale, scope, review delay)
- Actionable—link to the branch, show the context

### 4. Stream Organization

Group work by feature/workstream, not just by branch:

- **Stream health**: Aggregate metrics per stream (branches, commits, max drift)
- **Stream leads**: Who's accountable for each area
- **Cross-stream visibility**: See all streams side-by-side

Streams are user-defined groupings. Could be feature areas, team assignments, or release trains.

### 5. Team Visibility

Developer-centric view:

- **Contribution distribution**: Who's committing where, how much
- **Review activity**: Who's reviewing (future: review network, bottlenecks)
- **Workload signals**: Is someone drowning while others coast?
- **Knowledge mapping**: Who has touched which parts of the codebase (bus factor)
- **Status indicators**: Active, away, blocked

### 6. Churn Hotspots

Identify unstable areas of the codebase:

- **Files/directories ranked by change frequency**
- **Contributor count per area** (many hands vs. single owner)
- **Trend indicators** (increasing churn, decreasing, stable)

High churn + few contributors = risk. High churn + many contributors = potential coordination problem.

### 7. "New Since Last Check" Tracking

The core digest functionality:

- Track last seen commit per repo
- Show what's genuinely new since you last looked
- Mark-as-seen to reset the baseline
- Don't waste time re-reading what you've already reviewed

---

## Future Functionality (Designed In From Start)

### GitHub Integration
- PR status, reviews, CI results
- Review network (who reviews whom, bottlenecks)
- Link branches to PRs automatically
- Comment activity, review latency

### LLM-Powered Features
The data being collected (branches, commits, file changes, relationships) becomes context for AI:

- **Branch summarization**: "This branch is implementing Stripe checkout with webhook retry logic"
- **Pattern drift detection**: "Team A is using Repository pattern, Team B is using inline queries"
- **Semantic conflict detection**: "These two branches are both modifying auth flow differently"
- **Daily digest generation**: Natural language summary of what happened
- **Query interface**: "What services does the checkout flow depend on?" / "Show me all changes to auth this week"

### Additional Views
- **Commit heatmap calendar**: When is work happening? (time patterns)
- **Release readiness**: What's mergeable now vs. blocked
- **Diff preview**: Hover/click to see what changed
- **Dependency awareness**: Cross-repo relationships

---

## Technical Foundation

### Architecture
```
┌─────────────────────────────────────┐
│         Web Dashboard               │
│         localhost:4000              │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Hono API Server             │
│  - Repo management                  │
│  - Git data queries                 │
│  - "Last seen" tracking             │
│  - Stream organization              │
│  - Risk calculations                │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         SQLite (local file)         │
│  - Registered repos                 │
│  - Stream definitions               │
│  - Last seen state                  │
│  - Cached calculations              │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Local Git Repos (filesystem)   │
│  - Read-only git commands           │
│  - Requires manual git fetch        │
└─────────────────────────────────────┘
```

### Key Principle
**Git is already the database.** Don't duplicate commit/branch data. Query it live from the repos. Only persist: registered repos, user state (last seen, streams), and cached risk calculations.

---

## How This Fits Into StackLight

StackLight's vision is unified developer visibility: services, traces, ecosystem health, and codebase awareness—all local-first without requiring org adoption.

This repo digest is the **codebase awareness** piece. The same Hono + SQLite foundation becomes the core for:

- Service registry + health checks (add services, monitor status)
- Trace ingestion (receive events from instrumented apps)
- Eventually: AI context layer across all of it

The backend you build now is the backend for all of it. You're not building a throwaway prototype.

---

## MVP Scope

### Build First
1. Repo registration and management
2. Basic digest: new commits on main, active branches, contributors
3. Branch timeline visualization
4. Divergence tracking (commits behind main)
5. Collision detection (files touched by multiple branches)
6. Mark-seen functionality
7. Stale branch identification

### Skip For Now
- GitHub API integration
- Auto-fetch on interval
- LLM summaries
- Stream definitions (can infer from branch naming initially)
- Review network analysis
- Notifications

---

## Success Criteria

You open StackLight in the morning and within 30 seconds you know:
- What landed overnight
- Which streams are active vs. quiet
- What's about to cause problems
- Who needs attention

If it takes longer than that, the tool has failed.
