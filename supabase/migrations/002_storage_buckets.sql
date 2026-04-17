-- ============================================================================
-- Viajeros — Storage Bucket Setup
-- Run this in Supabase SQL Editor AFTER 001_initial_schema.sql
-- ============================================================================

-- ============================================================================
-- BUCKET: uploads
-- Stores point-of-interest images, route images, etc.
-- Public read, authenticated admin write.
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  TRUE,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- BUCKET: settings
-- Stores favicon, custom assets.
-- Public read, authenticated admin write.
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'settings',
  'settings',
  TRUE,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/x-icon', 'image/vnd.microsoft.icon']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES: uploads bucket
-- ============================================================================

-- Anyone can read uploaded files (public bucket)
CREATE POLICY "Public read for uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'uploads');

-- Only admins can upload
CREATE POLICY "Admin can upload to uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'uploads'
    AND public.is_admin()
  );

-- Only admins can update (overwrite)
CREATE POLICY "Admin can update uploads"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'uploads'
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id = 'uploads'
    AND public.is_admin()
  );

-- Only admins can delete
CREATE POLICY "Admin can delete uploads"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'uploads'
    AND public.is_admin()
  );

-- ============================================================================
-- STORAGE POLICIES: settings bucket
-- ============================================================================

-- Anyone can read settings files (favicon, etc.)
CREATE POLICY "Public read for settings"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'settings');

-- Only admins can upload
CREATE POLICY "Admin can upload to settings"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'settings'
    AND public.is_admin()
  );

-- Only admins can update
CREATE POLICY "Admin can update settings files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'settings'
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id = 'settings'
    AND public.is_admin()
  );

-- Only admins can delete
CREATE POLICY "Admin can delete settings files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'settings'
    AND public.is_admin()
  );
