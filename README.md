<div align="center">

# 🛡️ AEGIS FORGE

### *AI-Powered Technical Interview Simulation Platform*

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16+-black.svg)](https://nextjs.org)
[![LiveKit](https://img.shields.io/badge/LiveKit-Agents-purple.svg)](https://livekit.io)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Transform your interview preparation with hyper-realistic AI simulations**

[Demo](#demo) • [Features](#features) • [Architecture](#architecture) • [Quick Start](#quick-start) • [API Reference](#api-reference) • [Contributing](#contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [The Multi-Agent System](#the-multi-agent-system)
- [RAG Pipelines](#rag-pipelines)
- [Report Generation](#report-generation)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Aegis Forge** is an AI-powered technical interview simulation platform that creates hyper-realistic interview experiences. Unlike traditional chatbot-based mock interviews, Aegis Forge uses a **multi-agent system** with 6 specialized AI agents working simultaneously to test candidates on:

- ✅ **Technical Problem-Solving** - Real incident scenarios from DevOps, AI/ML, Cybersecurity, and more
- ✅ **Pressure Handling** - Simulated stakeholder interruptions and surprise crises
- ✅ **Ethical Judgment** - Integrity tests via the "Mole Agent" that offers unethical shortcuts
- ✅ **Communication Skills** - Real-time evaluation of clarity and technical vocabulary
- ✅ **Resume Verification** - GitHub cross-validation to detect skill exaggeration

At the end, candidates receive a detailed **FSIR (Full-Spectrum Interview Report)** with actionable insights.

---

## ✨ Features

### Core Capabilities

| Feature | Description |
|:--------|:------------|
| **Real-Time Voice Interview** | Sub-second latency using Groq LLM (~200ms) + Deepgram STT/TTS |
| **Multi-Agent Simulation** | 6 AI agents (Interviewer, Pressure, Observer, Mole, Governor, Crisis) |
| **Resume Verification** | GitHub API integration to validate claimed skills |
| **Dynamic Question Generation** | Questions based on real-time market trends and candidate profile |
| **Integrity Testing** | Ethical traps to test candidate judgment under pressure |
| **Safety Monitoring** | Real-time content moderation via Governor Agent |
| **Detailed Reporting** | DQI (Decision Quality Index) scoring + PDF reports |

### Unique Differentiators

- 🎭 **Emergent Complexity** - Multiple agents create unpredictable, realistic scenarios
- 🔍 **OSINT Integration** - Verifies resume claims against public GitHub data
- ⚡ **Low Latency** - ~850ms total round-trip for natural conversation flow
- 📊 **Objective Scoring** - DQI provides quantified, comparable metrics

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                   │
│                         (Next.js + React)                               │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│   │ Resume      │  │ Interview   │  │ Code        │  │ Telemetry   │   │
│   │ Upload      │  │ Video Call  │  │ Terminal    │  │ Panel       │   │
│   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ WebRTC / HTTP
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND GATEWAY                                 │
│                           (FastAPI)                                     │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│   │ Resume      │  │ Knowledge   │  │ LiveKit     │  │ Report      │   │
│   │ Validator   │  │ Engine      │  │ Dispatch    │  │ Generator   │   │
│   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ LiveKit Protocol
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        AGENT ORCHESTRATOR                               │
│                      (LiveKit Agents Framework)                         │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                     MULTI-AGENT SYSTEM                         │   │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │   │
│   │  │ Incident │ │ Pressure │ │ Observer │ │   Mole   │          │   │
│   │  │   Lead   │ │  Agent   │ │  Agent   │ │  Agent   │          │   │
│   │  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │   │
│   │  ┌──────────┐ ┌──────────┐                                    │   │
│   │  │ Governor │ │  Crisis  │                                    │   │
│   │  │  Agent   │ │  Popup   │                                    │   │
│   │  └──────────┘ └──────────┘                                    │   │
│   └────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
        ┌──────────┐      ┌──────────┐      ┌──────────┐
        │  Groq    │      │ Deepgram │      │ GitHub   │
        │   LLM    │      │ STT/TTS  │      │   API    │
        └──────────┘      └──────────┘      └──────────┘
```

---

## 🛠️ Tech Stack

### Backend

| Technology | Purpose | Why This Choice |
|:-----------|:--------|:----------------|
| **Python 3.11+** | Core language | Async support, rich ML ecosystem |
| **FastAPI** | API Gateway | Async, auto-docs, type safety |
| **LiveKit Agents** | Agent Framework | WebRTC native, multi-modal support |
| **Groq (Llama 3.3-70b)** | LLM Inference | ~200ms latency, cost-effective |
| **Deepgram** | STT + TTS | Low latency streaming |
| **pdfplumber** | PDF Parsing | Reliable text extraction |
| **pytesseract** | OCR Fallback | Image-based PDF support |
| **ReportLab** | PDF Generation | FSIR report creation |

### Frontend

| Technology | Purpose |
|:-----------|:--------|
| **Next.js 16** | React framework with App Router |
| **Tailwind CSS** | Utility-first styling |
| **LiveKit React SDK** | WebRTC integration |
| **Monaco Editor** | Code terminal component |

### Infrastructure

| Technology | Purpose |
|:-----------|:--------|
| **LiveKit Cloud** | WebRTC media server |
| **Redis** | Session state (planned) |
| **Docker** | Containerization |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Git

### Environment Variables

Create a `.env` file in the root directory:

```bash
# LiveKit Configuration
LIVEKIT_URL=wss://your-livekit-server.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret

# AI Services
GROQ_API_KEY=your_groq_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key

# Optional
GITHUB_TOKEN=your_github_token  # For higher API rate limits
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/aegis-forge.git
cd aegis-forge

# Install Python dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd web
npm install
cd ..
```

### Running the Application

**Terminal 1: Backend API**
```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Terminal 2: Agent Server**
```bash
python -m livekit.agents dev app.main:server
```

**Terminal 3: Frontend**
```bash
cd web
npm run dev
```

Access the application at `http://localhost:3000`

---

## 📁 Project Structure

```
aegis-forge/
├── app/                          # Agent Service (LiveKit)
│   ├── agents/                   # Multi-Agent System
│   │   ├── incident_lead.py      # Main interviewer agent
│   │   ├── pressure.py           # Stakeholder stress simulator
│   │   ├── observer.py           # Silent grading agent
│   │   ├── mole.py               # Integrity testing agent
│   │   ├── governor.py           # Safety monitoring agent
│   │   ├── crisis_popup.py       # Surprise crisis generator
│   │   ├── tools.py              # Agent tools (ToggleNotepad)
│   │   ├── prompts.py            # System prompt templates
│   │   └── base.py               # Base agent class
│   ├── analysis/                 # Report Generation
│   │   ├── pipeline.py           # FSIR generator
│   │   ├── pdf_generator.py      # PDF creation
│   │   ├── dqi_calculator.py     # DQI scoring logic
│   │   └── schemas.py            # Pydantic models
│   ├── rag/                      # RAG System
│   │   ├── scenarios.json        # Interview scenarios
│   │   └── scenarios.py          # Scenario loader
│   ├── resume/                   # Resume Processing
│   │   └── loader.py             # Audit data loader
│   ├── core/                     # Core Utilities
│   │   ├── end_detector.py       # End phrase detection
│   │   └── interview_timer.py    # Session timer
│   ├── logging/                  # Audit System
│   │   └── audit_logger.py       # Event logging
│   └── main.py                   # Agent entry point
│
├── backend/                      # FastAPI Backend
│   ├── main.py                   # API endpoints
│   ├── resume_validator.py       # PDF parsing + GitHub verification
│   ├── livekit_dispatch.py       # LiveKit integration
│   └── funnel/
│       └── pipeline.py           # Knowledge Engine (Singleton)
│
├── web/                          # Next.js Frontend
│   └── src/
│       ├── app/                  # App Router pages
│       └── components/           # React components
│
├── uploads/                      # Resume storage
├── requirements.txt              # Python dependencies
└── README.md                     # This file
```

---

## 📡 API Reference

### Backend Endpoints

#### `POST /upload-resume`

Upload and validate a candidate resume.

**Request:**
```bash
curl -X POST "http://localhost:8000/upload-resume" \
  -F "file=@resume.pdf"
```

**Response:**
```json
{
  "candidate_id": "john_doe_abc123",
  "trust_score": "78%",
  "integrity_level": "Medium",
  "detected_field": "devops",
  "scenario_id": "devops-redis-latency",
  "audit": {
    "verified_skills": ["python", "docker"],
    "unverified_skills": ["kubernetes", "rust"],
    "github_repos": 23
  }
}
```

#### `POST /start-interview`

Start an interview session.

**Request:**
```json
{
  "candidate_id": "john_doe_abc123"
}
```

**Response:**
```json
{
  "room_name": "interview_john_doe_abc123",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "join_url": "wss://livekit.example.com/room?token=..."
}
```

#### `GET /download-report/{candidate_id}`

Download the FSIR report as PDF.

---

## ⚙️ Configuration

### Scenario Configuration (`app/rag/scenarios.json`)

```json
{
  "scenarios": [
    {
      "id": "devops-redis-latency",
      "domain": "DevOps",
      "title": "Redis Latency Spike",
      "difficulty": "senior",
      "context": "Production Redis cluster experiencing 500ms+ latency",
      "initial_problem": "Our Redis cluster latency jumped from 2ms to 500ms...",
      "hiring_manager_persona": {
        "name": "Sarah Chen",
        "instructions": "You are a direct, no-nonsense Engineering Manager...",
        "tone": "Assertive but fair"
      }
    }
  ]
}
```

### Adding New Scenarios

1. Add scenario object to `scenarios.json`
2. Map field to scenario in `app/resume/loader.py`:
```python
FIELD_SCENARIOS = {
    "ai_ml": "ai-model-drift",
    "cybersecurity": "security-breach",
    "your_new_field": "your-scenario-id"
}
```

---

## 🤖 The Multi-Agent System

### Agent Roles

| Agent | Role | Behavior | Timing |
|:------|:-----|:---------|:-------|
| **Incident Lead** | Main Interviewer | Drives conversation, asks questions | Continuous |
| **Pressure Agent** | Stressed Stakeholder | Random interruptions | Every 15-40 seconds |
| **Observer Agent** | Silent Grader | Evaluates each turn | Background |
| **Mole Agent** | Integrity Tester | Offers unethical shortcuts | Once at 30-60s |
| **Governor Agent** | Safety Valve | Monitors for harmful content | Continuous |
| **Crisis Popup** | Surprise Tester | Injects crisis questions | At 3min and 8min |

### Agent Communication

Agents share state via the **Knowledge Engine Singleton**:

```python
from backend.funnel.pipeline import knowledge_engine

# All agents read from shared context
context = knowledge_engine.candidate_context
market_intel = knowledge_engine.get_market_intel("devops")
```

---

## 🔗 RAG Pipelines

The system uses 3 RAG (Retrieval-Augmented Generation) pipelines:

### 1. Resume Context RAG
- **Source:** Parsed resume + GitHub audit
- **Injected Into:** Incident Lead system prompt
- **Purpose:** Personalized questions based on candidate's actual experience

### 2. Scenario RAG
- **Source:** `scenarios.json`
- **Injected Into:** All agent contexts
- **Purpose:** Domain-specific crisis simulations

### 3. Market Intel RAG
- **Source:** Groq LLM real-time generation
- **Injected Into:** Interview questions
- **Purpose:** Current industry trends (e.g., recent outages)

---

## 📊 Report Generation

### FSIR (Full-Spectrum Interview Report)

Generated at interview end with:

| Section | Content |
|:--------|:--------|
| **Executive Summary** | Overall decision (Advance/Reject) with confidence |
| **DQI Score** | 0-100 Decision Quality Index |
| **Timeline** | Second-by-second event log |
| **Integrity Signals** | Mole bait acceptance/rejection |
| **Skill Validation** | Skills demonstrated during interview |
| **Communication Metrics** | Clarity, vocabulary, response time |
| **Agent Consensus** | Individual agent assessments |

### DQI Calculation

```python
# Factors weighted:
- Technical accuracy (35%)
- Decision speed (20%)
- Communication clarity (20%)
- Stress handling (15%)
- Ethical judgment (10%)
```

---

## 💻 Development

### Running Tests

```bash
pytest tests/ -v
```

### Code Style

```bash
# Format code
black app/ backend/

# Lint
flake8 app/ backend/
```

### Debug Mode

Enable verbose logging:
```bash
export LOG_LEVEL=DEBUG
python -m livekit.agents dev app.main:server
```

---

## 🚢 Deployment

### Docker

```dockerfile
# Build
docker build -t aegis-forge .

# Run
docker run -p 8000:8000 --env-file .env aegis-forge
```

### Production Checklist

- [ ] Set `LOG_LEVEL=INFO`
- [ ] Enable Redis for session isolation
- [ ] Configure rate limiting
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Enable HTTPS
- [ ] Configure CORS for your domain

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [LiveKit](https://livekit.io) - WebRTC infrastructure
- [Groq](https://groq.com) - Ultra-fast LLM inference
- [Deepgram](https://deepgram.com) - Speech-to-Text and Text-to-Speech

---

<div align="center">

**Built for the future of technical hiring**

</div>
