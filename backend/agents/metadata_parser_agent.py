# parses pbi model metadata (tmsl json / our own json / freeform text) into
# {tables, relationships, measures} -- tmsl is exact, freeform goes thru the llm
from __future__ import annotations

import json
from typing import Any, Dict, Optional

from core.llm import LLM

PARSE_SYSTEM_PROMPT = """You are a Power BI semantic model parser. You will be given \
raw model metadata — this may be TMDL text, a partial JSON export, pasted DAX measures, \
or a rough description. Extract everything you can into this exact JSON shape and \
nothing else:

{
  "tables": [{"name": "...", "description": "...", "row_count": "..." or null,
              "columns": [{"name": "...", "type": "...", "description": "...", "key": true|false}]}],
  "relationships": [{"from": "Table.Column", "to": "Table.Column", "cardinality": "Many-to-one" | "One-to-one" | "Many-to-many"}],
  "measures": [{"name": "...", "expression": "...", "description": "..."}]
}

Rules:
- Never invent table/column/measure names that aren't implied by the input.
- If row counts aren't given, use null.
- Write a short, genuinely useful one-line "description" for every table (what it \
represents) even if the input doesn't state one explicitly — infer it from the \
name/columns/grain.
- Mark a column "key": true only if it's clearly a primary/unique identifier.
- If the input is too sparse to produce anything meaningful, return empty arrays \
rather than guessing.

Respond with a single JSON object of exactly that shape."""


def _looks_like_tmsl(data: Any) -> bool:
    return isinstance(data, dict) and isinstance(data.get("model"), dict) and isinstance(data["model"].get("tables"), list)


def _looks_like_normalized(data: Any) -> bool:
    if not (isinstance(data, dict) and isinstance(data.get("tables"), list)):
        return False
    if not data["tables"]:
        return True
    first = data["tables"][0]
    return isinstance(first, dict) and "columns" in first


def _as_text(value: Any) -> str:
    # tmsl sometimes splits a dax expr into a list of lines instead of one string
    if isinstance(value, list):
        return "\n".join(str(v) for v in value)
    return value or ""


def _parse_tmsl(data: Dict[str, Any]) -> Dict[str, Any]:
    model = data.get("model", {})

    relationships_out = []
    key_columns = set()
    for rel in model.get("relationships", []):
        from_table = rel.get("fromTable", "")
        from_col = rel.get("fromColumn", "")
        to_table = rel.get("toTable", "")
        to_col = rel.get("toColumn", "")
        # "to" side of a pbi relationship is usually the one-side / key
        key_columns.add((to_table, to_col))
        from_card = (rel.get("fromCardinality") or "many").lower()
        to_card = (rel.get("toCardinality") or "one").lower()
        relationships_out.append({
            "from": f"{from_table}.{from_col}",
            "to": f"{to_table}.{to_col}",
            "cardinality": f"{from_card.title()}-to-{to_card}",
        })

    tables_out = []
    measures_out = []
    for table in model.get("tables", []):
        name = table.get("name", "")
        columns_out = []
        for col in table.get("columns", []):
            col_name = col.get("name", "")
            columns_out.append({
                "name": col_name,
                "type": col.get("dataType", "string"),
                "description": col.get("description") or "",
                "key": (name, col_name) in key_columns,
            })
        for m in table.get("measures", []):
            measures_out.append({
                "name": m.get("name", ""),
                "expression": _as_text(m.get("expression", "")),
                "description": _as_text(m.get("description") or ""),
            })
        tables_out.append({
            "name": name,
            "description": table.get("description") or "",
            "row_count": None,
            "columns": columns_out,
        })

    return {"tables": tables_out, "relationships": relationships_out, "measures": measures_out}


def parse_metadata(raw: str, llm: Optional[LLM] = None) -> Dict[str, Any]:
    text = (raw or "").strip()
    if not text:
        raise ValueError("No metadata provided.")

    data = None
    try:
        data = json.loads(text)
    except Exception:  # noqa: BLE001 - not JSON, that's fine, fall through
        pass

    if isinstance(data, dict):
        if _looks_like_tmsl(data):
            return _parse_tmsl(data)
        if _looks_like_normalized(data):
            return {
                "tables": data.get("tables", []),
                "relationships": data.get("relationships", []),
                "measures": data.get("measures", []),
            }

    if llm is None or not llm.configured:
        raise ValueError(
            "This doesn't look like a recognized Power BI model export (.bim/JSON), and no "
            "AI provider is configured to interpret freeform text. Paste a .bim/JSON export, "
            "or connect an AI provider in Settings first."
        )

    result = llm.complete_json(PARSE_SYSTEM_PROMPT, f"Raw model metadata:\n\n{text[:12000]}")
    return {
        "tables": result.get("tables", []),
        "relationships": result.get("relationships", []),
        "measures": result.get("measures", []),
    }
