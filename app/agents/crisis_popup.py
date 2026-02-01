"""
Crisis Pop-up Agent
Triggers a random domain-specific crisis question mid-interview.
"""
import logging
import asyncio
import random
import json
from typing import Optional, Any
from livekit.rtc import Room
from livekit.agents import llm

from app.agents.crisis_generator import generate_crisis_question
from app.logging.audit_logger import SessionAuditLogger

logger = logging.getLogger("aegis.agents.crisis_popup")


class CrisisPopupAgent:
    """
    Background agent that triggers a surprise crisis question.
    
    Waits for a random delay, then:
    1. Generates a domain-specific crisis question using Groq
    2. Sends CRISIS_POPUP signal to frontend
    3. Injects the question into the main conversation
    """
    
    def __init__(
        self,
        room: Room,
        domain: str,
        llm_instance: llm.LLM,
        audit_logger: SessionAuditLogger,
        lead_agent: Any = None,
        session: Any = None,  # [ADDED] for immediate speech
        min_delay_seconds: int = 180,  # 3 minutes
        max_delay_seconds: int = 480   # 8 minutes
    ):
        self._room = room
        self._domain = domain
        self._llm = llm_instance
        self._audit_logger = audit_logger
        self._lead_agent = lead_agent
        self._session = session # [ADDED]
        self._min_delay = min_delay_seconds
        self._max_delay = max_delay_seconds
        
        self._task: Optional[asyncio.Task] = None
        self._triggered = False
        self._candidate_name: Optional[str] = None
        
    def set_candidate_name(self, name: str):
        """Set candidate name for personalized questions."""
        self._candidate_name = name
        
    def set_lead_agent(self, agent: Any):
        """Set the lead agent reference for question injection."""
        self._lead_agent = agent
        
    async def start(self):
        """Start the crisis timer in the background."""
        if self._task is not None:
            logger.warning("Crisis popup already started")
            return
            
        self._task = asyncio.create_task(self._crisis_loop())
        logger.info(f">>> Crisis Popup Agent started (will trigger in {self._min_delay}-{self._max_delay}s)")
        
    async def stop(self):
        """Stop the crisis timer."""
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            self._task = None
            logger.info(">>> Crisis Popup Agent stopped")
            
    async def _crisis_loop(self):
        """Trigger crisis popup: first at 2.5 min, second at ~9 min total."""
        try:
            # FIRST CRISIS: Wait 2.5 minutes (150s)
            first_delay = 150
            logger.info(f">>> Crisis #1 will trigger in {first_delay} seconds (2.5 minutes)")
            
            await asyncio.sleep(first_delay)
            
            if not self._triggered:
                self._triggered = True
                logger.info(">>> CRISIS #1 TRIGGERING!")
                await self._trigger_crisis()
            
            # SECOND CRISIS: Wait another 7 minutes (High Pressure Phase)
            second_delay = 420  # 7 minutes
            logger.info(f">>> Crisis #2 will trigger in {second_delay} seconds (9.5 minutes total)")
            
            await asyncio.sleep(second_delay)
            
            logger.info(">>> CRISIS #2 TRIGGERING!")
            await self._trigger_crisis()
            
        except asyncio.CancelledError:
            logger.info(">>> Crisis timer cancelled")
            raise
        except Exception as e:
            logger.error(f">>> Crisis loop error: {e}")
            
    async def _trigger_crisis(self):
        """Generate and deliver the crisis question."""
        logger.info(">>> CRISIS POPUP TRIGGERING!")
        
        # 1. Generate crisis question using Groq
        crisis_question = await generate_crisis_question(
            self._domain,
            self._llm,
            self._candidate_name
        )
        
        # 2. Log to audit trail
        self._audit_logger.log_event(
            "CrisisPopupAgent",
            "CRISIS_TRIGGERED",
            f"Domain: {self._domain}",
            metadata={"question": crisis_question}
        )
        
        # 3. Send CRISIS_POPUP signal to frontend
        await self._send_frontend_alert(crisis_question)
        
        # 4. Inject question into conversation
        await self._inject_question(crisis_question)
        
        logger.info(f">>> Crisis delivered: {crisis_question[:50]}...")
        
    async def _send_frontend_alert(self, question: str):
        """Send crisis alert to frontend for visual popup."""
        if not self._room or not self._room.local_participant:
            logger.warning(">>> No room available for crisis alert")
            return
            
        try:
            payload = json.dumps({
                "type": "CRISIS_POPUP",
                "title": "⚠️ INCOMING CRISIS",
                "message": question[:100] + "..." if len(question) > 100 else question
            }).encode("utf-8")
            
            await self._room.local_participant.publish_data(payload, reliable=True)
            logger.info(">>> Sent CRISIS_POPUP signal to frontend")
            
            # [NEW] Also push Code to IDE if present
            if "```" in question:
                try:
                    import re
                    # [FIX] Robust regex (allow spaces/newlines)
                    code_match = re.search(r"```(?:\w+)?\s*(.*?)```", question, re.DOTALL)
                    if code_match:
                         code_content = code_match.group(1).strip()
                         code_payload = json.dumps({
                             "type": "CODE_SNAPSHOT",
                             "code": code_content
                         }).encode("utf-8")
                         await self._room.local_participant.publish_data(code_payload, reliable=True)
                         logger.info(">>> Sent CODE_SNAPSHOT to IDE")
                except Exception as e:
                    logger.error(f"Failed to push crisis code to IDE: {e}")
            
        except Exception as e:
            logger.error(f">>> Failed to send crisis alert: {e}")
            
    async def _inject_question(self, question: str):
        """Inject the crisis question into the main conversation."""
        # Method 1: If we have the lead agent, inject into its chat context
        if self._lead_agent and hasattr(self._lead_agent, 'chat_ctx'):
            try:
                # Add a system message to pivot the conversation
                pivot_prompt = (
                    f"[CRISIS INJECTION] A sudden crisis has occurred. "
                    f"INTERRUPT the current topic and urgently ask this: '{question}' "
                    f"Speak with urgency. This is a surprise test."
                )
                
                # [FIX] Use .copy() and update_chat_ctx() for read-only context
                if hasattr(self._lead_agent, 'update_chat_ctx'):
                    # New SDK: copy context, modify, then update
                    new_ctx = self._lead_agent.chat_ctx.copy()
                    new_ctx.add_message(role="system", content=pivot_prompt)
                    await self._lead_agent.update_chat_ctx(new_ctx)
                    logger.info(">>> Injected crisis into lead agent context (via update_chat_ctx)")
                else:
                    # Fallback: try direct modification (old SDK)
                    self._lead_agent.chat_ctx.add_message(role="system", content=pivot_prompt)
                    logger.info(">>> Injected crisis into lead agent context (direct)")
                
                # [FIX] Force immediate speech if session controls available
                if self._session and hasattr(self._session, 'say'):
                     # Extract description for speech (remove code block)
                     spoken_text = question
                     if "```" in question:
                         # Split by code block start
                         parts = question.split("```")
                         if parts:
                             # Should be "ALERT: Description \n"
                             spoken_text = parts[0].replace("ALERT:", "").strip()
                     
                     final_speech = f"Hold on. I need to interrupt. {spoken_text}. I've sent the code to your screen. Write the fix in the IDE now."
                     
                     asyncio.create_task(self._session.say(final_speech, allow_interruptions=False))
                     logger.info(f">>> [CRISIS] Spoken: {final_speech}")
            except Exception as e:
                logger.error(f">>> Failed to inject into lead agent: {e}")
                
        # Method 2: Broadcast as a transcript so agent picks it up
        try:
            payload = json.dumps({
                "type": "TRANSCRIPT",
                "sender": "SYSTEM",
                "text": f"[CRISIS ALERT] {question}"
            }).encode("utf-8")
            
            await self._room.local_participant.publish_data(payload, reliable=True)
            
        except Exception as e:
            logger.error(f">>> Failed to broadcast crisis: {e}")
