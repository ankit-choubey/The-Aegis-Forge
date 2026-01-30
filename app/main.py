import logging
import os

from dotenv import load_dotenv

from livekit.agents import (
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
    metrics,
    WorkerOptions,
    cli,
    metrics,
    inference,
    llm,
)
from livekit.plugins import deepgram, groq, silero
import json
from app.logging.audit_logger import SessionAuditLogger
from app.analysis.pipeline import InterviewPipeline
from backend.funnel.pipeline import knowledge_engine  # Explicit Import

from app.agents.incident_lead import IncidentLead
from app.agents.pressure import PressureAgent
from app.agents.observer import ObserverAgent
from app.agents.mole import MoleAgent
from app.rag.scenarios import ScenarioLoader

load_dotenv()
logger = logging.getLogger("aegis.main")

# Debug: Check keys
if not os.getenv("GROQ_API_KEY"):
    print("ERROR: GROQ_API_KEY not found in env!")
if not os.getenv("DEEPGRAM_API_KEY"):
    print("ERROR: DEEPGRAM_API_KEY not found in env!")

server = AgentServer()

def prewarm(proc: JobProcess):
    """Preload models."""
    proc.userdata["vad"] = silero.VAD.load()
    # Pre-loading scenario loader
    proc.userdata["scenarios"] = ScenarioLoader()

server.setup_fnc = prewarm

