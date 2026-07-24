"""EchoSplit backend regression tests.

Covers: health, auth (register/login/me), jobs metadata (stages/languages),
job lifecycle (upload -> poll -> results), translation, downloads (txt/json/pdf),
history listing/deletion, dashboard stats (auth-only), and GitHub OAuth status.

All tests hit the PUBLIC preview URL from frontend/.env (REACT_APP_BACKEND_URL).
"""
from __future__ import annotations

import io
import json
import os
import time
import uuid
from pathlib import Path

import pytest
import requests

# ---------- Config ----------
FRONTEND_ENV = Path("/app/frontend/.env").read_text(encoding="utf-8")
BASE_URL = None
for line in FRONTEND_ENV.splitlines():
    if line.startswith("REACT_APP_BACKEND_URL="):
        BASE_URL = line.split("=", 1)[1].strip().strip('"').rstrip("/")
        break
assert BASE_URL, "REACT_APP_BACKEND_URL not found in /app/frontend/.env"

API = f"{BASE_URL}/api"

TEST_MP3 = Path("/tmp/speech_real.mp3")  # main agent's real speech mp3 ~293KB
if not TEST_MP3.exists():
    TEST_MP3 = Path("/tmp/speech.mp3")
if not TEST_MP3.exists():
    # Fallback to any known MP3 in storage
    candidates = list(Path("/app/backend/storage/uploads").glob("*.mp3"))
    if candidates:
        TEST_MP3 = candidates[0]

# Test user
UNIQUE = uuid.uuid4().hex[:8]
TEST_EMAIL = f"qa_{UNIQUE}@echosplit.dev"
TEST_PASSWORD = "EchoSplit2026!"
TEST_NAME = "QA Tester"


# ---------- Fixtures ----------
@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    return s


@pytest.fixture(scope="session")
def registered_user(api_client):
    """Register once and return {token, email, id}."""
    r = api_client.post(
        f"{API}/auth/register",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD, "name": TEST_NAME},
        timeout=20,
    )
    if r.status_code == 400:
        # Already exists — login instead
        r = api_client.post(
            f"{API}/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            timeout=20,
        )
    assert r.status_code == 200, f"register/login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data
    assert "user" in data
    return {
        "token": data["access_token"],
        "email": data["user"]["email"],
        "id": data["user"]["id"],
        "name": data["user"]["name"],
    }


@pytest.fixture(scope="session")
def auth_headers(registered_user):
    return {"Authorization": f"Bearer {registered_user['token']}"}


@pytest.fixture(scope="session")
def guest_job(api_client):
    """Create a guest job by uploading TEST_MP3 and poll until done or timeout."""
    assert TEST_MP3.exists(), f"Missing test audio: {TEST_MP3}"
    with open(TEST_MP3, "rb") as f:
        files = {"file": (TEST_MP3.name, f, "audio/mpeg")}
        r = api_client.post(f"{API}/jobs", files=files, timeout=60)
    assert r.status_code == 200, f"create job failed: {r.status_code} {r.text}"
    data = r.json()
    assert "id" in data and "guest_token" in data
    job_id, guest_token = data["id"], data["guest_token"]

    # Poll for up to ~120s
    deadline = time.time() + 120
    status = "processing"
    last = None
    while time.time() < deadline:
        rr = api_client.get(f"{API}/jobs/{job_id}", params={"guest_token": guest_token}, timeout=20)
        assert rr.status_code == 200
        last = rr.json()
        status = last.get("status")
        if status in ("done", "failed"):
            break
        time.sleep(2)
    return {"id": job_id, "guest_token": guest_token, "doc": last, "status": status}


# =====================================================================
# 1) Health + metadata
# =====================================================================
class TestHealth:
    def test_root(self, api_client):
        r = api_client.get(f"{API}/", timeout=10)
        assert r.status_code == 200
        assert r.json().get("name") == "EchoSplit API"

    def test_health(self, api_client):
        r = api_client.get(f"{API}/health", timeout=10)
        assert r.status_code == 200
        assert r.json().get("status") == "ok"


