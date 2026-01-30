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
    """
    The Mole / Adversarial Agent.
    Tries to trick the candidate into violating policy.
    """
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
        # The Mole waits for a while, acting like a lurker, then strikes.
        # Wait for 30-60 seconds into the "Crisis" (simulated delay)
        await asyncio.sleep(random.randint(30, 60))
        
        if self.running and not self.triggered:
            self.triggered = True
            bait = random.choice(MOLE_BAIT_MESSAGES)
            
            self.audit_logger.log_event("MoleAgent", "BAIT_OFFERED", f"Bait: {bait}")
            logger.info(f"Mole Triggered! Bait: {bait}")
            # Logic to inject this into the conversation
            # In a full voice implementation, this would queue audio.
            # For now, we log the trap.
            pass
