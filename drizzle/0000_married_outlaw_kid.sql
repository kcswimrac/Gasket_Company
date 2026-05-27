CREATE TYPE "public"."fitment_status" AS ENUM('verified', 'scan_verified', 'reference');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending_quote', 'quoted', 'paid', 'queued', 'in_progress', 'qc', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."quote_status" AS ENUM('draft', 'pending', 'offered', 'needs_review', 'accepted', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."safety_class" AS ENUM('cosmetic', 'functional', 'critical_excluded');--> statement-breakpoint
CREATE TYPE "public"."segment" AS ENUM('tractor', 'marine', 'automotive', 'motorcycle', 'industrial');--> statement-breakpoint
CREATE TYPE "public"."tier" AS ENUM('oem', 'improved', 'custom', 'fitment_check');--> statement-breakpoint
CREATE TABLE "autoquote_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid,
	"quote_id" text NOT NULL,
	"quote_status" "quote_status" NOT NULL,
	"unit_price" numeric(10, 2),
	"total_price" numeric(10, 2),
	"lead_time_days" integer,
	"confidence" numeric(3, 2),
	"buyable" boolean,
	"dfm_issues" jsonb,
	"cost_breakdown" jsonb,
	"routing" jsonb,
	"material_code" text,
	"quantity" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contributors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"location" text,
	"public_credit_name" text,
	"total_contributions" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"company" text,
	"is_shop_account" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manufacturing_artifacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"package_id" uuid NOT NULL,
	"artifact_type" text NOT NULL,
	"machine_target" text,
	"file_url" text NOT NULL,
	"checksum" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manufacturing_packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"version" text NOT NULL,
	"approved_for_production" boolean DEFAULT false NOT NULL,
	"released_at" timestamp,
	"released_by" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"variant_id" uuid,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(10, 2),
	"total_price" numeric(10, 2),
	"autoquote_quote_id" text,
	"status" "order_status" DEFAULT 'pending_quote' NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid,
	"status" "order_status" DEFAULT 'pending_quote' NOT NULL,
	"total_price" numeric(10, 2),
	"rush_order" boolean DEFAULT false NOT NULL,
	"shipping_method" text,
	"tracking_number" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"shipped_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "part_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"part_id" uuid NOT NULL,
	"tier" "tier" NOT NULL,
	"material" text NOT NULL,
	"process" text NOT NULL,
	"base_price" numeric(10, 2),
	"lead_time_days" integer,
	"autoquote_material_code" text,
	"autoquote_process" text,
	"last_quoted_price" numeric(10, 2),
	"last_quoted_at" timestamp,
	"last_quote_id" text,
	"available" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"segment" "segment" NOT NULL,
	"application" text NOT NULL,
	"description" text,
	"fitment_status" "fitment_status" DEFAULT 'reference' NOT NULL,
	"safety_class" "safety_class" DEFAULT 'cosmetic' NOT NULL,
	"dimensions" text,
	"part_number" text,
	"scan_date" timestamp,
	"scan_source" text,
	"cad_file_url" text,
	"stl_preview_url" text,
	"contributor_id" uuid,
	"notes" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scan_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contributor_id" uuid,
	"part_description" text NOT NULL,
	"application" text NOT NULL,
	"condition" text,
	"status" text DEFAULT 'received' NOT NULL,
	"photo_urls" jsonb,
	"part_id" uuid,
	"notes" text,
	"received_at" timestamp DEFAULT now() NOT NULL,
	"scanned_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "autoquote_cache" ADD CONSTRAINT "autoquote_cache_variant_id_part_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."part_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manufacturing_artifacts" ADD CONSTRAINT "manufacturing_artifacts_package_id_manufacturing_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."manufacturing_packages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manufacturing_packages" ADD CONSTRAINT "manufacturing_packages_variant_id_part_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."part_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_line_items" ADD CONSTRAINT "order_line_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_line_items" ADD CONSTRAINT "order_line_items_variant_id_part_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."part_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "part_variants" ADD CONSTRAINT "part_variants_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_contributor_id_contributors_id_fk" FOREIGN KEY ("contributor_id") REFERENCES "public"."contributors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scan_queue" ADD CONSTRAINT "scan_queue_contributor_id_contributors_id_fk" FOREIGN KEY ("contributor_id") REFERENCES "public"."contributors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scan_queue" ADD CONSTRAINT "scan_queue_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE no action ON UPDATE no action;