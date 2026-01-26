# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# User Work Style Instructions For Claude
- I am an engineer, be concrete, concise, clear, and to the point when discussing with me, do not waste my time with long, over-conversational language
- I do not begin coding or modifying my files without confirmation of understanding and approach from me. I will not tolerate AI SLOP 


## Project Overview
MVP Specification
Vision
A local-first development tool that gives developers unified visibility across their fullstack applications and service ecosystems—without requiring org-wide adoption or DevOps access.
Core Problems Solved

Fragmented visibility: Server logs in terminal, client logs in browser, no unified view of what happened for a given request
Ecosystem blindness: Devs can't easily see health/status of services they depend on without DevOps access to AWS/GCP dashboards
Context loss: Hard to understand how services relate to each other, especially when solutioning new features across multiple codebases

Key Design Principles

Works for individuals: A single dev can use this on personal projects or at work without company buy-in
No SDK requirement for external services: If you can hit an API, you can monitor it
Dev-time focused: This is for development workflow, not production APM
Incrementally adoptable: Start with health checks, add tracing later, add AI context later


MVP Scope
### Phase 1: Service Registry + Health Dashboard
What it does:

Add services manually (name + URL)
Health check on configurable interval
Dashboard showing all services with status (up/down/degraded)
View service details (response time, last check, metadata)
Support for manifest files to enrich service metadata
Simple dependency tracking (service A depends on B)

#### Future Enhancements:

Auto-discovery from traces
AI queries
Production monitoring
Multi-user/auth

### Phase 2: Fullstack Trace Viewer (Next.js first)
What it does:

Capture server actions, API calls, and client events
Correlate via request ID
Display unified timeline for each request
Send traces to DevScope dashboard
#### Future Enhancements
Auto-instrumentation (requires explicit wrappers)
Component render tracking
Database query tracing



## Build and Development Commands

This is a Turborepo monorepo using **Bun** as the package manager.

```bash
# Install dependencies
bun install

# Development (runs all apps in parallel)
bun run dev

# Build all apps and packages
bun run build

# Lint all packages
bun run lint

# Type check all packages
bun run check-types

# Format code
bun run format
```

### Running Individual Apps

```bash
# Web app (port 3000)
cd apps/web && bun run dev

# Docs app (port 3001)
cd apps/docs && bun run dev
```

### UI Package

```bash
# Generate a new component
cd packages/ui && bun run generate:component
```

## Architecture


## Key Patterns

- Internal packages use `@repo/*` namespace
- ESLint uses modern flat config format (not .eslintrc)
- TypeScript strict mode is enabled across all packages
- Apps use Next.js App Router (`app/` directory)


## Initial Roadmap
Day 1: Foundation

Scaffold hono server with health endpoint
Implement Service model + JSON file storage
Add service CRUD routes
Basic health checker (fetch + timeout)
Interval-based health checking on startup

Day 2: Dashboard

React app shell
Service list view with status indicators
Add service form
Service detail view
Manual "check now" button

Day 3: Enrichment

Manifest JSON import (paste in)
Dependency field support
Simple dependency visualization
Response time history (last N checks)

Day 4: Tracer MVP

Add /api/traces endpoint to DevScope
Trace storage + querying
Add middleware + reporter to Next.js app
Wrap one server action with tracedAction
Basic trace timeline view in dashboard


Future Phases (Not MVP)

Auto-discovery: Parse traces to find services, suggest adding them
GitHub integration: Fetch manifest from repo URL
AI context layer: Query traces and service relationships via natural language
Pattern detection: Alert on response time degradation, error spikes
Team features: Shared registries, comments, ownership
More framework support: Remix, SvelteKit, Nuxt adapters


Notes

This is a dev tool, not production monitoring—don't over-engineer
Local-first means no auth needed for MVP
Traces should never block the app (fire and forget)
Start ugly, make it work, polish later

### Future Feature Discussions
- register a health chehck endpoint for a dependency, or then also register project as yours via repo url with like a config.json in it for our stuff to link etc
can then turn into more standard monitoring - aka last hit, analytics, scalability blah blah
- auto codebase scanning to dependency link and find what talks to what
