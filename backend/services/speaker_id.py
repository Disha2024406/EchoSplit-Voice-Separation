"""Speaker identification (ECAPA-TDNN scaffold)."""
from __future__ import annotations

import logging
from typing import Any, Dict, List

from core.config import settings

log = logging.getLogger("echosplit.speaker_id")


class SpeakerIdentificationService:
    """Assigns identity confidence to separated speakers.

    Real-model path uses ECAPA-TDNN embeddings + cosine similarity against a
    known-speaker DB. The scaffold assigns high confidence based on the
    amount of speech attributed to each speaker.
    """

    def __init__(self) -> None:
        self.model_name = settings.ECAPA_MODEL

    async def identify(self, speakers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not speakers:
            return []
        total = sum(s.get("duration_seconds", 0.0) for s in speakers) or 1.0
        for sp in speakers:
            share = sp.get("duration_seconds", 0.0) / total
            # More airtime → higher identification confidence (bounded 0.7–0.97)
            sp["confidence"] = round(0.70 + 0.27 * share, 2)
        return speakers
