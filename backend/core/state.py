from typing import TypedDict, List, Dict, Literal, Annotated, Any
from langgraph.graph.message import add_messages
from langchain_core.messages import AnyMessage

class AgentState(TypedDict):
    """
    The Single Source of Truth for the Interview Session.
    This state is passed between all nodes in the LangGraph FSM.
    """
    # --- CONTEXT (Immutable after start) ---
    candidate_id: str
    role_context: Dict[str, Any]  # e.g., {'role': 'DevOps', 'level': 'Senior'}
    
    # --- CONVERSATION (Append-only) ---
    # specific annotation required for LangGraph to append messages instead of overwrite
    messages: Annotated[List[AnyMessage], add_messages]
    
    # --- WAR ROOM METRICS (Mutable) ---
    phase: Literal["intro", "incident", "pressure", "mole", "resolution", "end"]
    server_health: int  # 0-100 (Starts at 100, drops on bad answers)
    
    # --- EVIDENCE & DECISION (The FSIR Output) ---
    timeline_events: List[Dict[str, Any]] # Structured log for the report
    integrity_flags: List[str]            # e.g., ["gaze_violation", "tab_switch"]
    final_decision: Literal["pending", "advance", "reject", "hold"]

# Initial State Factory
def get_initial_state(candidate_id: str, role_context: Dict) -> AgentState:
    return {
        "candidate_id": candidate_id,
        "role_context": role_context,
        "messages": [],
        "phase": "intro",
        "server_health": 100,
        "timeline_events": [],
        "integrity_flags": [],
        "final_decision": "pending"
    }
