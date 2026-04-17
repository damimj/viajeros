-- ============================================================================
-- Viajeros — Register Admin User
-- ============================================================================
--
-- BEFORE running this script:
--
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add user" > "Create new user"
-- 3. Enter your email and password
-- 4. Copy the User UID from the users list
-- 5. Replace 'YOUR_AUTH_USER_UUID' below with that UID
-- 6. Run this SQL in the SQL Editor
--
-- This replaces the original TravelMap's install/seed_admin.php
-- ============================================================================

INSERT INTO public.admins (auth_user_id, username)
VALUES (
  'YOUR_AUTH_USER_UUID',  -- ← Replace with your actual auth.users UUID
  'admin'
)
ON CONFLICT (auth_user_id) DO NOTHING;
