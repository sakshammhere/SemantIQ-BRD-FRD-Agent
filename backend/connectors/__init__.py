"""Read-only connectors for real target-platform schema introspection.

Each connector exposes the same two functions:
  test_connection(config) -> None   (raises on failure)
  fetch_schema(config)    -> List[{"table": str, "column": str, "type": str}]

No data is ever read or moved — only catalog/information_schema metadata.
"""
from __future__ import annotations

from typing import Any, Callable, Dict, List

from . import aws_connector, databricks_connector, snowflake_connector

CONNECTORS: Dict[str, Any] = {
    "snowflake": snowflake_connector,
    "databricks": databricks_connector,
    "aws": aws_connector,
}


def get_connector(platform: str):
    connector = CONNECTORS.get(platform)
    if not connector:
        raise ValueError(f"Unknown platform '{platform}'.")
    return connector
