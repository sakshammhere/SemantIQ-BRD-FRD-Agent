# explains existing dax measures in plain english + suggests new kpis
from __future__ import annotations

import json
from typing import Any, Dict

from core.llm import LLM

SYSTEM_PROMPT = """You are a business intelligence analyst. Given a Power BI semantic \
model (tables, columns, relationships, and DAX measures), do two things:

1. For every existing measure, write a one-sentence, business-friendly explanation of \
what it means and how it's calculated — no DAX jargon, understandable by a \
non-technical stakeholder.
2. Suggest 2-4 ADDITIONAL KPIs that would be genuinely useful given this model's \
tables and measures, that aren't already defined. For each: a name, the business \
rationale (why it matters), and a plausible DAX expression using only tables/columns \
that exist in the given model.

Never invent tables or columns that aren't in the model. If the model is too sparse to \
suggest anything meaningful, return an empty suggestions list rather than guessing.

Respond as a single JSON object of exactly this shape:
{
  "measures_explained": [{"name": "...", "explanation": "..."}],
  "suggested_kpis": [{"name": "...", "rationale": "...", "expression": "..."}]
}"""


def interpret_and_suggest(model: Dict[str, Any], llm: LLM) -> Dict[str, Any]:
    user = f"Semantic model:\n\n{json.dumps(model, indent=2)[:8000]}"
    result = llm.complete_json(SYSTEM_PROMPT, user)
    return {
        "measures_explained": result.get("measures_explained", []),
        "suggested_kpis": result.get("suggested_kpis", []),
    }
