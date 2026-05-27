ALTER TABLE "autoquote_cache" ADD COLUMN "expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "autoquote_cache" ADD COLUMN "quote_url" text;--> statement-breakpoint
ALTER TABLE "part_variants" ADD COLUMN "last_quote_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "make" text;--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "model" text;--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "year_start" integer;--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "year_end" integer;