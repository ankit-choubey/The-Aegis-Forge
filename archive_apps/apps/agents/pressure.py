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
    """
    The Anxious Stakeholder Agent.
    Runs in the background and interjects based on timing or context.
    """
    def __init__(self, room: Room, lead_logic: "IncidentLead", persona: Persona, llm_instance: llm.LLM, audit_logger: SessionAuditLogger):
        # Base init (no context needed really, just persona)
        super().__init__(persona, context="", llm_instance=llm_instance, audit_logger=audit_logger)
        
        self.room = room
        self.lead_logic = lead_logic
        self.running = False
        
        # Build System Prompt
        self.system_prompt = self._build_system_prompt(PRESSURE_AGENT_SYSTEM)

    async def start(self):
        self.running = True
        logger.info(f"Pressure agent {self.persona.name} started (Background).")
        asyncio.create_task(self._monitor_loop())

    async def stop(self):
        self.running = False

    async def _monitor_loop(self):
        # Initial grace period
        await asyncio.sleep(20)
        
        while self.running:
            # Random waittime between outbursts
            await asyncio.sleep(random.randint(15, 40))
            
            if not self.running: 
                break

            # Check if we should interrupt
            # For now, simplistic random check + simple logic
            # If we were more advanced, we'd read self.lead_logic.chat_ctx for silence
            
            should_interrupt = random.choice([True, False])
            
            if should_interrupt:
                interjection = random.choice(PRESSURE_INTERRUPTS)
                logger.info(f"Pressure Interjection Triggered: {interjection}")
                
                self.audit_logger.log_event("PressureAgent", "INTERRUPTION", f"Triggered: {interjection}")
                
                # In a real LiveKit implementation, we would emit this to the room 
                # or use a VoiceAgent to speak it. 
                # Assuming 'lead_logic' has a handle or we can use the room to send a text data packet
                # that the frontend uses to display a notification or TTS.
                
                # TODO: Wire this to actual TTS or Chat if needed.
                pass