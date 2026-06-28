# Architecture Decisions

## Flat Bridge Model

Bridge Risk Explorer uses a flat `Bridge` table and flat TypeScript domain model. This keeps the take-home implementation readable, queryable, and easy to reason about while still supporting national datasets.

Tradeoff: a more normalized model could reduce duplication for state/county/owner/classification fields, but it would add import and query complexity that is not necessary for this assessment.

## Raw FHWA/NBI Schema Isolation

Raw FHWA/NBI field names are confined to importer files and importer tests. Application code uses clean domain names such as `averageDailyTraffic`, `bridgeCondition`, `priorityLevel`, and `lastInspectionDate`.

Reason: this prevents raw federal schema details from leaking into UI, API contracts, and feature logic.

## Purpose-Built DTOs

API routes do not expose Prisma rows directly. The app uses purpose-built DTOs for:

- grid rows
- map markers
- bridge details
- risk hotspots

Reason: each view has a different data shape, and DTOs keep payloads intentional, flat, and stable.

## Repository Layer

Route handlers and dashboard pages call repository functions in `src/lib/bridgeRepository.ts`. Query construction, aggregation, and telemetry writes stay close to database access while UI/API files stay focused on presentation and request handling.

## Rule-Based Priority

Priority is application-derived, not an official NBI field. The rules are intentionally explainable:

- Critical for lowest rating <= 3, or Poor condition with high traffic, scour risk, or fracture risk
- High for Poor condition, lowest rating 4, bridge age >= 70, or ADT >= 25000
- Medium for Fair condition, lowest rating 5, bridge age >= 50, or ADT >= 10000
- Low when no major indicators are present

Reason: infrastructure screening needs transparent decision support rather than opaque scoring.

## National-Safe Map Endpoint

`GET /api/bridges/map` requires map bounds. Without bounds it returns no markers and `requiresBounds: true`. Bounded responses are capped by `MAP_MARKER_LIMIT`.

Reason: the national dataset can be large, and returning every marker by default would be slow and expensive.

## Import Workflow

The importer is a manual operational script:

```bash
npm run import:bridges -- data/2022HwyBridgesDelimitedAllStates.txt
```

It streams CSV rows, maps raw NBI fields into the clean Bridge model, batches roughly 1000 rows, and uses `createMany({ skipDuplicates: true })`.

Reason: this is appropriate for initial bulk loading in a take-home assessment. Upsert/diff sync is deferred.

## Dashboard Scope

The dashboard is intentionally lightweight and read-only. It provides operational summary, distributions, and highest-risk states but does not become a separate analytics product.

Reason: the core product goal remains bridge exploration through the grid, map, filters, details, and hotspots.

## Deployment Separation

The app does not import data during startup, Vercel build, or deployment. Data import is a separate manual operation against the target `DATABASE_URL`.

Reason: raw NBI files are large, imports are operationally sensitive, and deployment should remain fast and repeatable.
