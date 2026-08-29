# read-only snowflake connector, needs account/user/password/warehouse/database/schema (role optional)
from __future__ import annotations

from typing import Any, Dict, List

REQUIRED_FIELDS = ["account", "user", "password", "warehouse", "database", "schema"]


def _connect(config: Dict[str, Any]):
    import snowflake.connector

    return snowflake.connector.connect(
        account=config["account"],
        user=config["user"],
        password=config["password"],
        warehouse=config.get("warehouse") or None,
        database=config.get("database") or None,
        schema=config.get("schema") or None,
        role=config.get("role") or None,
        login_timeout=15,
        network_timeout=20,
    )


def test_connection(config: Dict[str, Any]) -> None:
    conn = _connect(config)
    try:
        cur = conn.cursor()
        cur.execute("select current_version()")
        cur.fetchone()
    finally:
        conn.close()


def fetch_schema(config: Dict[str, Any]) -> List[Dict[str, str]]:
    conn = _connect(config)
    try:
        cur = conn.cursor()
        cur.execute(
            "select table_name, column_name, data_type "
            "from information_schema.columns "
            "where table_schema = %s "
            "order by table_name, ordinal_position",
            (config.get("schema", "PUBLIC"),),
        )
        rows = cur.fetchall()
        return [{"table": r[0], "column": r[1], "type": r[2]} for r in rows]
    finally:
        conn.close()
