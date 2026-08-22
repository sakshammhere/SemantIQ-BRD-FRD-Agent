"""Builds the semantic data dictionary.

The structural facts (tables, columns, relationships, measure DAX) are assembled
deterministically in Python directly from the parsed model — so the dictionary is
always complete and accurate, never dependent on an LLM correctly reproducing a
potentially large schema. The LLM is only asked for the business framing: each
table's purpose/grain, and a short glossary of business terms — content that
genuinely requires judgment rather than transcription.
"""
from __future__ import annotations

import json
from typing import Any, Dict, List

from core.llm import LLM

SYSTEM_PROMPT = """You are documenting a semantic data dictionary for business \
stakeholders. Given a semantic model's table/column/measure names, do two things:

1. For every table, write a one-to-two sentence business purpose: what real-world \
thing one row represents (the grain) and why this table exists.
2. Produce a short glossary of 5-10 business terms that appear in or are implied by \
the table/column/measure names — terms a new analyst would need explained.

Never invent tables that aren't in the model.

Respond as a single JSON object of exactly this shape:
{
  "table_purposes": [{"table": "<exact table name from the model>", "purpose": "..."}],
  "glossary": [{"term": "...", "definition": "..."}]
}"""


def draft_dictionary(model: Dict[str, Any], measures_explained: List[Dict[str, str]], llm: LLM) -> Dict[str, Any]:
    table_names = [t.get("name", "") for t in model.get("tables", [])]
    user = f"""Table names: {json.dumps(table_names)}
Column names by table: {json.dumps({t.get('name', ''): [c.get('name', '') for c in t.get('columns', [])] for t in model.get('tables', [])})}
Measure names: {json.dumps([m.get('name', '') for m in model.get('measures', [])])}"""
    result = llm.complete_json(SYSTEM_PROMPT, user)

    purpose_by_table = {p.get("table"): p.get("purpose", "") for p in result.get("table_purposes", []) if isinstance(p, dict)}
    explanation_by_measure = {m.get("name"): m.get("explanation", "") for m in measures_explained if isinstance(m, dict)}

    tables_out = []
    total_columns = 0
    for table in model.get("tables", []):
        name = table.get("name", "")
        columns = table.get("columns", [])
        total_columns += len(columns)
        tables_out.append({
            "name": name,
            "purpose": purpose_by_table.get(name) or table.get("description") or "",
            "row_count": table.get("row_count"),
            "columns": [
                {
                    "name": c.get("name", ""),
                    "type": c.get("type", ""),
                    "description": c.get("description", ""),
                    "key": bool(c.get("key")),
                }
                for c in columns
            ],
        })

    measures_out = [
        {
            "name": m.get("name", ""),
            "expression": m.get("expression", ""),
            "description": explanation_by_measure.get(m.get("name"), m.get("description", "")),
        }
        for m in model.get("measures", [])
    ]

    relationships_out = [
        {
            "from": r.get("from", ""),
            "to": r.get("to", ""),
            "cardinality": r.get("cardinality", ""),
        }
        for r in model.get("relationships", [])
    ]

    definitions = len(tables_out) + total_columns + len(measures_out) + len(relationships_out)
    return {
        "label": "SEMANTIC DATA DICTIONARY",
        "kicker": f"SEMANTIC DICTIONARY · {definitions} DEFINITIONS",
        "title": "Source definitions & measures",
        "summary": {
            "tables": len(tables_out),
            "columns": total_columns,
            "measures": len(measures_out),
            "relationships": len(relationships_out),
        },
        "tables": tables_out,
        "relationships": relationships_out,
        "measures": measures_out,
        "glossary": result.get("glossary") or [],
    }
