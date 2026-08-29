# runs the doc-gen pipeline: dax/kpi interpret, then brd/frd/dictionary/mapping
from __future__ import annotations

from typing import Any, Dict

from agents import brd_agent, dax_kpi_agent, dictionary_agent, frd_agent, mapping_agent
from core.llm import LLM


def run_pipeline(model: Dict[str, Any], context: Dict[str, Any], platform: str, llm: LLM) -> Dict[str, Any]:
    interpretation = dax_kpi_agent.interpret_and_suggest(model, llm)
    brd = brd_agent.draft_brd(model, context, platform, llm)
    frd = frd_agent.draft_frd(model, context, llm)
    dictionary = dictionary_agent.draft_dictionary(model, interpretation["measures_explained"], llm)
    mapping = mapping_agent.draft_mapping(model, platform, llm)
    return {
        "docs": {"brd": brd, "frd": frd, "dictionary": dictionary, "mapping": mapping},
        "suggested_kpis": interpretation["suggested_kpis"],
    }
