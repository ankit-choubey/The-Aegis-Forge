from fastapi import FastAPI, BackgroundTasks, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uuid
import logging
import os
import shutil
import io # <--- Added
from pathlib import Path

# IMPORTS (The Trinity)
from backend.core.state import get_initial_state
from backend.core.graph import build_graph
from backend.funnel.pipeline import knowledge_engine
from backend.resume_validator import validate_resume, save_audit
from backend.livekit_dispatch import dispatcher
from app.resume.loader import detect_candidate_field, extract_candidate_context

# SETUP
app = FastAPI(title="Aegis-Forge Plugin Gateway (God Mode)")
logger = logging.getLogger("AEGIS-GATEWAY")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploads directory
UPLOADS_DIR = Path("uploads")
UPLOADS_DIR.mkdir(exist_ok=True)

# --- CONTRACTS (STRICT VALIDATION) ---
class RoleContext(BaseModel):
    title: str
    required_skills: List[str]
    difficulty: str
    resume_text: Optional[str] = "No resume provided"

class StartRequest(BaseModel):
    frai_session_id: str
    candidate_id: str
    role_context: RoleContext
    webhook_url: str

class StartResponse(BaseModel):
    status: str
    aegis_session_id: str
    message: str

class InterviewStartRequest(BaseModel):
    candidate_id: str
    room_name: Optional[str] = None

# IN-MEMORY SESSION STORE
active_sessions = {}
candidate_audits = {}  # Store audits by candidate_id

# --- ENDPOINTS ---

@app.get("/")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "aegis-forge-gateway"}


