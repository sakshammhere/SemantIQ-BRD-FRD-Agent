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
| 3 | Real Power BI live-connect | ⬜ Not started |
| 4 | Honest per-agent pipeline progress (replace cosmetic stepper) | ⬜ Not started |
| 5 | Traceability view — generated text ↔ source model element | ⬜ Not started |
| 6 | Demo reliability — seed dataset + prominent schema cross-check UI | ⬜ Not started |
| 7 | UI/UX polish pass (enhance existing design, not a rebuild) | ⬜ Not started |

## Decisions locked in during Stage 1–2

- Nova_nordisk (earlier team scaffold) is being ignored entirely — not referenced or merged from.
- Git is local-only for now (`git init` inside `Nova/`), no GitHub push yet.
- Power BI: real integration, using real API access the user has. Auth method to be decided in Stage 3.
- UI direction: enhance current look/feel — no visual rebuild.
- Hard rule for every stage: no changes to currently-working functionality without asking first; ask before every non-trivial decision.
