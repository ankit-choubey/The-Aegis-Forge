import logging
import random
import json
import asyncio
import dataclasses
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
from app.agents.tools import ToggleNotepad
from app.agents.question_generator import generate_dynamic_questions, format_questions_for_prompt  # [NEW]
from app.agents.rubrics.faang_swe import FAANG_INTERVIEWER_GUIDE

logger = logging.getLogger("aegis.agents.incident_lead")

from app.logging.audit_logger import SessionAuditLogger

class IncidentLead(Agent, AegisAgentBase):
    """
    The Hiring Manager / Incident Lead.
    Now enhanced with Knowledge Engine for dynamic market intel.
    """
    def __init__(self, scenario: Scenario, llm_instance: llm.LLM, audit_logger: SessionAuditLogger, room=None, qgen_llm: llm.LLM = None):
        # Init Base Logic
        AegisAgentBase.__init__(self, persona=scenario.hiring_manager_persona, context=scenario.context, llm_instance=llm_instance, audit_logger=audit_logger)
        
        self.scenario = scenario
        self.qgen_llm = qgen_llm or llm_instance # Default to main LLM if not provided
        self.initial_problem = scenario.initial_problem
        self.room = room  # [FIX] Save room reference for later use
        
        # Init Tools
        self.notepad_tool = None
        if room:
            self.notepad_tool = ToggleNotepad(room)
            logger.info(">>> [TOOLS] Registered ToggleNotepad tool.")
        
        # Get market intel and candidate context from Knowledge Engine
        try:
            market_intel = knowledge_engine.get_market_intel(scenario.domain)
            candidate_context = knowledge_engine.get_candidate_prompt_context()
            cand_name = "Candidate" # Initialize default
            
            logger.info(f">>> Knowledge Engine injected market intel: {market_intel[:50]}...")
            
            if candidate_context:
                logger.info(f">>> Candidate profile loaded, customizing questions...")
                
                # Check for name and projects in context
                cand_name = "Candidate"
                projects_str = "your recent projects" # Default
                
                cand_role = "Backend Engineer"
                if isinstance(knowledge_engine.candidate_context, dict):
                    cand_name = knowledge_engine.candidate_context.get('name', 'Candidate')
                    cand_role = knowledge_engine.candidate_context.get('role', knowledge_engine.candidate_context.get('field', 'Backend Engineer'))
                    # Try to extract projects if available in the context or audit data
                    raw_projects = knowledge_engine.candidate_context.get('projects', []) 
                    # If it's a list, join it. If string, use as is. 
                    if isinstance(raw_projects, list) and raw_projects:
                        projects_str = ", ".join(raw_projects[:3]) # Limit to top 3
                    elif isinstance(raw_projects, str) and raw_projects:
                        projects_str = raw_projects

                # Scripting the Flow
                if projects_str == "your recent projects":
                     # Fallback if no specific projects found
                     resume_ack_script = "I have reviewed your resume. Impressive work."
                else:
                     resume_ack_script = f"I have reviewed your resume and noticed your projects: {projects_str}. Impressive work."
                intro_script = "So, first introduce yourself and tell me something NOT mentioned in your resume."

                # [RECRUITER DASHBOARD] Check for Focus Topics
                focus_topics_list = knowledge_engine.candidate_context.get('focus_topics', [])
                focus_instruction = ""
                if focus_topics_list:
                     focus_msg = ", ".join(focus_topics_list)
                     focus_instruction = f"\n[RECRUITER PRIORITY]: The hiring manager requested a deep dive on: {focus_msg}. You MUST ask at least 2 challenging questions about these topics.\n"

                # Personalize Persona Instructions
                personalized_instructions = (
                    f"{scenario.hiring_manager_persona.instructions}\n"
                    f"IMPORTANT: You are interviewing {cand_name}. Start by greeting them by name.\n"
                    f"{focus_instruction}"
                    f"{FAANG_INTERVIEWER_GUIDE}"
                )
                
                # [FIX] Smart Context: Remove massive 'raw_text' but keep structured data
                safe_context = knowledge_engine.candidate_context.copy()
                if 'raw_text' in safe_context:
                    del safe_context['raw_text']
                
                # Convert to string and truncate safely to ~1500 chars (approx 400-500 tokens)
                candidate_json_str = json.dumps(safe_context, default=str)
                if len(candidate_json_str) > 1500:
                    candidate_json_str = candidate_json_str[:1500] + "... (truncated)"
                
                # Inject scripts into context for the Prompt to use
                enhanced_context = (
                    f"{scenario.context}\n"
                    f"MARKET INTEL: {market_intel[:1000]}\n"
                    f"CANDIDATE DATA: {candidate_json_str}\n\n"
                    f"[MANDATORY OPENING SCRIPT]\n"
                    f"1. RESUME ACK: '{resume_ack_script}'\n"
                    f"2. INTRO CHALLENGE: '{intro_script}'"
                )
                
                # Update Persona Instructions locally
                self.persona = dataclasses.replace(
                    scenario.hiring_manager_persona, 
                    instructions=personalized_instructions
                )
            else:
                enhanced_context = f"{scenario.context}\n\n{market_intel}"
                cand_role = "Backend Engineer" # Default fallback
                
            self.context = enhanced_context
            
            # [NEW] Generate dynamic questions based on candidate profile
            # IMPORTANT: Never block the event loop - always schedule async
            self.dynamic_questions = []
            self._pending_question_gen = None
            if knowledge_engine.candidate_context:
                try:
                    # Always schedule for later - never block
                    import asyncio
                    try:
                        loop = asyncio.get_running_loop()
                        # Loop is running, schedule as task (won't block)
                        self._pending_question_gen = asyncio.create_task(
                            generate_dynamic_questions(knowledge_engine.candidate_context, self.qgen_llm) # [FIX] Use QGen LLM
                        )
                        logger.info(">>> Dynamic question generation scheduled (async).")
                    except RuntimeError:
                        # No loop running, skip dynamic questions for now
                        logger.info(">>> No event loop, skipping dynamic questions.")
                except Exception as e:
                    logger.error(f">>> Question generation scheduling error: {e}")
        except Exception as e:
            logger.error(f"Failed to load Knowledge Engine: {e}")
            self.context = scenario.context
            self.dynamic_questions = [] 
            cand_role = "Backend Engineer"
        
        sys_prompt = self._build_system_prompt(
            INCIDENT_LEAD_SYSTEM, 
            initial_problem=self.initial_problem,
            candidate_name=cand_name,
            job_role=cand_role # [NEW] Inject Job Role
        )
        
        # [NEW] Append dynamic questions to system prompt if available
        if hasattr(self, 'dynamic_questions') and self.dynamic_questions:
            questions_section = format_questions_for_prompt(self.dynamic_questions)
            sys_prompt = sys_prompt + "\n" + questions_section
            logger.info(">>> Injected dynamic questions into system prompt.")
        
        # Create a chat context for the Agent (using local variable to avoid property conflict)
        _chat_ctx = llm.ChatContext()
        _chat_ctx.add_message(role="system", content=sys_prompt)

        # Build tools list
        agent_tools = []
        # if self.notepad_tool:
        #     agent_tools.append(self.notepad_tool.toggle_notepad)

        # Init Voice Agent
        super().__init__(
            instructions=sys_prompt, 
            llm=llm_instance,
            chat_ctx=_chat_ctx,
            tools=agent_tools  # <--- Changed from fnc_ctx
        )
        
    async def await_dynamic_questions(self):
        """
        [IMPROVEMENT] Block until dynamic questions are generated.
        This ensures the Agent actually knows the custom questions before starting.
        """
        if self._pending_question_gen:
            logger.info(">>> Waiting for dynamic questions to finish generation...")
            try:
                # Wait for the background task
                questions = await self._pending_question_gen
                
                # If we got questions, update the system prompt!
                if questions:
                    self.dynamic_questions = questions
                    
                    # Re-build System Prompt with new questions
                    sys_prompt = self._build_system_prompt(
                        INCIDENT_LEAD_SYSTEM, 
                        initial_problem=self.initial_problem,
                        candidate_name="Candidate", # Re-fetch name if possible/needed or store in self
                        job_role="Backend Engineer" # Re-fetch role
                    )
                    
                    # Format and append
                    questions_section = format_questions_for_prompt(self.dynamic_questions)
                    final_prompt = sys_prompt + "\n" + questions_section
                    
                    # Update Chat Context Prompt (The tricky part)
                    # We need to replace the first message (System)
                    # LiveKit Agents ChatContext is a list of ChatMessage
                    if self.chat_ctx.messages and self.chat_ctx.messages[0].role == "system":
                         self.chat_ctx.messages[0].content = final_prompt
                         logger.info(">>> System Prompt UPDATED with Dynamic Questions.")
                    else:
                         self.chat_ctx.messages.insert(0, llm.ChatMessage(role="system", content=final_prompt))
                
            except Exception as e:
                logger.error(f">>> Failed to await dynamic questions: {e}")
        
    async def start_interview(self, session):
        """
        Say the opening line.
        """
        cand_name = ""
        cand_field = "Engineering" # Default
        
        if knowledge_engine.candidate_context:
             logger.info(f">>> [DEBUG] Context in start_interview: {knowledge_engine.candidate_context}")
             cand_name = knowledge_engine.candidate_context.get('name', '')
             # Try to get field from context or audit data
             cand_field = knowledge_engine.candidate_context.get('detected_field', 'Engineering')
             if cand_field == 'Engineering':
                 # Fallback if detected_field key is different
                 cand_field = knowledge_engine.candidate_context.get('field', 'Engineering')
        else:
             logger.warning(">>> [DEBUG] No candidate_context found in knowledge_engine!")

        if cand_name and cand_name != "Candidate":
             opening_line = f"Hello {cand_name}, I see you applied for the {cand_field} position. I am {self.persona.name}. How are you doing today?"
        else:
             opening_line = f"Hello, I am {self.persona.name}. How are you doing today?"
             
        if hasattr(session, 'say'):
             self.audit_logger.log_event("IncidentLead", "INTERVIEW_START", f"Started interview (Warm Phase)")
             await session.say(opening_line, allow_interruptions=True)
             logger.info(f"Incident Lead said: {opening_line}")
             
             # Manual Broadcast for initial greeting (since session.say might bypass chat_ctx events)
             if self.room and self.room.local_participant:
                 payload = json.dumps({
                     "type": "TRANSCRIPT", 
                     "sender": "AGENT", 
                     "text": opening_line
                 }).encode("utf-8")
                 asyncio.create_task(self.room.local_participant.publish_data(payload, reliable=True))
                 
        else:
             logger.warning("Could not find 'say' method on session.")

    def trigger_crisis(self, crisis_key: str = None):
        """
        Force the agent to switch context to a crisis and ALERT FRONTEND.
        """
        if not crisis_key:
             crisis_key = random.choice(list(CRISIS_SCENARIOS.keys()))
             
        scenario_txt = CRISIS_SCENARIOS.get(crisis_key, "Unknown Incident")
        logger.info(f"Triggering Crisis: {crisis_key} -> {scenario_txt}")
        
        # 1. Update internal state/context
        prompt = INCIDENT_LEAD_CRISIS_TRIGGER.format(new_symptom=scenario_txt)
        
        # 2. Add system message to Chat Context
        self.chat_ctx.add_message(role="system", content=prompt)
        
        # 3. ALERT FRONTEND (Visual Animation)
        if self.notepad_tool and self.notepad_tool._room and self.notepad_tool._room.local_participant:
             import json
             payload = json.dumps({
                 "type": "CRISIS_ALERT", 
                 "message": f"CRISIS: {crisis_key.upper()}"
             }).encode("utf-8")
             
             # We need to dispatch this async, but this method might be sync. 
             # Use asyncio.create_task if loop running
             try:
                 asyncio.create_task(self.notepad_tool._room.local_participant.publish_data(payload, reliable=True))
                 logger.info(">>> [FRONTEND] Sent CRISIS_ALERT signal.")
             except Exception as e:
                 logger.error(f"Failed to send crisis alert: {e}")
                 
        self.audit_logger.log_event("IncidentLead", "CRISIS_TRIGGER", f"Injected: {scenario_txt}")
        # End of trigger_crisis
        # End of trigger_crisis