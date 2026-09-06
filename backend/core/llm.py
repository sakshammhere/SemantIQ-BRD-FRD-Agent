"""The single LLM "brain" shared by every SemantIQ agent.

Bring-your-own-key: the API key is always supplied by the authenticated user
(decrypted server-side just before the call) and never falls back to a
server-held secret. Four providers are supported:

    openai     - native OpenAI Chat Completions
    groq       - OpenAI-compatible endpoint, different base_url
    gemini     - Google's OpenAI-compatible endpoint, different base_url
    anthropic  - Claude's own SDK/message format

A call "fails" if it raises OR returns unparseable JSON. Failures are
classified as fatal (bad/expired key, no quota - raise immediately with an
actionable message) or transient (let the caller decide whether to retry).
"""
from __future__ import annotations

import json
import re
from typing import Any, Dict, Optional, Tuple


class LLMError(RuntimeError):
    """Raised when the LLM is unconfigured or the call fails fatally."""


PROVIDER_BASE_URLS: Dict[str, Optional[str]] = {
    "openai": None,
    "groq": "https://api.groq.com/openai/v1",
    "gemini": "https://generativelanguage.googleapis.com/v1beta/openai/",
}

DEFAULT_MODELS: Dict[str, str] = {
    "openai": "gpt-4o-mini",
    "groq": "llama-3.3-70b-versatile",
    "gemini": "gemini-2.0-flash",
    "anthropic": "claude-3-5-sonnet-latest",
}

SUPPORTED_PROVIDERS = tuple(DEFAULT_MODELS.keys())


def _diagnose(exc: Exception) -> Tuple[bool, str]:
    """Classify a provider call failure.

    Returns (fatal, message). "fatal" means retrying won't help (bad key,
    quota exhausted) so we should stop with a clear message instead of
    pretending the call could succeed on retry.
    """
    name = type(exc).__name__
    text = str(exc).lower()

    if (
        "insufficient_quota" in text
        or "exceeded your current quota" in text
        or "billing" in text
        or "not enough credits" in text
        or "resource_exhausted" in text
        or "rate_limit" in text and "quota" in text
    ):
        return True, (
            "Your API quota is used up — the account has no remaining credits/billing. "
            "Add credits with your provider, or switch keys in Settings, then try again."
        )

    if (
        name in ("AuthenticationError", "PermissionDeniedError", "AuthenticationException")
        or "invalid api key" in text
        or "incorrect api key" in text
        or "invalid_api_key" in text
        or "401" in text
        or "unauthorized" in text
        or "invalid x-api-key" in text
    ):
        return True, "Your API key was rejected — it's invalid or expired. Update it in Settings, then try again."

    if name == "NotFoundError" or "model_not_found" in text or "does not exist" in text:
        return True, "That model isn't available on your API key. Pick a different model in Settings, then try again."

    return False, f"{name}: {exc}"


_EXCLUDE_SUBSTRINGS = (
    "embedding", "whisper", "tts", "dall-e", "moderation", "davinci", "babbage",
    "curie", "ada", "instruct", "audio", "realtime", "transcribe", "search",
    "similarity", "edit", "image",
)


def list_models(provider: str, api_key: str) -> list[str]:
    """Return the chat-capable model ids actually available to this key.

    Raises LLMError if the key is invalid or the provider can't be reached —
    this call doubles as the live "test connection" check.
    """
    provider = (provider or "").strip().lower()
    api_key = (api_key or "").strip()
    if provider not in SUPPORTED_PROVIDERS:
        raise LLMError(f"Unknown provider '{provider}'.")
    if not api_key:
        raise LLMError("No API key provided.")

    try:
        if provider == "anthropic":
            ids = _list_models_anthropic(api_key)
        elif provider == "gemini":
            ids = _list_models_gemini(api_key)
        else:
            ids = _list_models_openai_compatible(provider, api_key)
    except LLMError:
        raise
    except Exception as exc:  # noqa: BLE001
        fatal, message = _diagnose(exc)
        raise LLMError(message if fatal else f"Could not reach {provider}: {message}") from exc

    filtered = [m for m in ids if not any(bad in m.lower() for bad in _EXCLUDE_SUBSTRINGS)]
    if not filtered:
        raise LLMError("Your key is valid, but no chat-capable models were found on this account.")
    return filtered


def _list_models_openai_compatible(provider: str, api_key: str) -> list[str]:
    from openai import OpenAI

    kwargs: Dict[str, Any] = {"api_key": api_key, "timeout": 30, "max_retries": 1}
    base_url = PROVIDER_BASE_URLS.get(provider)
    if base_url:
        kwargs["base_url"] = base_url
    client = OpenAI(**kwargs)
    models = list(client.models.list())
    # Newer models tend to have a later `created` timestamp — surface them first.
    models.sort(key=lambda m: getattr(m, "created", 0) or 0, reverse=True)
    return [m.id for m in models]


