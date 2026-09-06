"""Deterministic comparison of a parsed semantic model against a REAL fetched
target-platform schema (not an LLM guess). Used by the wizard's live
"Test & cross-check schema" step once a platform connection is saved.
"""
from __future__ import annotations

import re
from typing import Any, Dict, List


def _normalize(name: str) -> str:
    return re.sub(r"[^a-z0-9]", "", (name or "").lower())


def crosscheck(model: Dict[str, Any], target_schema: List[Dict[str, str]], platform: str) -> Dict[str, Any]:
    by_table: Dict[str, List[Dict[str, str]]] = {}
    for row in target_schema:
        by_table.setdefault(row["table"], []).append(row)
    norm_tables = {_normalize(t): t for t in by_table}

    table_mappings = []
    field_mappings = []
    matched = renamed = missing = 0

    for table in model.get("tables", []):
        tname = table.get("name", "")
        ntname = _normalize(tname)
        target_table = norm_tables.get(ntname)
        if not target_table:
            target_table = next((real for norm, real in norm_tables.items() if ntname and (ntname in norm or norm in ntname)), None)
        table_mappings.append({"source_table": tname, "target_table": target_table or "—", "type": ""})

        target_cols = {_normalize(c["column"]): c for c in by_table.get(target_table, [])} if target_table else {}

        for col in table.get("columns", []):
            cname = col.get("name", "")
            ncname = _normalize(cname)
            if not target_table:
                status, note, tcol = "Missing", f"Table '{tname}' was not found in the live {platform} catalog.", "—"
            elif ncname in target_cols:
                status, note, tcol = "Matched", "Exact match against the live catalog.", target_cols[ncname]["column"]
            else:
                fuzzy = next((c for norm, c in target_cols.items() if ncname and (ncname in norm or norm in ncname)), None)
                if fuzzy:
                    status, note, tcol = "Renamed", "Closest match found in the live catalog — verify manually.", fuzzy["column"]
                else:
                    status, note, tcol = "Missing", "No matching column found in the live catalog.", "—"

            if status == "Matched":
                matched += 1
            elif status == "Renamed":
                renamed += 1
            else:
                missing += 1

            field_mappings.append({
                "source_table": tname, "source_column": cname, "source_type": col.get("type", ""),
                "target_table": target_table or "—", "target_column": tcol, "status": status, "note": note,
            })

    total = matched + renamed + missing
    pct = round((matched + renamed) / total * 100) if total else 0
    return {
        "platform": platform,
        "mapped_pct": pct,
        "summary": {"total": total, "matched": matched, "renamed": renamed, "missing": missing},
        "table_mappings": table_mappings,
        "field_mappings": field_mappings,
        "live": True,
    }
