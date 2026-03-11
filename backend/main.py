from fastapi import FastAPI, BackgroundTasks, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.analysis.schemas import MediaPipeMetrics
import uuid
import logging
import os
import shutil
import io # <--- Added
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env")

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
    allow_origins=["http://localhost:3000", "https://f6bd14bc925f.ngrok-free.app", "*"],
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
mediapipe_store = {}   # Store MediaPipe metrics by candidate_id

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
    candidate_id = uuid.uuid4().hex[:8]
    
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
    
    # Generate random password for candidate
    import random
    import string
    import json
    password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
    
    # Save to local db
    db_path = UPLOADS_DIR / "db.json"
    db_data: dict[str, Any] = {}
    if db_path.exists():
        try:
            with open(db_path, "r") as f:
                content = json.load(f)
                if isinstance(content, dict):
                    db_data = content
        except:
            pass
            
    db_data[candidate_id] = {
        "password": password,
        "audit_path": str(audit_path),
        "status": "PENDING"
    }
    
    with open(db_path, "w") as f:
        json.dump(db_data, f)
    
    logger.info(f">>> Resume validated. Candidate: {candidate_id}, Password generated.")
    
    return {
        "candidate_id": candidate_id,
        "password": password,
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
    
    # Dispatch agent with audit path and candidate_id as metadata
    audit_metadata = f"audit:{candidate_id}:{candidate_data['audit_path']}"
    
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
    
# ...
from fastapi.responses import StreamingResponse, FileResponse
from app.analysis.pipeline import InterviewPipeline
from app.analysis.pdf_generator import PDFReportGenerator

class LoginRequest(BaseModel):
    candidate_id: str
    password: str

@app.post("/candidate-login")
async def candidate_login(request: LoginRequest):
    """
    Authenticate a candidate using their ID and auto-generated password.
    """
    import json
    db_path = UPLOADS_DIR / "db.json"
    
    if not db_path.exists():
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    try:
        with open(db_path, "r") as f:
            db_data = json.load(f)
    except:
        raise HTTPException(status_code=500, detail="Database error")
        
    if request.candidate_id not in db_data:
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    candidate_info = db_data[request.candidate_id]
    
    if candidate_info["password"] != request.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    # Re-hydrate memory store if needed
    if request.candidate_id not in candidate_audits:
        try:
            with open(candidate_info["audit_path"], "r") as f:
                audit = json.load(f)
                
            from app.resume.loader import detect_candidate_field, extract_candidate_context
            field = detect_candidate_field(audit)
            context = extract_candidate_context(audit)
            
            candidate_audits[request.candidate_id] = {
                "audit": audit,
                "audit_path": candidate_info["audit_path"],
                "field": field,
                "scenario_id": context['scenario_id'],
                "context": context
            }
        except Exception as e:
            logger.error(f"Failed to hydrate memory for {request.candidate_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to load session data")
            
    return {"status": "success", "message": "Authenticated"}

@app.get("/interview-results/{candidate_id}")
async def get_interview_results(candidate_id: str):
    """
    Fetch paths to the FSIR and Q&A JSON for a recruiter.
    """
    import json
    db_path = UPLOADS_DIR / "db.json"
    
    if db_path.exists():
        try:
            with open(db_path, "r") as f:
                db_data = json.load(f)
            
            if candidate_id in db_data:
                # Assuming status update logic is handled elsewhere, e.g., in a webhook or cleanup method
                if db_data[candidate_id]["status"] == "COMPLETED":
                     return {
                        "fsir_url": f"/download-report/{candidate_id}",
                        "qna_json_url": f"/download-qna/{candidate_id}",
                        "status": "COMPLETED"
                     }
        except Exception as e:
             logger.error(f"Failed to read db: {e}")
             
    # Try finding files directly if DB misses it
    fsir_path = _resolve_candidate_artifact("fsir", ".pdf", candidate_id)
    if fsir_path:
        return {
            "fsir_url": f"/download-report/{candidate_id}",
            "qna_json_url": f"/download-qna/{candidate_id}",
            "status": "COMPLETED"
        }
        
    return {"status": "PENDING", "message": "Interview hasn't finished yet or data is not ready."}


def _candidate_id_variants(candidate_id: str) -> List[str]:
    variants: List[str] = []
    raw = (candidate_id or "").strip()
    for value in (raw, raw.replace("audit:", "").strip()):
        if value and value not in variants:
            variants.append(value)
    if raw.startswith("audit:"):
        parts = raw.split(":", 2)
        if len(parts) >= 2 and parts[1] and parts[1] not in variants:
            variants.append(parts[1])
    return variants


def _uploads_roots() -> List[Path]:
    roots: List[Path] = []
    for path in (UPLOADS_DIR, Path("uploads"), Path(__file__).resolve().parents[1] / "uploads"):
        resolved = path.resolve()
        if resolved not in roots:
            roots.append(resolved)
    return roots


def _candidate_name_from_audit(candidate_id: str) -> Optional[str]:
    import json

    id_variants = _candidate_id_variants(candidate_id)
    for uploads_root in _uploads_roots():
        db_path = uploads_root / "db.json"
        if not db_path.exists():
            continue
        try:
            with open(db_path, "r") as f:
                db_data = json.load(f)
            for cid in id_variants:
                info = db_data.get(cid)
                if not info:
                    continue
                raw_audit_path = Path(info.get("audit_path", ""))
                candidate_paths: List[Path] = []
                if raw_audit_path.is_absolute():
                    candidate_paths.append(raw_audit_path)
                else:
                    candidate_paths.extend(
                        [
                            uploads_root / raw_audit_path,
                            Path.cwd() / raw_audit_path,
                            Path(__file__).resolve().parents[1] / raw_audit_path,
                        ]
                    )
                audit_path = next((p for p in candidate_paths if p.exists()), None)
                if not audit_path:
                    continue
                with open(audit_path, "r") as af:
                    audit_data = json.load(af)
                name = str(audit_data.get("contact_details", {}).get("name", "")).strip()
                if name:
                    return name
        except Exception as e:
            logger.warning(f"Failed candidate-name lookup for {candidate_id}: {e}")
    return None


def _resolve_candidate_artifact(prefix: str, suffix: str, candidate_id: str) -> Optional[Path]:
    tokens = _candidate_id_variants(candidate_id)
    candidate_name = _candidate_name_from_audit(candidate_id)
    if candidate_name and candidate_name not in tokens:
        tokens.append(candidate_name)

    search_roots: List[Path] = []
    for root in (Path.cwd(), Path(__file__).resolve().parents[1], *_uploads_roots()):
        resolved = root.resolve()
        if resolved not in search_roots:
            search_roots.append(resolved)

    for token in tokens:
        filename = f"{prefix}_{token}{suffix}"
        for root in search_roots:
            candidate_path = root / filename
            if candidate_path.exists():
                return candidate_path
    return None

@app.get("/download-feedback/{candidate_id}")
async def download_feedback(candidate_id: str):
    """
    Download the candidate-facing feedback PDF.
    """
    filename = f"feedback_{candidate_id}.pdf"
    file_path = UPLOADS_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Feedback report not ready. Please wait for interview to finish.")
    
    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=filename
    )

