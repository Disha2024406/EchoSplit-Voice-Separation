"""Speech-to-text service.

Real-model path: Faster-Whisper Large-v3 (local, GPU/CPU) — configured via
`Settings.WHISPER_LOCAL_MODEL`. Cloud fallback used in this environment:
OpenAI whisper-1 via the Emergent Universal LLM key.
"""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Any, Dict

from emergentintegrations.llm.openai.speech_to_text import OpenAISpeechToText

from core.config import settings

log = logging.getLogger("echosplit.transcription")

_SUPPORTED_STT_EXT = {"mp3", "mp4", "mpeg", "mpga", "m4a", "wav", "webm"}


class TranscriptionService:
    """Structured service; swap `.transcribe()` body for Faster-Whisper local."""

    def __init__(self) -> None:
        self.provider = "openai-whisper-1"
        self.local_model = settings.WHISPER_LOCAL_MODEL
        self._client = OpenAISpeechToText(api_key=settings.EMERGENT_LLM_KEY)

    async def transcribe(self, audio_path: Path) -> Dict[str, Any]:
        ext = audio_path.suffix.lower().lstrip(".")
        if ext not in _SUPPORTED_STT_EXT:
            log.warning("Extension %s not supported by cloud whisper; skipping", ext)
            return {"text": "", "segments": [], "language": "unknown"}
        try:
            with open(audio_path, "rb") as f:
                result = await self._client.transcribe(
                    file=f,
                    model=settings.CLOUD_STT_MODEL,
                    response_format="verbose_json",
                    timestamp_granularities=["segment"],
                )
        except Exception as e:
            log.exception("Whisper transcription failed: %s", e)
            raise

        if isinstance(result, dict):
            text = result.get("text", "")
            segments = result.get("segments", []) or []
            language = result.get("language", "en")
        else:
            text = getattr(result, "text", "") or ""
            segments = getattr(result, "segments", []) or []
            language = getattr(result, "language", "en")

        return {"text": text, "segments": segments, "language": language}
