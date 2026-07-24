"""Summarization service.

Real-model path: FLAN-T5 Large local. Cloud fallback: Claude Sonnet 4.5
via emergentintegrations LlmChat.
"""
from __future__ import annotations

import logging
import uuid

from emergentintegrations.llm.chat import LlmChat, UserMessage

from core.config import settings

log = logging.getLogger("echosplit.summary")

_SYSTEM = (
    "You are EchoSplit's summarization engine. Produce a crisp, well-structured "
    "summary of a spoken transcript. Output plain prose (no markdown headings), "
    "3–6 short paragraphs, capturing key topics, decisions, speaker dynamics, "
    "and any action items. Keep under 220 words."
)


class SummarizationService:
    def __init__(self) -> None:
        self.provider = settings.CLOUD_SUMMARY_PROVIDER
        self.model = settings.CLOUD_SUMMARY_MODEL

    async def summarize(self, transcript: str) -> str:
        if not transcript or not transcript.strip():
            return ""
        chat = (
            LlmChat(
                api_key=settings.EMERGENT_LLM_KEY,
                session_id=f"summary-{uuid.uuid4()}",
                system_message=_SYSTEM,
            )
            .with_model(self.provider, self.model)
        )
        try:
            reply = await chat.send_message(UserMessage(text=transcript[:15000]))
            return (reply or "").strip()
        except Exception as e:
            log.exception("Summary failed: %s", e)
            raise
