import json
import logging
import re
import uuid
from typing import Optional

from livekit.agents import llm
from app.rag.scenarios import Scenario, Persona

logger = logging.getLogger("aegis.core.scenario_generator")

class ScenarioGenerator:
    """
    Generates a full Scenario object from a simple user description (e.g. "Backend + AIML Engineer").
    Uses LLM to hallucinate valid Persona, Context, and Problem definitions.
    """
    
    def __init__(self, llm_instance: llm.LLM):
        self.llm = llm_instance

    async def generate_from_description(self, role_description: str) -> Optional[Scenario]:
        """
        Generate a Scenario object from a raw role description.
        """
        logger.info(f"Generating Custom Scenario for: {role_description}")
        
        prompt = (
            f"You are the Architect of a high-pressure interview simulation. \n"
            f"Create a valid JSON scenario configuration for the role: '{role_description}'.\n"
            f"The candidate claims to be an expert in this. Design a scenario that tests them.\n\n"
            f"Output JSON strictly matching this structure:\n"
            f"{{\n"
            f"  \"id\": \"custom-{str(uuid.uuid4())[:8]}\",\n"
            f"  \"domain\": \"<general field e.g. DevOps, Backend>\",\n"
            f"  \"title\": \"<Dramatic Title e.g. The Legacy Migration>\",\n"
            f"  \"difficulty\": \"Expert\",\n"
            f"  \"context\": \"<Brief background of the fictional company and stack>\",\n"
            f"  \"initial_problem\": \"<The immediate technical crisis the candidate walks into>\",\n"
            f"  \"hiring_manager_persona\": {{\n"
            f"      \"name\": \"<Name>\",\n"
            f"      \"tone\": \"<e.g. Skeptical, Busy, Technical>\",\n"
            f"      \"instructions\": \"<System prompt for the manager agent>\"\n"
            f"  }},\n"
            f"  \"stakeholder_persona\": {{\n"
            f"      \"name\": \"<Name>\",\n"
            f"      \"tone\": \"<e.g. Pushy, Clueless, Angry>\",\n"
            f"      \"trigger_phrases\": [\"We need this today!\", \"Why is it taking so long?\"],\n"
            f"      \"interjections\": [\"Time is money!\", \"Are you sure?\"]\n"
            f"  }},\n"
            f"  \"observer_metrics\": [\"<Metric 1>\", \"<Metric 2>\", \"<Metric 3>\"]\n"
            f"}}\n\n"
            f"Do not include markdown formatting (```json). Output raw JSON only."
        )

        try:
            chat_ctx = llm.ChatContext()
            chat_ctx.append(llm.ChatMessage(role="user", content=prompt))
            
            stream = self.llm.chat(chat_ctx=chat_ctx)
            response_text = ""
            async for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                     response_text += chunk.choices[0].delta.content
            
            # Clean Markdown wrappers if present
            clean_text = response_text.replace("```json", "").replace("```", "").strip()
            
            data = json.loads(clean_text)
            
            # Construct Scenario Object
            scenario = Scenario(
                id=data["id"],
                domain=data.get("domain", "General"),
                title=data.get("title", f"Interview for {role_description}"),
                difficulty=data.get("difficulty", "Hard"),
                context=data.get("context", ""),
                initial_problem=data.get("initial_problem", ""),
                hiring_manager_persona=Persona(
                    name=data["hiring_manager_persona"]["name"],
                    tone=data["hiring_manager_persona"]["tone"],
                    instructions=data["hiring_manager_persona"]["instructions"]
                ),
                stakeholder_persona=Persona(
                    name=data["stakeholder_persona"]["name"],
                    tone=data["stakeholder_persona"]["tone"],
                    instructions="", # Logic handled by PressureAgent
                    trigger_phrases=data["stakeholder_persona"].get("trigger_phrases", []),
                    interjections=data["stakeholder_persona"].get("interjections", [])
                ),
                observer_metrics=data.get("observer_metrics", ["Technical Accuracy", "Communication"])
            )
            
            logger.info(f"Successfully generated scenario: {scenario.title}")
            return scenario

        except Exception as e:
            logger.error(f"Failed to generate custom scenario: {e}")
            return None
