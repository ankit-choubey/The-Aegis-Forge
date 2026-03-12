# Aegis Forge

Aegis Forge is a full-stack AI interview simulation platform with:
- a FastAPI backend for resume intake, orchestration, and artifact delivery,
- a LiveKit multi-agent runtime for real-time voice interviews,
- a Next.js frontend for recruiter, candidate, interview, and reporting flows.

## What The Project Does

Aegis Forge runs a structured technical interview pipeline:
1. Candidate resume is uploaded and validated.
2. Skills/claims are analyzed and mapped to a role scenario.
3. A LiveKit room is created and an AI interviewer agent is dispatched.
4. Multi-agent interview runs in real time (voice + event telemetry).
5. FSIR artifacts (JSON/PDF), Q&A logs, and feedback report are generated.

## Core Architecture

### 1) API Gateway (FastAPI)
Main file: `backend/main.py`

Responsibilities:
- Resume upload and validation
- Candidate auth/session bootstrap
- LiveKit room/token/dispatch coordination
- Focus-topic and role override controls for recruiters
- MediaPipe telemetry ingestion
- Report/Q&A/feedback download endpoints

### 2) Interview Agent Runtime (LiveKit Agents)
Main file: `app/main.py`

Registered agent: `aegis-interviewer`

Participating agent roles:
- Incident Lead (primary interviewer)
- Pressure Agent (stress/interruption dynamics)
- Observer Agent (evaluation and DQI inputs)
- Mole Agent (integrity tests)
- Governor Agent (safety checks)
- Crisis Popup Agent (timed crisis injections)

Runtime stack:
- STT: Deepgram
- LLM: Groq
- TTS: Deepgram
- Optional avatar stream: Simli

### 3) Knowledge and Scenario Layer
- `backend/funnel/pipeline.py`: singleton knowledge engine for resume context, focus topics, and market intel
- `backend/funnel/pathway_engine.py`: Pathway-backed document indexing/retrieval helpers
- `app/rag/scenarios.json`: scenario definitions
- `app/rag/scenarios.py`: scenario loader

### 4) Frontend (Next.js App Router)
Root: `frontend/`

Major routes:
- `/` landing
- `/candidate` candidate login
- `/dashboard` candidate onboarding + resume flow
- `/recruiter` recruiter control panel
- `/interview/room` live interview room
- `/monitor/[roomId]` monitoring view
- `/report/[reportId]` report view
- `/features/*` product/feature demos

## Tech Stack

### Backend
- Python
- FastAPI
- LiveKit Agents + LiveKit Server SDK
- Groq API
- Deepgram
- Pathway
- ReportLab
- pdfplumber (+ OCR fallbacks when installed)

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- LiveKit React Components
- Monaco Editor

## Repository Layout

```text
.
├── app/                    # LiveKit agent app and analysis modules
├── backend/                # FastAPI API and knowledge engine
├── frontend/               # Next.js frontend
├── scripts/                # Utility/debug scripts
├── tests/                  # Python test suite
├── uploads/                # Runtime-generated artifacts and candidate data
├── livekit-agents/         # Workspace package
├── livekit-plugins/        # Workspace plugins
├── pyproject.toml
├── makefile
└── README.md
```

## Prerequisites

- Python 3.11+
- Node.js 18+
- `uv` package manager
- LiveKit Cloud project (or compatible LiveKit setup)
- API keys for Groq and Deepgram

## Environment Variables

Set these in root `.env`.

### Required (backend/agent)
- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `GROQ_API_KEY`
- `DEEPGRAM_API_KEY`

### Optional
- `SIMLI_API_KEY`
- `SIMLI_FACE_ID`
- `UPLOADS_DIR` (default: `uploads`)
- `ALLOWED_ORIGINS` (comma-separated; default includes `http://localhost:3000`)

### Frontend
- `NEXT_PUBLIC_API_BASE` (recommended to point at local FastAPI, e.g. `http://localhost:8000`)
- `NEXT_PUBLIC_LIVEKIT_URL`

