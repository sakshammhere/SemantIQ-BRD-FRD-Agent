"""HTTP API for the SemantIQ backend."""
from __future__ import annotations

import json
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

from agents import metadata_parser_agent
from agents.agent_tools import SYSTEM_PROMPT as AGENT_SYSTEM_PROMPT
from agents.agent_tools import TOOLS_FOR_LLM
from agents.chat_agent import run_chat
from connectors import CONNECTORS, get_connector
from core import pipeline
from core.llm import DEFAULT_MODELS, SUPPORTED_PROVIDERS, LLM, LLMError, list_models
from services import api_keys as api_keys_svc
from services import docgen
from services import platform_connections as platform_connections_svc
from services import schema_crosscheck
from services.supabase_client import CurrentUser, get_current_user

router = APIRouter(prefix="/api")


@router.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


# --------------------------------------------------------------------- chat
class ChatTurn(BaseModel):
    role: str
    content: str


class ChatIn(BaseModel):
    message: str
    history: List[ChatTurn] = []
    model_context: Optional[Dict[str, Any]] = None
    provider: str
    model: Optional[str] = None


@router.post("/chat")
def chat(body: ChatIn, user: CurrentUser = Depends(get_current_user)) -> Dict[str, str]:
    if body.provider not in SUPPORTED_PROVIDERS:
        raise HTTPException(status_code=400, detail=f"Unknown provider '{body.provider}'.")

    client = user.client()
    stored = api_keys_svc.get_decrypted_key(client, body.provider)
    if not stored:
        raise HTTPException(
            status_code=400,
            detail=f"No API key saved for {body.provider}. Add one in Settings first.",
        )

    llm = LLM(provider=body.provider, api_key=stored["api_key"], model=body.model or stored.get("model") or None)
    try:
        result = run_chat(
            llm,
            message=body.message,
            history=[turn.model_dump() for turn in body.history],
            model_context=body.model_context,
        )
    except LLMError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return result


# --------------------------------------------------------- agentic tool loop
