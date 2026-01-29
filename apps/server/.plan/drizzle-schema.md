
# Git Repo Activity Digest - Schema & Storage Plan

## Overview
Create a Zod validation schema for the git activity digest and set up SQLite storage.

This plan has two parts:
1. **Educational**: Raw SQLite with proper migration pattern (for learning)
2. **Implementation**: Drizzle ORM setup (what we'll actually build)

---

## 1. Zod Schema

**Location:** `apps/server/src/schemas/digest.schema.ts`

```typescript
import { z } from "zod";

const CommitSchema = z.object({
  sha: z.string(),
  message: z.string(),
  author: z.string(),
  timestamp: z.string().datetime(),
  filesChanged: z.number().int().nonnegative(),
});

const BranchSchema = z.object({
  name: z.string(),
  author: z.string(),
  lastCommit: z.string().datetime(),
  commitsAhead: z.number().int().nonnegative(),
  isNew: z.boolean(),
});

const ContributorSchema = z.object({
  name: z.string(),
  commitCount: z.number().int().nonnegative(),
});

const LastSeenSchema = z.object({
  commit: z.string(),
  timestamp: z.string().datetime(),
});

const RepoSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
});

const MainBranchSchema = z.object({
  currentHead: z.string(),
  newCommits: z.array(CommitSchema),
});

export const RepoActivityDigestSchema = z.object({
  repo: RepoSchema,
  lastSeen: LastSeenSchema.nullable(),
  main: MainBranchSchema,
  activeBranches: z.array(BranchSchema),
  contributors: z.array(ContributorSchema),
});

export type RepoActivityDigest = z.infer<typeof RepoActivityDigestSchema>;
```

---

## 2. Educational: Raw SQLite with Proper Migrations

This section demonstrates the correct pattern without any ORM. Not what we'll build, but important to understand.

### 2.1 File Structure

```
apps/server/src/
├── db/
│   ├── index.ts              # DB connection + migration runner
│   ├── migrations/
│   │   ├── 001_create_repo_digests.sql
│   │   └── 002_add_description_column.sql  # Example future migration
│   └── repositories/
│       └── digest.repository.ts
```

### 2.2 Migration Files

Each migration is a standalone SQL file. Numbered for ordering. Each runs exactly once.

**`db/migrations/001_create_repo_digests.sql`**
```sql
-- Create the repo_digests table with hybrid JSON blob storage
CREATE TABLE repo_digests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repo_id TEXT NOT NULL UNIQUE,
    repo_path TEXT NOT NULL,
    last_seen_commit TEXT,
    last_seen_timestamp TEXT,
    digest_json TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_repo_digests_repo_id ON repo_digests(repo_id);
CREATE INDEX idx_repo_digests_repo_path ON repo_digests(repo_path);
```

**`db/migrations/002_add_description_column.sql`** (example future migration)
```sql
-- Add optional description field
ALTER TABLE repo_digests ADD COLUMN description TEXT;
```

### 2.3 Database Initialization with Migration Runner

**`db/index.ts`**
```typescript
import { Database } from "bun:sqlite";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

// Configuration
const DB_PATH = process.env.DATABASE_PATH || "data/stacklight.db";
const MIGRATIONS_DIR = join(import.meta.dir, "migrations");

/**
 * Initialize database connection.
 * Separate from migration running - connection is just a connection.
 */
function createConnection(): Database {
  const db = new Database(DB_PATH, { create: true });

  // SQLite optimizations
  db.exec("PRAGMA journal_mode = WAL");      // Write-ahead logging for concurrency
  db.exec("PRAGMA foreign_keys = ON");       // Enforce FK constraints
  db.exec("PRAGMA busy_timeout = 5000");     // Wait up to 5s if DB is locked

  return db;
}

/**
 * Ensure migrations tracking table exists.
 * This is the ONE exception to "no inline CREATE" - the migrations table itself.
 */
function ensureMigrationsTable(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT DEFAULT (datetime('now'))
    )
  `);
}

/**
 * Get list of already-applied migrations.
 */
function getAppliedMigrations(db: Database): Set<string> {
  const rows = db.prepare("SELECT name FROM _migrations").all() as { name: string }[];
  return new Set(rows.map(r => r.name));
}

/**
 * Run all pending migrations in order.
 * Each migration runs in a transaction - all or nothing.
 */
function runMigrations(db: Database): void {
  ensureMigrationsTable(db);

  const applied = getAppliedMigrations(db);

  // Get migration files, sorted by name (hence numeric prefixes)
  const files = readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (applied.has(file)) {
      continue; // Already applied
    }

    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf-8");

    // Run migration in transaction
    db.exec("BEGIN TRANSACTION");
    try {
      db.exec(sql);
      db.prepare("INSERT INTO _migrations (name) VALUES (?)").run(file);
      db.exec("COMMIT");
      console.log(`✓ Applied migration: ${file}`);
    } catch (error) {
      db.exec("ROLLBACK");
      console.error(`✗ Migration failed: ${file}`);
      throw error;
    }
  }
}

