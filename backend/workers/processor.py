"""Background worker: schedules pipeline runs via asyncio tasks."""
from __future__ import annotations

import asyncio
import logging
from pathlib import Path

from pipeline.orchestrator import orchestrator

log = logging.getLogger("echosplit.worker")


async def process_job_async(job_id: str, file_path: Path, media_type: str) -> None:
    try:
        await orchestrator.run(job_id, file_path, media_type)
    except Exception as e:
        log.exception("Worker error on job %s: %s", job_id, e)


def spawn(job_id: str, file_path: Path, media_type: str) -> None:
    """Schedules pipeline in the running event loop."""
    asyncio.create_task(process_job_async(job_id, file_path, media_type))
