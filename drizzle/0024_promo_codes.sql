CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL DEFAULT 'percentage',
  discount_value numeric(10,2) NOT NULL,
  min_order_amount numeric(10,2),
  max_uses integer,
  current_uses integer DEFAULT 0,
  active boolean DEFAULT true NOT NULL,
  expires_at timestamp,
  created_at timestamp DEFAULT NOW() NOT NULL
);
