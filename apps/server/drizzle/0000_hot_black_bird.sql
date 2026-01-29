CREATE TABLE `repo_digests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`repo_id` text NOT NULL,
	`repo_path` text NOT NULL,
	`last_seen_commit` text,
	`last_seen_timestamp` text,
	`digest_json` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `repo_digests_repo_id_unique` ON `repo_digests` (`repo_id`);