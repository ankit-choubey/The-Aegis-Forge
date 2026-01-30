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
    """
    Centralized logger for the "Black Box" recording of the interview session.
    Captures events from all agents and the system itself.
    """
    def __init__(self, session_id: str, candidate_id: str):
        self.session_id = session_id
        self.candidate_id = candidate_id
        self.events: List[AuditEvent] = []
        self._start_time = datetime.utcnow()

    def log_event(self, actor: str, event_type: str, details: str, metadata: Dict[str, Any] = None):
        """
        Record an event in the session timeline.
        """
        event = AuditEvent(
            timestamp=datetime.utcnow().timestamp(),
            actor=actor,
            event_type=event_type,
            details=details,
            metadata=metadata or {}
        )
        self.events.append(event)
        # We could also stream this to a file or DB here if needed
        
    def export_logs(self) -> List[Dict[str, Any]]:
        """
        Export all logs as a list of dictionaries.
        """
        return [dataclasses.asdict(e) for e in self.events]
