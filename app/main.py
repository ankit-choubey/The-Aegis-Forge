import logging
import os

from dotenv import load_dotenv
import json
import asyncio
from livekit.rtc import DataPacket

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
from app.analysis.pdf_generator import PDFReportGenerator  # [NEW] PDF Report
from backend.funnel.pipeline import knowledge_engine  # Explicit Import

from app.agents.incident_lead import IncidentLead
from app.agents.pressure import PressureAgent
from app.agents.observer import ObserverAgent
from app.agents.mole import MoleAgent
from app.agents.governor import GovernorAgent # [NEW]
from app.agents.crisis_popup import CrisisPopupAgent  # [NEW] Crisis Pop-up
from app.agents.tools import ToggleNotepad
from app.rag.scenarios import ScenarioLoader
from app.core.end_detector import check_end_phrase, get_goodbye_message  # [NEW] End detection
from app.core.interview_timer import InterviewTimer  # [NEW] 40-min timer
from app.logging.questions_logger import QuestionsLogger  # [NEW] Questions log

# Backend Imports (for Dev Mode Resume Loading)
from backend.resume_validator import validate_resume
from backend.main import UPLOADS_DIR, extract_candidate_context, detect_candidate_field
import os

load_dotenv(dotenv_path=".env.local")
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

@server.rtc_session(agent_name="aegis-interviewer")  # Named agent to match dispatch
async def my_agent(ctx: JobContext):
    """
    Main entrypoint for the Aegis Forge Interview Loop.
    Supports dynamic scenario selection based on resume audit.
    """
    logger.info(f"Connecting to room {ctx.room.name}")
    await ctx.connect()
    
    # DEFERRED IMPORTS: These are loaded here to avoid blocking process initialization
    from backend.funnel.pipeline import knowledge_engine
    from backend.resume_validator import validate_resume
    from backend.main import UPLOADS_DIR, extract_candidate_context, detect_candidate_field
    logger.info(">>> Backend modules loaded (deferred)")

    # Check for resume audit file (can be passed via metadata or default path)
    # Format: "audit:/path/to/candidate_full_audit.json"
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
            # [NEW] Detect both PDF and JSON, sort by newest
            all_files = list(uploads_dir.glob("*.pdf")) + list(uploads_dir.glob("*_audit.json"))
            candidates = sorted(all_files, key=lambda p: p.stat().st_mtime, reverse=True)
            
            if candidates:
                latest_file = candidates[0]
                logger.info(f">>> Found latest candidate file: {latest_file.name}")
                
                # If PDF, process it first (VALIDATOR CONNECTION)
                if latest_file.suffix.lower() == ".pdf":
                    logger.info(">>> Processing new PDF upload...")
                    knowledge_engine.process_candidate_pdf(str(latest_file))
                else:
                    # Valid JSON audit
                    knowledge_engine.load_resume_audit(str(latest_file))

                # Retrieve context (works for both paths)
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
        model="llama-3.3-70b-versatile",
        api_key=groq_key,
    )
    
    # Initialize Audit Logger
    audit_logger = SessionAuditLogger(
        session_id=ctx.job.id,
        candidate_id=ctx.job.metadata or "unknown_candidate"
    )
    audit_logger.log_event("System", "SESSION_START", "Interview session initialized")
    
    # Initialize Questions Logger [NEW]
    questions_logger = QuestionsLogger(
        session_id=ctx.job.id,
        candidate_name=ctx.job.metadata or "Candidate",
        domain=scenario.domain
    )
    
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
    # Initialize Incident Lead (Now with Room access for Tools)
    # CRITICAL: Wrap in try/except to prevent timeout during assignment
    logger.info(">>> Initializing IncidentLead (this may take a moment)...")
    try:
        lead_agent_logic = IncidentLead(scenario, groq_llm, audit_logger, room=ctx.room)
        logger.info(">>> IncidentLead initialized successfully.")
    except Exception as e:
        logger.error(f">>> IncidentLead initialization failed: {e}")
        # Fallback to a simple agent without dynamic questions
        from livekit.agents.voice import Agent
        lead_agent_logic = Agent(
            instructions=f"You are {scenario.hiring_manager_persona.name}. Start the interview.",
            llm=groq_llm
        )
        logger.warning(">>> Using fallback simple agent.")
    
    # 2. Pressure Agent (Stakeholder)
    pressure_agent = PressureAgent(ctx.room, lead_agent_logic, scenario.stakeholder_persona, groq_llm, audit_logger)
    
    # 3. Observer Agent (Grader)
    observer_agent = ObserverAgent(scenario.observer_metrics, groq_llm, audit_logger)
    
    # 4. Mole Agent (Integrity Tester)
    # Using a simplified mock persona for now or from scenario if available
    mole_persona = scenario.stakeholder_persona # Fallback or use specific
    mole_agent = MoleAgent(ctx.room, mole_persona, groq_llm, audit_logger)

    # 5. Governor Agent (Safety Valve) [NEW]
    # Instantiate with default high-risk keywords
    governor_agent = GovernorAgent()
    logger.info("Governor Agent initialized.")

    # 6. Crisis Popup Agent [NEW]
    # Get candidate name for personalization
    candidate_name = None
    if knowledge_engine.candidate_context:
        candidate_name = knowledge_engine.candidate_context.get('name', None)
    
    crisis_popup_agent = CrisisPopupAgent(
        room=ctx.room,
        domain=scenario.domain,
        llm_instance=groq_llm,
        audit_logger=audit_logger,
        lead_agent=lead_agent_logic,
        min_delay_seconds=180,  # 3 minutes
        max_delay_seconds=480   # 8 minutes
    )
    if candidate_name:
        crisis_popup_agent.set_candidate_name(candidate_name)
    logger.info(f"Crisis Popup Agent initialized for domain: {scenario.domain}")

    # 7. Interview Timer [NEW] - 40 minute max
    interview_ended = False  # Flag to prevent multiple endings
    
    async def graceful_shutdown(reason: str = "timeout"):
        """Gracefully end the interview."""
        nonlocal interview_ended
        if interview_ended:
            return
        interview_ended = True
        
        logger.info(f">>> GRACEFUL SHUTDOWN triggered: {reason}")
        audit_logger.log_event("System", "INTERVIEW_END", f"Reason: {reason}")
        
        # 1. Stop background agents
        await pressure_agent.stop()
        await mole_agent.stop()
        await crisis_popup_agent.stop()
        await interview_timer.stop()
        
        # 2. Say goodbye
        goodbye_msg = get_goodbye_message(candidate_name)
        try:
            if hasattr(session, 'say'):
                await session.say(goodbye_msg, allow_interruptions=False)
        except Exception as e:
            logger.error(f"Failed to say goodbye: {e}")
        
        # 3. Send END_INTERVIEW signal to frontend
        try:
            payload = json.dumps({
                "type": "INTERVIEW_END",
                "reason": reason
            }).encode("utf-8")
            await ctx.room.local_participant.publish_data(payload, reliable=True)
        except Exception as e:
            logger.error(f"Failed to send end signal: {e}")
        
        # 4. Wait a moment for goodbye to finish
        await asyncio.sleep(3)
        
        # 5. Disconnect (this will trigger cleanup)
        try:
            await ctx.room.disconnect()
        except Exception as e:
            logger.error(f"Failed to disconnect: {e}")
    
    async def on_timer_timeout():
        """Called when 40-minute timer expires."""
        logger.info(">>> 40-minute interview limit reached!")
        await graceful_shutdown("timeout")
    
    async def on_timer_warning():
        """Called at 35 minutes (5-min warning)."""
        try:
            warning_msg = "Just a heads up, we have about 5 minutes left in our interview."
            if hasattr(session, 'say'):
                await session.say(warning_msg, allow_interruptions=True)
            audit_logger.log_event("System", "TIME_WARNING", "5 minutes remaining")
        except Exception as e:
            logger.error(f"Failed to say warning: {e}")
    
    interview_timer = InterviewTimer(
        max_duration_seconds=2400,  # 40 minutes
        on_timeout=on_timer_timeout,
        warning_at_seconds=2100  # 35 minutes
    )
    interview_timer.set_warning_callback(on_timer_warning)

    # --- Wire Transcripts to Observer Agent ---
    @session.on("user_input_transcribed")
    def on_user_speech(ev):
        # ev is UserInputTranscribedEvent with `transcript` and `is_final`
        if ev.is_final:
            print(f"DEBUG: User Speech Detected: {ev.transcript}")  # <--- Added Debug
            audit_logger.log_event("Candidate", "TRANSCRIPT", ev.transcript)
            observer_agent.log_turn("candidate", ev.transcript)

            # --- GOVERNOR SAFETY CHECK [NEW] ---
            # We pass a default confidence of 1.0 for now as we don't have real-time confidence stream
            is_safe = governor_agent.check_safety(ev.transcript, observer_confidence=1.0)
            if not is_safe:
                logger.critical(f"GOVERNOR INTERVENTION: Safety violation detected in '{ev.transcript}'")
                audit_logger.log_event("GovernorAgent", "SAFETY_INTERVENTION", f"Risk detected: {ev.transcript}")
                # Future: await session.connection.disconnect()
            # -----------------------------------

            # --- END PHRASE DETECTION [NEW] ---
            if check_end_phrase(ev.transcript):
                logger.info(f">>> END PHRASE DETECTED: '{ev.transcript}'")
                import asyncio
                asyncio.create_task(graceful_shutdown("user_request"))
                return  # Skip further processing
            # -----------------------------------
            
            # BROADCAST TO FRONTEND
            try:
                import asyncio
                # Removed topic="chat" for backward compatibility
                task = asyncio.create_task(ctx.room.local_participant.publish_data(
                    json.dumps({"type": "TRANSCRIPT", "sender": "YOU", "text": ev.transcript}).encode("utf-8"),
                    reliable=True
                ))
                task.add_done_callback(lambda t: logger.info(f"Broadcasted USER transcript: {len(ev.transcript)} chars"))
            except Exception as e:
                logger.error(f"Failed to broadcast USER transcript: {e}")
            
    @session.on("conversation_item_added")
    def on_agent_speech(ev):
        # ev is ConversationItemAddedEvent with `item` (ChatMessage)
        # Robust check for role (handle Enum or String)
        role = getattr(ev.item, 'role', '')
        if str(role) == 'assistant':
            # Robust content extraction (handle String or List)
            raw_content = getattr(ev.item, 'content', '')
            if isinstance(raw_content, list):
                content = " ".join([str(c) for c in raw_content])
            else:
                content = str(raw_content)
                
            if content:
                print(f"DEBUG: Agent Speech Detected: {content}")
                audit_logger.log_event("IncidentLead", "TRANSCRIPT", content)
                observer_agent.log_turn("incident_lead", content)
                
                # [NEW] Log questions to questions logger
                questions_logger.detect_and_log_question(content)
                
                # BROADCAST TO FRONTEND
                try:
                    # Removed topic="chat" for backward compatibility
                    task = asyncio.create_task(ctx.room.local_participant.publish_data(
                        json.dumps({"type": "TRANSCRIPT", "sender": "AGENT", "text": content}).encode("utf-8"),
                        reliable=True
                    ))
                    # Add callback to log success/failure of task
                    def _log_broadcast_result(t):
                        try:
                            t.result()
                            logger.info(f"Broadcasted AGENT transcript: {len(content)} chars")
                        except Exception as e:
                            logger.error(f"Async Broadcast Failed: {e}")
                    task.add_done_callback(_log_broadcast_result)
                    
                except Exception as e:
                    logger.error(f"Failed to broadcast AGENT transcript: {e}")

    # --- Listen for Frontend Code Submissions ---
    @ctx.room.on("data_received")
    def on_data(datapacket: DataPacket):
        try:
            data_str = datapacket.data.decode("utf-8")
            payload = json.loads(data_str)
            
            if payload.get("type") == "ALGO_SUBMIT":
                code = payload.get("code")
                logger.info(f">>> RECEIVED CODE SUBMISSION ({len(code)} chars)")
                
                # 1. Log to Audit
                audit_logger.log_event("Candidate", "CODE_SUBMIT", code)
                
                # [NEW] Log code submission to questions logger
                questions_logger.log_code_submission(code)
                
                # 2. Inject into LLM Context
                lead_agent_logic.chat_ctx.append(
                    llm.ChatMessage(
                        role="user", 
                        content=f"I have written the following Python code:\n```python\n{code}\n```\nPlease evaluate it."
                    )
                )
                
                # 3. Trigger Agent Acknowledgment
                asyncio.create_task(lead_agent_logic.say("I have received your code. Let me check it.", allow_interruptions=True))
                
        except Exception as e:
            logger.error(f"Error processing data packet: {e}")
            
    # ------------------------------------------

    # Start the Interview Loop
    # session.start() manages the voice pipeline
    await session.start(agent=lead_agent_logic, room=ctx.room)
    
    # Start background agents
    await pressure_agent.start()
    await mole_agent.start()
    await crisis_popup_agent.start()  # [NEW] Start crisis timer
    await interview_timer.start()  # [NEW] Start 40-min timer
    
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
            
            # [NEW] Generate PDF Report
            try:
                pdf_generator = PDFReportGenerator()
                pdf_bytes = pdf_generator.generate_report_bytes(fsir_report.model_dump())
                pdf_filename = f"fsir_{audit_logger.session_id}.pdf"
                with open(pdf_filename, "wb") as pdf_file:
                    pdf_file.write(pdf_bytes)
                logger.info(f"PDF Report generated: {pdf_filename}")
                print(f"PDF SUCCESS: {pdf_filename}")
            except Exception as pdf_err:
                logger.error(f"Failed to generate PDF report: {pdf_err}")
                print(f"PDF FAILURE: {pdf_err}")
            
            # [NEW] Save Questions Log
            questions_filename = questions_logger.save_to_file()
            print(f"Questions log saved: {questions_filename}")
            
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
    await crisis_popup_agent.stop()  # [NEW] Stop crisis timer

if __name__ == "__main__":
    cli.run_app(server)