// --- Exported Interface ---

let _db: Database | null = null;

/**
 * Get database instance. Initializes on first call.
 * This is the only export - all DB access goes through this.
 */
export function getDb(): Database {
  if (!_db) {
    _db = createConnection();
    runMigrations(_db);
  }
  return _db;
}

/**
 * Close database connection. Call on app shutdown.
 */
export function closeDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}
```

### 2.4 Repository Pattern

**`db/repositories/digest.repository.ts`**
```typescript
import { getDb } from "../index";
import { RepoActivityDigest, RepoActivityDigestSchema } from "../../schemas/digest.schema";

/**
 * Repository for repo_digests table.
 * All DB access for this entity goes through here.
 * Validates data on both write and read.
 */
export const digestRepository = {
  upsert(digest: RepoActivityDigest): void {
    const validated = RepoActivityDigestSchema.parse(digest);
    const db = getDb();

    db.prepare(`
      INSERT INTO repo_digests (repo_id, repo_path, last_seen_commit, last_seen_timestamp, digest_json, updated_at)
      VALUES ($repoId, $repoPath, $lastSeenCommit, $lastSeenTimestamp, $digestJson, datetime('now'))
      ON CONFLICT(repo_id) DO UPDATE SET
        repo_path = excluded.repo_path,
        last_seen_commit = excluded.last_seen_commit,
        last_seen_timestamp = excluded.last_seen_timestamp,
        digest_json = excluded.digest_json,
        updated_at = datetime('now')
    `).run({
      $repoId: validated.repo.id,
      $repoPath: validated.repo.path,
      $lastSeenCommit: validated.lastSeen?.commit ?? null,
      $lastSeenTimestamp: validated.lastSeen?.timestamp ?? null,
      $digestJson: JSON.stringify(validated),
    });
  },

  findByRepoId(repoId: string): RepoActivityDigest | null {
    const db = getDb();
    const row = db
      .prepare("SELECT digest_json FROM repo_digests WHERE repo_id = ?")
      .get(repoId) as { digest_json: string } | null;

    if (!row) return null;
    return RepoActivityDigestSchema.parse(JSON.parse(row.digest_json));
  },

  findAll(): RepoActivityDigest[] {
    const db = getDb();
    const rows = db
      .prepare("SELECT digest_json FROM repo_digests ORDER BY updated_at DESC")
      .all() as { digest_json: string }[];

    return rows.map(row => RepoActivityDigestSchema.parse(JSON.parse(row.digest_json)));
  },

  delete(repoId: string): boolean {
    const db = getDb();
    const result = db.prepare("DELETE FROM repo_digests WHERE repo_id = ?").run(repoId);
    return result.changes > 0;
  },
};
```

### 2.5 Key Concepts in This Pattern

| Concept | Why It Matters |
|---------|----------------|
| **Numbered migration files** | Ensures consistent ordering across environments |
| **`_migrations` tracking table** | Prevents re-running migrations, provides audit trail |
| **Transaction per migration** | Failed migration doesn't leave DB in broken state |
| **Lazy initialization** | DB connects on first use, not on import |
| **Single `getDb()` export** | All access through one point, easy to mock in tests |
| **Repository pattern** | Encapsulates SQL, provides typed interface |
| **Validate on read AND write** | Data integrity even if DB was modified externally |

---

## 3. Implementation: Drizzle ORM Setup

This is what we'll actually build. Drizzle gives us:
- Type-safe schema definitions in TypeScript
- Generated migrations
- Type-safe queries
- Still close to SQL (not a heavy abstraction like Prisma)

### 3.1 Dependencies

```bash
cd apps/server
bun add drizzle-orm
bun add -d drizzle-kit
```

### 3.2 File Structure

```
apps/server/
├── drizzle.config.ts           # Drizzle CLI configuration
├── src/
│   └── db/
│       ├── index.ts            # DB connection export
│       ├── schema/
│       │   ├── index.ts        # Re-exports all schemas
│       │   └── digest.ts       # Digest table schema
│       └── repositories/
│           └── digest.repository.ts
└── drizzle/                    # Generated migrations (don't edit)
    └── 0000_initial.sql
