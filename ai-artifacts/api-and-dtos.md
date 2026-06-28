# API And DTOs

Endpoints:
- `GET /api/bridges`
- `GET /api/bridges/map`
- `GET /api/bridges/hotspots`
- `GET /api/bridges/:id`

DTOs:
- `BridgeGridDto`
- `BridgeGridResponse`
- `BridgeMapMarkerDto`
- `BridgeMapResponse`
- `BridgeDetailDto`
- `RiskHotspotDto`
- `RiskHotspotsResponse`

`GET /api/bridges/:id` records access telemetry by incrementing `viewCount` and updating `lastViewedAt`.

Sort parameters are allowlisted before database queries are built.
