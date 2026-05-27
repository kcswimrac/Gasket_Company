CREATE TYPE "public"."part_file_type" AS ENUM('photo_donor', 'photo_finished', 'cad_step', 'cad_fusion', 'cad_solidworks', 'cad_other', 'stl_preview', 'drawing_pdf', 'scan_raw', 'other');--> statement-breakpoint
CREATE TABLE "part_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"part_id" uuid NOT NULL,
	"file_type" "part_file_type" NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer,
	"display_order" integer DEFAULT 0 NOT NULL,
	"show_in_catalog" boolean DEFAULT false NOT NULL,
	"is_step_file" boolean DEFAULT false NOT NULL,
	"notes" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "scan_queue_id" uuid;--> statement-breakpoint
ALTER TABLE "part_files" ADD CONSTRAINT "part_files_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE cascade ON UPDATE no action;