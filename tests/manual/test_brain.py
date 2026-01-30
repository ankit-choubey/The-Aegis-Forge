"""
Test Brain - Logic Verification Script
Tests the LangGraph FSM flow without external dependencies.
"""
from backend.core.state import get_initial_state
from backend.core.graph import build_graph

def run_test():
    print(">>> [TEST START] Initializing Aegis Brain...")
    
    # 1. Setup Mock Data
    mock_candidate = "TEST-CANDIDATE-001"
    mock_role = {"title": "Senior SRE Engineer", "level": "L5"}
    
    # 2. Create Initial Memory
    initial_memory = get_initial_state(mock_candidate, mock_role)
    print(f">>> [MEMORY] Initial Health: {initial_memory['server_health']}")
    print(f">>> [MEMORY] Initial Phase: {initial_memory['phase']}")
    
    # 3. Build the Brain
    print(">>> [GRAPH] Building state machine...")
    brain = build_graph()
    
    # 4. Execute the Flow
    print(">>> [EXECUTE] Running interview simulation...")
    final_state = brain.invoke(initial_memory)
    
    # 5. Verify Output
    print("\n" + "="*50)
    print(">>> [RESULTS]")
    print(f"    Final Phase: {final_state['phase']}")
    print(f"    Final Health: {final_state['server_health']}")
    print(f"    Timeline Events: {len(final_state['timeline_events'])}")
    print(f"    Integrity Flags: {final_state['integrity_flags']}")
    print(f"    Messages Count: {len(final_state['messages'])}")
    print("="*50)
    
    # 6. Check for messages
    if final_state['messages']:
        print("\n>>> [TRANSCRIPT]")
        for i, msg in enumerate(final_state['messages'][-5:]):  # Last 5 messages
            print(f"    {i+1}. {msg.content[:100]}...")
    
    # 7. Success check
    if len(final_state['messages']) > 0:
        print("\n>>> [SUCCESS] Graph executed and produced messages!")
        return True
    else:
        print("\n>>> [FAILURE] Graph produced no messages.")
        return False

if __name__ == "__main__":
    run_test()
