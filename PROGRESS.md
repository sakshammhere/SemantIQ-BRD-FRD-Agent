# SemantIQ — Internal Progress Tracker

Not judge-facing. Working log of the hackathon polish push, kept in sync stage by stage. See root `README.md` for the public-facing description.

## Audit baseline (2026-08-30)

**Already real, not stubbed:** all 7 LLM agents (BRD, FRD, DAX/KPI, dictionary, mapping, metadata parser, chat), Snowflake/Databricks/AWS connectors (real SDKs), real `.docx`/`.xlsx` generation, Supabase auth/storage/persistence, 4 LLM providers wired (OpenAI/Anthropic/Groq/Gemini, BYOK).

**Known gaps at baseline:**
- Power BI live-connect is 100% mocked (`frontend/lib/api.js` → `testPbiConnection`)
- Six-stage pipeline progress UI is cosmetic — one blocking backend call, not real per-agent status
- No traceability between generated doc text and the source model element it came from
- No seeded demo dataset — live demo depends on real uploaded/connected data
- Schema cross-check result isn't visually prominent
- No automated tests anywhere in the project
- `frontend/README.md` is stale (describes the app as mock-only; no longer true)

## Stage plan

| Stage | Scope | Status |
|---|---|---|
| 1 | Alignment — problem statement, Nova_nordisk disposition, PBI access, timeline | ✅ Done |
| 2 | Foundation — git init, root README, this progress tracker | ✅ Done (2026-08-30) |
| 3 | Real Power BI live-connect | ⏸ Paused by user (2026-08-30) — see note below |
| 4 | Honest per-agent pipeline progress (replace cosmetic stepper) | ⬜ Not started |
| 5 | Traceability view — generated text ↔ source model element | ⬜ Not started |
| 6 | Demo reliability — seed dataset + prominent schema cross-check UI | ⬜ Not started |
| 7 | UI/UX polish pass (enhance existing design, not a rebuild) | ⬜ Not started |

## Decisions locked in during Stage 1–2

- Nova_nordisk (earlier team scaffold) is being ignored entirely — not referenced or merged from.
- Git is local-only for now (`git init` inside `Nova/`), no GitHub push yet.
- UI direction: enhance current look/feel — no visual rebuild.
- Hard rule for every stage: no changes to currently-working functionality without asking first; ask before every non-trivial decision.

## Stage 3 — Power BI live-connect: paused, research findings preserved

User explicitly stopped this stage mid-research on 2026-08-30 ("wait stop here... let it be this only wherever it is") and redirected to: verify all existing functionality works, then finalize the README. **No Power BI code was written.** The wizard's Live Connect tab remains exactly as it was — honestly labeled in-app as "Preview only — live Power BI connections aren't wired up yet."

Research done before pausing, kept here so it isn't re-derived if this stage resumes later:
- Original plan (Execute Queries REST API running DAX `INFO.VIEW.*` functions) is a **dead end** — confirmed via current Microsoft docs that Execute Queries explicitly does not support INFO functions.
- Correct approach: the **Scanner API** (`POST /v1.0/myorg/admin/workspaces/getInfo?datasetSchema=true&datasetExpressions=true`, async: submit → poll `scanStatus` → fetch `scanResult`). Returns full tables/columns/measures **including DAX expressions**, works on Pro workspaces (no Premium/XMLA needed).
- Requires: Azure AD app registration with `Tenant.Read.All` application permission (admin consent), plus two Power BI Admin Portal tenant settings enabled ("Allow service principals to use read-only Power BI admin APIs", "Enhance admin APIs responses with detailed metadata"). This is a heavier, tenant-wide admin grant — not just per-workspace membership like the other connectors use.
- Credential storage was going to reuse the existing `platform_connections` service/table (same pattern as Snowflake/Databricks/AWS) with a new `powerbi` entry in `PLATFORM_META` (frontend) and `SECRET_FIELD` (backend) — this part of the plan is still valid if resumed.
