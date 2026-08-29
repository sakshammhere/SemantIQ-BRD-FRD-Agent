# backend never holds a service_role key -- forwards the user's own supabase token
# on every request so it goes thru the same RLS policies the browser already has
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
        # supabase client authed as this user, so rls applies
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
