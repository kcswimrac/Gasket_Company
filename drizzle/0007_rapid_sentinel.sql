ALTER TABLE "parts" ADD COLUMN "last_estimate_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "last_estimate_at" timestamp;--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "last_estimate_material" text;