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

logger = logging.getLogger("aegis.agents.incident_lead")

from app.logging.audit_logger import SessionAuditLogger

class IncidentLead(Agent, AegisAgentBase):
    """
    The Hiring Manager / Incident Lead.
    Now enhanced with Knowledge Engine for dynamic market intel.
    """
    def __init__(self, scenario: Scenario, llm_instance: llm.LLM, audit_logger: SessionAuditLogger):
        # Init Base Logic
        AegisAgentBase.__init__(self, persona=scenario.hiring_manager_persona, context=scenario.context, llm_instance=llm_instance, audit_logger=audit_logger)
        
        self.scenario = scenario
        self.initial_problem = scenario.initial_problem
        
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

        # Init Voice Agent
        super().__init__(
            instructions=sys_prompt, 
            llm=llm_instance,
            chat_ctx=_chat_ctx
        )
        
    async def start_interview(self, session):
        """
        Say the opening line.
        """
        cand_name = ""
        if knowledge_engine.candidate_context:
             cand_name = knowledge_engine.candidate_context.get('name', '')

        if cand_name and cand_name != "Candidate":
             opening_line = f"Hello {cand_name}, I am {self.persona.name}. We have an incident. {self.initial_problem}"
        else:
             opening_line = f"Hello, I am {self.persona.name}. We have an incident. {self.initial_problem}"
             
        if hasattr(session, 'say'):
             self.audit_logger.log_event("IncidentLead", "INTERVIEW_START", f"Started interview with problem: {self.initial_problem}")
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