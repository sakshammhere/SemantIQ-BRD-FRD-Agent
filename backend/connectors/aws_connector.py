"""Read-only AWS Glue Data Catalog connector (the metadata layer Redshift
Spectrum / Athena / Glue jobs share — reading it needs no warehouse compute).

Required config fields: aws_access_key_id, aws_secret_access_key, region, glue_database.
"""
from __future__ import annotations

from typing import Any, Dict, List

REQUIRED_FIELDS = ["aws_access_key_id", "aws_secret_access_key", "region", "glue_database"]


def _client(config: Dict[str, Any]):
    import boto3

    return boto3.client(
        "glue",
        aws_access_key_id=config["aws_access_key_id"],
        aws_secret_access_key=config["aws_secret_access_key"],
        region_name=config.get("region") or "us-east-1",
    )


def test_connection(config: Dict[str, Any]) -> None:
    client = _client(config)
    client.get_database(Name=config["glue_database"])


def fetch_schema(config: Dict[str, Any]) -> List[Dict[str, str]]:
    client = _client(config)
    paginator = client.get_paginator("get_tables")
    out: List[Dict[str, str]] = []
    for page in paginator.paginate(DatabaseName=config["glue_database"]):
        for table in page.get("TableList", []):
            table_name = table.get("Name", "")
            for col in table.get("StorageDescriptor", {}).get("Columns", []):
                out.append({"table": table_name, "column": col.get("Name", ""), "type": col.get("Type", "")})
    return out
