"""Supabase access for the backend.

The backend never holds a service_role key. Every request instead forwards
the user's own Supabase access token (the same one the frontend already has
from supabase-js), so every table read/write goes through the *same* Row
Level Security policies already enforced for the browser. This keeps a
single source of truth for "who can see what" instead of duplicating it in
backend logic.
"""
from __future__ import annotations

import os
from typing import Optional

from fastapi import Header, HTTPException
from supabase import Client, create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").strip()
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", "").strip()


def configured() -> bool:
    return bool(SUPABASE_URL and SUPABASE_ANON_KEY)


def _bearer(authorization: Optional[str]) -> Optional[str]:
    if authorization and authorization.lower().startswith("bearer "):
        return authorization[7:].strip()
    return None


class CurrentUser:
    def __init__(self, id: str, email: Optional[str], token: str):
        self.id = id
        self.email = email
        self.token = token

    def client(self) -> Client:
        """A Supabase client authenticated as this user (RLS applies)."""
        client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        client.postgrest.auth(self.token)
        return client


def get_current_user(authorization: Optional[str] = Header(default=None)) -> CurrentUser:
    if not configured():
        raise HTTPException(status_code=500, detail="Backend is missing SUPABASE_URL / SUPABASE_ANON_KEY.")

    token = _bearer(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Missing or malformed Authorization header.")

    client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    try:
        result = client.auth.get_user(token)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=401, detail="Session expired or invalid. Sign in again.") from exc

    user = getattr(result, "user", None)
    if not user:
        raise HTTPException(status_code=401, detail="Session expired or invalid. Sign in again.")

    return CurrentUser(id=user.id, email=user.email, token=token)
