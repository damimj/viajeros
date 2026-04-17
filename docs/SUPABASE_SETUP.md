# Supabase Setup Guide — Viajeros

Step-by-step guide to set up the Supabase project for Viajeros.

---

## 1. Create a Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Choose your organization, enter a project name (e.g., `viajeros`), and set a database password
4. Select a region close to your target audience
5. Click **"Create new project"** and wait for provisioning (~2 minutes)

## 2. Run Database Migrations

1. Go to **SQL Editor** in the Supabase Dashboard
2. Run the migration files **in order**:

### Migration 1: Schema + RLS + Seed Settings

Copy and paste the contents of `supabase/migrations/001_initial_schema.sql` into the SQL Editor and click **"Run"**.

This creates:
- All tables (`trips`, `points_of_interest`, `routes`, `trip_tags`, `settings`, `links`, `geocode_cache`, `admins`)
- `updated_at` auto-update triggers
- `is_admin()` helper function
- RLS policies (public read for published data, admin-only write)
- Default settings seed data (29 rows)

### Migration 2: Storage Buckets

Copy and paste `supabase/migrations/002_storage_buckets.sql` and run it.

This creates:
- `uploads` bucket (public read, 10MB limit, images only)
- `settings` bucket (public read, 5MB limit, images + favicons)
- Storage RLS policies

### Migration 3: Register Admin User

1. Go to **Authentication > Users**
2. Click **"Add user"** > **"Create new user"**
3. Enter your email and a strong password
4. After creation, copy the **User UID** from the users list
5. Open `supabase/migrations/003_seed_admin.sql`
6. Replace `YOUR_AUTH_USER_UUID` with the actual UUID
7. Run it in the SQL Editor

## 3. Get API Credentials

1. Go to **Settings > API** in the Supabase Dashboard
2. Copy these values into your `.env.local`:

| Dashboard Field   | `.env.local` Variable              |
|-------------------|------------------------------------|
| Project URL       | `NEXT_PUBLIC_SUPABASE_URL`         |
| `anon` `public`   | `NEXT_PUBLIC_SUPABASE_ANON_KEY`    |
| `service_role`    | `SUPABASE_SERVICE_ROLE_KEY`        |

> ⚠️ The `service_role` key bypasses RLS. **Never** expose it to the browser.

## 4. Verify Setup

After running the app locally (`npm run dev`):

1. **Public map** (`/`): Should load without errors (empty map, no trips yet)
2. **Login** (`/login`): Should show login form
3. **Admin** (`/admin`): Should redirect to login if not authenticated

After logging in:
- You should be able to access `/admin`
- Creating a trip should work
- The trip should appear on the public map only when `status = 'published'`

## 5. Verify RLS Policies

Quick test in the SQL Editor:

```sql
-- This should return 0 rows (no published trips yet)
SELECT * FROM trips;

-- As anonymous/anon key, you should NOT see draft trips
-- As the admin user, you should see all trips
```

## Storage Bucket Structure

After setup, your storage looks like:

```
uploads/
  trips/
    {trip_id}/
      {point_id}/
        image-001.jpg
        image-002.jpg
  routes/
    {route_id}/
      route-image.jpg

settings/
  favicon.ico
  custom-assets/
```

## Troubleshooting

**"permission denied for table X"**: RLS is enabled but the `is_admin()` function can't find your user. Check that:
- Your `auth.users` UUID matches the one in the `admins` table
- You're logged in (session cookie is set)

**Storage upload fails**: Check that:
- The bucket exists (run migration 002)
- The file is an allowed MIME type (JPEG, PNG, WebP, GIF)
- The file is under the size limit (10MB for uploads)
- You're authenticated as admin

**Settings not loading**: Run migration 001 again — the `ON CONFLICT` clause ensures it won't duplicate rows.
