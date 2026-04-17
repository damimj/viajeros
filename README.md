# Viajeros — Interactive Travel Diary

A self-managed interactive travel map built with **Next.js 15**, **Supabase** (Postgres + Auth + Storage), and **MapLibre GL**.

Refactored from [TravelMap](https://github.com/fabiomb/TravelMap) (PHP/MySQL) for deployment on **Vercel + Supabase**.

---

## Features

### Public Map
- Full-screen interactive map (MapLibre GL + WebGL rendering)
- deck.gl animated flight arcs
- Supercluster intelligent clustering (configurable)
- Trip filtering sidebar
- Detailed popups with images
- Color-coded routes by transport type
- Public REST API (`/api/geojson`)
- PWA with offline tile caching (Service Worker)
- Multi-language (English & Spanish) with browser detection

### Admin Panel
- Full CRUD for trips, points of interest, routes, and tags
- Visual route editor on the map
- Image upload with client-side resize/compression
- FlightRadar CSV importer (with preview, merge, and flight reorganization)
- Airbnb CSV importer (with geocoding and date-based trip linking)
- Global settings panel (map style, clustering, SEO, transport colors, image processing)
- Protected by Supabase Auth (email/password)

---

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Framework  | Next.js 15 (App Router, TypeScript)           |
| UI         | Tailwind CSS + shadcn/ui                      |
| Database   | Supabase Postgres (with RLS)                  |
| Auth       | Supabase Auth (email/password)                |
| Storage    | Supabase Storage (images, favicon)            |
| Maps       | MapLibre GL JS + deck.gl + Supercluster       |
| i18n       | next-intl (EN + ES)                           |
| Deploy     | Vercel                                        |

---

## Prerequisites

- **Node.js** 18.17+ (LTS recommended)
- **npm** or **pnpm**
- A **Supabase** project ([create one free](https://supabase.com/dashboard))
- A **Vercel** account (for deployment)

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USER/viajeros.git
cd viajeros
npm install
```

### 2. Set up Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project (or use an existing one)
3. Go to **SQL Editor** and run the migration file:
   - `supabase/migrations/001_initial_schema.sql`
4. Go to **Storage** and create two buckets:
   - `uploads` — public read, authenticated write
   - `settings` — public read, authenticated write
5. Go to **Authentication > Users** and create your admin user (email/password)

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials from **Settings > API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public map.
Open [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel (will redirect to login).

---

## Project Structure

```
viajeros/
├── public/
│   ├── icons/              # PWA icons
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service Worker for tile caching
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout (providers, fonts, i18n)
│   │   ├── page.tsx        # Public map page
│   │   ├── login/          # Login page
│   │   ├── admin/          # Admin panel (protected)
│   │   │   ├── layout.tsx  # Admin sidebar layout
│   │   │   ├── page.tsx    # Admin dashboard
│   │   │   ├── trips/      # Trip CRUD
│   │   │   ├── points/     # Point CRUD
│   │   │   ├── routes/     # Route CRUD
│   │   │   ├── tags/       # Tag CRUD
│   │   │   ├── settings/   # Settings panel
│   │   │   ├── import-flights/
│   │   │   └── import-airbnb/
│   │   ├── api/
│   │   │   ├── geojson/    # Public GeoJSON endpoint
│   │   │   ├── import/     # CSV import endpoints
│   │   │   └── settings/   # Settings API
│   │   └── actions/        # Server Actions (locale, etc.)
│   ├── components/
│   │   ├── ui/             # shadcn/ui base components
│   │   ├── map/            # MapLibre, clusters, popups
│   │   ├── admin/          # Admin-specific components
│   │   └── shared/         # Shared components (locale switcher, etc.)
│   ├── lib/
│   │   ├── supabase/       # Supabase clients (browser, server, admin, middleware)
│   │   ├── models/         # Data access helpers (trips, points, routes, etc.)
│   │   ├── i18n/           # Internationalization config
│   │   ├── utils/          # Utility functions (cn, etc.)
│   │   └── constants.ts    # Map styles, default settings, transport colors
│   ├── messages/
│   │   ├── en.json         # English translations
│   │   └── es.json         # Spanish translations
│   └── types/
│       ├── database.ts     # Supabase-generated DB types
│       └── domain.ts       # App domain types (Trip, Point, Route, etc.)
├── supabase/
│   └── migrations/         # SQL migration files
├── docs/                   # Additional documentation
├── .env.example            # Environment variables template
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── components.json         # shadcn/ui config
├── vercel.json
└── package.json
```

---

## Database

### Schema

The database mirrors the original TravelMap structure, translated from MySQL to Postgres:

- **trips** — Travel entries with title, dates, color, publish state
- **points** — Points of interest / stays with coordinates and images
- **routes** — GeoJSON routes with transport type
- **tags** — Organizational tags for trips
- **trip_tags** — Many-to-many relationship
- **settings** — Key-value global configuration
- **admins** — Links `auth.users` to admin role

### Row Level Security (RLS)

| Table   | SELECT (public)               | INSERT/UPDATE/DELETE       |
|---------|-------------------------------|----------------------------|
| trips   | `published = true`            | Admin only (via auth.uid)  |
| points  | Trip is published             | Admin only                 |
| routes  | Trip is published             | Admin only                 |
| tags    | Always readable               | Admin only                 |
| settings| Always readable               | Admin only                 |

---

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — Viajeros"
git remote add origin https://github.com/YOUR_USER/viajeros.git
git push -u origin main
```

### 2. Import in Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Set environment variables (same as `.env.local`)
4. Deploy

### 3. Update NEXT_PUBLIC_SITE_URL

After deployment, update `NEXT_PUBLIC_SITE_URL` to your Vercel domain:

```env
NEXT_PUBLIC_SITE_URL=https://viajeros-your-user.vercel.app
```

---

## Development Phases

- [x] **Phase 0** — Project structure, configs, Supabase clients, i18n, PWA manifest
- [ ] **Phase 1** — Postgres schema, RLS policies, Storage buckets, seed data
- [ ] **Phase 2** — Auth + admin layout + CRUD (trips, points, routes, tags, settings)
- [ ] **Phase 3** — Public map (MapLibre GL, clustering, deck.gl arcs, filters, popups)
- [ ] **Phase 4** — CSV importers (FlightRadar, Airbnb) + settings panel
- [ ] **Phase 5** — PWA optimizations, image processing, final docs

---

## Original Project

Based on [TravelMap](https://github.com/fabiomb/TravelMap) by [Fabio Baccaglioni](https://github.com/fabiomb).

## License

GPL-3.0 — See [LICENSE](LICENSE).
