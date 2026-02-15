<div align="center">

# 🛡️ AEGIS FORGE

### *AI-Powered Technical Interview Simulation Platform*

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16+-black.svg)](https://nextjs.org)
[![LiveKit](https://img.shields.io/badge/LiveKit-Agents-purple.svg)](https://livekit.io)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](license.md)

**Transform your interview preparation with hyper-realistic AI simulations**

[Overview](#-overview) • [Features](#-features) • [Architecture](#️-architecture) • [Installation](#-installation) • [Usage](#-usage) • [API Documentation](#-api-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#️-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#️-configuration)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Multi-Agent System](#-multi-agent-system)
- [Development](#-development)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Aegis Forge** is an AI-powered technical interview simulation platform that creates hyper-realistic interview experiences using a sophisticated multi-agent system. Unlike traditional chatbot-based mock interviews, Aegis Forge employs **6 specialized AI agents** working simultaneously to evaluate candidates comprehensively.

### What Makes Aegis Forge Unique?

- **Multi-Agent Architecture**: 6 specialized AI agents (Incident Lead, Pressure Agent, Observer, Mole, Governor, Crisis Popup) create emergent, realistic interview scenarios
- **Resume Verification**: GitHub API integration validates claimed skills against actual repositories
- **Dynamic Question Generation**: Questions based on real-time market trends and candidate profiles
- **Integrity Testing**: Ethical traps test candidate judgment under pressure
- **Ultra-Low Latency**: ~850ms total round-trip time for natural conversation flow
- **Comprehensive Reporting**: Detailed FSIR (Full-Spectrum Interview Report) with DQI (Decision Quality Index) scoring

### Interview Domains Supported

- ✅ DevOps & Infrastructure
- ✅ AI/ML Engineering
- ✅ Cybersecurity
- ✅ Blockchain Development
- ✅ Backend Engineering
- ✅ Frontend Development

---

## ✨ Features

### Core Capabilities

| Feature | Description |
|:--------|:------------|
| **Real-Time Voice Interview** | Sub-second latency using Groq LLM (~200ms) + Deepgram STT/TTS |
| **Multi-Agent Simulation** | 6 AI agents creating realistic interview pressure and scenarios |
| **Resume Verification** | Automatic GitHub validation of claimed skills and experience |
| **Dynamic Scenarios** | Real-world incident scenarios tailored to candidate's domain |
| **Integrity Testing** | Ethical traps via "Mole Agent" to test judgment |
| **Safety Monitoring** | Real-time content moderation via Governor Agent |
| **Crisis Injection** | Surprise crisis questions at strategic interview moments |
| **Detailed Analytics** | DQI scoring + comprehensive PDF reports |

### Technical Highlights

- 🎭 **Emergent Complexity** - Multiple agents create unpredictable, realistic scenarios
- 🔍 **OSINT Integration** - Verifies resume claims against public GitHub data
- ⚡ **Low Latency** - ~850ms total round-trip for natural conversation flow
- 📊 **Objective Scoring** - DQI provides quantified, comparable metrics
- 🛡️ **Content Safety** - Real-time monitoring prevents harmful content
- 🎯 **Adaptive Difficulty** - Dynamic question adjustment based on candidate responses

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND LAYER                              │
│                         (Next.js 16 + React)                            │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│   │ Resume      │  │ Live        │  │ Code        │  │ Telemetry   │   │
│   │ Upload      │  │ Interview   │  │ Terminal    │  │ Dashboard   │   │
│   │             │  │ (Avatar)    │  │ (Monaco)    │  │             │   │
│   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ HTTP/WebRTC
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND API GATEWAY                             │
│                           (FastAPI)                                     │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│   │ Resume      │  │ Knowledge   │  │ LiveKit     │  │ Report      │   │
│   │ Validator   │  │ Engine      │  │ Dispatcher  │  │ Generator   │   │
│   │ + GitHub    │  │ (Singleton) │  │             │  │ (PDF/JSON)  │   │
│   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ LiveKit Protocol
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      AGENT ORCHESTRATION LAYER                          │
│                    (LiveKit Agents Framework)                           │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                     MULTI-AGENT SYSTEM                         │   │
│   │                                                                │   │
│   │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  │   │
│   │  │ Incident  │  │ Pressure  │  │ Observer  │  │   Mole    │  │   │
│   │  │   Lead    │  │  Agent    │  │  Agent    │  │  Agent    │  │   │
│   │  │(Main Voice)│ │(Stressor) │  │ (Grader)  │  │(Integrity)│  │   │
│   │  └───────────┘  └───────────┘  └───────────┘  └───────────┘  │   │
│   │                                                                │   │
│   │  ┌───────────┐  ┌───────────┐                                │   │
│   │  │ Governor  │  │  Crisis   │                                │   │
│   │  │  Agent    │  │  Popup    │                                │   │
│   │  │ (Safety)  │  │(Surprise) │                                │   │
│   │  └───────────┘  └───────────┘                                │   │
│   └────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                 │
              ┌──────────────────┼──────────────────┬─────────────┐
              ▼                  ▼                  ▼             ▼
        ┌──────────┐      ┌──────────┐      ┌──────────┐  ┌──────────┐
        │  Groq    │      │ Deepgram │      │ GitHub   │  │ LiveKit  │
        │ Llama    │      │ STT/TTS  │      │   API    │  │  Cloud   │
        │ 3.1-8b   │      │          │      │          │  │          │
        └──────────┘      └──────────┘      └──────────┘  └──────────┘
```

### Data Flow

1. **Resume Upload** → Validation → GitHub verification → Field detection
2. **Knowledge Engine** → Loads audit data → Generates market intel → Creates context
3. **LiveKit Dispatch** → Creates room → Generates token → Spawns agent
4. **Interview Session** → Multi-agent coordination → Real-time evaluation
5. **Report Generation** → Observer logs → DQI calculation → PDF export

---

## 🛠️ Tech Stack

### Backend

| Technology | Version | Purpose | Why? |
|:-----------|:--------|:--------|:-----|
| **Python** | 3.11+ | Core language | Async support, rich ML ecosystem |
| **FastAPI** | Latest | API Gateway | Async, auto-docs, type safety |
| **LiveKit Agents** | 0.8.0+ | Multi-agent framework | WebRTC native, multi-modal support |
| **Groq (Llama 3.1)** | llama-3.1-8b-instant | LLM inference | ~200ms latency, cost-effective |
| **Deepgram** | Nova-3 | STT + TTS | Low latency streaming audio |
| **pdfplumber** | Latest | PDF parsing | Reliable text extraction |
| **pytesseract** | Latest | OCR fallback | Image-based PDF support |
| **ReportLab** | Latest | PDF generation | FSIR report creation |
| **Pydantic** | v2 | Data validation | Type safety, schemas |

### Frontend

| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| **Next.js** | 16.1.6 | React framework with App Router |
| **React** | 19.2.3 | UI library |
| **TypeScript** | 5+ | Type safety |
| **Tailwind CSS** | 4 | Utility-first styling |
| **LiveKit React SDK** | 2.9.19+ | WebRTC integration |
| **Monaco Editor** | 4.7.0 | Code terminal component |
| **Framer Motion** | 12.29.2 | Animations |

### Infrastructure

| Service | Purpose |
|:--------|:--------|
| **LiveKit Cloud** | WebRTC media server |
| **Docker** | Containerization (optional) |
| **UV** | Fast Python package manager |

---

## 📦 Prerequisites

Before installing Aegis Forge, ensure you have:

### Required

- **Python 3.11+** - [Download](https://python.org)
- **Node.js 18+** - [Download](https://nodejs.org)
- **Git** - [Download](https://git-scm.com)
- **UV** (Python package manager) - Install: `curl -LsSf https://astral.sh/uv/install.sh | sh`

### API Keys Required

- **LiveKit Cloud** account - [Sign up](https://livekit.io)
- **Groq API** key - [Get key](https://groq.com)
- **Deepgram API** key - [Get key](https://deepgram.com)
- **GitHub Token** (optional) - For higher API rate limits

### Optional Tools

- **Tesseract OCR** - For image-based PDF processing
  ```bash
  # macOS
  brew install tesseract
  
  # Ubuntu/Debian
  sudo apt-get install tesseract-ocr
  ```

---

## 🚀 Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/aegis-forge.git
cd aegis-forge
```

### Step 2: Backend Setup

```bash
# Install Python dependencies using UV
uv sync --all-extras --dev

# Alternative: using pip
# pip install -r requirements.txt
```

### Step 3: Frontend Setup

```bash
cd frontend
npm install
cd ..
```

### Step 4: Environment Configuration

Create a `.env` file in the root directory:

```bash
# LiveKit Configuration
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret

# AI Services
GROQ_API_KEY=gsk_your_groq_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key

# Optional: GitHub Token (for higher API rate limits)
GITHUB_TOKEN=ghp_your_github_token

# Optional: Logging Configuration
LOG_LEVEL=INFO
```

---

## ⚙️ Configuration

### Scenario Configuration

Scenarios are defined in `app/rag/scenarios.json`. Example:

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
      },
      "stakeholder_persona": {
        "name": "Product Manager",
        "instructions": "You are anxious about customer impact...",
        "tone": "Urgent"
      },
      "observer_metrics": ["technical_accuracy", "communication", "decision_speed"]
    }
  ]
}
```

### Adding New Scenarios

1. Add scenario object to `app/rag/scenarios.json`
2. Map field to scenario in `app/resume/loader.py`:

```python
FIELD_SCENARIOS = {
    "ai_ml": "ai-model-drift",
    "cybersecurity": "security-breach",
    "devops": "devops-redis-latency",
    "blockchain": "smart-contract-exploit",
    "your_new_field": "your-scenario-id"
}
```

---

## 🎮 Usage

### Running the Application

You need **3 terminal windows**:

#### Terminal 1: Backend API Server

```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

#### Terminal 2: LiveKit Agent Server

```bash
python -m livekit.agents dev app.main:server
```

**Output:**
```
INFO:     [Aegis-Forge] Starting up...
INFO:     Preloading VAD model...
INFO:     Loading scenario definitions...
INFO:     Ready to accept connections
```

#### Terminal 3: Frontend Development Server

```bash
cd frontend
npm run dev
```

**Output:**
```
  ▲ Next.js 16.1.6
  - Local:        http://localhost:3000
  - Ready in 1.5s
```

### Accessing the Application

Open your browser to: **http://localhost:3000**

---

## 📖 API Documentation

### Base URL

```
http://localhost:8000
```

### Endpoints

#### 1. Upload Resume

**POST** `/upload-resume`

Upload and validate a candidate's resume.

**Request:**
```bash
curl -X POST "http://localhost:8000/upload-resume" \
  -F "file=@resume.pdf"
```

**Response:**
```json
{
  "candidate_id": "abc12345",
  "detected_field": "devops",
  "scenario": "devops-redis-latency",
  "trust_score": "78%",
  "verified_skills": ["python", "docker", "kubernetes"],
  "audit": {
    "summary": {
      "trust_score": "78%",
      "total_skills": 15,
      "verified_count": 10,
      "unverified_count": 5
    },
    "github_stats": {
      "repos": 23,
      "verified_techs": ["Python", "Go", "Docker"]
    }
  }
}
```

#### 2. Start Interview

**POST** `/start-interview`

Creates a LiveKit room and starts the interview session.

**Request:**
```bash
curl -X POST "http://localhost:8000/start-interview" \
  -H "Content-Type: application/json" \
  -d '{
    "candidate_id": "abc12345"
  }'
```

**Response:**
```json
{
  "room_name": "interview_abc12345_1234567890",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "join_url": "wss://your-project.livekit.cloud?token=...",
  "detected_field": "devops",
  "scenario": "devops-redis-latency",
  "livekit_url": "wss://your-project.livekit.cloud"
}
```

#### 3. Set Focus Topics (Optional)

**POST** `/api/set-focus-topics`

Set recruiter-selected skills to focus on during the interview.

**Request:**
```json
{
  "candidate_id": "abc12345",
  "focus_topics": ["Kubernetes", "CI/CD", "Monitoring"]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Focus topics saved for candidate abc12345",
  "topics": ["Kubernetes", "CI/CD", "Monitoring"]
}
```

#### 4. Download Report

**GET** `/download-report/{candidate_id}`

Download the generated FSIR PDF report after interview completion.

**Request:**
```bash
curl -O "http://localhost:8000/download-report/abc12345"
```

**Response:** PDF file download

---

## 🤖 Multi-Agent System

### Agent Roles & Timing

| Agent | Role | Behavior | Activation |
|:------|:-----|:---------|:-----------|
| **Incident Lead** | Main Interviewer | Drives conversation, asks technical questions | Continuous |
| **Pressure Agent** | Stressed Stakeholder | Random urgent interruptions | Every 15-40 seconds |
| **Observer Agent** | Silent Grader | Evaluates responses in background | Every turn |
| **Mole Agent** | Integrity Tester | Offers unethical shortcuts | Once at 30-60 seconds |
| **Governor Agent** | Safety Monitor | Filters harmful content | Continuous |
| **Crisis Popup** | Surprise Tester | Injects crisis scenarios | At 3min and 8min marks |

### Agent Communication

All agents share state via the **Knowledge Engine Singleton**:

```python
from backend.funnel.pipeline import knowledge_engine

# Agents access shared context
context = knowledge_engine.candidate_context
market_intel = knowledge_engine.get_market_intel("devops")
```

### Example Agent Tools

The Incident Lead agent can:
- Toggle code notepad for coding tasks
- Inject crisis scenarios
- Access candidate profile
- Generate personalized greetings

```python
# Example: Toggle notepad for coding task
@llm.function_tool(description="Toggle coding Notepad")
async def toggle_notepad(visible: bool):
    await room.local_participant.publish_data(
        {"type": "TOGGLE_NOTEPAD", "visible": visible}
    )
```

---

## 📁 Project Structure

```
aegis-forge/
├── .env                          # Environment variables (DO NOT COMMIT)
├── pyproject.toml                # Python dependencies (UV)
├── makefile                      # Development commands
├── README.md                     # This file
│
├── app/                          # LiveKit Agent Service
│   ├── main.py                   # Agent entry point & orchestration
│   │
│   ├── agents/                   # Multi-Agent System
│   │   ├── base.py               # Base agent class
│   │   ├── tools.py              # Agent tools (ToggleNotepad)
│   │   ├── prompts.py            # System prompt templates
│   │   ├── incident_lead.py      # Main interviewer agent
│   │   ├── pressure.py           # Stakeholder stress simulator
│   │   ├── observer.py           # Silent grading agent
│   │   ├── mole.py               # Integrity testing agent
│   │   ├── governor.py           # Safety monitoring agent
│   │   └── crisis_popup.py       # Surprise crisis generator
│   │
│   ├── analysis/                 # Report Generation
│   │   ├── schemas.py            # Pydantic data models
│   │   ├── dqi_calculator.py     # DQI scoring algorithm
│   │   ├── pipeline.py           # FSIR report orchestrator
│   │   ├── pdf_generator.py      # PDF creation
│   │   └── social_verifier.py    # Social media verification
│   │
│   ├── rag/                      # Scenario Management
│   │   ├── scenarios.json        # Interview scenario definitions
│   │   └── scenarios.py          # Scenario loader class
│   │
│   ├── resume/                   # Resume Processing
│   │   └── loader.py             # Field detection & context extraction
│   │
│   ├── core/                     # Utilities
│   │   ├── end_detector.py       # End phrase detection
│   │   └── interview_timer.py    # Session timer
│   │
│   └── logging/                  # Audit System
│       └── audit_logger.py       # Event logging
│
├── backend/                      # FastAPI Backend
│   ├── main.py                   # API endpoints
│   ├── resume_validator.py       # PDF parsing + GitHub verification
│   ├── livekit_dispatch.py       # LiveKit room management
│   │
│   ├── funnel/
│   │   └── pipeline.py           # Knowledge Engine (Singleton)
│   │
│   └── core/
│       ├── state.py              # State machine
│       └── graph.py              # FSM graph builder
│
├── frontend/                     # Next.js Frontend
│   ├── package.json              # Node dependencies
│   │
│   ├── app/                      # App Router pages
│   │   ├── page.tsx              # Landing page
│   │   ├── interview/            # Interview UI
│   │   └── api/                  # API routes (token generation)
│   │
│   └── components/               # React Components
│       ├── Avatar.tsx            # Animated avatar
│       ├── CodeTerminal.tsx      # Monaco editor
│       ├── InterviewRoom.tsx     # Main interview UI
│       └── Telemetry.tsx         # Real-time metrics
│
├── uploads/                      # Resume & audit storage
├── tests/                        # Test files
└── docs/                         # Additional documentation
```

---

## 💻 Development

### Available Make Commands

```bash
make help              # Show all available commands
make install           # Install dependencies with UV
make format            # Format code with ruff
make lint              # Run linter
make lint-fix          # Auto-fix linting issues
make type-check        # Run mypy type checker
make check             # Run all checks
make doctor            # Check development environment health
```

### Running Tests

```bash
# Run all tests
pytest tests/ -v

# Run specific test file
pytest tests/test_agents.py -v

# Run with coverage
pytest --cov=app --cov-report=html
```

### Debug Mode

Enable verbose logging:

```bash
export LOG_LEVEL=DEBUG
python -m livekit.agents dev app.main:server
```

### Code Style

This project uses:
- **Ruff** for formatting and linting
- **Mypy** for type checking
- **Black** style guide

---

## 🚢 Deployment

### Using Docker

```dockerfile
# Build
docker build -t aegis-forge .

# Run
docker run -p 8000:8000 --env-file .env aegis-forge
```

### Production Checklist

- [ ] Set `LOG_LEVEL=INFO` (or `WARNING`)
- [ ] Secure `.env` file (never commit to Git)
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS/TLS
- [ ] Set up monitoring (Prometheus/Grafana recommended)
- [ ] Configure rate limiting
- [ ] Set up database for session persistence (Redis recommended)
- [ ] Review LiveKit pricing and limits
- [ ] Test with multiple concurrent users
- [ ] Set up backup/disaster recovery for audit logs
- [ ] Configure CDN for frontend assets

### Environment Variables for Production

```bash
# Production settings
LOG_LEVEL=WARNING
ENVIRONMENT=production
ALLOWED_ORIGINS=https://yourdomain.com

# Database (if using Redis)
REDIS_URL=redis://localhost:6379

# Monitoring
SENTRY_DSN=your_sentry_dsn  # Optional
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "GROQ_API_KEY not found"

**Solution:**
```bash
# Check .env file exists
cat .env | grep GROQ_API_KEY

# Reload environment
source .env  # or restart terminal
```

#### 2. LiveKit connection fails

**Solution:**
- Verify LiveKit credentials in `.env`
- Check LiveKit Cloud dashboard for room status
- Test connection: `curl -v "wss://your-project.livekit.cloud"`

#### 3. Resume upload fails

**Solution:**
```bash
# Install Tesseract for OCR
brew install tesseract  # macOS
sudo apt-get install tesseract-ocr  # Ubuntu

# Check uploads directory permissions
ls -la uploads/
chmod 755 uploads/
```

#### 4. Frontend fails to connect

**Solution:**
```bash
# Check all 3 services are running:
# 1. Backend API (port 8000)
curl http://localhost:8000

# 2. Agent server
# Should see "Ready to accept connections"

# 3. Frontend (port 3000)
curl http://localhost:3000
```

#### 5. Agent doesn't speak

**Solution:**
- Check Deepgram API key is valid
- Verify audio permissions in browser
- Check browser console for WebRTC errors
- Try different browser (Chrome recommended)

### Logs Location

- **Agent logs**: `agent.log`
- **Backend logs**: `backend.log`
- **Debug logs**: `debug.log`
- **Frontend logs**: Browser console
- **Audit logs**: `uploads/*_audit.json`

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Development Workflow

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/aegis-forge.git
   cd aegis-forge
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow existing code style
   - Add tests for new features
   - Update documentation

4. **Run checks**
   ```bash
   make check  # format, lint, type-check
   pytest tests/
   ```

5. **Commit changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

6. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Describe changes clearly
   - Link related issues
   - Add screenshots if UI changes

### Code Standards

- Follow Python PEP 8 style guide
- Use type hints (`typing` module)
- Write docstrings for all public functions
- Keep functions small and focused
- Add tests for new functionality

---

## 📄 License

This project is licensed under the MIT License - see the [license.md](license.md) file for details.

---

## 🙏 Acknowledgments

### Core Technologies

- [LiveKit](https://livekit.io) - WebRTC infrastructure and agent framework
- [Groq](https://groq.com) - Ultra-fast LLM inference
- [Deepgram](https://deepgram.com) - Real-time speech-to-text and text-to-speech

### Inspiration

This project was inspired by the need for more realistic technical interview preparation that goes beyond simple question-answer formats.

---

## 📞 Support

- **Documentation**: See `/docs` folder for detailed guides
- **Issues**: [GitHub Issues](https://github.com/yourusername/aegis-forge/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/aegis-forge/discussions)

---

<div align="center">

**Built for the future of technical hiring**

Made with ❤️ by the Aegis Forge Team

[⬆ Back to Top](#️-aegis-forge)

</div>