def _list_models_anthropic(api_key: str) -> list[str]:
    from anthropic import Anthropic

    client = Anthropic(api_key=api_key, timeout=30)
    result = client.models.list()
    return [m.id for m in result.data]


def _list_models_gemini(api_key: str) -> list[str]:
    import urllib.error
    import urllib.request

    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"HTTPError {exc.code}: {body[:300]}") from exc

    ids = []
    for entry in payload.get("models", []):
        methods = entry.get("supportedGenerationMethods", [])
        if "generateContent" not in methods:
            continue
        name = entry.get("name", "")
        ids.append(name.split("/", 1)[1] if "/" in name else name)
    return ids


def _to_anthropic_messages(messages: list) -> list:
    """Anthropic needs consecutive tool results batched into a single user
    turn (multiple tool_result blocks), not one user turn per result."""
    out: list = []
    i = 0
    while i < len(messages):
        m = messages[i]
        if m["role"] == "tool":
            batch = []
            while i < len(messages) and messages[i]["role"] == "tool":
                batch.append({"type": "tool_result", "tool_use_id": messages[i]["tool_call_id"], "content": messages[i]["content"]})
                i += 1
            out.append({"role": "user", "content": batch})
            continue
        if m["role"] == "assistant" and m.get("tool_calls"):
            content: list = []
            if m.get("content"):
                content.append({"type": "text", "text": m["content"]})
            for tc in m["tool_calls"]:
                content.append({"type": "tool_use", "id": tc["id"], "name": tc["name"], "input": tc["arguments"]})
            out.append({"role": "assistant", "content": content})
            i += 1
            continue
        out.append({"role": m["role"], "content": m.get("content") or ""})
        i += 1
    return out


