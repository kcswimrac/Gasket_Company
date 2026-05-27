ALTER TABLE "scan_queue" ADD COLUMN "segment" "segment";--> statement-breakpoint
ALTER TABLE "scan_queue" ADD COLUMN "make" text;--> statement-breakpoint
ALTER TABLE "scan_queue" ADD COLUMN "model" text;--> statement-breakpoint
ALTER TABLE "scan_queue" ADD COLUMN "year_start" integer;--> statement-breakpoint
ALTER TABLE "scan_queue" ADD COLUMN "year_end" integer;--> statement-breakpoint
ALTER TABLE "scan_queue" ADD COLUMN "fitment_status" "fitment_status" DEFAULT 'reference';--> statement-breakpoint
ALTER TABLE "scan_queue" ADD COLUMN "dimensions" text;--> statement-breakpoint
ALTER TABLE "scan_queue" ADD COLUMN "part_number" text;