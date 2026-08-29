# drafts the brd from the parsed model + biz context, shld stay decision-ready not technical
from __future__ import annotations

import json
from typing import Any, Dict

from core.llm import LLM

SYSTEM_PROMPT = """You are a senior business analyst drafting a comprehensive Business \
Requirements Document (BRD) for a semantic layer documentation project. Use the \
semantic model, the business context, and the target platform to write clear, \
decision-ready business-language content — never DAX or technical jargon here.

Ground every claim in the actual tables/measures/business context given. Never invent \
tables, measures, or stakeholders that aren't implied by the input. This document will \
be read by executives and stakeholders who were never shown the raw model, so be \
concrete and specific rather than generic.

Respond as a single JSON object of exactly this shape:
{
  "title": "<project name>",
  "executive_summary": "3-5 sentences: what this delivers and why it matters now.",
  "business_background": "1-2 short paragraphs: the problem this solves and why it exists.",
  "objectives": [
    {"id": "BO-1", "statement": "...", "success_metric": "a measurable way to know it's achieved"}
  ],
  "stakeholders": [
    {"role": "...", "responsibility": "what they need from this", "interest": "why they care"}
  ],
  "current_state": "1-2 sentences: how this is handled today, without this solution.",
  "future_state": "1-2 sentences: how it will work once delivered.",
  "in_scope": ["specific, concrete scope items — not generic phrases"],
  "out_of_scope": ["specific exclusions and why they're excluded"],
  "requirements": [
    {"id": "BR-001", "theme": "a grouping theme, e.g. 'Revenue Reporting'", "description": "a specific, testable business requirement", "priority": "Must" | "Should" | "Could", "rationale": "why this requirement exists"}
  ],
  "assumptions": ["..."],
  "constraints": ["..."],
  "risks": [
    {"risk": "...", "impact": "High" | "Medium" | "Low", "mitigation": "..."}
  ],
  "success_criteria": ["specific, measurable criteria for calling this done"],
  "glossary": [
    {"term": "a business term used in this document or the model", "definition": "..."}
  ]
}

Guidance on depth: produce 3-5 objectives, 3-6 stakeholders (derive plausible roles \
from the target audience given — don't invent unrelated ones), 8-15 requirements \
grouped under 3-5 themes spanning the model's actual tables/measures, 3-5 risks, \
5-10 glossary terms drawn from the actual table/column/measure names. Every array \
must have real, specific content — never a single filler item."""


def draft_brd(model: Dict[str, Any], context: Dict[str, Any], platform: str, llm: LLM) -> Dict[str, Any]:
    user = f"""Semantic model:
{json.dumps(model, indent=2)[:7000]}

Business context:
{json.dumps(context, indent=2)}

Target platform: {platform}"""
    result = llm.complete_json(SYSTEM_PROMPT, user)
    return {
        "label": "BUSINESS REQUIREMENTS DOCUMENT",
        "kicker": "BRD · VERSION 1.0",
        "title": result.get("title") or context.get("projectName") or "Untitled project",
        "executive_summary": result.get("executive_summary") or "",
        "business_background": result.get("business_background") or "",
        "objectives": result.get("objectives") or [],
        "stakeholders": result.get("stakeholders") or [],
        "current_state": result.get("current_state") or "",
        "future_state": result.get("future_state") or "",
        "in_scope": result.get("in_scope") or [],
        "out_of_scope": result.get("out_of_scope") or [],
        "requirements": result.get("requirements") or [],
        "assumptions": result.get("assumptions") or [],
        "constraints": result.get("constraints") or [],
        "risks": result.get("risks") or [],
        "success_criteria": result.get("success_criteria") or [],
        "glossary": result.get("glossary") or [],
    }
