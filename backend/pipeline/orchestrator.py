"""Pipeline orchestrator: runs each stage sequentially and updates job progress."""
from __future__ import annotations

import asyncio
import logging
import time
from pathlib import Path
from typing import List

from core.config import settings
from core.database import jobs_col
from models.job import PIPELINE_STAGES
from services.transcription import TranscriptionService
from services.separation import SpeakerSeparationService
from services.speaker_id import SpeakerIdentificationService
from services.summarization import SummarizationService
from services.translation import TranslationService, SUPPORTED_LANGUAGES
from utils.audio import wav_duration_seconds

log = logging.getLogger("echosplit.pipeline")


class PipelineOrchestrator:
    def __init__(self) -> None:
        self.transcription = TranscriptionService()
        self.separation = SpeakerSeparationService()
        self.speaker_id = SpeakerIdentificationService()
        self.summary = SummarizationService()
        self.translation = TranslationService()

    async def _set_stage(self, job_id: str, stage: str, state: str, **extra) -> None:
        update = {
            f"stage_progress.{stage}": state,
            "current_stage": stage,
            "updated_at": _now_iso(),
        }
        update.update(extra)
        await jobs_col.update_one({"id": job_id}, {"$set": update})

    async def run(self, job_id: str, file_path: Path, media_type: str) -> None:
        started = time.time()
        try:
            # 1. Upload marker
            await self._set_stage(job_id, "uploading", "done")

            # 2. Extract audio (video → audio). Scaffold: use file directly.
            await self._set_stage(job_id, "extract_audio", "running")
            duration = wav_duration_seconds(file_path) or 0.0
            await self._set_stage(
                job_id,
                "extract_audio",
                "done",
                duration_seconds=duration,
            )

            # 3+5. Speech recognition (needed before separation to diarize).
            await self._set_stage(job_id, "speech_recognition", "running")
            stt = await self.transcription.transcribe(file_path)
            segments = stt["segments"] or []
            transcript = stt["text"] or ""
            await self._set_stage(
                job_id,
                "speech_recognition",
                "done",
                transcript=transcript,
                transcript_segments=segments,
            )

            # 4. Speaker separation
            await self._set_stage(job_id, "speaker_separation", "running")
            speakers = await self.separation.separate(file_path, segments, job_id)
            await self._set_stage(
                job_id,
                "speaker_separation",
                "done",
                speakers=speakers,
            )

            # 6. Speaker identification (confidence)
            await self._set_stage(job_id, "speaker_identification", "running")
            speakers = await self.speaker_id.identify(speakers)
            await self._set_stage(
                job_id,
                "speaker_identification",
                "done",
                speakers=speakers,
            )

            # 7. Transcript generation (already generated; mark done)
            await self._set_stage(job_id, "transcript_generation", "done")

            # 8. Summary
            await self._set_stage(job_id, "ai_summary", "running")
            summary_text = await self.summary.summarize(transcript) if transcript else ""
            await self._set_stage(job_id, "ai_summary", "done", summary=summary_text)

            # 9. Default translation (English) so results page has something.
            await self._set_stage(job_id, "translation", "running")
            default_translation = ""
            if summary_text:
                try:
                    default_translation = await self.translation.translate(summary_text, "en")
                except Exception as e:
                    log.warning("Default translation failed: %s", e)
            await self._set_stage(
                job_id,
                "translation",
                "done",
                translations={"en": default_translation or summary_text},
            )

            # 10. Done
            await self._set_stage(
                job_id,
                "results",
                "done",
                status="done",
                processing_ms=int((time.time() - started) * 1000),
                model_info={
                    "separation": self.separation.model_name,
                    "speaker_id": self.speaker_id.model_name,
                    "stt_local": settings.WHISPER_LOCAL_MODEL,
                    "stt_cloud": settings.CLOUD_STT_MODEL,
                    "summary": settings.CLOUD_SUMMARY_MODEL,
                    "translation": settings.CLOUD_TRANSLATE_MODEL,
                    "summary_local": settings.FLAN_T5_MODEL,
                    "translation_local": settings.NLLB_MODEL,
                },
            )
            log.info("Job %s complete in %.2fs", job_id, time.time() - started)
        except Exception as e:
            log.exception("Pipeline failed for job %s", job_id)
            await jobs_col.update_one(
                {"id": job_id},
                {
                    "$set": {
                        "status": "failed",
                        "error": str(e),
                        f"stage_progress.{await _current(job_id) or 'results'}": "error",
                        "updated_at": _now_iso(),
                    }
                },
            )


def _now_iso() -> str:
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()


async def _current(job_id: str) -> str:
    doc = await jobs_col.find_one({"id": job_id}, {"current_stage": 1, "_id": 0})
    return (doc or {}).get("current_stage", "results")


orchestrator = PipelineOrchestrator()
