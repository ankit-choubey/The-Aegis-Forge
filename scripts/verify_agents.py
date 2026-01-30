import asyncio
import logging
import sys
import unittest
from unittest.mock import MagicMock, AsyncMock, patch

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("verify_agents")

# Mock LiveKit imports BEFORE importing app modules
sys.modules["livekit"] = MagicMock()
sys.modules["livekit.agents"] = MagicMock()
sys.modules["livekit.agents.llm"] = MagicMock()
sys.modules["livekit.agents.voice"] = MagicMock()
sys.modules["livekit.rtc"] = MagicMock()

# Define mock classes to support type verification if needed
class MockLLM:
    def __init__(self):
        self.chat = AsyncMock()

class MockChatContext:
    def __init__(self):
        self.items = []
    def add_message(self, role, content):
        self.items.append({"role": role, "content": content})
    def append(self, role, text):
        self.add_message(role, text)
        return self

class MockAgent:
    def __init__(self, *args, **kwargs):
        pass

# Apply mocks to sys modules
sys.modules["livekit.agents"].llm.LLM = MockLLM
sys.modules["livekit.agents"].llm.ChatContext = MockChatContext

# Fix for metaclass conflict: Ensure the imported Agent is our real class, not a MagicMock
mock_voice_module = MagicMock()
mock_voice_module.Agent = MockAgent
sys.modules["livekit.agents.voice"] = mock_voice_module

# Now import the app modules
# We need to ensure relative imports work, so we add current dir to sys.path
import os
sys.path.append(os.getcwd())

from app.agents.incident_lead import IncidentLead
from app.agents.pressure import PressureAgent
from app.agents.observer import ObserverAgent
from app.agents.mole import MoleAgent
from app.agents.governor import GovernorAgent
from app.rag.scenarios import Scenario, Persona

class TestAegisAgents(unittest.IsolatedAsyncioTestCase):
    
    def setUp(self):
        # Create Mock Data
        self.hm_persona = Persona(name="Alice", tone="Serious", instructions="Test candidates.")
        self.st_persona = Persona(name="Bob", tone="Angry", instructions="Yell.")
        self.scenario = Scenario(
            id="test-1", domain="devops", title="Test Scenario", difficulty="Easy",
            context="Server is down.", initial_problem="500 errors on API.",
            hiring_manager_persona=self.hm_persona,
            stakeholder_persona=self.st_persona,
            observer_metrics=["latency", "accuracy"]
        )
        self.mock_llm = MockLLM()
        self.mock_room = MagicMock()

    async def test_incident_lead(self):
        logger.info("--- Testing Incident Lead ---")
        agent = IncidentLead(self.scenario, self.mock_llm)
        
        # 1. Verify System Prompt
        sys_msgs = [m for m in agent.chat_ctx.items if m["role"] == "system"]
        self.assertTrue(len(sys_msgs) > 0)
        self.assertIn("Alice", sys_msgs[0]["content"])
        self.assertIn("500 errors on API", sys_msgs[0]["content"])
        logger.info("✅ Incident Lead System Prompt Verified")

        # 2. Verify Start Interview
        mock_session = AsyncMock()
        await agent.start_interview(mock_session)
        mock_session.say.assert_called_once()
        args, _ = mock_session.say.call_args
        self.assertIn("Hello, I am Alice", args[0])
        logger.info("✅ Incident Lead Speaking Verified")

        # 3. Verify Crisis Trigger
        agent.trigger_crisis("DB_LOCK")
        last_msg = agent.chat_ctx.items[-1]
        self.assertIn("Database CPU is at 100%", last_msg["content"])
        logger.info("✅ Crisis Trigger Verified")

    async def test_pressure_agent(self):
        logger.info("--- Testing Pressure Agent ---")
        lead_agent = IncidentLead(self.scenario, self.mock_llm)
        agent = PressureAgent(self.mock_room, lead_agent, self.st_persona, self.mock_llm)
        
        # 1. Verify Init
        self.assertIn("Bob", agent.system_prompt)
        logger.info("✅ Pressure Agent Init Verified")
        
        # 2. We can't easily test the async loop without waiting, but we can check if start sets running
        await agent.start()
        # We invoke start but we mocked asyncio.create_task in logic inside? 
        # Actually our mock code executes real logic unless mocked.
        # But we didn't await the task, so it might just behave.
        self.assertTrue(agent.running)
        await agent.stop()
        self.assertFalse(agent.running)
        logger.info("✅ Pressure Agent Start/Stop Verified")

    async def test_observer_agent(self):
        logger.info("--- Testing Observer Agent ---")
        agent = ObserverAgent(["latency"], self.mock_llm)
        
        # 1. Mock LLM Response for evaluation
        mock_chunk = MagicMock()
        mock_chunk.choices = [MagicMock(delta=MagicMock(content='```json\n{"score": "PASS"}\n```'))]
        
        # Create an async iterator for the mock stream
        # IMPORTANT: We need a fresh iterator for each call if we want to call it multiple times
        # But here we assume one call.
        async def async_iter(*args, **kwargs):
            yield mock_chunk
            
        self.mock_llm.chat.side_effect = async_iter

        # 2. Log Turn
        agent.log_turn("User", "I am rebooting settings.")
        
        # 3. Wait a bit for async task (in real app) or check logic
        # Since _evaluate_turn is a background task created with create_task, we must yield to loop
        await asyncio.sleep(0.01)
        
        self.mock_llm.chat.assert_called()
        self.assertEqual(len(agent.transcript_log), 1)
        self.assertEqual(agent.transcript_log[0]["text"], "I am rebooting settings.")
        logger.info("✅ Observer Agent Logging & Eval Verified")

    def test_governor_agent(self):
        logger.info("--- Testing Governor Agent ---")
        gov = GovernorAgent()
        
        # 1. Safe Check
        self.assertTrue(gov.check_safety("I will fix the server", 0.9))
        
        # 2. Risk Keyword
        self.assertFalse(gov.check_safety("This is illegal", 0.9))
        
        # 3. Low Confidence Drift
        self.assertTrue(gov.check_safety("Hmm", 0.3)) # 1st fail
        self.assertTrue(gov.check_safety("Uhh", 0.3)) # 2nd fail
        self.assertFalse(gov.check_safety("I dunno", 0.3)) # 3rd fail -> Trigger
        logger.info("✅ Governor Agent Safety Logic Verified")
        
    async def test_mole_agent(self):
        logger.info("--- Testing Mole Agent ---")
        agent = MoleAgent(self.mock_room, self.st_persona, self.mock_llm)
        self.assertIn("helpful but unethical", agent.system_prompt)
        logger.info("✅ Mole Agent Init Verified")

if __name__ == "__main__":
    unittest.main()
