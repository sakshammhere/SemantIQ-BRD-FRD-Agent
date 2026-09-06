"""Read-only Databricks (Unity Catalog / SQL warehouse) connector.

Required config fields: server_hostname, http_path, access_token.
Optional: catalog (default "main"), schema (default "default").
"""
from __future__ import annotations

import re
from typing import Any, Dict, List

REQUIRED_FIELDS = ["server_hostname", "http_path", "access_token"]

_SAFE_IDENTIFIER = re.compile(r"^[A-Za-z0-9_]+$")


def _safe_identifier(value: str, field_name: str) -> str:
    if not _SAFE_IDENTIFIER.match(value):
        raise ValueError(f"Invalid {field_name} — only letters, numbers, and underscores are allowed.")
    return value


def _connect(config: Dict[str, Any]):
    from databricks import sql

    return sql.connect(
        server_hostname=config["server_hostname"],
        http_path=config["http_path"],
        access_token=config["access_token"],
    )


def test_connection(config: Dict[str, Any]) -> None:
    conn = _connect(config)
    try:
        cur = conn.cursor()
        cur.execute("select 1")
        cur.fetchone()
    finally:
        conn.close()


def fetch_schema(config: Dict[str, Any]) -> List[Dict[str, str]]:
    catalog = _safe_identifier(config.get("catalog") or "main", "catalog")
    schema = _safe_identifier(config.get("schema") or "default", "schema")
    conn = _connect(config)
    try:
        cur = conn.cursor()
        cur.execute(
            f"select table_name, column_name, data_type "
            f"from {catalog}.information_schema.columns "
            f"where table_schema = %(schema)s "
            f"order by table_name, ordinal_position",
            {"schema": schema},
        )
        rows = cur.fetchall()
        return [{"table": r[0], "column": r[1], "type": r[2]} for r in rows]
    finally:
        conn.close()
