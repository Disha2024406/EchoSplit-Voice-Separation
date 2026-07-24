"""Job endpoints: upload, status, results, translate, downloads."""
from __future__ import annotations

import io
import json
import logging
import uuid
from pathlib import Path
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from fastapi.responses import FileResponse, Response, StreamingResponse

from core.config import settings
from core.database import jobs_col
from core.security import get_current_user, require_user
from models.job import JobDoc, PIPELINE_STAGES
from schemas.job import JobSummary, TranslateRequest
from services.translation import SUPPORTED_LANGUAGES, TranslationService
from utils.audio import guess_media_type
from workers.processor import spawn

log = logging.getLogger("echosplit.jobs")
router = APIRouter(prefix="/jobs", tags=["jobs"])

_translator = TranslationService()


def _ext_ok(filename: str) -> bool:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return ext in settings.ALLOWED_AUDIO or ext in settings.ALLOWED_VIDEO


def _clean(doc: dict) -> dict:
    doc.pop("_id", None)
    return doc


@router.get("/languages")
async def languages():
    return {"languages": [{"code": k, "name": v} for k, v in SUPPORTED_LANGUAGES.items()]}


@router.get("/stages")
async def stages():
    return {"stages": PIPELINE_STAGES}


@router.post("", response_model=dict)
async def create_job(
    file: UploadFile = File(...),
    guest_token: Optional[str] = Form(default=None),
    user=Depends(get_current_user),
):
    if not file.filename or not _ext_ok(file.filename):
        raise HTTPException(status_code=400, detail="Unsupported file type")

    ext = file.filename.rsplit(".", 1)[-1].lower()
    media_type = guess_media_type(file.filename)

    file_id = str(uuid.uuid4())
    stored_name = f"{file_id}.{ext}"
    dest = settings.UPLOADS_DIR / stored_name

    data = await file.read()
    dest.write_bytes(data)
    size = len(data)

    job = JobDoc(
        filename=file.filename,
        file_size=size,
        media_type=media_type,
        source_url=f"/api/files/uploads/{stored_name}",
        owner_id=user["id"] if user else None,
        guest_token=(None if user else (guest_token or str(uuid.uuid4()))),
        current_stage="uploading",
        status="processing",
        stage_progress={s: "pending" for s in PIPELINE_STAGES},
    )
    doc = job.model_dump()
    await jobs_col.insert_one(doc)

    spawn(job.id, dest, media_type)

    return {
        "id": job.id,
        "guest_token": job.guest_token,
        "status": job.status,
        "source_url": job.source_url,
    }


