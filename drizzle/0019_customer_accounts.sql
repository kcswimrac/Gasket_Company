ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash text;--> statement-breakpoint
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;
