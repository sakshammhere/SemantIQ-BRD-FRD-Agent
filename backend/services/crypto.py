# encrypts secrets at rest (llm keys, platform creds) before they hit supabase.
# key comes from ENCRYPTION_KEY env var in prod, or an auto-generated .enc_key file locally
from __future__ import annotations

import os
from typing import Optional

_KEY_FILE = os.environ.get("ENCRYPTION_KEY_FILE", ".enc_key")


def _load_key() -> Optional[bytes]:
    env = (os.environ.get("ENCRYPTION_KEY", "") or "").strip()
    if env:
        return env.encode("utf-8")
    try:
        if os.path.exists(_KEY_FILE):
            with open(_KEY_FILE, "rb") as fh:
                data = fh.read().strip()
                return data or None
    except Exception:  # noqa: BLE001
        pass
    return None


def _ensure_key() -> Optional[bytes]:
    key = _load_key()
    if key:
        return key
    from cryptography.fernet import Fernet

    key = Fernet.generate_key()
    try:
        with open(_KEY_FILE, "wb") as fh:
            fh.write(key)
        try:
            os.chmod(_KEY_FILE, 0o600)
        except Exception:  # noqa: BLE001 - chmod unsupported on some platforms
            pass
    except Exception:  # noqa: BLE001 - still usable this process even if not persisted
        pass
    return key


def encrypt(plaintext: str) -> str:
    if not plaintext:
        return ""
    from cryptography.fernet import Fernet

    key = _ensure_key()
    if not key:
        raise RuntimeError("No encryption key available")
    return Fernet(key).encrypt(plaintext.encode("utf-8")).decode("ascii")


def decrypt(token: str) -> str:
    if not token:
        return ""
    try:
        from cryptography.fernet import Fernet

        key = _ensure_key()
        if not key:
            return ""
        return Fernet(key).decrypt(token.encode("ascii")).decode("utf-8")
    except Exception:  # noqa: BLE001 - wrong key / corrupt data: don't leak, don't crash
        return ""
