# estimates how the model maps onto a target platform's physical schema (naming
# convention only, not a live catalog check -- that's schema_crosscheck.py's job).
# llm makes the judgment calls, python expands them to every column so nothing's missed
from __future__ import annotations

import json
import re
from typing import Any, Dict, List

from core.llm import LLM

SYSTEM_PROMPT = """You are a data platform architect. Given a Power BI semantic model \
and a target platform (Snowflake, Databricks, or AWS), make the judgment calls needed \
to estimate a physical schema mapping — you do NOT need to list every column, Python \
will expand your rules to the full field list.

Respond as a single JSON object of exactly this shape:
{
  "casing_rule": "SCREAMING_SNAKE_CASE" | "snake_case",
  "table_mappings": [
    {"source_table": "<exact table name>", "target_table": "<physical table name following fct_/dim_ or FCT_/DIM_ convention as appropriate>", "table_type": "Fact" | "Dimension" | "Other"}
  ],
  "renames": [
    {"source": "Table.Column", "target_column": "PHYSICAL_NAME", "note": "why this differs from a plain casing conversion"}
  ],
  "missing": [
    {"source": "Table.Column", "reason": "why there's no confident target — flag for manual review"}
  ]
}

Only put a field in "renames" if its physical name would differ from a straightforward \
casing conversion of the source name (e.g. a business synonym like Amount -> \
NET_AMOUNT). Only put a field in "missing" if you genuinely have no confident guess. \
Every table in the model must appear in "table_mappings". Be explicit that this is an \
estimate pending a real catalog comparison, not a verified live schema match."""


def _split_words(name: str) -> List[str]:
    # handles PascalCase/camelCase and existing snake/space separators alike
    spaced = re.sub(r"(?<=[a-z0-9])(?=[A-Z])", "_", name)
    spaced = re.sub(r"(?<=[A-Za-z])(?=[0-9])", "_", spaced)
    parts = re.split(r"[\s_\-]+", spaced)
    return [p for p in parts if p]


def _apply_casing(name: str, rule: str) -> str:
    words = _split_words(name) or [name]
    if rule == "snake_case":
        return "_".join(w.lower() for w in words)
    return "_".join(w.upper() for w in words)  # default SCREAMING_SNAKE_CASE


def draft_mapping(model: Dict[str, Any], platform: str, llm: LLM) -> Dict[str, Any]:
    table_names = [t.get("name", "") for t in model.get("tables", [])]
    columns_by_table = {t.get("name", ""): [c.get("name", "") for c in t.get("columns", [])] for t in model.get("tables", [])}
    user = f"""Target platform: {platform}

Table names: {json.dumps(table_names)}
Columns by table: {json.dumps(columns_by_table)}"""
    result = llm.complete_json(SYSTEM_PROMPT, user)

    casing_rule = result.get("casing_rule") if result.get("casing_rule") in ("snake_case", "SCREAMING_SNAKE_CASE") else "SCREAMING_SNAKE_CASE"
    table_target = {}
    table_type = {}
    for tm in result.get("table_mappings", []):
        if not isinstance(tm, dict):
            continue
        src = tm.get("source_table")
        table_target[src] = tm.get("target_table") or _apply_casing(src or "", casing_rule)
        table_type[src] = tm.get("table_type", "Other")

    rename_map = {r.get("source"): r for r in result.get("renames", []) if isinstance(r, dict) and r.get("source")}
    missing_map = {m.get("source"): m for m in result.get("missing", []) if isinstance(m, dict) and m.get("source")}

    table_mappings_out = []
    field_mappings_out = []
    matched = renamed = missing = 0

    for table in model.get("tables", []):
        tname = table.get("name", "")
        ttarget = table_target.get(tname) or _apply_casing(tname, casing_rule)
        table_mappings_out.append({"source_table": tname, "target_table": ttarget, "type": table_type.get(tname, "Other")})

        for col in table.get("columns", []):
            cname = col.get("name", "")
            key = f"{tname}.{cname}"
            if key in missing_map:
                missing += 1
                field_mappings_out.append({
                    "source_table": tname, "source_column": cname, "source_type": col.get("type", ""),
                    "target_table": ttarget, "target_column": "—", "status": "Missing",
                    "note": missing_map[key].get("reason", "No confident target — needs manual review."),
                })
            elif key in rename_map:
                renamed += 1
                field_mappings_out.append({
                    "source_table": tname, "source_column": cname, "source_type": col.get("type", ""),
                    "target_table": ttarget, "target_column": rename_map[key].get("target_column", ""), "status": "Renamed",
                    "note": rename_map[key].get("note", "Business naming convention applied."),
                })
            else:
                matched += 1
                field_mappings_out.append({
                    "source_table": tname, "source_column": cname, "source_type": col.get("type", ""),
                    "target_table": ttarget, "target_column": _apply_casing(cname, casing_rule), "status": "Matched",
                    "note": "Naming convention applied.",
                })

    relationship_mappings_out = []
    for rel in model.get("relationships", []):
        def _conv(ref: str) -> str:
            if "." not in ref:
                return ref
            t, c = ref.split(".", 1)
            return f"{table_target.get(t) or _apply_casing(t, casing_rule)}.{_apply_casing(c, casing_rule)}"
        relationship_mappings_out.append({
            "source": f"{rel.get('from', '')} → {rel.get('to', '')}",
            "target_join": f"{_conv(rel.get('from', ''))} = {_conv(rel.get('to', ''))}",
            "cardinality": rel.get("cardinality", ""),
        })

    measure_mappings_out = []
    for m in model.get("measures", []):
        measure_mappings_out.append({
            "measure": m.get("name", ""),
            "dax": m.get("expression", ""),
            "note": "Re-derive as a warehouse-native aggregate expression over the mapped physical columns above.",
        })

    total = matched + renamed + missing
    pct = round((matched + renamed) / total * 100) if total else 0

    return {
        "label": "INTEGRATION MAPPING REPORT",
        "kicker": f"MAPPING REPORT · {pct}% MAPPED (ESTIMATE)",
        "title": f"Power BI → {platform}",
        "platform": platform,
        "mapped_pct": pct,
        "summary": {"total": total, "matched": matched, "renamed": renamed, "missing": missing},
        "table_mappings": table_mappings_out,
        "field_mappings": field_mappings_out,
        "relationship_mappings": relationship_mappings_out,
        "measure_mappings": measure_mappings_out,
    }
