import asyncio
import json
import logging
from unittest.mock import MagicMock, AsyncMock
from app.main import QuestionsLogger
from app.agents.incident_lead import IncidentLead

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("interconnection_test")

async def test_backend_receives_code():
    print("--- Starting Backend Data Channel Verification ---")

    # 1. Mock Room and Data Packet
    mock_room = MagicMock()
    mock_participant = MagicMock()
    mock_room.local_participant = mock_participant
    
    # Mock DataPacket
    class MockDataPacket:
        def __init__(self, payload):
            self.data = payload.encode("utf-8")
            self.participant = MagicMock()
            self.participant.identity = "frontend_user"

    # 2. Simulate ALGO_SUBMIT Payload
    code_content = "print('Hello World')"
    payload = json.dumps({
        "type": "ALGO_SUBMIT",
        "code": code_content
    })
    packet = MockDataPacket(payload)

    # 3. Initialize Logger
    q_logger = QuestionsLogger(session_id="test_interconnect", candidate_name="Tester")
    
    # 4. Simulate Handler Logic (copied from main.py)
    # We are testing the LOGIC inside on_data, not the LiveKit event emitter itself
    try:
        data_str = packet.data.decode("utf-8")
        data = json.loads(data_str)
        
        if data.get("type") == "ALGO_SUBMIT":
            received_code = data.get("code")
            logger.info(f"Handler processing code: {received_code}")
            
            # Log to QuestionsLogger
            q_logger.log_code_submission(received_code, evaluation="Test Eval")
            
            print("SUCCESS: Handler parsed ALGO_SUBMIT correctly.")
    except Exception as e:
        print(f"FAILURE: Handler crashed: {e}")
        return

    # 5. Verify Logger Output
    filename = q_logger.save_to_file("interconnect_test_log.json")
    
    with open(filename, "r") as f:
        log_data = json.load(f)
        
    found = False
    for q in log_data["questions"]:
        if q["type"] == "code" and q["answer"] == code_content:
            found = True
            break
            
    if found:
        print("SUCCESS: Code submission found in persistent log.")
    else:
        print("FAILURE: Code submission NOT found in log.")

    # Cleanup
    import os
    if os.path.exists(filename):
        os.remove(filename)

if __name__ == "__main__":
    asyncio.run(test_backend_receives_code())
