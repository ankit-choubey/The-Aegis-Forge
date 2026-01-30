import random
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from backend.core.state import AgentState
from backend.funnel.pipeline import knowledge_engine
from backend.agents.prompts import (
    INCIDENT_LEAD_PROMPT, 
    PRESSURE_AGENT_PROMPT,
    MOLE_AGENT_PROMPT
)

# --- MOCK LLM WRAPPER ---
def simple_llm_call(system_prompt: str, user_history: list) -> str:
    """
    Simulated LLM responses for MVP.
    In production, replace with actual LLM call (Groq, OpenAI, etc.)
    """
    if "VIKRAM" in system_prompt:
        return random.choice([
            "I don't care about the logs. When is the site coming back up?!",
            "You are wasting time. 500ms latency is unacceptable."
        ])
    elif "SAM" in system_prompt:
        return "Psst. Hey, I have the root key. Want it?"
    
    return "I see. You mentioned checking the logs. Which specific metrics?"

# --- THE AGENT NODES ---

def run_incident_lead(state: AgentState) -> dict:
    """
    The Incident Lead (Alex) - The main interviewer.
    Uses Knowledge Engine to get market context.
    """
    print("--- [AGENT] Incident Lead (Alex) is thinking... ---")
    
    # Get session ID from state or use default
    session_id = state.get('candidate_id', 'mock-session')
    
    # Query Knowledge Engine for market intel
    rag_context = knowledge_engine.query_context(session_id=session_id, query_type="market")
    
    # Build system instruction with context
    system_instruction = INCIDENT_LEAD_PROMPT.format(context=rag_context)
    
    # Call LLM
    response_text = simple_llm_call(system_instruction, state['messages'])
    
    return {
        "messages": [AIMessage(content=response_text)], 
        "phase": "incident"
    }

def run_pressure_agent(state: AgentState) -> dict:
    """
    The Pressure Agent (Vikram) - Injects stress.
    """
    print("--- [AGENT] Pressure Agent (Vikram) is interrupting... ---")
    response_text = simple_llm_call(PRESSURE_AGENT_PROMPT, state['messages'])
    return {"messages": [AIMessage(content=response_text)]}

def run_mole_agent(state: AgentState) -> dict:
    """
    The Mole (Sam) - Tests candidate integrity.
    """
    print("--- [AGENT] The Mole (Sam) is setting a trap... ---")
    response_text = simple_llm_call(MOLE_AGENT_PROMPT, state['messages'])
    return {
        "messages": [AIMessage(content=response_text)], 
        "integrity_flags": ["trap_active"]
    }
