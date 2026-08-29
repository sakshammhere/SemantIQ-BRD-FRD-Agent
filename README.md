# SemantIQ

**An AI chatbot agent that automates BRD/FRD creation from Power BI semantic models.**

SemantIQ extracts a Power BI semantic layer — tables, relationships, calculated tables, KPIs, measures, and DAX logic — and turns it into structured, business-friendly documentation. It suggests additional KPIs where relevant and maps the model onto a target enterprise data platform (Snowflake, Databricks, or AWS).

## The problem

BRD, FRD, and semantic-layer documentation for analytics solutions is usually written by hand — a slow, error-prone process once a Power BI model has more than a handful of tables, relationships, calculated columns, and DAX measures. SemantIQ replaces that manual write-up with an AI agent pipeline that reads the model directly and produces the documentation a business analyst would otherwise spend days drafting.

## What it does

| Requirement | How SemantIQ delivers it |
|---|---|
| Chatbot interface | Conversational intake for business context, plus a persistent chat sidebar for iterating on generated docs |
| Automates BRD/FRD creation | Dedicated LLM agents draft the BRD and FRD from the model + business context |
| Extracts Power BI semantic layer details | Reads tables, relationships, calculated tables, KPIs, measures, and DAX straight from a model export (.bim/JSON/TMDL — upload or paste) |
| Documents in business-friendly language | Every table, join, KPI, measure, and DAX expression is explained in plain business language, not technical DAX syntax |
| Suggests additional KPIs | A dedicated agent reviews the existing measures and proposes relevant KPIs the model doesn't yet have |
| Platform integration | Live schema cross-check and mapping report against Snowflake, Databricks, or AWS |

## Architecture

Blue = LLM reasoning &nbsp;·&nbsp; Green = deterministic Python &nbsp;·&nbsp; Orange = input / output

```mermaid
flowchart TD
    subgraph INPUTS[" "]
        direction LR
        I1["Power BI Model<br/>upload / paste"]
        I2["Business Context<br/>(chat)"]
        I3["Target Platform<br/>Snowflake / Databricks / AWS"]
    end

    subgraph DOC["Documentation pipeline"]
        direction TB
        P1["Metadata Parser Agent<br/>model → tables · relationships · measures"]
        P2["DAX / KPI Agent<br/>interpret DAX · suggest KPIs"]
        P3["BRD Agent"]
        P4["FRD Agent"]
        P5["Dictionary Agent"]
        P6["Mapping Agent"]
        P7["Document Generator<br/>docgen.py → real .docx / .xlsx"]
        P1 --> P2
        P1 --> P3
        P1 --> P4
        P1 --> P5
        P1 --> P6
        P2 --> P5
        P3 --> P7
        P4 --> P7
        P5 --> P7
        P6 --> P7
    end

    subgraph XCHK["Live schema cross-check"]
        direction TB
        X1["Platform Connector<br/>Snowflake / Databricks / AWS SDK"]
        X2["Schema Cross-Check<br/>fuzzy-match model ↔ live catalog"]
        X1 --> X2
    end

    I1 --> P1
    I2 --> P3
    I2 --> P4
    I3 --> P3
    I3 --> P6
    I3 --> X1

    LLM["LLM Brain<br/>core/llm.py<br/>OpenAI · Anthropic · Groq · Gemini (BYOK)"]
    LLM -.-> P2
    LLM -.-> P3
    LLM -.-> P4
    LLM -.-> P5
    LLM -.-> P6

    ORCH["Orchestrator<br/>core/pipeline.py"]
    ORCH -.-> P2
    ORCH -.-> P3
    ORCH -.-> P4
    ORCH -.-> P5
    ORCH -.-> P6

    subgraph OUT[" "]
        direction LR
        O1["BRD.docx"]
        O2["FRD.docx"]
        O3["Semantic Dictionary.xlsx"]
        O4["Integration Mapping.xlsx"]
        O5["Suggested KPIs<br/>(in-app)"]
        O6["Live Cross-Check Report<br/>(in-app)"]
    end
    P7 --> O1
    P7 --> O2
    P7 --> O3
    P7 --> O4
    P2 --> O5
    X2 --> O6

    SUPA["Supabase — auth · encrypted credentials · project & document persistence · file storage"]
    ORCH -.-> SUPA
    P7 -.-> SUPA

    classDef input fill:#fdebd0,stroke:#e67e22,color:#7a4a12
    classDef llmNode fill:#dbe9fd,stroke:#2f6fdb,color:#1a3d7c
    classDef detNode fill:#d9f2e3,stroke:#2ea86b,color:#166341
    classDef infra fill:#eaeaf2,stroke:#5a5a72,color:#33334d
    classDef supa fill:#efe3fb,stroke:#8552c9,color:#4a2a7a

    class I1,I2,I3,O1,O2,O3,O4,O5,O6 input
    class P2,P3,P4,P5,P6 llmNode
    class P1,P7,X1,X2 detNode
    class LLM,ORCH infra
    class SUPA supa
```

## Getting started

**Backend**
```bash
cd backend
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env   # fill in Supabase project + encryption key
uvicorn main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm start
```
Open `http://localhost:4173`. Sign up, then add an LLM provider key in Settings to start generating documentation.

## Status

Built for a hackathon submission. Core documentation pipeline is functional end to end today.

| Capability | Status |
|---|---|
| Model ingestion via upload / paste (.bim, JSON, TMDL) | ✅ Working |
| BRD, FRD, semantic dictionary, KPI suggestions | ✅ Working — real LLM agent pipeline |
| Snowflake / Databricks / AWS schema cross-check & mapping | ✅ Working — real connectors, live catalogs |
| Real `.docx` / `.xlsx` document export | ✅ Working |
| Power BI live workspace connection | 🚧 Roadmap — upload/paste cover the same extraction today |
