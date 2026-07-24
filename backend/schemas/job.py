"""Job schemas."""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class JobSummary(BaseModel):
    id: str
    filename: str
    status: str
    current_stage: str
    created_at: str
    duration_seconds: float = 0.0
    speaker_count: int = 0


class TranslateRequest(BaseModel):
    lang_code: str


class TranslateResponse(BaseModel):
    lang_code: str
    text: str
