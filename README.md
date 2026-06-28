# Bridge Risk Explorer

Bridge Risk Explorer is a dark, data-first geospatial workspace for exploring FHWA National Bridge Inventory data. It helps infrastructure planners screen bridge condition, traffic, age, priority, and state/county risk patterns across both single-state and national datasets.

## Features

- Dashboard overview with bridge counts, condition/priority distributions, and highest-risk states.
- Explorer workspace with grid and MapLibre map views.
- Shared search, state, county, condition, priority, age, and traffic filters.
- State-first county filtering using generated Census lookup data.
- Details inspector with source/derived-field context.
- Rule-based condition and priority badges with contextual tooltips.
- Risk hotspot panel scoped nationally by state or within a selected state by county.
- URL-backed Explorer state.
- National-safe map endpoint that requires bounds and caps marker volume.
- Access telemetry through `GET /api/bridges/:id`, which records view count and last viewed time.

## Tech Stack

- Next.js 15 App Router
- React 19 and TypeScript
- Tailwind CSS with CSS variables
- Local shadcn/ui-compatible primitives
- TanStack Table and TanStack Query
- Zustand
- MapLibre GL
- Prisma
- PostgreSQL/PostGIS
- Vitest and React Testing Library
- ESLint and Prettier
- `tsx` scripts

## Architecture Overview

The app keeps bridge data flat from database to API DTOs. Raw FHWA/NBI field names are isolated to importer files; the UI and API use domain names such as `averageDailyTraffic`, `bridgeCondition`, and `priorityLevel`.

- `prisma/schema.prisma`: flat `Bridge` table and indexes.
- `src/domain/bridge.ts`: flat TypeScript domain model.
- `src/importer/*`: raw FHWA/NBI parsing, normalization, lookup, and mapping boundary.
- `src/lib/bridgeRepository.ts`: database query and aggregation functions.
- `src/features/bridge-explorer/api/*`: purpose-built DTOs and query hooks.
- `src/features/bridge-explorer/state/*`: shared Explorer state and URL serialization.
- `src/features/bridge-explorer/components/*`: dashboard, explorer, grid, map, details, badges, and hotspots.
- `src/app/api/bridges/*`: Next.js route handlers.

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`. The root route redirects to `/dashboard`; the Explorer workspace is at `/explorer`.

## Database Setup

Local development expects PostgreSQL with PostGIS enabled.

```sql
CREATE DATABASE bridge_explorer;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

Set `DATABASE_URL` in `.env`, then run Prisma:

```bash
npx prisma format
npx prisma migrate dev
npx prisma generate
```

The Prisma schema includes latitude/longitude fields plus unsupported PostGIS/search-vector fields. Those fields are documented for production raw SQL migration support; latitude/longitude remain the portable source of truth.

## Data Import Workflow

Large NBI data files must not be committed. The `data/` directory is gitignored.

1. Place the FHWA/NBI delimited text file under `data/`.
2. Configure `DATABASE_URL` for the target database.
3. Run the importer manually:

```bash
npm run import:bridges -- data/2022HwyBridgesDelimitedAllStates.txt
```

The app does not import data during startup or deployment. The importer streams comma-delimited FHWA/NBI files, maps raw fields into the flat Bridge model, and writes batches with:

```ts
prisma.bridge.createMany({ data: batch, skipDuplicates: true })
```

County and state lookup files can be regenerated from the Census county reference file:

```bash
npm run generate:lookups -- data/national_county2020.txt
```

## Supabase Deployment Notes

- Create a Supabase PostgreSQL project.
- Enable PostGIS in Supabase SQL editor:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

- Set `DATABASE_URL` and, if needed by Prisma migrations, `DIRECT_URL`.
- Run Prisma migrations against the Supabase database from a trusted local environment or CI job.
- Run the bridge importer manually against the Supabase `DATABASE_URL`.
- Do not upload or commit the raw NBI file to the app repository.

## Vercel Deployment Notes

- Set environment variables in Vercel:
  - `DATABASE_URL`
  - `DIRECT_URL` if your migration workflow needs it
- Deploy the Next.js app normally.
- Do not run the importer as part of Vercel build/startup.
- Import data separately from a local machine or controlled job pointed at the hosted database.
- Confirm the hosted database has PostGIS enabled before running migrations/imports.

## API Endpoints

- `GET /api/bridges`: grid records with pagination, filtering, and sorting.
- `GET /api/bridges/map`: bounded map markers; returns no national marker dump without bounds.
- `GET /api/bridges/hotspots`: state-level or county-level risk hotspots.
- `GET /api/bridges/:id`: bridge details; increments `viewCount` and updates `lastViewedAt`.

Shared query parameters:

- `search`
- `stateCode`
- `countyCode`
- `bridgeCondition`
- `priorityLevel`
- `minAge`
- `maxAge`
- `minAdt`
- `maxAdt`
- `sortBy`
- `sortDirection`
- `page`
- `pageSize`
- `north`
- `south`
- `east`
- `west`

## Testing Commands

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

## Known Limitations

- Built within a take-home assessment timebox.
- No auth, editing, exports, saved searches, AI chat, or background sync.
- Importer is optimized for initial bulk load using `createMany({ skipDuplicates: true })`.
- Upsert/diff synchronization is future work.
- Map markers are capped for national performance.
- County viewport fitting uses simple marker/state behavior rather than bundled county polygons.
- PostGIS geometry/search-vector population may require raw SQL migration work in production.
- Dashboard is intentionally lightweight and read-only.

## Future Improvements

- Add production-grade raw SQL migrations for geometry and full-text search.
- Add importer upsert/diff mode for recurring NBI refreshes.
- Add marker clustering and density-aware map styling.
- Add seeded database integration tests.
- Add richer dashboard trend data once historical imports exist.
- Add county boundary data for precise county map fitting.
