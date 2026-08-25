# SemantIQ

A self-contained, enterprise-style frontend demo for turning a Power BI semantic model and business context into BRD/FRD documentation.

## Run locally

Requires Node.js 18+.

```bash
npm run check
npm start
```

Then open `http://localhost:4173`.

## Included flows

- Dashboard with mock documentation projects
- Power BI live connection, upload, and paste-metadata paths
- Expandable semantic model preview with tables, columns, relationships, and DAX measures
- Business-context intake with assistant refinement chat
- Snowflake, Databricks, and AWS target selection
- Target schema cross-check with semantic mapping statuses
- Six-stage documentation generation pipeline
- BRD, FRD, semantic dictionary, and integration mapping result tabs
- Persistent document chat sidebar
- Mock artifact downloads, light/dark theme, responsive layouts

## API boundary

All data operations are isolated in `lib/api.js`. The module returns realistic delayed mock responses and is designed to be replaced with a Node.js/TypeScript API client later. `lib/types.js` contains the shared JSDoc data contracts.