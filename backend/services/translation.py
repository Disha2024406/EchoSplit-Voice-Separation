"""Translation service.

Real-model path: NLLB-200 local. Cloud fallback: Gemini 2.5 Flash via
emergentintegrations LlmChat.
"""
from __future__ import annotations

import logging
import uuid

from emergentintegrations.llm.chat import LlmChat, UserMessage

from core.config import settings

log = logging.getLogger("echosplit.translation")

SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "bn": "Bengali",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "ja": "Japanese",
    "zh": "Chinese (Simplified)",
    "ar": "Arabic",
    "ru": "Russian",
    "ta": "Tamil",
    "te": "Telugu",
    "ml": "Malayalam",
    "mr": "Marathi",
    "ur": "Urdu",
}


class TranslationService:
    def __init__(self) -> None:
        self.provider = settings.CLOUD_TRANSLATE_PROVIDER
        self.model = settings.CLOUD_TRANSLATE_MODEL

    async def translate(self, text: str, lang_code: str) -> str:
        if not text or not text.strip():
            return ""
        if lang_code not in SUPPORTED_LANGUAGES:
            raise ValueError(f"Unsupported language: {lang_code}")
        target = SUPPORTED_LANGUAGES[lang_code]
        system = (
            f"You are a professional translator. Translate the user's text to {target}. "
            "Preserve meaning, tone, and paragraph structure. Return only the translation."
        )
        chat = (
            LlmChat(
                api_key=settings.EMERGENT_LLM_KEY,
                session_id=f"translate-{lang_code}-{uuid.uuid4()}",
                system_message=system,
            )
            .with_model(self.provider, self.model)
        )
        try:
            reply = await chat.send_message(UserMessage(text=text[:8000]))
            return (reply or "").strip()
        except Exception as e:
            log.exception("Translation to %s failed: %s", lang_code, e)
            raise