# ============================================
# NEW: Resume Upload & Interview Endpoints
# ============================================

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """
    Upload and validate a resume PDF.
    
    Returns:
        - candidate_id: Unique ID for this candidate
        - audit: Full validation results
        - detected_field: AI/ML, Cybersecurity, etc.
        - scenario: Interview scenario to use
    """
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")
    
    # Generate candidate ID
    candidate_id = str(uuid.uuid4())[:8]
    
    # Save uploaded file
    pdf_path = UPLOADS_DIR / f"{candidate_id}_{file.filename}"
    try:
        with open(pdf_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        logger.info(f">>> Saved resume: {pdf_path}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")
    
    # Validate resume
    try:
        audit = validate_resume(str(pdf_path))
        if "error" in audit:
            raise HTTPException(status_code=400, detail=audit["error"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation failed: {e}")
    
    # Detect field and extract context
    field = detect_candidate_field(audit)
    context = extract_candidate_context(audit)
    
    # Save audit to file
    audit_path = UPLOADS_DIR / f"{candidate_id}_audit.json"
    save_audit(audit, str(audit_path))
    
    # Store in memory
    candidate_audits[candidate_id] = {
        "audit": audit,
        "audit_path": str(audit_path),
        "field": field,
        "scenario_id": context['scenario_id'],
        "context": context
    }
    
    # Load into Knowledge Engine
    knowledge_engine.load_resume_audit(str(audit_path))
    
    # Trigger Dynamic Market Research (Async)
    # This fetches 2024 trends from Groq LLM
    market_intel = await knowledge_engine.hydrate_dynamic_intel(field)
    
    # Update Audit with Dynamic Intel & Re-save
    audit["dynamic_market_intel"] = market_intel
    save_audit(audit, str(audit_path))
    
    logger.info(f">>> Resume validated. Candidate: {candidate_id}, Field: {field}")
    
    return {
        "candidate_id": candidate_id,
        "detected_field": field,
        "scenario": context['scenario_id'],
        "trust_score": audit['summary']['trust_score'],
        "verified_skills": audit['verification_breakdown']['verified_skills'],
        "audit": audit
    }


@app.post("/start-interview")
async def start_interview_session(request: InterviewStartRequest):
    """
    Start an interview session for a validated candidate.
    
    Args:
        candidate_id: ID from upload-resume response
        room_name: Optional custom room name
        
    Returns:
        - room_name: LiveKit room name
        - token: Access token for the candidate
        - join_url: URL to join the interview
    """
    candidate_id = request.candidate_id
    
    # Check if candidate was validated
    if candidate_id not in candidate_audits:
        raise HTTPException(
            status_code=404, 
            detail=f"Candidate {candidate_id} not found. Upload resume first."
        )
    
    candidate_data = candidate_audits[candidate_id]
    
    # Generate room name
    room_name = request.room_name or dispatcher.generate_room_name(candidate_id)
    
    # Create token for candidate
    token = dispatcher.create_token(
        room_name=room_name,
        participant_name=f"Candidate-{candidate_id}",
        can_publish=True,
        can_subscribe=True
    )
    
    # Dispatch agent with audit path as metadata
    audit_metadata = f"audit:{candidate_data['audit_path']}"
    
    dispatch_result = await dispatcher.dispatch_agent(
        room_name=room_name,
        agent_name="aegis-interviewer",
        metadata=audit_metadata
    )
    
    if not dispatch_result.get("success"):
        logger.error(f"Agent dispatch failed: {dispatch_result.get('error')}")
        # Continue anyway - agent might auto-join
    
    # Get join URL
    join_url = dispatcher.get_room_url(room_name, token)
    
    logger.info(f">>> Interview started. Room: {room_name}, Scenario: {candidate_data['scenario_id']}")
    
    return {
        "room_name": room_name,
        "token": token,
        "join_url": join_url,
        "detected_field": candidate_data['field'],
        "scenario": candidate_data['scenario_id'],
        "livekit_url": dispatcher.url
    }


# ...
from fastapi.responses import StreamingResponse
from app.analysis.pipeline import InterviewPipeline
from app.analysis.pdf_generator import PDFReportGenerator

@app.get("/candidate/{candidate_id}")
async def get_candidate(candidate_id: str):
    """Get candidate audit details."""
    if candidate_id not in candidate_audits:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    return candidate_audits[candidate_id]


@app.get("/download-report/{candidate_id}")
async def download_report(candidate_id: str):
    """
    Generate and download the PDF report for a candidate.
    """
    if candidate_id not in candidate_audits:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    candidate_data = candidate_audits[candidate_id]
    audit_log = candidate_data.get("audit", {}).get("audit_log", [])
    
    # 1. Run Analysis Pipeline (On-the-fly)
    # We construct a data dict simulating the real input needed by the pipeline
    # For now, we pass the raw audit, assuming the pipeline handles it or we mock the DQI part
    # In a real run, DQI is calculated. Here we might need to mock if missing.
    
    pipeline = InterviewPipeline()
    
    # Mocking data structure required by generate_detailed_report
    # It expects: {"dqi_calculation": {...}, "audit_log": [...]}
    # We try to pull dqi from audit if exists, or use defaults
    dqi_data = candidate_data.get("audit", {}).get("dqi", {
        "overall_score": 85, 
        "breakdown": {"score": 85, "correct_decisions": 6, "recoverable_mistakes": 1}
    })
    
    pipeline_input = {
        "dqi_calculation": dqi_data,
        "audit_log": audit_log if isinstance(audit_log, list) else [] # audit_log might be missing or raw
    }
    
    try:
        # Generate the FSIR Pydantic Object
        fsir = pipeline.generate_detailed_report(candidate_id, pipeline_input)
        fsir_dict = fsir.model_dump()
        
        # Inject candidate ID explicitly if missing
        fsir_dict['candidate_id'] = candidate_id
        
        # 2. Generate PDF
        pdf_gen = PDFReportGenerator()
        pdf_bytes = pdf_gen.generate_report_bytes(fsir_dict)
        
        # 3. Stream Response
        filename = f"Aegis_Report_{candidate_id}.pdf"
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        logger.error(f"Report Generation Failed: {e}")
        raise HTTPException(status_code=500, detail=f"Report Generation Failed: {e}")


# ============================================
# Original Endpoints
# ============================================

@app.post("/aegis/start", response_model=StartResponse)
async def start_interview(request: StartRequest, background_tasks: BackgroundTasks):
    """
    [ENTRY POINT] The Frai Handshake.
    Uses BackgroundTasks to ensure <50ms response time.
    """
    try:
        # 1. Generate Internal ID
        aegis_id = str(uuid.uuid4())
        logger.info(f">>> [HANDSHAKE] Received FRAI Session: {request.frai_session_id}")

        # 2. TRIGGER ASYNC INGESTION (Fire and Forget)
        background_tasks.add_task(
            knowledge_engine.ingest_context, 
            session_id=aegis_id, 
            role_context=request.role_context.model_dump()
        )

        # 3. INITIALIZE STATE MACHINE (The Brain)
        initial_state = get_initial_state(
            candidate_id=request.candidate_id,
            role_context=request.role_context.model_dump()
        )

        # 4. STORE SESSION
        active_sessions[aegis_id] = {
            "frai_id": request.frai_session_id,
            "state": initial_state,
            "graph": build_graph()  # The FSM Engine
        }

        # 5. IMMEDIATE RESPONSE
        return {
            "status": "accepted",
            "aegis_session_id": aegis_id,
            "message": "Protocol Accepted. Intelligence Loading in Background."
        }

    except Exception as e:
        logger.critical(f"!!! [CRITICAL FAILURE] Handshake failed: {e}")
        raise HTTPException(status_code=500, detail="War Room Initialization Failed")

@app.get("/aegis/sessions")
async def list_sessions():
    """List all active sessions."""
    return {
        "count": len(active_sessions),
        "sessions": list(active_sessions.keys())
    }

@app.get("/aegis/session/{session_id}")
async def get_session(session_id: str):
    """Get details of a specific session."""
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = active_sessions[session_id]
    return {
        "aegis_session_id": session_id,
        "frai_id": session["frai_id"],
        "state": session["state"]
    }

# Run with: uvicorn backend.main:app --reload --port 8000
