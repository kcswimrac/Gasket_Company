-- Default admin user: admin@backyardrestorations.com / admin123
-- CHANGE THIS PASSWORD IMMEDIATELY after first login
INSERT INTO admin_users (name, email, password_hash, role)
VALUES (
  'Admin',
  'admin@backyardrestorations.com',
  '8d49f8025efd4b408e7ee849a0dc2fae3bec919d4416b44ae930b92488120861',
  'owner'
)
ON CONFLICT (email) DO NOTHING;
