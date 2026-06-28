# Architecture Decisions

- Next.js App Router route handlers expose the backend API.
- Prisma owns the flat `Bridge` table.
- Repository functions separate route handlers from database query construction.
- DTO mappers prevent raw database rows from leaking through API routes.
- Zustand stores shared explorer state for grid, map, filters, hotspots, and details.
- TanStack Query fetches only API DTO endpoints.
- MapLibre uses bounded requests so national datasets remain safe to browse.
