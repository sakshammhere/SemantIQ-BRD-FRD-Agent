# the actual http api, all routes live here
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
    # one turn of the tool loop, stateless -- frontend always sends the full convo
    # incl any prior tool calls/results, and executes whatever tools we request
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


class ParseIn(BaseModel):
    raw: str
    provider: Optional[str] = None
    model: Optional[str] = None


@router.post("/parse-metadata")
def parse_metadata_route(body: ParseIn, user: CurrentUser = Depends(get_current_user)) -> Dict[str, Any]:
    llm = None
    if body.provider:
        stored = api_keys_svc.get_decrypted_key(user.client(), body.provider)
        if stored:
            llm = LLM(provider=body.provider, api_key=stored["api_key"], model=body.model or stored.get("model") or None)

    try:
        return metadata_parser_agent.parse_metadata(body.raw, llm)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except LLMError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


class GenerateIn(BaseModel):
    model_context: Dict[str, Any]
    business_context: Dict[str, Any]
    platform: str
    provider: str
    model: Optional[str] = None


@router.post("/generate")
def generate_route(body: GenerateIn, user: CurrentUser = Depends(get_current_user)) -> Dict[str, Any]:
    if body.provider not in SUPPORTED_PROVIDERS:
        raise HTTPException(status_code=400, detail=f"Unknown provider '{body.provider}'.")

    stored = api_keys_svc.get_decrypted_key(user.client(), body.provider)
    if not stored:
        raise HTTPException(status_code=400, detail=f"No API key saved for {body.provider}. Add one in Settings first.")

    llm = LLM(provider=body.provider, api_key=stored["api_key"], model=body.model or stored.get("model") or None)
    try:
        return pipeline.run_pipeline(body.model_context, body.business_context, body.platform, llm)
    except LLMError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


_FILENAMES = {
    "brd": "BRD.docx",
    "frd": "FRD.docx",
    "dictionary": "Semantic_Layer_Dictionary.xlsx",
    "mapping": "Integration_Mapping_Report.xlsx",
}


def _format_date(iso_str: Optional[str]) -> str:
    if not iso_str:
        return ""
    try:
        return datetime.fromisoformat(iso_str.replace("Z", "+00:00")).strftime("%B %d, %Y")
    except ValueError:
        return iso_str


@router.get("/projects/{project_id}/documents/{doc_type}/file")
def download_document_file(project_id: str, doc_type: str, user: CurrentUser = Depends(get_current_user)) -> Response:
    if doc_type not in docgen.DOC_BUILDERS:
        raise HTTPException(status_code=400, detail=f"Unknown document type '{doc_type}'.")

    client = user.client()
    project_res = client.table("projects").select("*").eq("id", project_id).single().execute()
    project = project_res.data
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    doc_res = (
        client.table("documents")
        .select("content")
        .eq("project_id", project_id)
        .eq("doc_type", doc_type)
        .single()
        .execute()
    )
    if not doc_res.data:
        raise HTTPException(status_code=404, detail="Document not found.")

    doc_json = json.loads(doc_res.data["content"])
    meta = {
        "source_label": project.get("source_model") or "the connected source model",
        "generated_date": _format_date(project.get("created_at")),
        "platform": project.get("platform") or "",
        "audience": project.get("audience") or "Stakeholders",
    }

    _ext, builder, mime = docgen.DOC_BUILDERS[doc_type]
    file_bytes = builder(doc_json, meta)
    filename = _FILENAMES[doc_type]
    return Response(
        content=file_bytes,
        media_type=mime,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


class ConnectionIn(BaseModel):
    platform: str
    label: Optional[str] = None
    config: Dict[str, Any]


class ConnectionTestIn(BaseModel):
    platform: str
    config: Dict[str, Any]


def _require_fields(platform: str, config: Dict[str, Any]) -> None:
    connector = get_connector(platform)
    missing = [f for f in connector.REQUIRED_FIELDS if not str(config.get(f, "")).strip()]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing required field(s) for {platform}: {', '.join(missing)}.")


@router.post("/settings/connections/test")
def test_connection_route(body: ConnectionTestIn, user: CurrentUser = Depends(get_current_user)) -> Dict[str, Any]:
    if body.platform not in CONNECTORS:
        raise HTTPException(status_code=400, detail=f"Unknown platform '{body.platform}'.")
    _require_fields(body.platform, body.config)
    connector = get_connector(body.platform)
    try:
        connector.test_connection(body.config)
    except Exception as exc:  # noqa: BLE001 - surfaced directly, these SDKs raise many exception types
        raise HTTPException(status_code=400, detail=f"Connection failed: {exc}") from exc
    return {"ok": True}


@router.get("/settings/connections")
def list_connections_route(user: CurrentUser = Depends(get_current_user)) -> List[Dict[str, Any]]:
    return platform_connections_svc.list_connections(user.client())


@router.post("/settings/connections")
def save_connection_route(body: ConnectionIn, user: CurrentUser = Depends(get_current_user)) -> Dict[str, Any]:
    if body.platform not in CONNECTORS:
        raise HTTPException(status_code=400, detail=f"Unknown platform '{body.platform}'.")
    _require_fields(body.platform, body.config)
    return platform_connections_svc.save_connection(user.client(), user.id, body.platform, body.label, body.config)


@router.delete("/settings/connections/{platform}")
def delete_connection_route(platform: str, user: CurrentUser = Depends(get_current_user)) -> Dict[str, str]:
    platform_connections_svc.delete_connection(user.client(), platform)
    return {"status": "deleted"}


class CrossCheckIn(BaseModel):
    model_context: Dict[str, Any]
    platform: str


@router.post("/platform/cross-check")
def cross_check_route(body: CrossCheckIn, user: CurrentUser = Depends(get_current_user)) -> Dict[str, Any]:
    if body.platform not in CONNECTORS:
        raise HTTPException(status_code=400, detail=f"Unknown platform '{body.platform}'.")

    config = platform_connections_svc.get_decrypted_config(user.client(), body.platform)
    if not config:
        raise HTTPException(
            status_code=400,
            detail=f"No {body.platform} connection saved. Add one in Settings first.",
        )

    connector = get_connector(body.platform)
    try:
        target_schema = connector.fetch_schema(config)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Could not read the {body.platform} catalog: {exc}") from exc

    return schema_crosscheck.crosscheck(body.model_context, target_schema, body.platform)
