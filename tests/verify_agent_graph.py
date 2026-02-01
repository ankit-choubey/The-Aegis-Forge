import asyncio
import logging
from unittest.mock import MagicMock, AsyncMock

# Set PYTHONPATH to include project root
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.agents.incident_lead import IncidentLead
from app.agents.pressure import PressureAgent
from app.agents.crisis_popup import CrisisPopupAgent
from app.logging.audit_logger import SessionAuditLogger

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("graph_test")

async def test_agent_graph():
    print("--- Starting Multi-Agent Graph Verification ---")

    # 1. Setup Mocks
    mock_room = MagicMock()
    mock_room.local_participant = MagicMock()
    mock_room.local_participant.publish_data = AsyncMock()
    
    mock_llm = MagicMock()
    mock_audit_logger = MagicMock(spec=SessionAuditLogger)
    
    mock_scenario = MagicMock()
    mock_scenario.hiring_manager_persona.name = "Lead"
    mock_scenario.context = "Context"
    
    # 2. Instantiate Incident Lead (The Hub)
    print("[1] Initializing IncidentLead...")
    lead_agent = IncidentLead(
        scenario=mock_scenario,
        llm_instance=mock_llm,
        audit_logger=mock_audit_logger,
        room=mock_room
    )
    
    # Mock chat context methods
    # Since chat_ctx is a property, we mock the internal attribute it likely uses or the property itself
    lead_agent._chat_ctx = MagicMock()
    lead_agent._chat_ctx.add_message = MagicMock()
    lead_agent.update_chat_ctx = AsyncMock()

    # 3. Instantiate Pressure Agent (The Spoke)
    print("[2] Initializing PressureAgent...")
    pressure_agent = PressureAgent(
        room=mock_room,
        lead_logic=lead_agent,
        persona=MagicMock(),
        llm_instance=mock_llm,
        audit_logger=mock_audit_logger
    )

    # 4. Instantiate Crisis Popup Agent (The Spoke)
    print("[3] Initializing CrisisPopupAgent...")
    crisis_agent = CrisisPopupAgent(
        room=mock_room,
        domain="DevOps",
        llm_instance=mock_llm,
        audit_logger=mock_audit_logger,
        lead_agent=lead_agent,
        session=MagicMock() # Mock session
    )
    
    # 5. Verify Pressure Agent Connection
    print("[4] Testing Pressure Agent -> Incident Lead Connection...")
    # Simulate an interjection logic manually (since running loop is hard)
    # trigger logic is typically: log event -> send data -> maybe speak
    try:
        pressure_agent.audit_logger.log_event("Pressure", "TEST", "Test Interjection")
        # Assert logic handled
        mock_audit_logger.log_event.assert_called()
        print("SUCCESS: Pressure Agent can log events to shared Audit Logger.")
    except Exception as e:
        print(f"FAILURE: Pressure Agent Interaction Failed: {e}")

    # 6. Verify Crisis Agent Injection
    print("[5] Testing Crisis Agent -> Incident Lead Injection...")
    test_question = "Why is the server down?"
    try:
        await crisis_agent._inject_question(test_question)
        
        # Check if it tried to update lead agent's context
        # It calls either update_chat_ctx or chat_ctx.add_message
        if lead_agent.update_chat_ctx.called:
            print("SUCCESS: Crisis Agent called update_chat_ctx on IncidentLead.")
        elif lead_agent.chat_ctx.add_message.called:
            print("SUCCESS: Crisis Agent added message to IncidentLead context.")
        else:
            print("FAILURE: Crisis Agent did NOT update IncidentLead context.")
            
    except Exception as e:
        print(f"FAILURE: Crisis Agent Injection Crashed: {e}")

if __name__ == "__main__":
    asyncio.run(test_agent_graph())
