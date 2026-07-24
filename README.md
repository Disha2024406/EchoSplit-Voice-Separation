# EchoSplit — Multi-Speaker Voice Separation Platform

A modular AI pipeline that separates speakers in an audio/video file, transcribes each voice, summarizes the conversation, and translates the summary into 15 languages.

## Stack

- **Frontend**: React (CRA), Tailwind, Shadcn UI, Framer Motion, Phosphor icons, glassmorphism dark/light theme
- **Backend**: FastAPI, MongoDB (Motor), async pipeline orchestrator, JWT auth, GitHub OAuth stub
- **AI Models (pluggable)**:
  - SepFormer (speaker separation)
  - ECAPA-TDNN (speaker identification)
  - Faster-Whisper Large-v3 (STT) with OpenAI `whisper-1` cloud fallback
  - FLAN-T5 Large (summarization) with Claude Sonnet 4.5 cloud fallback
  - NLLB-200 (translation) with Gemini 2.5 Flash cloud fallback

Cloud fallbacks are wired through the Emergent Universal LLM key so the platform is fully usable on CPU. Swap any service class under `backend/services/` with real weight loading for local GPU execution.

## Run locally

```bash
# backend
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001

# frontend
cd ../frontend
yarn
yarn start
```

Environment:

- `backend/.env`
  - `MONGO_URL` — MongoDB connection string
  - `DB_NAME` — Mongo database name
  - `EMERGENT_LLM_KEY` — Universal LLM proxy key (cloud fallbacks)
  - `JWT_SECRET`, `JWT_ALGORITHM`, `JWT_EXPIRES_MIN`
  - `STORAGE_DIR` — local upload/output directory
  - `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` *(optional)* — enables GitHub login button
- `frontend/.env`
  - `REACT_APP_BACKEND_URL` — public HTTPS URL of the FastAPI service

## Datasets

Configs for LibriMix, WHAM!, VoxCeleb1 live under `backend/datasets/*.yaml`. Data is **not** bundled — regenerate/download locally and update `root:` paths.

## Architecture

```
backend/
├── api/            # REST endpoints
├── core/           # config, DB client, security
├── models/         # Pydantic document schemas
├── schemas/        # request/response DTOs
├── services/       # per-stage AI service classes (swappable)
├── pipeline/       # orchestrator that runs 8 pipeline stages
├── workers/        # async background scheduler
├── utils/          # audio helpers
└── datasets/       # dataset configuration
```

Every AI stage is a class with a single `async` public method. Replace `services/transcription.py` with a Faster-Whisper local call and everything else keeps working.

## Guest mode

No login is required to upload, separate, transcribe, summarize, translate, and download. Guest jobs live in the browser via a `guest_token`. Sign in to unlock **Dashboard**, **History (permanent)**, and **Profile**.