## Local Setup

### 1) Install Python deps
```bash
uv sync --all-extras --dev
```

### 2) Install frontend deps
```bash
cd frontend
npm install
cd ..
```

### 3) Start FastAPI backend
```bash
uvicorn backend.main:app --reload --port 8000
```

### 4) Start LiveKit agent runtime
```bash
python app/main.py dev
```
(Production-style run is also supported via LiveKit CLI modes.)

### 5) Start frontend
```bash
cd frontend
npm run dev
```

Frontend default: `http://localhost:3000`

## End-to-End Flow

1. Recruiter/candidate uploads resume (`POST /upload-resume`).
2. Backend returns `candidate_id` + generated password + audit payload.
3. Candidate authenticates (`POST /candidate-login`).
4. Recruiter optionally sets focus topics (`POST /api/set-focus-topics`) or role override (`POST /api/set-candidate-role`).
5. Session starts (`POST /start-interview`), token and room are generated, agent dispatched.
6. Interview proceeds in LiveKit room with multi-agent orchestration.
7. MediaPipe telemetry can be pushed (`POST /mediapipe-metrics`).
8. On completion, FSIR + Q&A + feedback artifacts are available for download.

## API Surface (FastAPI)

### Health and session
- `GET /`
- `POST /aegis/start`
- `GET /aegis/sessions`
- `GET /aegis/session/{session_id}`

### Candidate lifecycle
- `POST /upload-resume`
- `POST /candidate-login`
- `POST /start-interview`
- `POST /stop-interview`
- `GET /candidate/{candidate_id}`
- `GET /candidates`

### Recruiter controls
- `POST /api/set-focus-topics`
- `POST /api/set-candidate-role`

### Telemetry
- `POST /mediapipe-metrics`
- `GET /mediapipe-metrics/{candidate_id}`

### Artifacts and results
- `GET /interview-results/{candidate_id}`
- `GET /download-report/{candidate_id}`
- `GET /download-qna/{candidate_id}`
- `GET /download-feedback/{candidate_id}`

## Generated Files and Runtime Data

Primary runtime directory: `uploads/`

Common artifacts:
- `{candidate_id}_audit.json`
- `{candidate_id}_mediapipe.json`
- `focus_config.json`
- `db.json`
- `fsir_{candidate_or_session}.pdf`
- `questions_{candidate}.json`
- `feedback_{candidate}.pdf`

## Frontend Server Routes

- `GET /api/livekit/token` (token generation + optional dispatch)
- `POST /api/execute` (local code execution helper for interview coding tasks)

## Security and Operational Notes

- `frontend/app/api/execute/route.ts` runs submitted code via local shell commands; deploy only in trusted environments or remove/lock down this route.
- Candidate/session data is partially in-memory (`candidate_audits`, `mediapipe_store`) and partially persisted (`uploads/db.json`, audit files). Restarting services clears memory but login can rehydrate from disk.
- Some frontend pages contain hardcoded ngrok fallbacks; set `NEXT_PUBLIC_API_BASE` explicitly in local/dev/prod environments.

## Testing and Quality

### Make targets
```bash
make help
make check
make format
make lint
make type-check
```

### Agent verification helper
```bash
python3 scripts/verify_agents.py
```

### Python tests
```bash
uv run pytest
```

## Troubleshooting

- If agent does not join room:
  - Verify `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`.
  - Confirm `aegis-interviewer` agent is running (`python app/main.py dev`).

- If interview has no voice:
  - Check `GROQ_API_KEY` and `DEEPGRAM_API_KEY`.
  - Ensure browser mic permissions are granted.

- If frontend cannot reach backend:
  - Set `NEXT_PUBLIC_API_BASE=http://localhost:8000`.
  - Check CORS via `ALLOWED_ORIGINS`.

- If report download returns 404:
  - Confirm interview completed and artifact exists in `uploads/`.

## License

See `license.md`.