@app.get("/download-qna/{candidate_id}")
async def download_qna(candidate_id: str):
    """
    Download the raw Q&A JSON. (Assuming it gets saved here by the agents process)
    """
    final_path = _resolve_candidate_artifact("questions", ".json", candidate_id)
    if not final_path:
        raise HTTPException(status_code=404, detail="Q&A data not found.")
        
    return FileResponse(
        path=final_path,
        media_type="application/json",
        filename=f"questions_{candidate_id}.json"
    )

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
    final_path = _resolve_candidate_artifact("fsir", ".pdf", candidate_id)
    if not final_path:
        logger.warning(f"Report not found for {candidate_id}. It might not be generated yet.")
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

@app.get("/candidates")
async def get_all_candidates():
    """Return all candidates for the recruiter dashboard."""
    import json
    db_path = UPLOADS_DIR / "db.json"
    candidates = []
    
    if db_path.exists():
        try:
            with open(db_path, "r") as f:
                db_data = json.load(f)
                
            for cid, info in db_data.items():
                name = "Unknown"
                role = "Unknown"
                score = "N/A"
                
                # First check memory
                if cid in candidate_audits:
                    audit = candidate_audits[cid].get('audit', {})
                    if isinstance(audit, dict):
                        name = audit.get('contact_details', {}).get('name', 'Unknown')
                        score = audit.get('summary', {}).get('trust_score', 'N/A')
                    role = candidate_audits[cid].get('field', 'Unknown')
                # Fallback to reading the audit file from disk
                elif "audit_path" in info and Path(info["audit_path"]).exists():
                    try:
                        with open(info["audit_path"], "r") as af:
                            audit_data = json.load(af)
                        name = audit_data.get('contact_details', {}).get('name', 'Unknown')
                        score = audit_data.get('summary', {}).get('trust_score', 'N/A')
                        role = detect_candidate_field(audit_data) # use the imported detector
                        # Repopulate memory cache
                        candidate_audits[cid] = {'audit': audit_data, 'field': role}
                    except Exception as parse_error:
                        logger.error(f"Failed to read audit for {cid}: {parse_error}")
                
                candidates.append({
                    "id": cid,
                    "name": name,
                    "status": info.get("status", "PENDING"),
                    "role": role,
                    "score": score
                })
        except Exception as e:
            logger.error(f"Failed loading candidates: {e}")
            pass
            
    return {"candidates": candidates}

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

