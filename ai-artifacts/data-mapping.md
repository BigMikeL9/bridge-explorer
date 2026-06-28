# Data Mapping

The importer is the raw FHWA/NBI boundary.

Normalization includes:
- Trimmed text with surrounding single quotes removed.
- Invalid, empty, or `N` numeric values converted to `null`.
- NBI DMS latitude/longitude values converted to decimal degrees.
- MMYY inspection dates converted to first-of-month UTC dates.
- FHWA condition codes mapped to clean domain condition values.

State names come from the source state code. County names are keyed by `${stateCode}-${countyCode}` because county codes repeat across states.