class TestJobMetadata:
    def test_stages_order(self, api_client):
        r = api_client.get(f"{API}/jobs/stages", timeout=10)
        assert r.status_code == 200
        stages = r.json()["stages"]
        expected = [
            "uploading",
            "extract_audio",
            "speaker_separation",
            "speaker_identification",
            "speech_recognition",
            "transcript_generation",
            "ai_summary",
            "translation",
            "results",
        ]
        assert stages == expected, f"stages mismatch: {stages}"
        assert len(stages) == 9

    def test_languages_15(self, api_client):
        r = api_client.get(f"{API}/jobs/languages", timeout=10)
        assert r.status_code == 200
        langs = r.json()["languages"]
        assert len(langs) == 15
        codes = {l["code"] for l in langs}
        for required in ("en", "hi", "bn", "ta", "ur", "mr"):
            assert required in codes, f"missing language {required}"


# =====================================================================
# 2) Auth
# =====================================================================
class TestAuth:
    def test_register_login_me(self, api_client, registered_user, auth_headers):
        assert registered_user["email"] == TEST_EMAIL
        # /auth/me with token
        r = api_client.get(f"{API}/auth/me", headers=auth_headers, timeout=10)
        assert r.status_code == 200
        me = r.json()
        assert me["email"] == TEST_EMAIL
        assert me["name"] == TEST_NAME
        assert me["provider"] == "email"
        assert "id" in me

    def test_me_without_token_401(self, api_client):
        r = api_client.get(f"{API}/auth/me", timeout=10)
        assert r.status_code == 401

    def test_login_wrong_password(self, api_client):
        r = api_client.post(
            f"{API}/auth/login",
            json={"email": TEST_EMAIL, "password": "wrongpass"},
            timeout=10,
        )
        assert r.status_code == 401

    def test_register_duplicate_400(self, api_client):
        r = api_client.post(
            f"{API}/auth/register",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD, "name": TEST_NAME},
            timeout=10,
        )
        assert r.status_code == 400

    def test_github_status_not_configured(self, api_client):
        r = api_client.get(f"{API}/auth/github/status", timeout=10)
        assert r.status_code == 200
        assert r.json() == {"configured": False}


# =====================================================================
# 3) Dashboard (auth required)
# =====================================================================
class TestDashboard:
    def test_stats_requires_auth(self, api_client):
        r = api_client.get(f"{API}/dashboard/stats", timeout=10)
        assert r.status_code == 401

    def test_stats_shape(self, api_client, auth_headers):
        r = api_client.get(f"{API}/dashboard/stats", headers=auth_headers, timeout=10)
        assert r.status_code == 200
        data = r.json()
        for k in ("files_processed", "minutes_processed", "average_processing_ms", "recent"):
            assert k in data, f"missing key {k}"
        assert isinstance(data["recent"], list)


# =====================================================================
# 4) Job lifecycle (guest)
# =====================================================================
class TestJobLifecycle:
    def test_upload_and_process(self, guest_job):
        assert guest_job["status"] == "done", (
            f"pipeline did not finish (status={guest_job['status']}); "
            f"last doc: {json.dumps(guest_job['doc'], default=str)[:600]}"
        )
        doc = guest_job["doc"]
        assert doc.get("transcript"), "empty transcript"
        assert doc.get("summary"), "empty summary"
        speakers = doc.get("speakers") or []
        assert len(speakers) >= 1, "no speakers"
        # All stages should be done
        prog = doc.get("stage_progress") or {}
        for stage in [
            "uploading", "extract_audio", "speaker_separation", "speaker_identification",
            "speech_recognition", "transcript_generation", "ai_summary", "translation", "results",
        ]:
            assert prog.get(stage) == "done", f"stage {stage} = {prog.get(stage)}"

    def test_get_job_wrong_guest_token_403(self, api_client, guest_job):
        r = api_client.get(
            f"{API}/jobs/{guest_job['id']}",
            params={"guest_token": "bogus-token"},
            timeout=10,
        )
        assert r.status_code == 403

    def test_get_job_missing_404(self, api_client):
        r = api_client.get(f"{API}/jobs/does-not-exist", timeout=10)
        assert r.status_code == 404


