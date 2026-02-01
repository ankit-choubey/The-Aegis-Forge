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
        # [FIX] MOLE LOOP: Trigger text popups every 60-90 seconds
        while self.running:
            await asyncio.sleep(random.randint(45, 90))
            
            if not self.running: break
            
            try:
                # 1. Get recent transcript? (Mocking snippet for now, or could link to session buffer)
                # Ideally, we'd grab the last 30s of context. For now, use generic context.
                snippet = "The interview is ongoing."
                
                # 2. Generate Dynamic Tip
                from backend.funnel.pipeline import knowledge_engine
                tip = await knowledge_engine.generate_mole_tip(snippet)
                
                logger.info(f">>> [MOLE] Generated Tip: {tip}")
                self.audit_logger.log_event("MoleAgent", "TIP_GENERATED", tip)
                
                # 3. Send Popup to Frontend
                import json
                payload = json.dumps({
                    "type": "MOLE_POPUP",
                    "text": tip,
                    "variant": "warning" if "Psst" in tip else "info"
                }).encode("utf-8")
                
                if self.room and self.room.local_participant:
                    await self.room.local_participant.publish_data(payload, reliable=True)
                    logger.info(">>> [MOLE] Sent popup to frontend.")
                    
            except Exception as e:
                logger.error(f">>> [MOLE] Logic failed: {e}")
