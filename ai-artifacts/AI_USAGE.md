# AI Usage

ChatGPT was used to support product planning, architecture, feature scoping, data mapping, API design, UI direction, and documentation drafting for Bridge Risk Explorer.

Codex was used incrementally to implement the assessment in phases:

- project setup and tooling
- flat Bridge domain model and Prisma schema
- streaming FHWA/NBI importer
- backend API route handlers and DTOs
- shared Explorer state and query hooks
- dashboard, grid, map, hotspot, and details UI
- visual polish and submission documentation

Generated code was reviewed and refined after each phase. Implementation choices were kept scoped to the take-home assessment and adjusted for consistency, maintainability, readability, and the existing project structure.

Intentional architecture decisions influenced by the AI-assisted planning process include:

- isolating raw FHWA/NBI field names to importer files
- keeping the database schema and API DTOs flat
- using purpose-built DTOs for grid, map, detail, and hotspot views
- making priority levels explainable, rule-based, and separate from official NBI fields
- requiring map bounds so the national map endpoint cannot return the full dataset by default
- using batched `createMany({ skipDuplicates: true })` for the initial import workflow
- keeping the dashboard read-only and lightweight rather than expanding into a separate analytics product
