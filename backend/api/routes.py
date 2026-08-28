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
class AgentToolCall(BaseModel):
    id: str
    name: str
    arguments: Dict[str, Any] = {}


class AgentMessage(BaseModel):
    role: str  # "user" | "assistant" | "tool"
    content: Optional[str] = None
    tool_calls: Optional[List[AgentToolCall]] = None
    tool_call_id: Optional[str] = None
    name: Optional[str] = None


class AgentStepIn(BaseModel):
    messages: List[AgentMessage]
    model_context: Optional[Dict[str, Any]] = None
    provider: str
    model: Optional[str] = None
    allowed_tools: Optional[List[str]] = None


@router.post("/agent/step")
def agent_step_route(body: AgentStepIn, user: CurrentUser = Depends(get_current_user)) -> Dict[str, Any]:
    """One turn of the Agent Chat's tool-calling loop. Stateless: the caller
    (frontend) always sends the full conversation, including any prior tool
    calls/results. The backend never executes a tool itself — it only decides,
    via the LLM, whether to reply with text or request one or more tool calls;
    the frontend executes those (with permission gating) and sends the results
    back in the next call.
    """
    if body.provider not in SUPPORTED_PROVIDERS:
        raise HTTPException(status_code=400, detail=f"Unknown provider '{body.provider}'.")

    stored = api_keys_svc.get_decrypted_key(user.client(), body.provider)
    if not stored:
        raise HTTPException(status_code=400, detail=f"No API key saved for {body.provider}. Add one in Settings first.")

    llm = LLM(provider=body.provider, api_key=stored["api_key"], model=body.model or stored.get("model") or None)
    context_block = (
        json.dumps(body.model_context, indent=2)[:6000]
        if body.model_context
        else "No semantic model is currently attached to this conversation."
    )
    system = f"{AGENT_SYSTEM_PROMPT}\n\nCurrently attached semantic model context:\n{context_block}"
    messages = [m.model_dump(exclude_none=True) for m in body.messages]
    tools = TOOLS_FOR_LLM
    if body.allowed_tools is not None:
        tools = [t for t in TOOLS_FOR_LLM if t["name"] in body.allowed_tools]

    try:
        return llm.complete_with_tools(system, messages, tools)
    except LLMError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


# ---------------------------------------------------------------- API keys
class ApiKeyIn(BaseModel):
    provider: str
    api_key: str
    model: Optional[str] = None


class ApiKeyTestIn(BaseModel):
    provider: str
    api_key: str


@router.post("/settings/api-keys/test")
def test_api_key(body: ApiKeyTestIn, user: CurrentUser = Depends(get_current_user)) -> Dict[str, Any]:
    if body.provider not in SUPPORTED_PROVIDERS:
        raise HTTPException(status_code=400, detail=f"Unknown provider '{body.provider}'.")
    try:
        models = list_models(body.provider, body.api_key)
    except LLMError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    recommended = DEFAULT_MODELS.get(body.provider)
    if recommended not in models and models:
        recommended = models[0]
    return {
        "ok": True,
        "models": [{"id": m, "recommended": m == recommended} for m in models],
        "recommended": recommended,
    }


@router.get("/settings/api-keys")
def list_api_keys(user: CurrentUser = Depends(get_current_user)) -> List[Dict[str, Any]]:
    return api_keys_svc.list_api_keys(user.client())


@router.post("/settings/api-keys")
def save_api_key(body: ApiKeyIn, user: CurrentUser = Depends(get_current_user)) -> Dict[str, Any]:
    if body.provider not in SUPPORTED_PROVIDERS:
        raise HTTPException(status_code=400, detail=f"Unknown provider '{body.provider}'.")
    if not body.api_key.strip():
        raise HTTPException(status_code=400, detail="API key cannot be empty.")
    return api_keys_svc.save_api_key(user.client(), user.id, body.provider, body.api_key.strip(), body.model)


@router.delete("/settings/api-keys/{provider}")
def delete_api_key(provider: str, user: CurrentUser = Depends(get_current_user)) -> Dict[str, str]:
    api_keys_svc.delete_api_key(user.client(), provider)
    return {"status": "deleted"}


# ------------------------------------------------------------- model parsing
