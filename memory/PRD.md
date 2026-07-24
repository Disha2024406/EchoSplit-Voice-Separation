# EchoSplit — Product Requirements Document

## Original problem statement
Build a complete, production-inspired **AI multi-speaker voice separation platform** as a university final-year project. React + Tailwind + Framer Motion frontend (glassmorphism, light/dark), FastAPI + MongoDB backend, modular AI pipeline architected around SpeechBrain SepFormer, ECAPA-TDNN, Faster-Whisper Large-v3, FLAN-T5, and NLLB-200. Guest users can process files without login; login only unlocks Dashboard/History/Profile. 15-language translation, drag-drop upload, live pipeline visualization, downloads, dataset config placeholders.

## User personas
- **Guest visitor** — wants to try voice separation on a file immediately, no signup.
- **Registered researcher** — wants dashboard, permanent history, per-account stats, saved outputs.
- **Contributing developer** — needs a modular architecture where any AI stage can be swapped for a locally-hosted model.

## User choices (as gathered)
- Database: **MongoDB**
- Frontend stack: **React CRA (JS)**
- AI pipeline: **Modular architecture + cloud LLM fallbacks via Emergent Universal Key** (Whisper for STT, Claude Sonnet 4.5 for summary, Gemini 2.5 Flash for translation)
- Auth: **JWT email/password now, GitHub OAuth later** (credentials to be provided by user)
- Scope for v1: **Build everything — all pages, pipeline, auth, dashboard.**

## Architecture

```
backend/
├── api/            REST endpoints (auth, jobs, dashboard, files)
├── core/           config, Mongo client, JWT + bcrypt
├── models/         User + Job Pydantic docs
├── schemas/        request/response DTOs
├── services/       transcription, separation, speaker_id, summarization, translation
├── pipeline/       orchestrator (runs 8 pipeline stages)
├── workers/        asyncio background scheduler
├── utils/          audio helpers
└── datasets/       LibriMix / WHAM! / VoxCeleb1 YAML configs (data not bundled)

frontend/src/
├── contexts/       Theme, Auth
├── components/     Navbar, Footer, MeshBackground, Waveform, SpeakerCard,
│                   PipelineStages, ThemeToggle
├── pages/          Home, About, Technology, Documentation, Contact, Login,
│                   Signup, Upload, Processing, Results, History, Dashboard,
│                   Profile, Privacy, Terms, NotFound
└── lib/            api client
```

## What's been implemented (2026-02-14)
- 15 pages routed with `react-router-dom`, mesh-gradient glassmorphism theme, Outfit/IBM Plex Sans/JetBrains Mono typography.
- Guest-first upload flow (no login) with drag-drop, progress bar, 25 MB limit, MIME validation.
- 8-stage animated pipeline visualizer (framer-motion), live-polled from backend job document.
- Speaker cards with waveform, confidence, per-speaker audio player, utterance list.
- Results dashboard: transcript / summary / timeline tabs, translate-to-15-languages dropdown, downloads (transcript.txt, summary.pdf hand-rolled, results.json).
- History: search / delete / reopen. Dashboard: files processed, minutes, avg processing, recent jobs. Profile with signout.
- JWT auth: register, login, `me`; bcrypt password hashing. GitHub OAuth status endpoint + disabled button when unconfigured.
- REST endpoints for all of the above; MongoDB indexes on user email + job owner_id + guest_token.
- AI service classes with cloud fallbacks via Emergent Universal LLM key:
  - `TranscriptionService` → OpenAI Whisper-1 (real speech verified)
  - `SummarizationService` → Claude Sonnet 4.5
  - `TranslationService` → Gemini 2.5 Flash
  - `SpeakerSeparationService` → heuristic diarization via Whisper turn timestamps (ready to swap for SepFormer)
  - `SpeakerIdentificationService` → duration-weighted confidence (ready to swap for ECAPA-TDNN)
- Dataset YAML configs for LibriMix, WHAM!, VoxCeleb1 + README explaining local placement.
- 21/21 pytest tests pass; frontend E2E flows validated (see `/app/test_reports/iteration_1.json`).

## Prioritized backlog
- **P1**: GitHub OAuth callback endpoints + client wiring (waiting on user-provided Client ID/Secret).
- **P1**: Real SepFormer / ECAPA-TDNN inference path (GPU deployment target).
- **P2**: Faster-Whisper local option (CTranslate2) for zero-cloud runs.
- **P2**: Enforce guest_token on GET/download endpoints to remove read-anyone-with-id concern.
- **P2**: Replace `asyncio.create_task` background scheduler with Arq/RQ for multi-worker safety.
- **P3**: FLAN-T5 and NLLB-200 local pipeline options.
- **P3**: Migrate FastAPI startup/shutdown to `lifespan` context manager.

## Next tasks
1. Collect GitHub OAuth credentials from user; wire login flow.
2. Add server-side "no speech detected" warning surface on jobs (LOW severity from test agent).
3. Documentation page: expand with local-model recipes for each AI stage.
