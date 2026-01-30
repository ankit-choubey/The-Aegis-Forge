from typing import Dict
from langgraph.graph import StateGraph, END
from langchain_core.messages import SystemMessage

from backend.core.state import AgentState
from backend.agents.personas import (
    run_incident_lead, 
    run_pressure_agent, 
    run_mole_agent
)
from backend.database.scenarios import get_scenario_for_role

# --- NODE DEFINITIONS ---

def intro_node(state: AgentState) -> Dict:
    """
    [SETUP PHASE]
    1. Reads the candidate's role.
    2. Fetches the correct Crisis Scenario from the Database.
    3. Injects the 'Mission Brief' into the chat history so Agents know the rules.
    """
    candidate_id = state['candidate_id']
    role = state['role_context'].get('title', 'Engineer')
    
    print(f"--- [BRAIN] Initializing Protocol for: {role} ---")
    
    # 1. FETCH RULES (From Ankit's DB)
    scenario = get_scenario_for_role(role)
    print(f"--- [BRAIN] Loading Scenario: {scenario['name']} ---")
    
    # 2. CREATE MISSION BRIEF (Hidden Instruction for Agents)
    mission_brief = (
        f"SYSTEM INJECTION: Active Scenario is '{scenario['name']}'.\n"
        f"OBJECTIVE: {scenario['objective']}\n"
        f"CONSTRAINTS: {', '.join(scenario.get('constraints', []))}\n"
        f"FAILURE MODES: {', '.join(scenario.get('failure_modes', []))}\n"
        "Start the simulation now."
    )
    
    return {
        "phase": "incident",
        "messages": [SystemMessage(content=mission_brief)]
    }

def incident_node(state: AgentState) -> Dict:
    """
    [PHASE 1] The Incident Commander (Alex) runs the show.
    """
    return run_incident_lead(state)

def pressure_node(state: AgentState) -> Dict:
    """
    [PHASE 2] The Pressure Agent (Vikram) interrupts.
    """
    return run_pressure_agent(state)

def mole_node(state: AgentState) -> Dict:
    """
    [PHASE 3] The Mole (Sam) tries to trap the candidate.
    """
    return run_mole_agent(state)

# --- THE GRAPH BUILDER (Wiring) ---

def build_graph():
    workflow = StateGraph(AgentState)

    # 1. Add Nodes
    workflow.add_node("intro", intro_node)
    workflow.add_node("incident", incident_node)
    workflow.add_node("pressure", pressure_node)
    workflow.add_node("mole", mole_node)

    # 2. Add Edges ( The Flow of the Interview )
    workflow.set_entry_point("intro")

    # Intro -> Incident (Start the crisis)
    workflow.add_edge("intro", "incident")

    # Incident -> Pressure (After some exchanges, inject stress)
    workflow.add_edge("incident", "pressure")

    # Pressure -> Mole (After stress, test integrity)
    workflow.add_edge("pressure", "mole")

    # Mole -> End (Finish)
    workflow.add_edge("mole", END)

    # 3. Compile
    app = workflow.compile()
    return app
