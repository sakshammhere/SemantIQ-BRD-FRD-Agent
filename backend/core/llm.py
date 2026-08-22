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


