import json
import logging
import os
from dataclasses import dataclass
from typing import List, Optional, Dict

logger = logging.getLogger("aegis.rag.scenarios")

@dataclass
class Persona:
    name: str
    tone: str
    instructions: str
    trigger_phrases: Optional[List[str]] = None
    interjections: Optional[List[str]] = None

@dataclass
class Scenario:
    id: str
    domain: str
    title: str
    difficulty: str
    context: str
    initial_problem: str
    hiring_manager_persona: Persona
    stakeholder_persona: Persona
    observer_metrics: List[str]

class ScenarioLoader:
    def __init__(self, scenarios_path: str = "app/rag/scenarios.json"):
        self.scenarios_path = scenarios_path
        self._scenarios: Dict[str, Scenario] = {}
        self.load_scenarios()

    def load_scenarios(self):
        try:
            # Handle path resolution relative to project root
            if not os.path.exists(self.scenarios_path):
                # Try finding it relative to current file if running from root
                current_dir = os.path.dirname(os.path.abspath(__file__))
                alt_path = os.path.join(current_dir, "scenarios.json")
                if os.path.exists(alt_path):
                    self.scenarios_path = alt_path
                else:
                    logger.error(f"Scenarios file not found at {self.scenarios_path}")
                    return

            with open(self.scenarios_path, "r") as f:
                data = json.load(f)
                
            for s_data in data.get("scenarios", []):
                hm_data = s_data["hiring_manager_persona"]
                sp_data = s_data["stakeholder_persona"]
                
                scenario = Scenario(
                    id=s_data["id"],
                    domain=s_data["domain"],
                    title=s_data["title"],
                    difficulty=s_data["difficulty"],
                    context=s_data["context"],
                    initial_problem=s_data["initial_problem"],
                    hiring_manager_persona=Persona(
                        name=hm_data["name"],
                        tone=hm_data["tone"],
                        instructions=hm_data["instructions"]
                    ),
                    stakeholder_persona=Persona(
                        name=sp_data["name"],
                        tone=sp_data["tone"],
                        instructions="", # Stakeholder uses specific behavior logic, mostly trigger based
                        trigger_phrases=sp_data.get("trigger_phrases", []),
                        interjections=sp_data.get("interjections", [])
                    ),
                    observer_metrics=s_data.get("observer_metrics", [])
                )
                self._scenarios[scenario.id] = scenario
            
            logger.info(f"Loaded {len(self._scenarios)} scenarios.")
            
        except Exception as e:
            logger.error(f"Failed to load scenarios: {e}")

    def get_scenario(self, scenario_id: str) -> Optional[Scenario]:
        return self._scenarios.get(scenario_id)

    def list_scenarios(self) -> List[Dict[str, str]]:
        return [{"id": s.id, "title": s.title, "domain": s.domain} for s in self._scenarios.values()]
