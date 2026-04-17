# Vercel Deployment Guide — Viajeros

Step-by-step guide to deploy Viajeros to Vercel.

---

## Prerequisites

Before deploying:

1. **Supabase project** is set up (see `docs/SUPABASE_SETUP.md`)
2. **Migrations** have been run (`001`, `002`, `003`)
3. **Admin user** has been created in Supabase Auth + `admins` table
4. **Local dev** has been tested successfully (`npm run dev`)
5. **Repository** is pushed to GitHub

## Step 1: Import Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your `viajeros` repository
4. Vercel will auto-detect it as a Next.js project

## Step 2: Set Environment Variables

In the Vercel project settings, add these environment variables:

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | From Supabase Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | **Server-only**, never exposed |
| `NEXT_PUBLIC_SITE_URL` | `https://viajeros.vercel.app` | Your Vercel domain |
| `NEXT_PUBLIC_DEFAULT_SITE_TITLE` | `Viajeros` | Fallback title |

> Tip: You can paste your `.env.local` content directly into the "Add Multiple" input.

## Step 3: Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy automatically
3. First deploy takes ~2 minutes

## Step 4: Verify

After deployment:

1. **Public map** (`/`): Should load with MapLibre GL, empty if no published trips
2. **Login** (`/login`): Should show login form
3. **Admin** (`/admin`): Should redirect to login → sign in → see dashboard

## Step 5: Configure Custom Domain (Optional)

1. Go to **Vercel Project Settings > Domains**
2. Add your custom domain
3. Update `NEXT_PUBLIC_SITE_URL` to match
4. Vercel handles SSL automatically

## Step 6: Supabase URL Configuration

If using a custom domain, update Supabase:

1. Go to **Supabase Dashboard > Authentication > URL Configuration**
2. Set **Site URL** to your production URL
3. Add any redirect URLs needed

---

## Build Configuration

Viajeros uses these Vercel defaults:

| Setting | Value |
|---|---|
| Framework | Next.js |
| Build Command | `next build` |
| Output Directory | `.next` |
| Node.js Version | 18.x (or later) |
| Install Command | `npm install` |

## Serverless Function Limits

On Vercel Hobby (free):

| Resource | Limit |
|---|---|
| Request body size | 4.5 MB |
| Execution time | 10 seconds |
| Memory | 1024 MB |

This affects CSV importers:
- FlightRadar CSVs are typically small (< 100KB) ✓
- Airbnb CSVs are typically small (< 50KB) ✓
- Image uploads go directly to Supabase Storage (not through Vercel) ✓

## Automatic Deployments

Vercel deploys automatically on every push to `main`:
- **Production**: pushes to `main` branch
- **Preview**: pushes to other branches or pull requests

## Monitoring

- **Vercel Analytics**: Enable in project settings for Core Web Vitals
- **Function Logs**: Available in Vercel Dashboard > Logs
- **Supabase Logs**: Available in Supabase Dashboard > Logs

## Troubleshooting

### "NEXT_PUBLIC_SUPABASE_URL is not set"
→ Verify environment variables are set in Vercel project settings (not just locally)

### Build fails with TypeScript errors
→ Run `npm run type-check` locally first to catch errors

### Images not loading
→ Check that `NEXT_PUBLIC_SUPABASE_URL` domain is in `next.config.ts` `images.remotePatterns`

### Auth not working after deploy
→ Update Supabase **Site URL** and **Redirect URLs** in Authentication settings

### Service Worker not caching tiles
→ SW only caches after first load; verify with DevTools > Application > Service Workers

### CSS not applying
→ Ensure `globals.css` is imported in `layout.tsx`; clear browser cache