# ============================================
# MediaPipe Behavioral Biometrics Endpoint
# ============================================

@app.post("/mediapipe-metrics")
async def receive_mediapipe_metrics(metrics: MediaPipeMetrics):
    """
    Receive MediaPipe behavioral biometrics from the frontend.
    The frontend should call this endpoint periodically or at interview end
    with the full MediaPipeMetrics payload.
    
    CONTRACT:
    - session_id must match the LiveKit room/session ID
    - candidate_id must match the candidate_id from /upload-resume
    """
    candidate_id = metrics.candidate_id
    
    # Store (overwrite if called multiple times — last write wins)
    mediapipe_store[candidate_id] = metrics.model_dump()
    
    # Also save to disk for persistence
    mp_path = UPLOADS_DIR / f"{candidate_id}_mediapipe.json"
    try:
        import json
        with open(mp_path, "w") as f:
            json.dump(metrics.model_dump(), f, indent=2)
        logger.info(f">>> MediaPipe metrics saved: {mp_path}")
    except Exception as e:
        logger.error(f"Failed to save MediaPipe metrics: {e}")
    
    return {
        "status": "ok",
        "message": f"MediaPipe metrics received for candidate {candidate_id}",
        "scores": {
            "confidence": metrics.overall_confidence_score,
            "engagement": metrics.overall_engagement_score,
            "authenticity": metrics.authenticity_score
        }
    }

@app.get("/mediapipe-metrics/{candidate_id}")
async def get_mediapipe_metrics(candidate_id: str):
    """
    Retrieve stored MediaPipe metrics for a candidate.
    Used internally by the FSIR pipeline.
    """
    # Check memory first
    if candidate_id in mediapipe_store:
        return mediapipe_store[candidate_id]
    
    # Fallback: check disk
    mp_path = UPLOADS_DIR / f"{candidate_id}_mediapipe.json"
    if mp_path.exists():
        import json
        with open(mp_path, "r") as f:
            data = json.load(f)
        mediapipe_store[candidate_id] = data  # Cache it
        return data
    
    raise HTTPException(status_code=404, detail=f"No MediaPipe data found for candidate {candidate_id}")


class StopInterviewRequest(BaseModel):
    candidate_id: str

@app.post("/stop-interview")
async def stop_interview(request: StopInterviewRequest):
    """
    Handle the end of an interview from the frontend.
    Generates Candidate-Facing Feedback Report and updates status.
    """
    candidate_id = request.candidate_id
    logger.info(f">>> [STOP-INTERVIEW] Received end signal for {candidate_id}")

    try:
        # Load necessary data to generate feedback
        # 1. Audit Log & Candidate Context
        audit_path = ""
        db_path = UPLOADS_DIR / "db.json"
        
        import json
        if db_path.exists():
            with open(db_path, "r") as f:
                db_data = json.load(f)
                
            if candidate_id in db_data:
                 audit_path = db_data[candidate_id].get("audit_path", "")
        
        # We need the audit log to generate the detailed FSIR if it hasn't been done yet
        # But mostly we need it to generate the Candidate Feedback
        try:
            feedback_text = (
                "Thank you for completing the interview! You demonstrated strong "
                "problem-solving skills and handled questions well. We noticed some "
                "areas for growth in system design concepts. Keep up the good work!"
            )

            from reportlab.pdfgen import canvas
            from reportlab.lib.pagesizes import letter

            feedback_filename = UPLOADS_DIR / f"feedback_{candidate_id}.pdf"
            c = canvas.Canvas(str(feedback_filename), pagesize=letter)
            c.drawString(100, 750, "Interview Feedback Report")
            c.drawString(100, 730, f"Candidate ID: {candidate_id}")
            c.drawString(100, 700, feedback_text)
            c.save()

            logger.info(f">>> Feedback generated: {feedback_filename}")

        except Exception as e:
            logger.error(f">>> Failed to generate feedback PDF: {e}")
             
        # Finally, update the status in db.json so frontend knows it's ready
        if db_path.exists():
             with open(db_path, "r") as f:
                 db_data = json.load(f)
                 
             if candidate_id in db_data:
                 db_data[candidate_id]["status"] = "COMPLETED"
                 
                 with open(db_path, "w") as f:
                     json.dump(db_data, f, indent=4)
                     
                 logger.info(f">>> Marked session {candidate_id} as COMPLETED")
                 
        return {"status": "success", "message": "Interview stopped and feedback generated."}
        
    except Exception as e:
        logger.error(f"Failed to process stop interview: {e}")
        raise HTTPException(status_code=500, detail="Failed to stop the interview and process reports.")
