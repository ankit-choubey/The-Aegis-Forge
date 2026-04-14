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
        """
        Updates the RAG context (e.g. if the user reveals new info).
        """
        self.context = new_context
        # Depending on implementation, might need to refresh system prompt here
        logger.info(f"Context updated for {self.persona.name}")

    def _build_system_prompt(self, template: str, **kwargs) -> str:
        """
        Helper to format the system prompt with context and persona details.
        Safe formatting that ignores missing keys in the template if needed, 
        or strictly enforces them.
        """
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
