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
    """
    The Silent Evaluator.
    Listens to turns and outputs JSON assessments.
    """
    def __init__(self, metrics: List[str], llm_instance: llm.LLM, audit_logger: SessionAuditLogger):
        # Mock Persona for base init
        class MockPersona:
            name = "Observer"
            instructions = "Observe and grade."
            tone = "Analytical"
            
        super().__init__(persona=MockPersona(), context="", llm_instance=llm_instance, audit_logger=audit_logger)
        
        self.metrics = metrics
        self.transcript_log: List[Dict[str, Any]] = []
        self.evaluations: List[str] = [] # Store raw JSON strings from LLM
        self.system_prompt = self._build_system_prompt(OBSERVER_SYSTEM)


    def log_turn(self, speaker: str, text: str):
        """Called whenever a turn is completed."""
        print(f"DEBUG: Observer logging turn - Speaker: {speaker}, Text: {text}") # <--- Added Debug
        entry = {"speaker": speaker, "text": text}
        self.transcript_log.append(entry)
        
        # Async evaluation
        asyncio.create_task(self._evaluate_turn(text))
        
    async def _evaluate_turn(self, turn_text: str):
        """
        Runs a quick LLM pass to grade the turn.
        """
        with open("debug.log", "a") as f:
            f.write(f"\n--- EVALUATING: {turn_text} ---\n")

        chat_ctx = llm.ChatContext()
        chat_ctx.add_message(role="system", content=self.system_prompt)
        chat_ctx.add_message(role="user", content=f"Evaluate this turn: '{turn_text}'")
        
        try:
             stream = self.model.chat(chat_ctx=chat_ctx)
             full_response = ""
             async for chunk in stream:
                 content = None
                 # Try standard LiveKit agent structure
                 if hasattr(chunk, 'choices') and chunk.choices:
                     content = chunk.choices[0].delta.content
                 # Fallback for alternative chunk structures
                 elif hasattr(chunk, 'content'):
                     content = chunk.content
                 
                 if content:
                     full_response += content
             
             with open("debug.log", "a") as f:
                 f.write(f"LLM RESPONSE: {full_response}\n")
             
             # Post-process the JSON
             clean_content = full_response.strip()
             # Try to extract JSON if wrapped in markdown
             if "```json" in clean_content:
                 clean_content = clean_content.split("```json")[1].split("```")[0].strip()
                 
             logger.info(f"Observer JSON: {clean_content}")
             
             # Store for final calculation
             self.evaluations.append(clean_content)
             print(f"DEBUG: Stored evaluation. Total count: {len(self.evaluations)}") # <--- Added Debug
             
             # Log to Audit Trail
             try:
                 eval_data = json.loads(clean_content)
                 self.audit_logger.log_event("ObserverAgent", "EVALUATION_COMPLETE", "Turn evaluated", metadata=eval_data)
             except:
                 self.audit_logger.log_event("ObserverAgent", "EVALUATION_PARSE_ERROR", "Could not parse JSON", metadata={"raw": clean_content})
                 print(f"DEBUG: JSON Parse Error for: {clean_content}") # <--- Added Debug
                 
        except Exception as e:
            logger.error(f"Observer evaluation error: {e}")
            print(f"DEBUG: Observer Exception: {e}") # <--- Added Debug
            
    
    def generate_dqi_report(self) -> Dict[str, Any]:
        """
        Calculate final DQI (Decision Quality Index) score using robust calculator.
        """
        # We use the stored self.evaluations which contains the raw JSON strings from the LLM
        return dqi_calculator.calculate_score("current_session", self.evaluations).model_dump()
