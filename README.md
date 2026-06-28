# Bridge Explorer

Bridge Explorer is a data-dense geospatial workspace for engineers and infrastructure planners working with the National Bridge Inventory (NBI). It supports both single-state files and national all-states datasets, with shared filtering across grid, map, detail, and risk hotspot views.

## Tech Stack

- Next.js 15 App Router
- React 19 and TypeScript
- Tailwind CSS with CSS variables
- shadcn/ui-compatible local primitives
- TanStack Table and TanStack Query
- Zustand
- MapLibre GL
- Prisma
- PostgreSQL/PostGIS
- Vitest and React Testing Library
- ESLint and Prettier
- `tsx` importer scripts

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

## PostgreSQL/PostGIS

Configure `DATABASE_URL` in `.env`:

```env
DATABASE_URL="postgresql://bridge_explorer:bridge_explorer@localhost:5432/bridge_explorer?schema=public"
```

The schema includes normal latitude/longitude fields plus Prisma `Unsupported` fields for PostGIS geometry and PostgreSQL full-text search vectors. In a production migration, enable extensions and maintain those fields with raw SQL:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

## Prisma

Format and validate the schema:

```bash
npx prisma format
npx prisma validate
```

When a database is available:

```bash
npx prisma migrate dev
npx prisma generate
```

## Importing NBI Data

Import a comma-delimited FHWA/NBI file:

```bash
npm run import:bridges -- data/NBI_ALL_STATES.txt
```

Expected CSV format:
- Header row with raw FHWA/NBI field names.
- Comma-delimited text parsed by a streaming CSV parser.
- Supports single-state files and national all-states files without code changes.

The importer batches about 1000 mapped rows and writes with:

```ts
prisma.bridge.createMany({ data: batch, skipDuplicates: true })
```

## API Endpoints

- `GET /api/bridges`
- `GET /api/bridges/map`
- `GET /api/bridges/hotspots`
- `GET /api/bridges/:id`

`GET /api/bridges/:id` increments `viewCount`, updates `lastViewedAt`, and returns a `BridgeDetailDto`.

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

## Data Model Decisions

The database schema and API DTOs are intentionally flat. Bridge Explorer does not expose raw database rows from API routes. It uses purpose-built DTOs for:

- `BridgeGridDto`
- `BridgeMapMarkerDto`
- `BridgeDetailDto`
- `RiskHotspotDto`

Raw FHWA/NBI field names are isolated to importer files and importer tests. The app surface uses clean domain names such as `averageDailyTraffic`, `bridgeCondition`, `priorityLevel`, and `stateCode`.

## Condition And Priority Rules

Condition mapping:
- `G` -> `Good`
- `F` -> `Fair`
- `P` -> `Poor`
- other values -> `Unknown`

Priority levels:
- `Critical`: lowest rating <= 3, or poor condition with high traffic, scour risk, or fracture-critical risk.
- `High`: poor condition, lowest rating 4, bridge age >= 70, or ADT >= 25000.
- `Medium`: fair condition, lowest rating 5, bridge age >= 50, or ADT >= 10000.
- `Low`: no major risk indicators.

## State-Aware Filtering

State comes before county. Changing `stateCode` clears `countyCode`, and the UI disables county selection until a state is selected. Hotspots follow the same scope:

- No state selected: national state-level hotspots.
- State selected: county-level hotspots within that state.

## National-Safe Map Behavior

The map endpoint never returns the full national marker set by default. If bounds are missing, it returns:

```json
{
  "markers": [],
  "requiresBounds": true
}
```

The map view writes MapLibre bounds into shared state and then requests bounded markers capped by `MAP_MARKER_LIMIT`.

## Testing

```bash
npm run test
npm run typecheck
npm run lint
```

Coverage focuses on normalization, derived fields, DTO mapping, query parsing, shared state, badges, grid interactions, details drawer rendering, and hotspot selection behavior.

## Known Limitations

- Built within an OA timebox.
- No auth, editing, exports, saved searches, or chat.
- Map markers are capped for national performance.
- Importer is optimized for initial bulk load with `createMany({ skipDuplicates: true })`.
- Upsert/diff synchronization is future work.
- Full national county lookup data should be added for production imports.
- PostGIS geometry/search-vector population needs raw SQL migration work.

## Future Improvements

- Add production migrations for PostGIS geometry and full-text search.
- Add full national FIPS county lookup data.
- Add marker clustering and density-aware map styling.
- Add integration tests against a seeded database.
- Add URL sync tests around browser history behavior.
