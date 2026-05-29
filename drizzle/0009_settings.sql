CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);--> statement-breakpoint
INSERT INTO settings (key, value) VALUES ('estimate_markup_pct', '5') ON CONFLICT (key) DO NOTHING;