"""Serves uploaded/original media files under /api/files/uploads/{name}."""
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from core.config import settings

router = APIRouter(prefix="/files", tags=["files"])


@router.get("/uploads/{name}")
async def get_upload(name: str):
    safe = Path(name).name  # strip any path components
    fp = settings.UPLOADS_DIR / safe
    if not fp.exists() or not fp.is_file():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(fp)
