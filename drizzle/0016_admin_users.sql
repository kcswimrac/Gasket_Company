CREATE TABLE IF NOT EXISTS admin_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'operator',
  active boolean DEFAULT true NOT NULL,
  last_login_at timestamp,
  created_at timestamp DEFAULT NOW() NOT NULL
);