# =====================================================================
# 5) Translation
# =====================================================================
class TestTranslation:
    def test_translate_to_hindi(self, api_client, guest_job):
        if guest_job["status"] != "done":
            pytest.skip("pipeline not done")
        r = api_client.post(
            f"{API}/jobs/{guest_job['id']}/translate",
            params={"guest_token": guest_job["guest_token"]},
            json={"lang_code": "hi"},
            timeout=60,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["lang_code"] == "hi"
        assert data.get("text"), "empty translation"
        assert len(data["text"]) > 5

        # Confirm persisted via GET
        rr = api_client.get(
            f"{API}/jobs/{guest_job['id']}",
            params={"guest_token": guest_job["guest_token"]},
            timeout=10,
        )
        assert rr.status_code == 200
        assert rr.json().get("translations", {}).get("hi")


# =====================================================================
# 6) Downloads
# =====================================================================
class TestDownloads:
    def test_download_transcript_txt(self, api_client, guest_job):
        if guest_job["status"] != "done":
            pytest.skip("pipeline not done")
        r = api_client.get(f"{API}/jobs/{guest_job['id']}/download/transcript.txt", timeout=20)
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("text/plain")
        assert len(r.text) > 0

    def test_download_results_json(self, api_client, guest_job):
        if guest_job["status"] != "done":
            pytest.skip("pipeline not done")
        r = api_client.get(f"{API}/jobs/{guest_job['id']}/download/results.json", timeout=20)
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("application/json")
        data = json.loads(r.text)
        assert data["id"] == guest_job["id"]

    def test_download_summary_pdf(self, api_client, guest_job):
        if guest_job["status"] != "done":
            pytest.skip("pipeline not done")
        r = api_client.get(f"{API}/jobs/{guest_job['id']}/download/summary.pdf", timeout=20)
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("application/pdf")
        assert r.content.startswith(b"%PDF-"), "not a valid PDF header"


# =====================================================================
# 7) History (guest listing + delete)
# =====================================================================
class TestHistory:
    def test_list_guest_jobs(self, api_client, guest_job):
        r = api_client.get(f"{API}/jobs", params={"guest_token": guest_job["guest_token"]}, timeout=15)
        assert r.status_code == 200
        arr = r.json()
        assert isinstance(arr, list)
        assert any(d.get("id") == guest_job["id"] for d in arr)

    def test_list_no_token_empty(self, api_client):
        r = api_client.get(f"{API}/jobs", timeout=10)
        assert r.status_code == 200
        assert r.json() == []

    def test_delete_own_job(self, api_client):
        # Create + delete a fresh guest job (fast — don't wait for completion)
        with open(TEST_MP3, "rb") as f:
            files = {"file": (TEST_MP3.name, f, "audio/mpeg")}
            r = api_client.post(f"{API}/jobs", files=files, timeout=60)
        assert r.status_code == 200
        job = r.json()
        rd = api_client.delete(
            f"{API}/jobs/{job['id']}",
            params={"guest_token": job["guest_token"]},
            timeout=15,
        )
        assert rd.status_code == 200
        assert rd.json().get("deleted") is True
        # Verify 404 on subsequent get
        rg = api_client.get(f"{API}/jobs/{job['id']}", timeout=10)
        assert rg.status_code == 404


if __name__ == "__main__":
    import sys
    sys.exit(pytest.main([__file__, "-v", "--tb=short"]))
