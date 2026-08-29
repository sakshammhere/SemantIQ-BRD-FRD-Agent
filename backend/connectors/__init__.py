# read-only target platform connectors, each just needs test_connection() + fetch_schema()
# never reads actual data, only catalog/information_schema metadata
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
