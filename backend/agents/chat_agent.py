# the chatbot interface -- explains the model in plain english, helps draft
# brd/frd, suggests kpis, advises on platform mapping
from __future__ import annotations

import json
from typing import Any, Dict, List, Optional

from core.llm import LLM

SYSTEM_PROMPT = """You are the SemantIQ AI agent, the chatbot interface of a documentation \
platform for Power BI semantic layers. Your job:

- Read and interpret Power BI semantic model metadata (tables, relationships/joins, \
calculated columns, KPIs, measures, DAX expressions) whenever it is supplied to you.
- Translate technical structure and DAX logic into clear, business-friendly language a \
non-technical stakeholder could understand.
- Help produce Business Requirements Documents (BRD) and Functional Requirements \
Documents (FRD) from that metadata plus the business context the user gives you.
- Proactively suggest additional KPIs relevant to the model's tables and measures, when \
it's genuinely useful to do so — don't force it into every reply.
- Advise on integration/mapping considerations for enterprise data platforms — Snowflake, \
Databricks, AWS, and others — including how Power BI semantic names typically map to \
physical warehouse schemas (naming conventions, likely renames, fields that may be missing).
- Be conversational, concise, and precise. Ask a clarifying question when a request is \
ambiguous rather than guessing.
- Never invent table, column, or measure names that were not given to you in the current \
semantic model context. If none has been provided yet, say so and ask the user to paste or \
upload one before attempting a deep analysis.

Always respond as a single JSON object of the exact shape {"reply": "<message text>"}. \
No markdown code fences around the JSON, no extra keys."""


def _format_history(history: List[Dict[str, str]]) -> str:
    if not history:
        return "(no prior messages)"
    lines = []
    for turn in history[-12:]:
        role = "User" if turn.get("role") == "user" else "SemantIQ"
        lines.append(f"{role}: {turn.get('content', '')}")
    return "\n".join(lines)


def run_chat(llm: LLM, message: str, history: List[Dict[str, str]], model_context: Optional[Dict[str, Any]]) -> Dict[str, str]:
    context_block = (
        json.dumps(model_context, indent=2)[:6000]
        if model_context
        else "No semantic model has been provided in this conversation yet."
    )

    user_prompt = f"""Conversation so far:
{_format_history(history)}

Current semantic model context (may be empty):
{context_block}

User's latest message:
{message}

Respond as JSON: {{"reply": "..."}}"""

    result = llm.complete_json(SYSTEM_PROMPT, user_prompt)
    reply = result.get("reply")
    if not isinstance(reply, str) or not reply.strip():
        reply = "I wasn't able to form a clear response that time — could you rephrase, or give me a bit more detail?"
    return {"reply": reply}
