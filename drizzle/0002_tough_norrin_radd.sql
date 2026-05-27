CREATE TYPE "public"."scan_artifact_type" AS ENUM('scan_raw', 'scan_processed', 'cad_model', 'stl_preview', 'drawing_pdf', 'photo', 'other');--> statement-breakpoint
CREATE TABLE "scan_artifacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scan_queue_id" uuid NOT NULL,
	"artifact_type" "scan_artifact_type" NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer,
	"superseded_by" uuid,
	"notes" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "scan_queue" ADD COLUMN "current_scan_version" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "scan_queue" ADD COLUMN "current_cad_version" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "scan_queue" ADD COLUMN "needs_cad_update" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "scan_artifacts" ADD CONSTRAINT "scan_artifacts_scan_queue_id_scan_queue_id_fk" FOREIGN KEY ("scan_queue_id") REFERENCES "public"."scan_queue"("id") ON DELETE cascade ON UPDATE no action;