"""Audio helpers.

For the scaffold pipeline we compute basic metadata using the `wave` and
mimetypes libraries so no heavy binary deps are required. When real
SepFormer / ffmpeg pipelines are wired in, replace with pydub/torchaudio.
"""
from __future__ import annotations

import wave
from pathlib import Path
from typing import Optional


def guess_media_type(filename: str) -> str:
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext in {"mp4", "mov", "mkv", "avi", "webm"}:
        return "video"
    return "audio"


def wav_duration_seconds(path: Path) -> Optional[float]:
    try:
        with wave.open(str(path), "rb") as w:
            frames = w.getnframes()
            rate = w.getframerate()
            return frames / float(rate) if rate else None
    except Exception:
        return None
