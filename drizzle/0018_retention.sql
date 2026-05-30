ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_activity_at timestamp DEFAULT NOW();
--> statement-breakpoint
ALTER TABLE customers ADD COLUMN IF NOT EXISTS deleted_at timestamp;
--> statement-breakpoint
ALTER TABLE customers ADD COLUMN IF NOT EXISTS deletion_requested_at timestamp;
