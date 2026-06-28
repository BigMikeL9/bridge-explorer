# Bridge Explorer Project Ground Rules

- Product name: Bridge Explorer.
- Build incrementally; do not implement the full application in one pass.
- Prefer consistency, maintainability, and readability over expanding scope.
- When requirements are ambiguous, choose the simpler implementation and document the tradeoff.
- Support national all-states datasets from the beginning, including Pennsylvania-only views.
- Keep database schema and API DTOs flat.
- Keep raw FHWA/NBI field names inside importer code only.
- Do not expose raw database rows from API routes.
- Use purpose-built DTOs for grid, map, detail, and hotspot surfaces.
- Do not add auth, editing, AI chat, exports, saved searches, or extra dashboards.
- Visual direction: calm, modern, data-first geospatial engineering workspace with compact typography, neutral colors, subtle borders, low-noise MapLibre basemap, Lucide icons, Tailwind CSS variables, and no emoji badges.
