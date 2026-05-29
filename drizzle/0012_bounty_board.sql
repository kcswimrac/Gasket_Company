CREATE TABLE IF NOT EXISTS bounty_board (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  segment text,
  make text,
  model text,
  year_start integer,
  year_end integer,
  reward text,
  priority text DEFAULT 'normal',
  status text DEFAULT 'open' NOT NULL,
  claimed_by uuid REFERENCES contributors(id),
  claimed_at timestamp,
  fulfilled_at timestamp,
  part_id uuid REFERENCES parts(id),
  created_at timestamp DEFAULT NOW() NOT NULL,
  updated_at timestamp DEFAULT NOW() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_bounty_board_status ON bounty_board(status);