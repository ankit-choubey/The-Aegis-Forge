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

class FocusTopicsRequest(BaseModel):
    candidate_id: str
    focus_topics: List[str]

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


@app.post("/api/set-focus-topics")
async def set_focus_topics(request: FocusTopicsRequest):
    """
    Set recruiter-selected focus topics for the interview.
    Call this BEFORE /start-interview to prioritize specific skills.
    
    Args:
        candidate_id: ID from upload-resume response
        focus_topics: List of skills to focus on (max 5 recommended)
        
    Returns:
        - status: success/error
        - topics: The saved topics
    """
    import json
    
    # Validate candidate exists (optional - can skip if coming from different flow)
    if request.candidate_id and request.candidate_id in candidate_audits:
        logger.info(f">>> [FOCUS] Setting topics for known candidate: {request.candidate_id}")
    
    # Limit to 5 topics for best results
    topics = request.focus_topics[:5] if len(request.focus_topics) > 5 else request.focus_topics
    
    # Save to focus_config.json (Knowledge Engine reads from here)
    config = {
        "candidate_id": request.candidate_id,
        "focus_topics": topics
    }
    
    try:
        config_path = UPLOADS_DIR / "focus_config.json"
        with open(config_path, "w") as f:
            json.dump(config, f, indent=2)
        
        logger.info(f">>> [FOCUS] Saved focus topics: {topics}")
        
        # Also trigger Knowledge Engine to reload
        knowledge_engine.load_focus_topics()
        
        return {
            "status": "success",
            "message": f"Focus topics saved for candidate {request.candidate_id}",
            "topics": topics
        }
    except Exception as e:
        logger.error(f">>> [FOCUS] Failed to save focus topics: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save focus topics: {e}")


class RoleUpdateRequest(BaseModel):
    candidate_id: str
    role: str  # e.g., "AI/ML", "DevOps"

@app.post("/api/set-candidate-role")
async def set_candidate_role(request: RoleUpdateRequest):
    """
    [FRONTEND FEATURE] Allow user to manually select/override the Job Role.
    This updates the Knowledge Engine context + Scenario.
    """
    candidate_id = request.candidate_id
    role = request.role
    
    # 1. Validate Candidate
    if candidate_id not in candidate_audits:
         raise HTTPException(status_code=404, detail="Candidate not found")
         
    # 2. Map Role to Scenario ID
    # Simple mapping (Extend as needed)
    role_map = {
        "AI/ML": "ai-model-drift",
        "DevOps": "devops-redis-latency", 
        "Cybersecurity": "security-breach",
        "Blockchain": "smart-contract-exploit",
        "Backend": "backend-api-outage",
        "Frontend": "frontend-ui-crash" # Placeholder if scenario exists
    }
    
    # Default to generic backend if unknown
    scenario_id = role_map.get(role, "backend-api-outage")
    
    # 3. Update In-Memory Store
    candidate_audits[candidate_id]['field'] = role
    candidate_audits[candidate_id]['scenario_id'] = scenario_id
    candidate_audits[candidate_id]['context']['detected_field'] = role  # Update extracted context too
    
    # 4. Update Audit File (Persistence)
    audit_path = candidate_audits[candidate_id]['audit_path']
    audit_data = candidate_audits[candidate_id]['audit']
    
    # Inject override
    audit_data['manual_role_override'] = role
    save_audit(audit_data, audit_path)
    
    # 5. Reload Knowledge Engine
    knowledge_engine.load_resume_audit(str(audit_path))
    knowledge_engine.candidate_context['detected_field'] = role # Force update
    knowledge_engine.candidate_context['role'] = role # Force update
    knowledge_engine.candidate_context['scenario_id'] = scenario_id # Force scenario
    
    logger.info(f">>> [ROLE OVERRIDE] Candidate {candidate_id} switched to {role} ({scenario_id})")
    
    return {
        "status": "success",
        "candidate_id": candidate_id,
        "new_role": role,
        "new_scenario": scenario_id
    }


# ...
from fastapi.responses import StreamingResponse, FileResponse
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
    Download the PRE-GENERATED PDF report for a candidate.
    (Generated by the Agent Process at the end of the interview)
    """
    # 1. Try to find the file
    filename = f"fsir_{candidate_id}.pdf"
    file_path = Path(filename)
    
    # Also check uploads text
    uploads_path = UPLOADS_DIR / filename
    
    final_path = None
    if file_path.exists():
        final_path = file_path
    elif uploads_path.exists():
        final_path = uploads_path
        
    if not final_path:
        logger.warning(f"Report not found for {candidate_id}. It might not be generated yet.")
        # [FALLBACK] For Dev/Testing, check if there are ANY pdfs to serve? No, 404 is stricter.
        # But user mentioned "we get a pdf", implies it exists.
        
        # Check if we can fallback to session-based naming if we knew the session?
        # For now, return 404 but with helpful message
        
        # [DEV HACK] If dev mode, return dummy if real one missing?
        # No, better to be honest.
        raise HTTPException(status_code=404, detail="Report not ready. Please wait for interview to finish.")
    
    return FileResponse(
        path=final_path,
        media_type="application/pdf",
        filename=f"Aegis_Report_{candidate_id}.pdf"
    )



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
