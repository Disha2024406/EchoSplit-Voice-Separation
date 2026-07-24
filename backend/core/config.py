"""EchoSplit configuration loaded from environment."""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")


class Settings:
    MONGO_URL: str = os.environ["MONGO_URL"]
    DB_NAME: str = os.environ["DB_NAME"]
    CORS_ORIGINS: str = os.environ.get("CORS_ORIGINS", "*")

    EMERGENT_LLM_KEY: str = os.environ["EMERGENT_LLM_KEY"]

    JWT_SECRET: str = os.environ["JWT_SECRET"]
    JWT_ALGORITHM: str = os.environ.get("JWT_ALGORITHM", "HS256")
    JWT_EXPIRES_MIN: int = int(os.environ.get("JWT_EXPIRES_MIN", "10080"))

    STORAGE_DIR: Path = Path(os.environ.get("STORAGE_DIR", "/app/backend/storage"))
    UPLOADS_DIR: Path = STORAGE_DIR / "uploads"
    OUTPUTS_DIR: Path = STORAGE_DIR / "outputs"

    ALLOWED_AUDIO = {"mp3", "wav", "flac", "m4a"}
    ALLOWED_VIDEO = {"mp4", "mov", "mkv", "avi"}

    # Models (structural — real weights loaded when GPU/ local pipeline enabled)
    SEPFORMER_MODEL = "speechbrain/sepformer-whamr"
    ECAPA_MODEL = "speechbrain/spkrec-ecapa-voxceleb"
    WHISPER_LOCAL_MODEL = "large-v3"
    FLAN_T5_MODEL = "google/flan-t5-large"
    NLLB_MODEL = "facebook/nllb-200-distilled-600M"

    # Cloud fallbacks (via Emergent Universal LLM key)
    CLOUD_STT_MODEL = "whisper-1"
    CLOUD_SUMMARY_PROVIDER = "anthropic"
    CLOUD_SUMMARY_MODEL = "claude-sonnet-4-5-20250929"
    CLOUD_TRANSLATE_PROVIDER = "gemini"
    CLOUD_TRANSLATE_MODEL = "gemini-2.5-flash"


settings = Settings()
settings.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
settings.OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
