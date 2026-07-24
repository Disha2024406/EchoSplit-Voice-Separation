"""Job document model."""
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, ConfigDict


PIPELINE_STAGES = [
    "uploading",
    "extract_audio",
    "speaker_separation",
    "speaker_identification",
    "speech_recognition",
    "transcript_generation",
    "ai_summary",
    "translation",
    "results",
]


class Speaker(BaseModel):
    label: str
    confidence: float
    audio_url: Optional[str] = None
    duration_seconds: float = 0.0
    utterances: List[Dict[str, Any]] = Field(default_factory=list)


class JobDoc(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    owner_id: Optional[str] = None       # user id or None for guests
    guest_token: Optional[str] = None    # random token so guests can list their own

    filename: str
    file_size: int = 0
    media_type: str = "audio"            # "audio" | "video"
    source_url: Optional[str] = None

    status: str = "queued"               # queued | processing | done | failed
    current_stage: str = "uploading"
    stage_progress: Dict[str, str] = Field(default_factory=dict)  # stage -> "pending|running|done|error"
    error: Optional[str] = None

    speakers: List[Speaker] = Field(default_factory=list)
    transcript: Optional[str] = None
    transcript_segments: List[Dict[str, Any]] = Field(default_factory=list)
    summary: Optional[str] = None
    translations: Dict[str, str] = Field(default_factory=dict)  # lang_code -> text

    duration_seconds: float = 0.0
    processing_ms: int = 0
    model_info: Dict[str, str] = Field(default_factory=dict)

    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
