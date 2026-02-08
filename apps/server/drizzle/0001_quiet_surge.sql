PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_repo_digests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`repo_id` text NOT NULL,
	`repo_path` text NOT NULL,
	`last_seen_commit` text,
	`last_seen_timestamp` text,
	`digest_json` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
INSERT INTO `__new_repo_digests`("id", "repo_id", "repo_path", "last_seen_commit", "last_seen_timestamp", "digest_json", "created_at", "updated_at") SELECT "id", "repo_id", "repo_path", "last_seen_commit", "last_seen_timestamp", "digest_json", "created_at", "updated_at" FROM `repo_digests`;--> statement-breakpoint
DROP TABLE `repo_digests`;--> statement-breakpoint
ALTER TABLE `__new_repo_digests` RENAME TO `repo_digests`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `repo_digests_repo_id_unique` ON `repo_digests` (`repo_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `repo_digests_repo_path_unique` ON `repo_digests` (`repo_path`);