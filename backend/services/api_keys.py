"""Reads/writes a user's own bring-your-own LLM API keys.

Ciphertext lives in Supabase (`api_keys` table, RLS-scoped to the owner);
encryption/decryption happens only here, in the backend process.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from supabase import Client

from . import crypto

TABLE = "api_keys"


def _mask(plain: str) -> str:
    if len(plain) <= 4:
        return "••••"
    return f"{'•' * 6}{plain[-4:]}"


def save_api_key(client: Client, user_id: str, provider: str, api_key: str, model: Optional[str]) -> Dict[str, Any]:
    ciphertext = crypto.encrypt(api_key)
    row = {
        "user_id": user_id,
        "provider": provider,
        "model": model,
        "key_ciphertext": ciphertext,
    }
    result = client.table(TABLE).upsert(row, on_conflict="user_id,provider").execute()
    saved = result.data[0] if result.data else row
    return {"provider": provider, "model": saved.get("model"), "masked_key": _mask(api_key)}


def list_api_keys(client: Client) -> List[Dict[str, Any]]:
    result = client.table(TABLE).select("provider, model, key_ciphertext, updated_at").execute()
    items = []
    for row in result.data or []:
        plain = crypto.decrypt(row.get("key_ciphertext") or "")
        items.append({
            "provider": row["provider"],
            "model": row.get("model"),
            "masked_key": _mask(plain) if plain else "invalid",
            "updated_at": row.get("updated_at"),
        })
    return items


def get_decrypted_key(client: Client, provider: str) -> Optional[Dict[str, str]]:
    result = client.table(TABLE).select("model, key_ciphertext").eq("provider", provider).limit(1).execute()
    if not result.data:
        return None
    row = result.data[0]
    plain = crypto.decrypt(row.get("key_ciphertext") or "")
    if not plain:
        return None
    return {"api_key": plain, "model": row.get("model") or ""}


def delete_api_key(client: Client, provider: str) -> None:
    client.table(TABLE).delete().eq("provider", provider).execute()