@server.rtc_session()  # Auto-dispatch mode
async def my_agent(ctx: JobContext):
    """
    Main entrypoint for the Aegis Forge Interview Loop.
    Supports dynamic scenario selection based on resume audit.
    """
    logger.info(f"Connecting to room {ctx.room.name}")
    await ctx.connect()

    # Check for resume audit file (can be passed via metadata or default path)
    # Format: "audit:/path/to/candidate_full_audit.json" or just scenario_id
    loader: ScenarioLoader = ctx.proc.userdata["scenarios"]
    scenario_id = "devops-redis-latency"  # Default
    
    metadata = ctx.job.metadata if ctx.job.metadata else ""
    
    if metadata.startswith("audit:"):
        # Load resume audit from metadata
        audit_path = metadata.replace("audit:", "").strip()
        logger.info(f"Loading candidate audit from metadata: {audit_path}")
        
        if knowledge_engine.load_resume_audit(audit_path):
            candidate = knowledge_engine.get_candidate_context()
            if candidate:
                scenario_id = candidate.get('scenario_id', 'devops-redis-latency')
                logger.info(f">>> Detected field: {candidate.get('field')}, using scenario: {scenario_id}")
    elif metadata:
        # Use metadata as direct scenario ID
        scenario_id = metadata
    else:
        # No metadata - try to load the LATEST audit from uploads folder
        import glob
        from pathlib import Path
        uploads_dir = Path("uploads")
        if uploads_dir.exists():
            audit_files = sorted(uploads_dir.glob("*_audit.json"), key=lambda p: p.stat().st_mtime, reverse=True)
            if audit_files:
                latest_audit = str(audit_files[0])
                logger.info(f">>> Auto-loading latest audit: {latest_audit}")
                
                if knowledge_engine.load_resume_audit(latest_audit):
                    candidate = knowledge_engine.get_candidate_context()
                    if candidate:
                        scenario_id = candidate.get('scenario_id', 'devops-redis-latency')
                        logger.info(f">>> Detected field: {candidate.get('field')}, using scenario: {scenario_id}")
    
    scenario = loader.get_scenario(scenario_id)
    
    if not scenario:
        logger.warning(f"Scenario {scenario_id} not found, falling back to devops-redis-latency")
        scenario = loader.get_scenario("devops-redis-latency")

    logger.info(f"Starting interview: {scenario.title}")

    # Initialize Components
    groq_key = os.getenv("GROQ_API_KEY")
    groq_llm = groq.LLM(
        model="llama-3.1-8b-instant",
        api_key=groq_key,
    )
    
    # Initialize Audit Logger
    audit_logger = SessionAuditLogger(
        session_id=ctx.job.id,
        candidate_id=ctx.job.metadata or "unknown_candidate"
    )
    audit_logger.log_event("System", "SESSION_START", "Interview session initialized")
    
    # Create the AgentSession (Pipeline)
    session = AgentSession(
        # STT: Deepgram (Low Latency)
        stt=deepgram.STT(model="nova-3", language="en-US"),
        
        # LLM: Groq (Low Latency)
        llm=groq_llm,
        
        # TTS: Deepgram (Low Latency)
        tts=deepgram.TTS(model="aura-asteria-en"),
        
        vad=ctx.proc.userdata["vad"],
    )

    # 1. Incident Lead (Hiring Manager)
    # Passed as the 'agent' logic to the session
    lead_agent_logic = IncidentLead(scenario, groq_llm, audit_logger)
    
    # 2. Pressure Agent (Stakeholder)
    pressure_agent = PressureAgent(ctx.room, lead_agent_logic, scenario.stakeholder_persona, groq_llm, audit_logger)
    
    # 3. Observer Agent (Grader)
    observer_agent = ObserverAgent(scenario.observer_metrics, groq_llm, audit_logger)
    
    # 4. Mole Agent (Integrity Tester)
    # Using a simplified mock persona for now or from scenario if available
    mole_persona = scenario.stakeholder_persona # Fallback or use specific
    mole_agent = MoleAgent(ctx.room, mole_persona, groq_llm, audit_logger)

    # --- Wire Transcripts to Observer Agent ---
    @session.on("user_input_transcribed")
    def on_user_speech(ev):
        # ev is UserInputTranscribedEvent with `transcript` and `is_final`
        if ev.is_final:
            print(f"DEBUG: User Speech Detected: {ev.transcript}")  # <--- Added Debug
            audit_logger.log_event("Candidate", "TRANSCRIPT", ev.transcript)
            observer_agent.log_turn("candidate", ev.transcript)
            
    @session.on("conversation_item_added")
    def on_agent_speech(ev):
        # ev is ConversationItemAddedEvent with `item` (ChatMessage)
        if hasattr(ev.item, 'role') and ev.item.role == 'assistant':
            content = ev.item.content if hasattr(ev.item, 'content') else str(ev.item)
            print(f"DEBUG: Agent Speech Detected: {content}") # <--- Added Debug
            audit_logger.log_event("IncidentLead", "TRANSCRIPT", content)
            observer_agent.log_turn("incident_lead", content)
    # ------------------------------------------

    # Start the Interview Loop
    # session.start() manages the voice pipeline
    await session.start(agent=lead_agent_logic, room=ctx.room)
    
    # Start background agents
    await pressure_agent.start()
    await mole_agent.start()
    
    # Say the opening line
    await lead_agent_logic.start_interview(session)



    # Cleanup logic
    async def cleanup():
        try:
            audit_logger.log_event("System", "SESSION_END", "Interview session ended")
            
            dqi_data = observer_agent.generate_dqi_report()
            audit_logs = audit_logger.export_logs()
            
            # Prepare Raw Data for Pipeline
            raw_data = {
                "session_id": audit_logger.session_id,
                "timestamp": audit_logger._start_time.isoformat(),
                "candidate_id": audit_logger.candidate_id,
                "dqi_calculation": dqi_data,
                "audit_log": audit_logs
            }
            
            # Use Analysis Pipeline to generate Final Report
            print(f"--- Generating FSIR Report for {audit_logger.session_id} ---")
            pipeline = InterviewPipeline()
            fsir_report = pipeline.generate_detailed_report(audit_logger.session_id, raw_data)
            print("FSIR Report object created.")
            
            # Serialize
            json_output = fsir_report.model_dump_json(indent=2)
            
            # Save to file
            filename = f"fsir_{audit_logger.session_id}.json"
            print(f"Saving to {filename}...")
            with open(filename, "w") as f:
                f.write(json_output)
                
            logger.info(f"FSIR Report generated: {filename}")
            print(f"FSIR SUCCESS: {filename}")
            
        except Exception as e:
            logger.error(f"Failed to generate FSIR report: {e}")
            print(f"FSIR FAILURE: {e}")
            import traceback
            traceback.print_exc()

    ctx.add_shutdown_callback(cleanup)

    # Wait until the room is closed or process is killed
    import asyncio
    try:
        await asyncio.Future()
    except asyncio.CancelledError:
        pass
    
    await pressure_agent.stop()
    await mole_agent.stop()

if __name__ == "__main__":
    cli.run_app(server)