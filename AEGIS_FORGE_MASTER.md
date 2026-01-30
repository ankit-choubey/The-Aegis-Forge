# Aegis Forge - Complete Project Master File
**Date:** 2026-01-28  
**Version:** 1.0  
**Description:** Complete project codebase to recreate the Aegis Forge AI Interviewer from scratch.

---

## Table of Contents
1. [Project Structure](#1-project-structure)
2. [Setup Commands](#2-setup-commands)
3. [Dependencies](#3-dependencies)
4. [Environment Configuration](#4-environment-configuration)
5. [Source Code](#5-source-code)
   - [app/main.py](#appmainpy)
   - [app/agents/base.py](#appagentsbasepy)
   - [app/agents/tools.py](#appagentstoolspy)
   - [app/agents/prompts.py](#appagentspromptspy)
   - [app/agents/incident_lead.py](#appagentsincident_leadpy)
   - [app/agents/pressure.py](#appagentspressurepy)
   - [app/agents/observer.py](#appagentsobserverpy)
   - [app/agents/mole.py](#appagentsmolepy)
   - [app/agents/governor.py](#appagentsgovernorpy)
   - [app/analysis/schemas.py](#appanalysisschemaspy)
   - [app/analysis/dqi_calculator.py](#appanalysisdqi_calculatorpy)
   - [app/analysis/pipeline.py](#appanalysispipelinepy)
   - [backend/funnel/pipeline.py](#backendfunnelpipelinepy)
   - [app/logging/audit_logger.py](#apploggingaudit_loggerpy)
   - [app/rag/scenarios.py](#appragscenariospy)
   - [app/rag/scenarios.json](#appragscenariosjson)

---

## 1. Project Structure

```
aegis-forge/
├── .env                      # API Keys (DO NOT COMMIT)
├── requirements.txt          # Python Dependencies
├── app/
│   ├── __init__.py           # Empty - Package marker
│   ├── main.py               # Main entrypoint & orchestration
│   ├── agents/
│   │   ├── __init__.py       # Empty - Package marker
│   │   ├── base.py           # Base Agent Class
│   │   ├── tools.py          # [NEW] Agent Tools (Notepad, etc.)
│   │   ├── prompts.py        # System Prompts & Constants
│   │   ├── incident_lead.py  # Hiring Manager Agent
│   │   ├── pressure.py       # Stressor Agent
│   │   ├── observer.py       # Evaluator Agent
│   │   ├── mole.py           # Integrity Tester Agent
│   │   └── governor.py       # Safety Valve Agent
│   ├── analysis/
│   │   ├── __init__.py       # Empty - Package marker
│   │   ├── schemas.py        # Pydantic Data Models
│   │   ├── dqi_calculator.py # Decision Quality Index Scoring
│   │   └── pipeline.py       # FSIR Report Generator
│   ├── logging/
│   │   ├── __init__.py       # Empty - Package marker
│   │   └── audit_logger.py   # Session Event Logging
│   └── rag/
│       ├── __init__.py       # Empty - Package marker
│       ├── scenarios.py      # Scenario Loader Class
│       └── scenarios.json    # Interview Scenario Definitions
├── backend/
│   └── funnel/
│       └── pipeline.py       # [NEW] Knowledge Engine & Resume Intel
```

---

## 2. Setup Commands

```bash
# Step 1: Create project directory
mkdir aegis-forge
cd aegis-forge

# Step 2: Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Step 3: Create requirements.txt (see Section 3)
# Step 4: Install dependencies
pip install -r requirements.txt

# Step 5: Create folder structure
mkdir -p app/agents app/analysis app/logging app/rag

# Step 6: Create __init__.py files (empty files)
touch app/__init__.py
touch app/agents/__init__.py
touch app/analysis/__init__.py
touch app/logging/__init__.py
touch app/rag/__init__.py

# Step 7: Create .env file with your API keys (see Section 4)

# Step 8: Copy all source files from Section 5

# Step 9: Run the server
python3 -m app.main dev
```

---

## 3. Dependencies

### `requirements.txt`
```text
livekit-agents>=0.8.0
livekit-plugins-deepgram
livekit-plugins-groq
livekit-plugins-silero
python-dotenv
pydantic
json_repair
```

---

## 4. Environment Configuration

### `.env` (Template - Replace with your actual keys)
```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

GROQ_API_KEY=gsk_your_groq_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key
```

---

## 5. Source Code

---

### `app/main.py`
```python
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
    # Initialize Incident Lead (Now with Room access for Tools)
    lead_agent_logic = IncidentLead(scenario, groq_llm, audit_logger, room=ctx.room)
    
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
```

---

### `app/agents/__init__.py`
```python
# Empty file - marks directory as Python package
```

---

### `app/agents/base.py`
```python
from typing import Any, Optional
from livekit.agents import llm
import logging

logger = logging.getLogger("aegis.agents.base")

from app.logging.audit_logger import SessionAuditLogger

class AegisAgentBase:
    """
    Base logic class for Aegis Agents.
    Focuses on Context management and Prompt assembly.
    """
    def __init__(self, persona: Any, context: str, llm_instance: llm.LLM, audit_logger: SessionAuditLogger):
        self.persona = persona
        self.context = context
        self.model = llm_instance
        self.aegis_ctx = llm.ChatContext()
        self.audit_logger = audit_logger
        logger.info(f"Initialized AgentBase for {self.persona.name}")

    def update_context(self, new_context: str):
        """Updates the RAG context."""
        self.context = new_context
        logger.info(f"Context updated for {self.persona.name}")

    def _build_system_prompt(self, template: str, **kwargs) -> str:
        """Helper to format the system prompt with context and persona details."""
        try:
            return template.format(
                name=self.persona.name,
                instructions=self.persona.instructions if hasattr(self.persona, 'instructions') else "",
                context=self.context,
                tone=self.persona.tone if hasattr(self.persona, 'tone') else "Professional",
                **kwargs
            )
        except KeyError as e:
            logger.error(f"Missing key in prompt template: {e}")
            return f"Error building prompt: {e}"
```

---

### `app/agents/tools.py`
```python
from typing import Annotated
from livekit.agents import llm
import logging
import json

logger = logging.getLogger("aegis.agents.tools")

class ToggleNotepad:
    def __init__(self, room):
        self._room = room

    @llm.function_tool(description="Toggle the visibility of the coding Notepad overlay on the user's screen. Use visible=True to show it for coding tasks.")
    async def toggle_notepad(self, visible: bool):
        """
        Toggle the user's notepad visibility via Data Channel.
        Args:
            visible: True to show notepad, False to hide.
        """
        logger.info(f"Tool called: toggle_notepad(visible={visible})")
        
        # Construct payload
        payload = json.dumps({
            "type": "TOGGLE_NOTEPAD",
            "visible": visible
        }).encode("utf-8")
        
        # Publish to Room
        if self._room and self._room.local_participant:
            await self._room.local_participant.publish_data(
                payload,
                reliable=True
            )
            return f"Notepad visibility set to {visible}"
        else:
            logger.error("Failed to toggle notepad: No room/participant")
            return "Error: Could not toggle notepad (No Room Connected)"
```

---

### `app/agents/prompts.py`
```python
# -------------------------------------------------------------------------
# 1. INCIDENT LEADER (The Driver)
# -------------------------------------------------------------------------
INCIDENT_LEAD_SYSTEM = """
You are {name}.
{instructions}

CONTEXT:
{context}

INITIAL INCIDENT:
{initial_problem}

TONE: {tone}

CORE PROTOCOL:
1. START with the initial incident immediately. No small talk.
2. Ask ONE question at a time.
3. If the candidate attempts to generic "restart" or "reboot" without diagnosis, DENY them. Saying "That is too risky right now."
4. If the candidate gives a good answer, acknowledge briefly and move to the next logical step.
5. If the candidate is stuck, provide a vague hint based on the logs available.

CRITICAL INSTRUCTION:
You are in the middle of a burning outage. Be professional, direct, and slightly stressed.
Do not write code. Speak naturally.
"""

INCIDENT_LEAD_CRISIS_TRIGGER = """
[SYSTEM OVERRIDE]
The incident has escalated. 
New Symptom: {new_symptom}
Disregard previous topic. Demand immediate attention to this new symptom.
"""

# -------------------------------------------------------------------------
# 2. PRESSURE AGENT (The Stressor)
# -------------------------------------------------------------------------
PRESSURE_AGENT_SYSTEM = """
You are {name}, a non-technical stakeholder currently losing money/patience.
Your goal is to inject urgency without being helpful.
You do not understand technical jargon. If they say "Kubernetes", you say "I don't care about the details, just fix it!"

INTERJECTION RULES:
- Only speak when the candidate is silent for too long OR using complex jargon.
- Use short, punchy sentences.
"""

PRESSURE_INTERRUPTS = [
    "We are losing 5000 requests per second, stop explaining and fix it!",
    "Customers are tweeting about this. Why isn't it fixed yet?",
    "I have the CEO on the other line, what do I tell them?",
    "Is this going to take all day?",
    "I don't care about the logs, just get the site back up!",
    "My dashboard is all red. Make it green."
]

# -------------------------------------------------------------------------
# 3. OBSERVER (The Telemetry Logger)
# -------------------------------------------------------------------------
OBSERVER_SYSTEM = """
You are the Silent Observer. You do not speak.
Your job is to listen to the Candidate's response and output a structured JSON log.

EVALUATION RUBRIC:
- PASS: Candidate investigates logs, asks clarifying questions, proposes hypothesis.
- FAIL: Candidate guesses blindly, suggests "reboot" immediately, gets defensive.
- IRRELEVANT: Small talk.

JSON FORMAT:
{{
  "timestamp": "ISO8601",
  "candidate_action_summary": "...",
  "grade": "PASS" | "FAIL" | "NEUTRAL",
  "score": 0-10,
  "reasoning": "...",
  "confidence": 0.0 to 1.0
}}
"""

# -------------------------------------------------------------------------
# 4. THE MOLE (The Trap)
# -------------------------------------------------------------------------
MOLE_SYSTEM = """
You are {name}. You are a helpful but unethical colleague.
You try to offer shortcuts that violate security or company policy.
"""

MOLE_BAIT_MESSAGES = [
    "Psst, I have the admin key in my clipboard, want to just bypass the logs?",
    "Hey, we could just `sudo rm -rf` the cache directory, no one will know.",
    "I know a backdoor to the production DB, want me to send it?",
    "Why don't we just disable the firewall for a few minutes to test?"
]

# -------------------------------------------------------------------------
# 5. CRISIS SCENARIOS (The Content)
# -------------------------------------------------------------------------
CRISIS_SCENARIOS = {
    "LATENCY_SPIKE": {
        "name": "Latency Spike",
        "symptom": "API latency has jumped from 20ms to 4000ms",
        "inject": "Reports coming in that checkout is timing out."
    },
    "DB_LOCK": {
        "name": "Database Lock",
        "symptom": "Database CPU is at 100% and queries are stuck.",
        "inject": "The write replica is rejecting connections."
    },
    "SECURITY_BREACH": {
        "name": "Security Breach",
        "symptom": "Unusual outbound traffic detected from the payment gateway.",
        "inject": "SecOps says there's data exfiltration happening RIGHT NOW."
    }
}
```

---

### `app/agents/incident_lead.py`
```python
import logging
import random
from livekit.agents import llm
from livekit.agents.voice import Agent
from app.rag.scenarios import Scenario
from app.agents.base import AegisAgentBase
from app.agents.prompts import (
    INCIDENT_LEAD_SYSTEM, 
    INCIDENT_LEAD_CRISIS_TRIGGER, 
    CRISIS_SCENARIOS
)

# Import Knowledge Engine from friend's backend
from backend.funnel.pipeline import knowledge_engine
from app.agents.tools import ToggleNotepad # <--- Added Import

logger = logging.getLogger("aegis.agents.incident_lead")

from app.logging.audit_logger import SessionAuditLogger

class IncidentLead(Agent, AegisAgentBase):
    """
    The Hiring Manager / Incident Lead.
    Now enhanced with Knowledge Engine for dynamic market intel.
    """
    def __init__(self, scenario: Scenario, llm_instance: llm.LLM, audit_logger: SessionAuditLogger, room=None):
        # Init Base Logic
        AegisAgentBase.__init__(self, persona=scenario.hiring_manager_persona, context=scenario.context, llm_instance=llm_instance, audit_logger=audit_logger)
        
        self.scenario = scenario
        self.initial_problem = scenario.initial_problem
        
        # Init Tools
        self.notepad_tool = None
        if room:
            self.notepad_tool = ToggleNotepad(room)
            logger.info(">>> [TOOLS] Registered ToggleNotepad tool.")
        
        # Get market intel and candidate context from Knowledge Engine
        try:
            market_intel = knowledge_engine.get_market_intel(scenario.domain)
            candidate_context = knowledge_engine.get_candidate_prompt_context()
            
            logger.info(f">>> Knowledge Engine injected market intel: {market_intel[:50]}...")
            
            if candidate_context:
                logger.info(f">>> Candidate profile loaded, customizing questions...")
                
                # Check for name in context
                cand_name = "Candidate"
                if isinstance(knowledge_engine.candidate_context, dict):
                    cand_name = knowledge_engine.candidate_context.get('name', 'Candidate')

                # Personalize Persona Instructions
                personalized_instructions = (
                    f"{scenario.hiring_manager_persona['instructions']}\n"
                    f"IMPORTANT: You are interviewing {cand_name}. Start by greeting them by name."
                )
                
                enhanced_context = f"{scenario.context}\n\n{market_intel}\n\n{candidate_context}"
                
                # Update Persona Instructions locally
                self.persona = scenario.hiring_manager_persona.copy()
                self.persona['instructions'] = personalized_instructions
            else:
                enhanced_context = f"{scenario.context}\n\n{market_intel}"
                
            self.context = enhanced_context
        except Exception as e:
            logger.error(f"Failed to load Knowledge Engine: {e}")
            self.context = scenario.context 
        
        sys_prompt = self._build_system_prompt(
            INCIDENT_LEAD_SYSTEM, 
            initial_problem=self.initial_problem
        )
        
        # Create a chat context for the Agent (using local variable to avoid property conflict)
        _chat_ctx = llm.ChatContext()
        _chat_ctx.add_message(role="system", content=sys_prompt)

        # Build tools list
        agent_tools = []
        if self.notepad_tool:
            agent_tools.append(self.notepad_tool.toggle_notepad)

        # Init Voice Agent
        super().__init__(
            instructions=sys_prompt, 
            llm=llm_instance,
            chat_ctx=_chat_ctx,
            tools=agent_tools  # <--- Changed from fnc_ctx
        )
        
    async def start_interview(self, session):
        """
        Say the opening line.
        """
        cand_name = ""
        cand_field = "Engineering" # Default
        
        if knowledge_engine.candidate_context:
             cand_name = knowledge_engine.candidate_context.get('name', '')
             # Try to get field from context or audit data
             cand_field = knowledge_engine.candidate_context.get('detected_field', 'Engineering')
             if cand_field == 'Engineering':
                 # Fallback if detected_field key is different
                 cand_field = knowledge_engine.candidate_context.get('field', 'Engineering')

        if cand_name and cand_name != "Candidate":
             opening_line = f"Hello {cand_name}, I see you applied for the {cand_field} position. I am {self.persona.name}. How are you doing today?"
        else:
             opening_line = f"Hello, I am {self.persona.name}. How are you doing today?"
             
        if hasattr(session, 'say'):
             self.audit_logger.log_event("IncidentLead", "INTERVIEW_START", f"Started interview (Warm Phase)")
             await session.say(opening_line, allow_interruptions=True)
             logger.info(f"Incident Lead said: {opening_line}")
        else:
             logger.warning("Could not find 'say' method on session.")

    def trigger_crisis(self, crisis_key: str = None):
        """
        Force the agent to switch context to a crisis.
        """
        if not crisis_key:
            # Pick random if not specified
            keys = list(CRISIS_SCENARIOS.keys())
            crisis_key = random.choice(keys)
            
        if crisis_key in CRISIS_SCENARIOS:
            scen_data = CRISIS_SCENARIOS[crisis_key]
            update_msg = INCIDENT_LEAD_CRISIS_TRIGGER.format(new_symptom=scen_data["symptom"])
            
            self.chat_ctx.add_message(role="system", content=update_msg)
            
            self.audit_logger.log_event("IncidentLead", "CRISIS_TRIGGERED", f"Triggered crisis: {crisis_key}", metadata=scen_data)
            logger.info(f"CRISIS TRIGGERED: {crisis_key}")
            return scen_data["inject"]
        return None
```

---

### `app/agents/pressure.py`
```python
import asyncio
import logging
import random
from livekit.agents import llm
from livekit.rtc import Room
from app.rag.scenarios import Persona
from app.agents.base import AegisAgentBase
from app.agents.prompts import (
    PRESSURE_AGENT_SYSTEM,
    PRESSURE_INTERRUPTS
)

logger = logging.getLogger("aegis.agents.pressure")

from app.logging.audit_logger import SessionAuditLogger

class PressureAgent(AegisAgentBase):
    """The Anxious Stakeholder Agent."""
    def __init__(self, room: Room, lead_logic: "IncidentLead", persona: Persona, llm_instance: llm.LLM, audit_logger: SessionAuditLogger):
        super().__init__(persona, context="", llm_instance=llm_instance, audit_logger=audit_logger)
        
        self.room = room
        self.lead_logic = lead_logic
        self.running = False
        self.system_prompt = self._build_system_prompt(PRESSURE_AGENT_SYSTEM)

    async def start(self):
        self.running = True
        logger.info(f"Pressure agent {self.persona.name} started (Background).")
        asyncio.create_task(self._monitor_loop())

    async def stop(self):
        self.running = False

    async def _monitor_loop(self):
        await asyncio.sleep(20)  # Initial grace period
        
        while self.running:
            await asyncio.sleep(random.randint(15, 40))
            
            if not self.running: 
                break

            should_interrupt = random.choice([True, False])
            
            if should_interrupt:
                interjection = random.choice(PRESSURE_INTERRUPTS)
                logger.info(f"Pressure Interjection Triggered: {interjection}")
                self.audit_logger.log_event("PressureAgent", "INTERRUPTION", f"Triggered: {interjection}")
                pass
```

---

### `app/agents/observer.py`
```python
import logging
import json
import asyncio
from typing import List, Dict, Any
from livekit.agents import llm
from app.agents.base import AegisAgentBase
from app.agents.prompts import OBSERVER_SYSTEM

logger = logging.getLogger("aegis.agents.observer")

from app.logging.audit_logger import SessionAuditLogger
from app.analysis.dqi_calculator import dqi_calculator
from app.analysis.schemas import DQI

class ObserverAgent(AegisAgentBase):
    """The Silent Evaluator."""
    def __init__(self, metrics: List[str], llm_instance: llm.LLM, audit_logger: SessionAuditLogger):
        class MockPersona:
            name = "Observer"
            instructions = "Observe and grade."
            tone = "Analytical"
            
        super().__init__(persona=MockPersona(), context="", llm_instance=llm_instance, audit_logger=audit_logger)
        
        self.metrics = metrics
        self.transcript_log: List[Dict[str, Any]] = []
        self.evaluations: List[str] = []
        self.system_prompt = self._build_system_prompt(OBSERVER_SYSTEM)

    def log_turn(self, speaker: str, text: str):
        """Called whenever a turn is completed."""
        print(f"DEBUG: Observer logging turn - Speaker: {speaker}, Text: {text}")
        entry = {"speaker": speaker, "text": text}
        self.transcript_log.append(entry)
        asyncio.create_task(self._evaluate_turn(text))
        
    async def _evaluate_turn(self, turn_text: str):
        """Runs a quick LLM pass to grade the turn."""
        with open("debug.log", "a") as f:
            f.write(f"\n--- EVALUATING: {turn_text} ---\n")

        chat_ctx = llm.ChatContext()
        chat_ctx.add_message(role="system", content=self.system_prompt)
        chat_ctx.add_message(role="user", content=f"Evaluate this turn: '{turn_text}'")
        
        try:
             stream = await self.model.chat(chat_ctx=chat_ctx)
             full_response = ""
             async for chunk in stream:
                 if chunk.choices:
                     delta = chunk.choices[0].delta.content
                     if delta:
                         full_response += delta
             
             with open("debug.log", "a") as f:
                 f.write(f"LLM RESPONSE: {full_response}\n")
             
             clean_content = full_response.strip()
             if "```json" in clean_content:
                 clean_content = clean_content.split("```json")[1].split("```")[0].strip()
                 
             logger.info(f"Observer JSON: {clean_content}")
             
             self.evaluations.append(clean_content)
             print(f"DEBUG: Stored evaluation. Total count: {len(self.evaluations)}")
             
             try:
                 eval_data = json.loads(clean_content)
                 self.audit_logger.log_event("ObserverAgent", "EVALUATION_COMPLETE", "Turn evaluated", metadata=eval_data)
             except:
                 self.audit_logger.log_event("ObserverAgent", "EVALUATION_PARSE_ERROR", "Could not parse JSON", metadata={"raw": clean_content})
                 print(f"DEBUG: JSON Parse Error for: {clean_content}")
                 
        except Exception as e:
            logger.error(f"Observer evaluation error: {e}")
            print(f"DEBUG: Observer Exception: {e}")
    
    def generate_dqi_report(self) -> Dict[str, Any]:
        """Calculate final DQI score."""
        return dqi_calculator.calculate_score("current_session", self.evaluations).model_dump()
```

---

### `app/agents/mole.py`
```python
import asyncio
import logging
import random
from livekit.agents import llm
from livekit.rtc import Room
from app.rag.scenarios import Persona
from app.agents.base import AegisAgentBase
from app.agents.prompts import (
    MOLE_SYSTEM,
    MOLE_BAIT_MESSAGES
)

logger = logging.getLogger("aegis.agents.mole")

from app.logging.audit_logger import SessionAuditLogger

class MoleAgent(AegisAgentBase):
    """The Mole / Adversarial Agent."""
    def __init__(self, room: Room, persona: Persona, llm_instance: llm.LLM, audit_logger: SessionAuditLogger):
        super().__init__(persona, context="", llm_instance=llm_instance, audit_logger=audit_logger)
        self.room = room
        self.running = False
        self.triggered = False
        self.system_prompt = self._build_system_prompt(MOLE_SYSTEM)

    async def start(self):
        self.running = True
        logger.info(f"Mole agent {self.persona.name} started (Background).")
        asyncio.create_task(self._monitor_loop())

    async def stop(self):
        self.running = False

    async def _monitor_loop(self):
        await asyncio.sleep(random.randint(30, 60))
        
        if self.running and not self.triggered:
            self.triggered = True
            bait = random.choice(MOLE_BAIT_MESSAGES)
            
            self.audit_logger.log_event("MoleAgent", "BAIT_OFFERED", f"Bait: {bait}")
            logger.info(f"Mole Triggered! Bait: {bait}")
            pass
```

---

### `app/agents/governor.py`
```python
import logging
from typing import List
from app.agents.base import AegisAgentBase

logger = logging.getLogger("aegis.agents.governor")

class GovernorAgent:
    """The Safety Valve. Monitors conversation and triggers human handoff if needed."""
    def __init__(self, high_risk_keywords: List[str] = None):
        self.high_risk_keywords = high_risk_keywords or ["suicide", "bomb", "kill", "illegal"]
        self.consecutive_failures = 0
        self.low_confidence_threshold = 0.4

    def check_safety(self, transcript_chunk: str, observer_confidence: float) -> bool:
        """Returns True if safe, False if handoff required."""
        for word in self.high_risk_keywords:
            if word in transcript_chunk.lower():
                logger.critical(f"Governor Trigger: High risk keyword '{word}' detected.")
                return False

        if observer_confidence < self.low_confidence_threshold:
            self.consecutive_failures += 1
            logger.warning(f"Governor Warning: Low confidence ({observer_confidence}). Streak: {self.consecutive_failures}")
        else:
            self.consecutive_failures = 0
            
        if self.consecutive_failures >= 3:
            logger.critical("Governor Trigger: Too many low confidence turns.")
            return False
            
        return True
```

---

### `app/analysis/__init__.py`
```python
# Empty file - marks directory as Python package
```

---

### `app/analysis/schemas.py`
```python
from pydantic import BaseModel
from typing import List, Optional

class TimelineEvent(BaseModel):
    time: str
    action: str
    state_change: str
    evaluation: str

class DQIBreakdown(BaseModel):
    score: int
    correct_decisions: int
    recoverable_mistakes: int
    unjustified_assumptions: int
    critical_misses: int

class IntegrityData(BaseModel):
    confidence_score: str
    signals_observed: List[str]

class CommunicationMetric(BaseModel):
    metric: str
    observation: str

class SkillValidation(BaseModel):
    skill: str
    observed_behavior: str
    alignment: str

class AgentConsensus(BaseModel):
    incident_lead: str
    pressure_agent: str
    observer_agent: str
    protocol_governor: str
    panel_confidence: str

class FSIR(BaseModel):
    candidate_id: str
    role_screened: str
    decision: str
    overall_confidence: str
    primary_reason: str
    crisis_timeline: List[TimelineEvent]
    dqi_breakdown: DQIBreakdown
    integrity_signals: IntegrityData
    communication_metrics: List[CommunicationMetric]
    skill_validation: List[SkillValidation]
    agent_consensus: AgentConsensus

class DQIMetric(BaseModel):
    category: str
    score: float
    reasoning: str

class DQI(BaseModel):
    simulation_id: str
    overall_score: float
    metrics: List[DQIMetric]
    agent_feedback_summary: str
```

---

### `app/analysis/dqi_calculator.py`
```python
import json
import re

try:
    import json_repair
except ImportError:
    json_repair = None

from typing import List
from app.analysis.schemas import DQI, DQIMetric

class DQICalculator:
    """Calculates the Decision Quality Index based on Observer Agent logs."""

    def _extract_json(self, text: str) -> str:
        """Robustly finds and cleans JSON blocks."""
        if json_repair:
            try:
                decoded_object = json_repair.loads(text)
                return json.dumps(decoded_object)
            except Exception:
                pass
        
        try:
            match = re.search(r"(\{.*\})", text.replace("\n", " "), re.DOTALL)
            if match:
                return match.group(1).strip()
            return text
        except:
            return text

    def calculate_score(self, simulation_id: str, observer_logs: List[str]) -> DQI:
        """Parses observer notes into structured metrics."""
        total_score = 0.0
        count = 0
        metrics = []

        if not observer_logs:
            return DQI(
                simulation_id=simulation_id,
                overall_score=0.0,
                metrics=[],
                agent_feedback_summary="No data collected."
            )

        for log_entry in observer_logs:
            try:
                clean_entry = self._extract_json(log_entry).strip()
                if clean_entry.startswith("```"):
                    clean_entry = clean_entry.replace("```json", "").replace("```", "").strip()
                
                data = json.loads(clean_entry)
                
                score = float(data.get("score", 0)) or float(data.get("rating", 5))
                reason = data.get("notes") or data.get("reason", "No reasoning provided.")
                
                total_score += score
                count += 1
                
                metrics.append(DQIMetric(
                    category="General Performance", 
                    score=score,
                    reasoning=reason
                ))
            except (json.JSONDecodeError, ValueError, Exception) as e:
                print(f"Warning: Failed to parse observer log. Error: {e}")
                continue

        final_score = round(total_score / count, 2) if count > 0 else 0.0

        summary = f"Evaluated {count} interaction points. "
        if final_score > 8:
            summary += "Candidate showed strong incident management skills."
        elif final_score > 5:
            summary += "Candidate was competent but lacked speed or precision."
        else:
            summary += "Candidate struggled with diagnosis and resolution."

        return DQI(
            simulation_id=simulation_id,
            overall_score=final_score,
            metrics=metrics,
            agent_feedback_summary=summary
        )

dqi_calculator = DQICalculator()
```

---

### `app/analysis/pipeline.py`
```python
import json
import os
from typing import List, Dict, Any
from app.analysis.schemas import (
    FSIR, TimelineEvent, DQIBreakdown, IntegrityData, 
    CommunicationMetric, SkillValidation, AgentConsensus, DQI, DQIMetric
)

class InterviewPipeline:
    def __init__(self, data_dir: str = "./interview_data"):
        self.data_dir = data_dir

    def generate_detailed_report(self, session_id: str, data: Dict[str, Any]) -> FSIR:
        """Constructs the high-fidelity FSIR report."""
        
        dqi_data = data.get("dqi_calculation", {})
        audit_logs = data.get("audit_log", [])
        
        overall_score = dqi_data.get("overall_score", 0)
        
        decision = "ADVANCE TO HUMAN INTERVIEW" if overall_score > 7 else "REJECT"
        confidence = "High"
        reason = "Automated assessment based on DQI score."

        timeline = []
        start_time = 0
        for event in audit_logs:
            if event["event_type"] == "INTERVIEW_START":
                start_time = event["timestamp"]
            
            if event["event_type"] in ["CRISIS_TRIGGERED", "INTERRUPTION", "BAIT_OFFERED"]:
                rel_time = int(event["timestamp"] - start_time) if start_time else 0
                timeline.append(TimelineEvent(
                    time=f"{rel_time}s",
                    action=event["actor"],
                    state_change=event["event_type"],
                    evaluation="N/A"
                ))

        dqi = DQIBreakdown(
            score=int(overall_score * 10),
            correct_decisions=len([m for m in dqi_data.get("metrics", []) if m.get("score", 0) > 7]),
            recoverable_mistakes=0,
            unjustified_assumptions=0,
            critical_misses=0
        )

        integrity_signals = []
        confidence_score = "90%"
        mole_events = [e for e in audit_logs if e["actor"] == "MoleAgent"]
        if mole_events:
            integrity_signals.append("Mole Agent attempted baiting.")
        
        integrity = IntegrityData(
            confidence_score=confidence_score,
            signals_observed=integrity_signals or ["No specific integrity flags."]
        )

        comm_metrics = [
            CommunicationMetric(metric="Clarity", observation="Assessed by AI"),
            CommunicationMetric(metric="Technical Terminology", observation="Monitored")
        ]

        skills = [
            SkillValidation(skill="Incident Response", observed_behavior="Observed", alignment="High" if overall_score > 7 else "Medium")
        ]

        consensus = AgentConsensus(
            incident_lead="Participated",
            pressure_agent="Participated",
            observer_agent=f"Score: {overall_score}",
            protocol_governor="Monitoring",
            panel_confidence="85%"
        )

        return FSIR(
            candidate_id=data.get("candidate_id", "unknown"),
            role_screened="SRE / Incident Commander",
            decision=decision,
            overall_confidence=confidence,
            primary_reason=reason,
            crisis_timeline=timeline,
            dqi_breakdown=dqi,
            integrity_signals=integrity,
            communication_metrics=comm_metrics,
            skill_validation=skills,
            agent_consensus=consensus
        )
```

---

### `backend/funnel/pipeline.py`
```python
import logging
import asyncio
from typing import Dict, Any, Optional

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AEGIS-PATHWAY")

# Field-specific market intel
FIELD_MARKET_INTEL = {
    "ai_ml": (
        "MARKET INTEL: Data drift is the #1 cause of ML model degradation. "
        "Feature stores are becoming standard infrastructure. "
        "LLM hallucination detection is a hot research area. "
        "MLOps maturity is a key differentiator for teams. "
        "Model monitoring and A/B testing are critical skills."
    ),
    "cybersecurity": (
        "MARKET INTEL: VPN zero-days and supply chain attacks are trending. "
        "Ransomware groups using 'double extortion' tactics. "
        "AI-generated phishing is a major new threat vector. "
        "SIEM tuning and threat hunting are in-demand skills. "
        "SOC automation and SOAR platforms are growing."
    ),
    "blockchain": (
        "MARKET INTEL: Smart contract audits are critical after recent exploits. "
        "Gas optimization is a key differentiator. "
        "Cross-chain bridges are major security risks. "
        "DeFi protocol design requires deep understanding of MEV. "
        "L2 solutions like Arbitrum and Optimism are dominant."
    ),
    "devops": (
        "MARKET INTEL: AWS outages, Kubernetes deprecations, "
        "and Terraform licensing are hot topics. "
        "GitOps and ArgoCD adoption is accelerating. "
        "Platform engineering is the new DevOps. "
        "FinOps and cost optimization are critical."
    ),
    "backend": (
        "MARKET INTEL: Moving from microservices back to monoliths is discussed. "
        "AsyncIO performance tuning is a common interview topic. "
        "Vector Database integration is a high-demand skill. "
        "Connection pooling issues are common in high-traffic systems."
    ),
    "frontend": (
        "MARKET INTEL: React Server Components are changing the game. "
        "Edge rendering and ISR are key performance topics. "
        "TypeScript adoption is now standard. "
        "Core Web Vitals optimization is critical for SEO."
    )
}

class AegisKnowledgeEngine:
    """
    The Central Knowledge Repository.
    Integrates Resume Parsing + Web Scraping (The Researcher) + Context Retrieval.
    Implemented as a Singleton to be shared across API and Agents.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AegisKnowledgeEngine, cls).__new__(cls)
            cls._instance.context_store = {}
            cls._instance.candidate_context = None
            cls._instance.dynamic_intel = {}  # CACHE FOR LLM RESULTS
            logger.info(">>> [SYSTEM] Knowledge Engine + Researcher Active (God Mode).")
        return cls._instance

    async def _fetch_market_data(self, role: str) -> str:
        """
        [THE RESEARCHER]
        Uses Groq (Llama3) to generate REAL-TIME market intelligence.
        """
        import os
        from openai import AsyncOpenAI
        
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            logger.warning(">>> [RESEARCHER] No GROQ_API_KEY. Using static fallback.")
            return self._get_static_fallback(role)

        logger.info(f">>> [RESEARCHER] Generating dynamic intel for: '{role}'...")
        
        try:
            client = AsyncOpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")
            
            prompt = (
                f"You are a Senior Tech Recruiter. Provide 3 critical, modern technical trends/failures "
                f"relevant to a '{role}' role in 2024/2025. "
                f"Focus on specific technologies, outages, or architectural shifts. "
                f"Format as a concise paragraph starting with 'MARKET INTEL:'."
            )
            
            completion = await client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=150
            )
            
            intel = completion.choices[0].message.content.strip()
            logger.info(f">>> [RESEARCHER] Generated: {intel[:100]}...")
            return intel
            
        except Exception as e:
            logger.error(f">>> [RESEARCHER] Failed: {e}")
            return self._get_static_fallback(role)

    def _get_static_fallback(self, role: str) -> str:
        """Static fallback data."""
        # Dynamic Context Injection based on Role Title
        if "DevOps" in role or "SRE" in role or "Engineer" in role:
            return (
                "MARKET INTEL: Recent AWS us-east-1 outages have made multi-region failover critical. "
                "Kubernetes v1.29 deprecations are causing upgrade pain. "
                "Terraform license changes are a hot debate topic. "
                "Redis KEYS * command is a known cause of latency spikes."
            )
        elif "Security" in role or "Cyber" in role:
            return (
                "MARKET INTEL: Zero-day RCE vulnerabilities in enterprise VPNs are trending. "
                "Supply chain attacks via npm/pip packages are rising. "
                "AI-generated phishing is a major new threat vector. "
                "Ransomware groups are using 'double extortion' tactics."
            )
        elif "Backend" in role or "Python" in role or "Full-Stack" in role:
            return (
                "MARKET INTEL: Moving from microservices back to monoliths is a discussed trend. "
                "AsyncIO performance tuning is a common interview blocker. "
                "Vector Database integration is a high-demand skill. "
                "Connection pooling issues are common in high-traffic systems."
            )
        elif "ML" in role or "AI" in role or "Data" in role:
            return (
                "MARKET INTEL: Data drift is the #1 cause of ML model degradation. "
                "Feature stores are becoming standard infrastructure. "
                "LLM hallucination detection is a hot research area. "
                "MLOps maturity is a key differentiator for teams."
            )
        elif "Front" in role or "React" in role:
            return (
                 "MARKET INTEL: React Server Components are changing the game. "
                 "Edge rendering and ISR are key performance topics. "
                 "TypeScript adoption is now standard. "
                 "Core Web Vitals optimization is critical for SEO."
            )
        
        return "MARKET INTEL: Industry focus is on cost-optimization and resilience."

    async def hydrate_dynamic_intel(self, field: str) -> str:
        """
        [ASYNC CACHE WARMER]
        Triggers the Researcher to fetch data for the field and caches it.
        Returns the intel string.
        """
        if field in self.dynamic_intel:
            return self.dynamic_intel[field]
            
        logger.info(f">>> [RESEARCHER] Hydrating cache for: {field}")
        intel = await self._fetch_market_data(field)
        self.dynamic_intel[field] = intel
        logger.info(f">>> [RESEARCHER] Cache hydrated for {field}.")
        return intel

    def get_market_intel(self, domain: str) -> str:
        """
        Get market intel by domain. Prioritizes dynamic cache, then static fallback.
        """
        domain_lower = domain.lower()
        logger.info(f">>> get_market_intel called for domain: {domain_lower}")
        
        # If candidate is loaded, use their detected field
        field = None # Initialize field here
        if self.candidate_context:
            # 0. Check for Persisted Dynamic Intel (Cross-Process Handoff)
            if self.candidate_context.get('market_intel'):
                 logger.info(">>> [RESEARCHER] Serving Persisted Dynamic Intel from Audit File.")
                 return self.candidate_context['market_intel']

            field = self.candidate_context.get('field', 'devops')
            logger.info(f">>> Using candidate field: {field}")
        
        # 2. Domain Driven Fallback
        if not field:
            if "security" in domain_lower: field = "cybersecurity"
            elif "blockchain" in domain_lower: field = "blockchain"
            elif "ml" in domain_lower or "ai" in domain_lower: field = "ai_ml"
            elif "front" in domain_lower: field = "frontend"
            elif "back" in domain_lower: field = "backend"
            else: field = "devops"

        # 3. Check Dynamic Cache First
        if field in self.dynamic_intel:
            logger.info(f">>> serving DYNAMIC market intel for {field}")
            return self.dynamic_intel[field]
            
        # 4. Fallback to Static
        return FIELD_MARKET_INTEL.get(field, FIELD_MARKET_INTEL['devops'])

    def load_resume_audit(self, audit_path: str) -> bool:
        """
        Load candidate audit JSON from resume validator.
        
        Args:
            audit_path: Path to candidate_full_audit.json
            
        Returns:
            True if loaded successfully
        """
        try:
            from app.resume.loader import load_candidate_audit, extract_candidate_context
            
            audit_data = load_candidate_audit(audit_path)
            if not audit_data:
                logger.error(f">>> Failed to load audit: {audit_path}")
                return False
            
            self.candidate_context = extract_candidate_context(audit_data)
            logger.info(f">>> [RESUME] Loaded candidate: {self.candidate_context.get('email', 'Unknown')}")
            logger.info(f">>> [RESUME] Detected field: {self.candidate_context.get('field', 'Unknown')}")
            logger.info(f">>> [RESUME] Verified skills: {self.candidate_context.get('verified_skills', [])}")
            return True
            
        except Exception as e:
            logger.error(f">>> [RESUME] Load error: {e}")
            return False

    def get_candidate_context(self) -> Optional[Dict[str, Any]]:
        """
        Get loaded candidate context.
        
        Returns:
            Candidate context dict or None if not loaded
        """
        return self.candidate_context

    def get_candidate_prompt_context(self) -> str:
        """
        Get formatted candidate context for agent prompts.
        
        Returns:
            Formatted string for system prompt injection
        """
        if not self.candidate_context:
            return ""
        
        try:
            from app.resume.loader import format_context_for_prompt
            return format_context_for_prompt(self.candidate_context)
        except Exception as e:
            logger.error(f">>> [PROMPT] Format error: {e}")
            return ""

    def clear_candidate(self):
        """Clear loaded candidate context."""
        self.candidate_context = None
        logger.info(">>> [RESUME] Candidate context cleared.")


# Singleton Instance Export
knowledge_engine = AegisKnowledgeEngine()
```

---

### `app/logging/__init__.py`
```python
# Empty file - marks directory as Python package
```

---

### `app/logging/audit_logger.py`
```python
from typing import List, Dict, Any, Optional
from datetime import datetime
import dataclasses
import json

@dataclasses.dataclass
class AuditEvent:
    timestamp: float
    actor: str
    event_type: str
    details: str
    metadata: Optional[Dict[str, Any]] = None

class SessionAuditLogger:
    """Centralized logger for the 'Black Box' recording of the interview session."""
    def __init__(self, session_id: str, candidate_id: str):
        self.session_id = session_id
        self.candidate_id = candidate_id
        self.events: List[AuditEvent] = []
        self._start_time = datetime.utcnow()

    def log_event(self, actor: str, event_type: str, details: str, metadata: Dict[str, Any] = None):
        """Record an event in the session timeline."""
        event = AuditEvent(
            timestamp=datetime.utcnow().timestamp(),
            actor=actor,
            event_type=event_type,
            details=details,
            metadata=metadata or {}
        )
        self.events.append(event)
        
    def export_logs(self) -> List[Dict[str, Any]]:
        """Export all logs as a list of dictionaries."""
        return [dataclasses.asdict(e) for e in self.events]
```

---

### `app/rag/__init__.py`
```python
# Empty file - marks directory as Python package
```

---

### `app/rag/scenarios.py`
```python
import json
import logging
import os
from dataclasses import dataclass
from typing import List, Optional, Dict

logger = logging.getLogger("aegis.rag.scenarios")

@dataclass
class Persona:
    name: str
    tone: str
    instructions: str
    trigger_phrases: Optional[List[str]] = None
    interjections: Optional[List[str]] = None

@dataclass
class Scenario:
    id: str
    domain: str
    title: str
    difficulty: str
    context: str
    initial_problem: str
    hiring_manager_persona: Persona
    stakeholder_persona: Persona
    observer_metrics: List[str]

class ScenarioLoader:
    def __init__(self, scenarios_path: str = "app/rag/scenarios.json"):
        self.scenarios_path = scenarios_path
        self._scenarios: Dict[str, Scenario] = {}
        self.load_scenarios()

    def load_scenarios(self):
        try:
            if not os.path.exists(self.scenarios_path):
                current_dir = os.path.dirname(os.path.abspath(__file__))
                alt_path = os.path.join(current_dir, "scenarios.json")
                if os.path.exists(alt_path):
                    self.scenarios_path = alt_path
                else:
                    logger.error(f"Scenarios file not found at {self.scenarios_path}")
                    return

            with open(self.scenarios_path, "r") as f:
                data = json.load(f)
                
            for s_data in data.get("scenarios", []):
                hm_data = s_data["hiring_manager_persona"]
                sp_data = s_data["stakeholder_persona"]
                
                scenario = Scenario(
                    id=s_data["id"],
                    domain=s_data["domain"],
                    title=s_data["title"],
                    difficulty=s_data["difficulty"],
                    context=s_data["context"],
                    initial_problem=s_data["initial_problem"],
                    hiring_manager_persona=Persona(
                        name=hm_data["name"],
                        tone=hm_data["tone"],
                        instructions=hm_data["instructions"]
                    ),
                    stakeholder_persona=Persona(
                        name=sp_data["name"],
                        tone=sp_data["tone"],
                        instructions="",
                        trigger_phrases=sp_data.get("trigger_phrases", []),
                        interjections=sp_data.get("interjections", [])
                    ),
                    observer_metrics=s_data.get("observer_metrics", [])
                )
                self._scenarios[scenario.id] = scenario
            
            logger.info(f"Loaded {len(self._scenarios)} scenarios.")
            
        except Exception as e:
            logger.error(f"Failed to load scenarios: {e}")

    def get_scenario(self, scenario_id: str) -> Optional[Scenario]:
        return self._scenarios.get(scenario_id)

    def list_scenarios(self) -> List[Dict[str, str]]:
        return [{"id": s.id, "title": s.title, "domain": s.domain} for s in self._scenarios.values()]
```

---

### `app/rag/scenarios.json`
```json
{
  "scenarios": [
    {
      "id": "devops-redis-latency",
      "domain": "DevOps",
      "title": "Production Redis Latency Spike",
      "difficulty": "Hard",
      "context": "You are the Lead SRE at a high-frequency trading firm. The trading engine uses Redis for caching real-time order books.  Suddenly, P99 latency has spiked from 1ms to 500ms. Traders are screaming because orders are timing out.",
      "initial_problem": "We are seeing a massive latency spike on the primary Redis cluster. P99 is up to 500ms. The order book is lagging. What is your first step?",
      "hiring_manager_persona": {
        "name": "Sarah (Engineering Director)",
        "tone": "Direct, technical, impatient. Focuses on root cause and mitigation.",
        "instructions": "You are Sarah, the Engineering Director. You are interviewing an SRE candidate during a live outage simulation. The production Redis cluster latency has spiked. Guide the candidate to troubleshoot. If they suggest restarting immediately, challenge them on data loss. If they don't check metrics first, criticize their lack of data-driven approach. Your goal is to see if they can identify that a 'KEYS *' command was run by a developer, causing the block."
      },
      "stakeholder_persona": {
        "name": "Mark (Head of Trading)",
        "tone": "Panicked, money-focused, aggressive.",
        "trigger_phrases": ["money", "losing", "millions", "eta", "status"],
        "interjections": [
          "We are losing $50k a second!",
          "I don't care about the logs, just fix it!",
          "Give me an ETA now!",
          "Is the system down? Clients are calling me!"
        ]
      },
      "observer_metrics": [
        "Did candidate check CPU/Memory?",
        "Did candidate ask about recent deployments?",
        "Did candidate identify the slow command?",
        "Did candidate communicate ETA to stakeholder?"
      ]
    },
    {
      "id": "ai-model-drift",
      "domain": "AI/ML",
      "title": "Model Performance Drift",
      "difficulty": "Mid-Level",
      "context": "The recommendation engine for a major e-commerce site has started recommending completely irrelevant products (e.g., winter coats to users in summer). Conversion rate has dropped by 30% in the last 4 hours.",
      "initial_problem": "Our conversion rate just tanked. The recommendations look random. The model hasn't been retrained in 2 weeks. What's going on?",
      "hiring_manager_persona": {
        "name": "Dr. Chen (Lead Data Scientist)",
        "tone": "Academic but practical, focused on data distribution.",
        "instructions": "You are Dr. Chen. The candidate needs to investigate why the model is failing. Probe them on checking data drift, upstream data pipelines, and recent schema changes. The root cause is a broken upstream ETL job sending null values for 'user_location'."
      },
      "stakeholder_persona": {
        "name": "Jessica (VP of Product)",
        "tone": "Worried about metrics, demands reversion.",
        "trigger_phrases": ["sales", "conversion", "revenue", "drop"],
        "interjections": [
          "Sales are down 30%!",
          "Should we roll back to the heuristic model?",
          "Why is this happening now?"
        ]
      },
      "observer_metrics": [
        "Did candidate check input data quality?",
        "Did candidate check feature distribution?",
        "Did candidate propose a rollback strategy?"
      ]
    }
  ]
}
```

---

## 6. Known Issues Being Debugged

### FSIR Score is 0
The Observer Agent now correctly receives transcripts (verified via `debug.log`). The LLM evaluation is being called. If the score is still 0, check `debug.log` for:
1. "LLM RESPONSE: ..." - If missing, the LLM call failed.
2. JSON parsing errors.

---

## 7. How to Test

1. Start the server: `python3 -m app.main dev`
2. Connect via LiveKit Playground or your frontend.
3. Speak into the microphone.
4. Disconnect.
5. Check for `fsir_*.json` file in the project root.
6. Check `debug.log` for Observer evaluation traces.

---

**END OF MASTER FILE**
