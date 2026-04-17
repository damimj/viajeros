# Viajeros — Project Context for Claude

## What is this project?

Viajeros is a refactored version of [TravelMap](https://github.com/fabiomb/TravelMap), originally built with PHP 8 + MySQL + Bootstrap + jQuery + MapLibre GL. It has been fully rewritten for **Vercel + Supabase** with modern technologies while maintaining feature parity with the original.

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **UI**: Tailwind CSS + shadcn/ui design tokens (no shadcn components installed yet — using inline Tailwind classes following shadcn conventions)
- **Database**: Supabase Postgres with Row Level Security (RLS)
- **Auth**: Supabase Auth (email/password), session managed via `@supabase/ssr` middleware
- **Storage**: Supabase Storage (2 buckets: `uploads` for images, `settings` for favicon)
- **Maps**: MapLibre GL JS (vector tiles), deck.gl (flight arc overlays), Supercluster (point clustering)
- **Image Processing**: browser-image-compression (client-side resize before upload)
- **CSV Parsing**: PapaParse + custom parsers in `src/lib/utils/csv-parsers.ts`
- **i18n**: next-intl with EN + ES translations in `src/messages/`
- **PWA**: Service Worker in `public/sw.js` for tile caching

## Architecture Decisions

- **RLS for public reads**: The public map reads directly from Supabase with the `anon` key. RLS policies ensure only `published` trips are visible. No API route needed for reads.
- **4 Supabase clients**: `client.ts` (browser), `server.ts` (SSR), `admin.ts` (service_role, server-only), `middleware.ts` (session refresh + auth guard).
- **Admin protected by middleware**: `src/middleware.ts` redirects unauthenticated users from `/admin/*` to `/login`.
- **Single-user admin**: The `admins` table links an `auth.users` UUID to admin role. The `is_admin()` Postgres function checks membership.
- **Client-side image compression**: Images are compressed in the browser before uploading to Supabase Storage, avoiding Vercel serverless limits.
- **CSV importers**: CSVs are parsed client-side for preview. Grouped/geocoded data is sent to `/api/import/*` routes that use the `service_role` key.
- **GeoJSON as JSONB**: Routes store GeoJSON in a `JSONB` column (no PostGIS).

## Database Schema

Tables (all use UUID primary keys, `ON DELETE CASCADE` foreign keys):

- `admins` — maps `auth.users` to admin role
- `trips` — title, description, dates, color_hex, status (draft/published/planned)
- `routes` — trip_id FK, transport_type (plane/car/bike/walk/ship/train/bus/aerial), geojson_data (JSONB), color, distance_meters, dates
- `points_of_interest` — trip_id FK, title, description, type (stay/visit/food/waypoint), lat/lng, image_path, visit_date
- `trip_tags` — trip_id FK, tag_name (unique per trip)
- `settings` — key/value store (29 default rows for map style, clustering, transport colors, image settings, SEO, etc.)
- `links` — polymorphic external links (entity_type: poi/route/trip)
- `geocode_cache` — Nominatim reverse geocoding cache

RLS: public SELECT on published data, admin-only INSERT/UPDATE/DELETE via `is_admin()` function.

Migrations are in `supabase/migrations/` (001 schema, 002 storage, 003 admin seed).

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Public map (MapLibre GL full-screen)
│   ├── layout.tsx                  # Root layout (i18n, fonts, dynamic metadata from settings)
│   ├── login/page.tsx              # Supabase Auth login form
│   ├── auth/callback/route.ts      # Auth code exchange
│   ├── actions/auth.ts             # Logout server action
│   ├── actions/locale.ts           # Locale switch server action
│   ├── admin/
│   │   ├── layout.tsx              # Admin sidebar + ToastProvider
│   │   ├── page.tsx                # Trip listing (main admin dashboard)
│   │   ├── trips/new/page.tsx      # Create trip
│   │   ├── trips/[id]/page.tsx     # Edit trip
│   │   ├── points/                 # Points CRUD (list, new, edit)
│   │   ├── routes/                 # Routes CRUD (list, new, edit)
│   │   ├── tags/page.tsx           # Tag management (inline)
│   │   ├── settings/page.tsx       # Settings panel (4 tabs)
│   │   ├── import-flights/page.tsx # FlightRadar CSV importer
│   │   └── import-airbnb/page.tsx  # Airbnb CSV importer
│   └── api/
│       ├── geojson/route.ts        # Public GeoJSON API (GET, supports ?trip_id=)
│       └── import/
│           ├── flights/route.ts    # POST: import flight groups
│           └── airbnb/route.ts     # POST: import geocoded stays
├── components/
│   ├── admin/                      # sidebar, trip-form, point-form, route-form, entity-actions, trip-actions, favicon-upload
│   ├── auth/login-form.tsx
│   ├── map/                        # travel-map, map-view, map-sidebar, flight-arcs
│   └── shared/                     # locale-switcher, sw-register, toast
├── hooks/
│   ├── use-map-data.ts             # Fetch published trips with POIs + routes
│   ├── use-map-settings.ts         # Fetch and parse settings for map config
│   └── use-browser-language.ts     # Auto-detect browser language on first visit
├── lib/
│   ├── supabase/                   # client.ts, server.ts, admin.ts, middleware.ts
│   ├── models/                     # trips.ts, points.ts, routes.ts, tags.ts, links.ts, settings.ts
│   ├── i18n/                       # config.ts, request.ts, locale.ts
│   ├── utils/                      # cn.ts, image.ts, csv-parsers.ts, airports.ts
│   └── constants.ts                # MAP_STYLES, DEFAULT_TRANSPORT_COLORS, TRANSPORT_TYPES
├── messages/                       # en.json, es.json (full translations)
├── types/
│   ├── domain.ts                   # App types (Trip, Route, PointOfInterest, AppSettings, etc.)
│   └── database.ts                 # Supabase-generated types (placeholder, regenerate with CLI)
└── middleware.ts                    # Auth guard + session refresh
```

## Current Status

All 5 phases are complete:

- Phase 0: Project structure, configs, Supabase clients ✅
- Phase 1: Postgres schema, RLS, Storage, models ✅
- Phase 2: Auth, admin layout, CRUD (trips/points/routes/tags/settings) ✅
- Phase 3: Public map (MapLibre, Supercluster, deck.gl, sidebar, i18n, API) ✅
- Phase 4: CSV importers (FlightRadar + Airbnb), favicon upload ✅
- Phase 5: PWA, image utils, browser language detection, toast system, docs ✅

## Known Limitations / TODOs

- `src/types/database.ts` is a placeholder — regenerate with `npx supabase gen types typescript --project-id YOUR_ID > src/types/database.ts`
- No shadcn/ui components installed yet (using inline Tailwind). Run `npx shadcn@latest add button input select` etc. to add them.
- Route editor is GeoJSON textarea — a visual draw-on-map editor (like original Leaflet.draw) is not yet implemented
- deck.gl flight arcs work but need testing with actual MapLibre GL + MapboxOverlay compatibility
- Airbnb geocoding calls Nominatim directly from the browser (works but rate-limited to 1 req/sec)
- No unit/integration tests yet
- No image gallery for points (single image_path only, original supported multiple images)
- The `links` table CRUD is in the model layer but has no UI yet

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_SITE_TITLE=Viajeros
```

## Key Files to Know

- `supabase/migrations/001_initial_schema.sql` — Full DB schema + RLS + seeds
- `src/lib/supabase/middleware.ts` — Session refresh + admin route protection
- `src/lib/models/settings.ts` — Parses 29 setting rows into typed `AppSettings`
- `src/components/map/travel-map.tsx` — Core MapLibre GL component with Supercluster
- `src/lib/utils/airports.ts` — 75-airport database for FlightRadar importer
- `src/lib/utils/csv-parsers.ts` — FlightRadar + Airbnb CSV parsers with trip grouping
