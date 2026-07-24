"""EchoSplit FastAPI entrypoint."""
import logging
import sys
from pathlib import Path

# Ensure `backend` is on the path so `from core...` works under uvicorn.
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi import APIRouter, FastAPI
from starlette.middleware.cors import CORSMiddleware

from api.auth import router as auth_router
from api.dashboard import router as dashboard_router
from api.files import router as files_router
from api.jobs import router as jobs_router
from core.config import settings
from core.database import ensure_indexes

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("echosplit")

app = FastAPI(title="EchoSplit API", version="0.1.0")

api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {
        "name": "EchoSplit API",
        "version": "0.1.0",
        "status": "ok",
    }


@api_router.get("/health")
async def health():
    return {"status": "ok"}


api_router.include_router(auth_router)
api_router.include_router(jobs_router)
api_router.include_router(dashboard_router)
api_router.include_router(files_router)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=settings.CORS_ORIGINS.split(",") if settings.CORS_ORIGINS != "*" else ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def _startup() -> None:
    try:
        await ensure_indexes()
        logger.info("MongoDB indexes ensured")
    except Exception as e:
        logger.warning("Index creation failed: %s", e)
    logger.info("EchoSplit API ready — storage=%s", settings.STORAGE_DIR)


@app.on_event("shutdown")
async def _shutdown() -> None:
    logger.info("EchoSplit API shutting down")