class LLM:
    def __init__(self, provider: str, api_key: str, model: Optional[str] = None):
        self.provider = (provider or "").strip().lower()
        self.api_key = (api_key or "").strip()
        self.model = (model or DEFAULT_MODELS.get(self.provider, "")).strip()
        self._client = None

    @property
    def configured(self) -> bool:
        return bool(self.api_key and self.model and self.provider in SUPPORTED_PROVIDERS)

    def complete_json(self, system: str, user: str) -> Dict[str, Any]:
        """Return a parsed JSON dict, or raise LLMError."""
        if not self.configured:
            raise LLMError(
                f"No API key configured for '{self.provider or 'this provider'}'. "
                "Add one in Settings."
            )
        try:
            if self.provider == "anthropic":
                raw = self._complete_anthropic(system, user)
            else:
                raw = self._complete_openai_compatible(system, user)
        except LLMError:
            raise
        except Exception as exc:  # noqa: BLE001
            fatal, message = _diagnose(exc)
            if fatal:
                raise LLMError(message) from exc
            raise LLMError(f"The model call failed: {message}") from exc

        result = self._safe_json(raw)
        if result.get("_parse_error"):
            raise LLMError("The model returned a response that couldn't be parsed. Try again.")
        return result

    def complete_with_tools(self, system: str, messages: list, tools: list) -> Dict[str, Any]:
        """Run one turn of a tool-calling agentic loop.

        `messages` is a canonical list of turns:
          {"role": "user"|"assistant", "content": str|None, "tool_calls": [{"id","name","arguments"}]|None}
          {"role": "tool", "tool_call_id": str, "name": str, "content": str}
        Returns one new assistant turn in that same shape: either a plain text
        reply (tool_calls=None) or one or more requested tool calls
        (content may still hold accompanying explanatory text).
        """
        if not self.configured:
            raise LLMError(
                f"No API key configured for '{self.provider or 'this provider'}'. "
                "Add one in Settings."
            )
        try:
            if self.provider == "anthropic":
                return self._complete_tools_anthropic(system, messages, tools)
            return self._complete_tools_openai_compatible(system, messages, tools)
        except LLMError:
            raise
        except Exception as exc:  # noqa: BLE001
            fatal, message = _diagnose(exc)
            if fatal:
                raise LLMError(message) from exc
            raise LLMError(f"The model call failed: {message}") from exc

    def _complete_tools_openai_compatible(self, system: str, messages: list, tools: list) -> Dict[str, Any]:
        if self._client is None:
            from openai import OpenAI

            kwargs: Dict[str, Any] = {"api_key": self.api_key, "timeout": 90, "max_retries": 1}
            base_url = PROVIDER_BASE_URLS.get(self.provider)
            if base_url:
                kwargs["base_url"] = base_url
            self._client = OpenAI(**kwargs)

        oa_tools = [{"type": "function", "function": {"name": t["name"], "description": t["description"], "parameters": t["parameters"]}} for t in tools]
        oa_messages: list = [{"role": "system", "content": system}]
        for m in messages:
            if m["role"] == "tool":
                oa_messages.append({"role": "tool", "tool_call_id": m["tool_call_id"], "content": m["content"]})
            elif m["role"] == "assistant" and m.get("tool_calls"):
                oa_messages.append({
                    "role": "assistant",
                    "content": m.get("content"),
                    "tool_calls": [
                        {"id": tc["id"], "type": "function", "function": {"name": tc["name"], "arguments": json.dumps(tc["arguments"])}}
                        for tc in m["tool_calls"]
                    ],
                })
            else:
                oa_messages.append({"role": m["role"], "content": m.get("content") or ""})

        resp = self._client.chat.completions.create(model=self.model, messages=oa_messages, tools=oa_tools, tool_choice="auto", temperature=0)
        msg = resp.choices[0].message
        if msg.tool_calls:
            calls = []
            for tc in msg.tool_calls:
                try:
                    args = json.loads(tc.function.arguments or "{}")
                except json.JSONDecodeError:
                    args = {}
                calls.append({"id": tc.id, "name": tc.function.name, "arguments": args})
            return {"role": "assistant", "content": msg.content, "tool_calls": calls}
        return {"role": "assistant", "content": msg.content or "", "tool_calls": None}

    def _complete_tools_anthropic(self, system: str, messages: list, tools: list) -> Dict[str, Any]:
        if self._client is None:
            from anthropic import Anthropic

            self._client = Anthropic(api_key=self.api_key, timeout=90)

        an_tools = [{"name": t["name"], "description": t["description"], "input_schema": t["parameters"]} for t in tools]
        an_messages = _to_anthropic_messages(messages)

        resp = self._client.messages.create(model=self.model, max_tokens=4096, system=system, messages=an_messages, tools=an_tools)
        text_parts = []
        calls = []
        for block in resp.content:
            if block.type == "text":
                text_parts.append(block.text)
            elif block.type == "tool_use":
                calls.append({"id": block.id, "name": block.name, "arguments": block.input})
        return {"role": "assistant", "content": "".join(text_parts) if text_parts else None, "tool_calls": calls or None}

    # ---------------------------------------------------------- openai-compatible
    def _complete_openai_compatible(self, system: str, user: str) -> str:
        if self._client is None:
            from openai import OpenAI

            kwargs: Dict[str, Any] = {"api_key": self.api_key, "timeout": 90, "max_retries": 1}
            base_url = PROVIDER_BASE_URLS.get(self.provider)
            if base_url:
                kwargs["base_url"] = base_url
            self._client = OpenAI(**kwargs)

        messages = [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ]

        def _create(json_mode: bool):
            params: Dict[str, Any] = {"model": self.model, "messages": messages, "temperature": 0}
            if json_mode:
                params["response_format"] = {"type": "json_object"}
            return self._client.chat.completions.create(**params)

        try:
            resp = _create(json_mode=True)
        except Exception as exc:  # noqa: BLE001 - some models/providers reject response_format
            text = str(exc).lower()
            if "response_format" in text or "json_object" in text:
                messages[0]["content"] += "\n\nRespond with a single valid JSON object and nothing else."
                resp = _create(json_mode=False)
            else:
                raise
        return resp.choices[0].message.content or ""

    # -------------------------------------------------------------- anthropic
    def _complete_anthropic(self, system: str, user: str) -> str:
        if self._client is None:
            from anthropic import Anthropic

            self._client = Anthropic(api_key=self.api_key, timeout=90)

        resp = self._client.messages.create(
            model=self.model,
            max_tokens=8192,
            system=system + "\n\nRespond with a single valid JSON object and nothing else — no prose, no markdown fences.",
            messages=[{"role": "user", "content": user}],
        )
        return "".join(getattr(block, "text", "") for block in resp.content)

    # -------------------------------------------------------------- json guard
    @staticmethod
    def _safe_json(raw: str) -> Dict[str, Any]:
        try:
            return json.loads(raw)
        except Exception:  # noqa: BLE001
            pass
        cleaned = re.sub(r"^```(?:json)?|```$", "", raw.strip(), flags=re.MULTILINE).strip()
        try:
            return json.loads(cleaned)
        except Exception:  # noqa: BLE001
            pass
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except Exception:  # noqa: BLE001
                pass
        return {"_parse_error": True, "raw": raw}
