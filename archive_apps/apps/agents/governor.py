import logging
from typing import List
from app.agents.base import AegisAgentBase

logger = logging.getLogger("aegis.agents.governor")

class GovernorAgent:
    """
    The Safety Valve.
    Monitors the conversation state and decides if a human takeover is needed.
    """
    def __init__(self, high_risk_keywords: List[str] = None):
        self.high_risk_keywords = high_risk_keywords or ["suicide", "bomb", "kill", "illegal"]
        self.consecutive_failures = 0
        self.low_confidence_threshold = 0.4

    def check_safety(self, transcript_chunk: str, observer_confidence: float) -> bool:
        """
        Returns True if safe, False if handoff required.
        """
        # 1. Keyword Check
        for word in self.high_risk_keywords:
            if word in transcript_chunk.lower():
                logger.critical(f"Governor Trigger: High risk keyword '{word}' detected.")
                return False

        # 2. Confidence Check
        if observer_confidence < self.low_confidence_threshold:
            self.consecutive_failures += 1
            logger.warning(f"Governor Warning: Low confidence ({observer_confidence}). Streak: {self.consecutive_failures}")
        else:
            self.consecutive_failures = 0
            
        if self.consecutive_failures >= 3:
            logger.critical("Governor Trigger: Too many low confidence turns.")
            return False
            
        return True
