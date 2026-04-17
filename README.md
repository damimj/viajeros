# Viajeros — Interactive Travel Diary

A self-managed interactive travel map built with **Next.js 15**, **Supabase** (Postgres + Auth + Storage), and **MapLibre GL**.

Refactored from [TravelMap](https://github.com/fabiomb/TravelMap) (PHP/MySQL) for deployment on **Vercel + Supabase**.

---

## Features

### Public Map
- Full-screen interactive map (MapLibre GL + WebGL rendering)
- deck.gl animated flight arcs (great-circle)
- Supercluster intelligent clustering (configurable from admin)
- Trip filtering sidebar with tags, dates, and point/route counts
- Detailed popups with images, descriptions, and dates
- Color-coded routes by transport type (8 types)
- Public REST API (`/api/geojson`) with CORS
- URL-based trip filtering (`?trip_id=UUID`)
- PWA with offline tile caching (Service Worker)
- Multi-language (English & Spanish) with browser auto-detection

### Admin Panel
- Full CRUD for trips, points of interest, routes, and tags
- Trips with title, description, dates, color, status (draft/published/planned)
- Points with coordinates, type (visit/stay/food/waypoint), image upload
- Routes with GeoJSON, transport type, color, distance, dates
- Tags management with trip assignment
- FlightRadar CSV importer (preview, merge trips, move flights, edit titles)
- Airbnb CSV importer (auto-geocoding via Nominatim, date-based trip linking)
- Settings panel with 4 tabs: General, Map, Images, Site
- Favicon upload to Supabase Storage
- Protected by Supabase Auth (email/password)
- Responsive sidebar with mobile support

---

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Framework  | Next.js 15 (App Router, TypeScript)           |
| UI         | Tailwind CSS + shadcn/ui design tokens        |
| Database   | Supabase Postgres (with RLS)                  |
| Auth       | Supabase Auth (email/password)                |
| Storage    | Supabase Storage (images, favicon)            |
| Maps       | MapLibre GL JS + deck.gl + Supercluster       |
| Images     | browser-image-compression (client-side)       |
| CSV        | PapaParse (client-side parsing)               |
| i18n       | next-intl (EN + ES)                           |
| Deploy     | Vercel                                        |

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USER/viajeros.git
cd viajeros
npm install
```

### 2. Set up Supabase

See [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) for detailed instructions.

### 3. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### 4. Run locally

```bash
npm run dev
```

- **Public map**: [http://localhost:3000](http://localhost:3000)
- **Admin panel**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **API**: [http://localhost:3000/api/geojson](http://localhost:3000/api/geojson)

---

## Deployment

See [docs/VERCEL_DEPLOY.md](docs/VERCEL_DEPLOY.md) for step-by-step Vercel deployment.

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design overview.

---

## Documentation

| Document | Description |
|---|---|
| [SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) | Database, Storage, Auth setup |
| [VERCEL_DEPLOY.md](docs/VERCEL_DEPLOY.md) | Production deployment guide |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture overview |

---

## Development Phases

- [x] **Phase 0** — Project structure, configs, Supabase clients, i18n, PWA manifest
- [x] **Phase 1** — Postgres schema, RLS policies, Storage buckets, seed data, models
- [x] **Phase 2** — Auth + admin layout + CRUD (trips, points, routes, tags, settings)
- [x] **Phase 3** — Public map (MapLibre GL, clustering, deck.gl arcs, filters, popups, i18n)
- [x] **Phase 4** — CSV importers (FlightRadar, Airbnb) + settings panel + favicon upload
- [x] **Phase 5** — PWA optimizations, image utils, browser language detection, docs

---

## Original Project

Based on [TravelMap](https://github.com/fabiomb/TravelMap) by [Fabio Baccaglioni](https://github.com/fabiomb). GPL-3.0 License.

## License

GPL-3.0 — See [LICENSE](LICENSE).
