"""Dashboard/statistics endpoints (require auth)."""
from __future__ import annotations

from fastapi import APIRouter, Depends

from core.database import jobs_col
from core.security import require_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
async def stats(user=Depends(require_user)):
    owner_id = user["id"]
    cursor = jobs_col.find(
        {"owner_id": owner_id},
        {"_id": 0, "duration_seconds": 1, "processing_ms": 1, "status": 1, "created_at": 1},
    )
    docs = [d async for d in cursor]
    total_files = len(docs)
    total_minutes = round(sum(d.get("duration_seconds", 0.0) for d in docs) / 60.0, 2)
    completed = [d for d in docs if d.get("status") == "done"]
    avg_ms = int(sum(d.get("processing_ms", 0) for d in completed) / len(completed)) if completed else 0
    recent = sorted(docs, key=lambda d: d.get("created_at", ""), reverse=True)[:5]
    return {
        "files_processed": total_files,
        "minutes_processed": total_minutes,
        "average_processing_ms": avg_ms,
        "recent": recent,
    }
