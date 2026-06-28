# Limitations And Next Steps

Known limitations:
- Built within an OA timebox.
- No auth, editing, exports, saved searches, or chat.
- Map marker cap protects national performance.
- Importer is optimized for initial bulk load with `createMany({ skipDuplicates: true })`.
- Upsert/diff sync is future work.
- Full national county lookup data is not yet complete.
- PostGIS geometry and full-text vector maintenance need raw SQL migrations.

Next steps:
- Seed a local database and run an end-to-end import.
- Add production SQL migrations for PostGIS and full-text search.
- Add map clustering.
- Add integration tests against seeded API data.
- Expand county lookup coverage nationally.
