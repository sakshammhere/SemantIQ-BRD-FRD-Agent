# fastapi entrypoint, run w/ uvicorn main:app --reload --port 8000
from __future__ import annotations

import os

try:
    from dotenv import load_dotenv

    load_dotenv()
except Exception:  # noqa: BLE001 - python-dotenv optional; env may be set another way
    pass

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router

app = FastAPI(title="SemantIQ API", version="0.1.0")

_origins = [o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "http://localhost:4173").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

app.include_router(router)


@app.get("/")
def root() -> dict:
    return {"service": "SemantIQ API", "status": "ok"}