```

### 3.3 Drizzle Configuration

**`apps/server/drizzle.config.ts`**
```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_PATH || "data/stacklight.db",
  },
});
```

### 3.4 Schema Definition

**`src/db/schema/digest.ts`**
```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const repoDigests = sqliteTable("repo_digests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  repoId: text("repo_id").notNull().unique(),
  repoPath: text("repo_path").notNull(),
  lastSeenCommit: text("last_seen_commit"),
  lastSeenTimestamp: text("last_seen_timestamp"),
  digestJson: text("digest_json").notNull(),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// TypeScript type for selecting from this table
export type RepoDigestRow = typeof repoDigests.$inferSelect;
export type NewRepoDigestRow = typeof repoDigests.$inferInsert;
```

**`src/db/schema/index.ts`**
```typescript
export * from "./digest";
```

### 3.5 Database Connection

**`src/db/index.ts`**
```typescript
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as schema from "./schema";

const DB_PATH = process.env.DATABASE_PATH || "data/stacklight.db";

// Create SQLite connection
const sqlite = new Database(DB_PATH, { create: true });

// SQLite optimizations
sqlite.exec("PRAGMA journal_mode = WAL");
sqlite.exec("PRAGMA foreign_keys = ON");
sqlite.exec("PRAGMA busy_timeout = 5000");

// Create Drizzle instance with schema for relational queries
export const db = drizzle(sqlite, { schema });

// Export raw sqlite for edge cases if needed
export { sqlite };
```

### 3.6 Repository with Drizzle

**`src/db/repositories/digest.repository.ts`**
```typescript
import { eq } from "drizzle-orm";
import { db } from "../index";
import { repoDigests } from "../schema";
import { RepoActivityDigest, RepoActivityDigestSchema } from "../../schemas/digest.schema";

export const digestRepository = {
  async upsert(digest: RepoActivityDigest): Promise<void> {
    const validated = RepoActivityDigestSchema.parse(digest);

    await db
      .insert(repoDigests)
      .values({
        repoId: validated.repo.id,
        repoPath: validated.repo.path,
        lastSeenCommit: validated.lastSeen?.commit ?? null,
        lastSeenTimestamp: validated.lastSeen?.timestamp ?? null,
        digestJson: JSON.stringify(validated),
      })
      .onConflictDoUpdate({
        target: repoDigests.repoId,
        set: {
          repoPath: validated.repo.path,
          lastSeenCommit: validated.lastSeen?.commit ?? null,
          lastSeenTimestamp: validated.lastSeen?.timestamp ?? null,
          digestJson: JSON.stringify(validated),
          updatedAt: new Date().toISOString(),
        },
      });
  },

  async findByRepoId(repoId: string): Promise<RepoActivityDigest | null> {
    const row = await db
      .select()
      .from(repoDigests)
      .where(eq(repoDigests.repoId, repoId))
      .get();

    if (!row) return null;
    return RepoActivityDigestSchema.parse(JSON.parse(row.digestJson));
  },

  async findAll(): Promise<RepoActivityDigest[]> {
    const rows = await db.select().from(repoDigests).all();
    return rows.map(row => RepoActivityDigestSchema.parse(JSON.parse(row.digestJson)));
  },

  async delete(repoId: string): Promise<boolean> {
    const result = await db
      .delete(repoDigests)
      .where(eq(repoDigests.repoId, repoId))
      .returning();

    return result.length > 0;
  },
};
```

### 3.7 Migration Workflow

```bash
# Generate migration from schema changes
bunx drizzle-kit generate

# Apply migrations to database
bunx drizzle-kit migrate

# Open Drizzle Studio (visual DB browser)
bunx drizzle-kit studio
```

Add to `apps/server/package.json`:
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }
}
```

### 3.8 Drizzle vs Raw SQLite Comparison

| Aspect | Raw SQLite | Drizzle |
|--------|------------|---------|
| **Schema definition** | SQL files | TypeScript |
| **Migrations** | Manual numbered files | Auto-generated from schema diff |
| **Type safety** | Manual types | Inferred from schema |
| **Query building** | Raw SQL strings | Type-safe builder |
| **Learning curve** | Lower (just SQL) | Slightly higher |
| **Flexibility** | Maximum | High (can still use raw SQL) |

---

## 4. Implementation Summary

### Files to Create

| File | Purpose |
|------|---------|
| `apps/server/drizzle.config.ts` | Drizzle CLI configuration |
| `apps/server/src/schemas/digest.schema.ts` | Zod validation schema |
| `apps/server/src/db/index.ts` | Database connection |
| `apps/server/src/db/schema/index.ts` | Schema barrel export |
| `apps/server/src/db/schema/digest.ts` | Drizzle table definition |
| `apps/server/src/db/repositories/digest.repository.ts` | Data access layer |

### Commands to Run

```bash
cd apps/server
bun add drizzle-orm
bun add -d drizzle-kit
mkdir -p src/db/schema src/db/repositories data
bunx drizzle-kit generate
bunx drizzle-kit migrate
```

---

## 5. Verification

1. **Type check**: `bun run check-types`
2. **Generate migration**: `bunx drizzle-kit generate` - should create initial migration
3. **Apply migration**: `bunx drizzle-kit migrate` - should create `data/stacklight.db`
4. **Test repository**: Write a simple script or test that:
   - Creates a digest
   - Retrieves it by repo ID
   - Verifies the data matches
5. **Drizzle Studio**: `bunx drizzle-kit studio` - visually inspect the table
