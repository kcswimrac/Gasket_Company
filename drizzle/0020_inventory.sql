ALTER TABLE part_variants ADD COLUMN IF NOT EXISTS stock_quantity integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE part_variants ADD COLUMN IF NOT EXISTS made_to_order boolean DEFAULT true;