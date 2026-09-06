"""Reads/writes a user's own platform connection credentials (Snowflake,
Databricks, AWS). Same pattern as api_keys.py: ciphertext lives in Supabase
(`platform_connections` table, RLS-scoped to the owner), encryption/decryption
happens only here in the backend process. Each platform stores a small JSON
config with multiple fields (not just one key), so the whole config is
encrypted together as one blob.
"""
from __future__ import annotations

import json
from typing import Any, Dict, List, Optional

from supabase import Client

from . import crypto

TABLE = "platform_connections"

# The one field per platform that's actually sensitive — everything else
# (account, warehouse, database, region, ...) is safe to echo back plainly.
SECRET_FIELD = {
    "snowflake": "password",
    "databricks": "access_token",
    "aws": "aws_secret_access_key",
}


def _mask(plain: str) -> str:
    if not plain:
        return ""
    if len(plain) <= 4:
        return "••••"
    return f"{'•' * 6}{plain[-4:]}"


def _redacted(platform: str, config: Dict[str, Any]) -> Dict[str, Any]:
    secret_key = SECRET_FIELD.get(platform)
    out = dict(config)
    if secret_key and secret_key in out:
        out[secret_key] = _mask(str(out[secret_key]))
    return out


def save_connection(client: Client, user_id: str, platform: str, label: Optional[str], config: Dict[str, Any]) -> Dict[str, Any]:
    ciphertext = crypto.encrypt(json.dumps(config))
    row = {
        "user_id": user_id,
        "platform": platform,
        "label": label,
        "config_ciphertext": ciphertext,
    }
    result = client.table(TABLE).upsert(row, on_conflict="user_id,platform").execute()
    saved = result.data[0] if result.data else row
    return {"platform": platform, "label": saved.get("label"), "config": _redacted(platform, config)}


def list_connections(client: Client) -> List[Dict[str, Any]]:
    result = client.table(TABLE).select("platform, label, config_ciphertext, updated_at").execute()
    items = []
    for row in result.data or []:
        plain = crypto.decrypt(row.get("config_ciphertext") or "")
        try:
            config = json.loads(plain) if plain else {}
        except json.JSONDecodeError:
            config = {}
        items.append({
            "platform": row["platform"],
            "label": row.get("label"),
            "config": _redacted(row["platform"], config),
            "updated_at": row.get("updated_at"),
        })
    return items


def get_decrypted_config(client: Client, platform: str) -> Optional[Dict[str, Any]]:
    result = client.table(TABLE).select("config_ciphertext").eq("platform", platform).limit(1).execute()
    if not result.data:
        return None
    plain = crypto.decrypt(result.data[0].get("config_ciphertext") or "")
    if not plain:
        return None
    try:
        return json.loads(plain)
    except json.JSONDecodeError:
        return None


def delete_connection(client: Client, platform: str) -> None:
    client.table(TABLE).delete().eq("platform", platform).execute()