@router.get("/{job_id}")
async def get_job(job_id: str, guest_token: Optional[str] = None, user=Depends(get_current_user)):
    query = {"id": job_id}
    doc = await jobs_col.find_one(query, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Job not found")

    if doc.get("owner_id"):
        if not user or user["id"] != doc["owner_id"]:
            raise HTTPException(status_code=403, detail="Not authorized")
    else:
        if guest_token and doc.get("guest_token") != guest_token:
            # allow read anyway if no token was set, otherwise reject
            raise HTTPException(status_code=403, detail="Invalid guest token")
    return doc


@router.get("", response_model=list)
async def list_jobs(guest_token: Optional[str] = None, user=Depends(get_current_user)):
    if user:
        cursor = jobs_col.find({"owner_id": user["id"]}, {"_id": 0}).sort("created_at", -1).limit(200)
    elif guest_token:
        cursor = jobs_col.find({"guest_token": guest_token}, {"_id": 0}).sort("created_at", -1).limit(50)
    else:
        return []
    return [d async for d in cursor]


@router.delete("/{job_id}")
async def delete_job(job_id: str, guest_token: Optional[str] = None, user=Depends(get_current_user)):
    doc = await jobs_col.find_one({"id": job_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Job not found")
    if doc.get("owner_id"):
        if not user or user["id"] != doc["owner_id"]:
            raise HTTPException(status_code=403, detail="Not authorized")
    else:
        if doc.get("guest_token") and doc.get("guest_token") != guest_token:
            raise HTTPException(status_code=403, detail="Invalid guest token")
    await jobs_col.delete_one({"id": job_id})
    return {"deleted": True}


@router.post("/{job_id}/translate")
async def translate(job_id: str, body: TranslateRequest, guest_token: Optional[str] = None, user=Depends(get_current_user)):
    doc = await jobs_col.find_one({"id": job_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Job not found")
    if doc.get("owner_id") and (not user or user["id"] != doc["owner_id"]):
        raise HTTPException(status_code=403, detail="Not authorized")
    if not doc.get("owner_id") and guest_token and doc.get("guest_token") != guest_token:
        raise HTTPException(status_code=403, detail="Invalid guest token")

    source = doc.get("summary") or doc.get("transcript") or ""
    if not source:
        raise HTTPException(status_code=400, detail="Nothing to translate yet")
    translated = await _translator.translate(source, body.lang_code)
    await jobs_col.update_one(
        {"id": job_id},
        {"$set": {f"translations.{body.lang_code}": translated}},
    )
    return {"lang_code": body.lang_code, "text": translated}


# ---------- Downloads ----------
@router.get("/{job_id}/download/transcript.txt")
async def download_transcript(job_id: str):
    doc = await jobs_col.find_one({"id": job_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Job not found")
    text = doc.get("transcript") or ""
    return Response(
        content=text,
        media_type="text/plain",
        headers={"Content-Disposition": f'attachment; filename="{job_id}-transcript.txt"'},
    )


@router.get("/{job_id}/download/results.json")
async def download_results_json(job_id: str):
    doc = await jobs_col.find_one({"id": job_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Job not found")
    payload = json.dumps(doc, indent=2, default=str)
    return Response(
        content=payload,
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{job_id}-results.json"'},
    )


@router.get("/{job_id}/download/summary.pdf")
async def download_summary_pdf(job_id: str):
    """Produces a minimal, valid PDF containing the summary text (no external deps)."""
    doc = await jobs_col.find_one({"id": job_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Job not found")
    title = f"EchoSplit Summary — {doc.get('filename', 'audio')}"
    summary = (doc.get("summary") or "").strip() or "No summary generated yet."
    pdf_bytes = _tiny_pdf(title, summary)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{job_id}-summary.pdf"'},
    )


def _pdf_escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _tiny_pdf(title: str, body: str) -> bytes:
    """Builds a very small single-page PDF using Helvetica core font."""
    lines = [title, ""]
    for para in body.split("\n"):
        # naive line wrapping ~ 88 chars
        while len(para) > 88:
            cut = para.rfind(" ", 0, 88)
            if cut <= 0:
                cut = 88
            lines.append(para[:cut])
            para = para[cut:].lstrip()
        lines.append(para)

    content_stream_lines = ["BT", "/F1 12 Tf", "50 780 Td", "14 TL"]
    for i, ln in enumerate(lines[:60]):
        content_stream_lines.append(f"({_pdf_escape(ln)}) Tj")
        content_stream_lines.append("T*")
    content_stream_lines.append("ET")
    content = "\n".join(content_stream_lines).encode("latin-1", errors="replace")

    objs = []
    objs.append(b"<< /Type /Catalog /Pages 2 0 R >>")
    objs.append(b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>")
    objs.append(
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
        b"/Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>"
    )
    objs.append(b"<< /Length " + str(len(content)).encode() + b" >>\nstream\n" + content + b"\nendstream")
    objs.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")

    out = io.BytesIO()
    out.write(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = []
    for i, body in enumerate(objs, start=1):
        offsets.append(out.tell())
        out.write(f"{i} 0 obj\n".encode())
        out.write(body)
        out.write(b"\nendobj\n")
    xref_start = out.tell()
    out.write(f"xref\n0 {len(objs) + 1}\n".encode())
    out.write(b"0000000000 65535 f \n")
    for off in offsets:
        out.write(f"{off:010d} 00000 n \n".encode())
    out.write(b"trailer\n")
    out.write(f"<< /Size {len(objs) + 1} /Root 1 0 R >>\n".encode())
    out.write(f"startxref\n{xref_start}\n%%EOF".encode())
    return out.getvalue()
