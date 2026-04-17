# Architecture Overview — Viajeros

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel (CDN + Edge)                   │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Next.js     │  │  API Routes  │  │  Middleware    │  │
│  │  App Router  │  │  /api/*      │  │  Auth guard   │  │
│  │  SSR + CSR   │  │  Serverless  │  │  Session mgmt │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────────┘  │
│         │                 │                              │
└─────────┼─────────────────┼──────────────────────────────┘
          │                 │
          ▼                 ▼
┌─────────────────────────────────────────────────────────┐
│                      Supabase                           │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Postgres │  │  Auth    │  │ Storage  │              │
│  │ + RLS    │  │ Email/PW │  │ Buckets  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### Public Map (Read-only)
```
Browser → Supabase (anon key + RLS) → Only published trips visible
```

### Admin Panel (CRUD)
```
Browser → Supabase Auth (login) → Session cookie
Browser → Supabase (anon key + RLS + session) → Full CRUD access
```

### CSV Importers
```
Browser → Parse CSV client-side → POST /api/import/* → service_role key → Supabase
```

### Image Uploads
```
Browser → Compress (client-side) → Supabase Storage (anon key + RLS) → Public URL
```

## Supabase Clients

| Client | File | Used In | Key | RLS |
|--------|------|---------|-----|-----|
| Browser | `client.ts` | Client Components | anon | Yes |
| Server | `server.ts` | Server Components, Actions | anon + cookie | Yes |
| Admin | `admin.ts` | API Routes (import) | service_role | Bypassed |
| Middleware | `middleware.ts` | Edge Middleware | anon + cookie | Yes |

## Key Design Decisions

### RLS over API Routes
Public data reads go directly from the browser to Supabase via the `anon` key.
RLS ensures only `published` trips are visible. This eliminates unnecessary
API Routes for reads and reduces latency.

### Client-side Image Compression
Images are compressed in the browser before uploading to Supabase Storage.
This avoids consuming serverless function execution time and respects
Vercel's 4.5MB request body limit.

### CSV Parsing Client-side, Import Server-side
CSV files are parsed in the browser (PapaParse) for instant preview.
The grouped/geocoded data is then sent to API Routes that use the
`service_role` key to insert into the database.

### Supercluster over MapLibre Built-in Clustering
Supercluster runs client-side and provides more control over cluster
rendering than MapLibre's built-in clustering. It allows custom markers
with click-to-expand behavior and works well with the config from settings.

### deck.gl for Flight Arcs Only
deck.gl is used exclusively for great-circle flight arcs (ArcLayer).
All other map rendering uses MapLibre GL's native layers for simplicity
and performance.

## Folder Structure Rationale

```
src/
├── app/              # Next.js App Router pages and API routes
│   ├── admin/        # Protected admin pages (middleware redirects to login)
│   ├── api/          # Serverless API endpoints
│   └── actions/      # Server Actions (locale switch, logout)
├── components/
│   ├── admin/        # Admin-only components (forms, sidebar)
│   ├── map/          # Public map components (MapLibre, clusters, arcs)
│   └── shared/       # Shared components (locale switcher, toast, SW)
├── hooks/            # React hooks (useMapData, useMapSettings, etc.)
├── lib/
│   ├── supabase/     # 4 Supabase client variants
│   ├── models/       # Data access layer (CRUD helpers per table)
│   ├── i18n/         # Internationalization config
│   ├── utils/        # Utilities (cn, csv parsers, airports, image)
│   └── constants.ts  # Map styles, transport colors, types
├── messages/         # i18n translation files (en.json, es.json)
└── types/            # TypeScript types (domain.ts, database.ts)
```
