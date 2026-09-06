"""Drafts a comprehensive Functional Requirements Document — organized as functional
modules, each containing user stories with acceptance criteria — from the parsed
model + business context."""
from __future__ import annotations

import json
from typing import Any, Dict

from core.llm import LLM

SYSTEM_PROMPT = """You are a senior business analyst drafting a comprehensive \
Functional Requirements Document (FRD) for a semantic layer documentation project. \
Describe what the system must do, organized into functional modules — each module \
contains user stories, and each user story has concrete, testable acceptance criteria.

Ground everything in the actual tables/columns/relationships/measures given — never \
invent ones that aren't present. Where a story concerns a measure, reference its real \
name and, where useful, its actual DAX expression so a technical reader can verify it \
against the model.

Respond as a single JSON object of exactly this shape:
{
  "title": "<project name>",
  "introduction": "2-3 sentences: purpose and reading guide for this document.",
  "system_overview": "2-3 sentences: what system/pipeline this describes at a high level.",
  "modules": [
    {
      "name": "a functional module name, e.g. 'Data Ingestion & Parsing'",
      "description": "1-2 sentences: what this module covers.",
      "stories": [
        {
          "id": "US-1.1",
          "story": "As a <role>, I want <capability>, so that <benefit>.",
          "priority": "Must" | "Should" | "Could",
          "acceptance_criteria": ["Given/When/Then or plain testable statements — 2-4 per story"]
        }
      ]
    }
  ],
  "non_functional_requirements": [
    {"category": "Performance" | "Security" | "Auditability" | "Usability" | "Reliability", "requirement": "..."}
  ],
  "data_requirements": [
    {"entity": "a real table name from the model", "fields": ["real column/measure names"], "notes": "grain, governance notes, or constraints"}
  ],
  "traceability": [
    {"business_requirement": "a plausible BR id like BR-001", "functional_requirement": "a US id from above, e.g. US-1.1"}
  ]
}

Guidance on depth: produce 3-5 modules covering the real lifecycle implied by the \
model and context (e.g. ingestion/parsing, semantic interpretation, documentation \
generation, platform mapping, governance) — each with 2-4 user stories, each story \
with 2-4 acceptance criteria. Include one data_requirements entry per real table in \
the model. Produce 4-8 traceability rows. Every array must have real, specific \
content — never a single filler item."""


def draft_frd(model: Dict[str, Any], context: Dict[str, Any], llm: LLM) -> Dict[str, Any]:
    user = f"""Semantic model:
{json.dumps(model, indent=2)[:7000]}

Business context:
{json.dumps(context, indent=2)}"""
    result = llm.complete_json(SYSTEM_PROMPT, user)
    return {
        "label": "FUNCTIONAL REQUIREMENTS DOCUMENT",
        "kicker": "FRD · VERSION 1.0",
        "title": result.get("title") or context.get("projectName") or "Untitled project",
        "introduction": result.get("introduction") or "",
        "system_overview": result.get("system_overview") or "",
        "modules": result.get("modules") or [],
        "non_functional_requirements": result.get("non_functional_requirements") or [],
        "data_requirements": result.get("data_requirements") or [],
        "traceability": result.get("traceability") or [],
    }
