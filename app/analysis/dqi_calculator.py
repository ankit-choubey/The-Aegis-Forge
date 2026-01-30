import json
import re
# We use json_repair to fix common JSON errors automatically
# import json_repair # User code had this, we might need to install it or mock it if not available.
# To avoid dependency issues immediately, I will try standard json first or wrap it.
# Actually I should check if json_repair is installed. If not I should install it or use basic try/except.
# For now I will use standard json and standard regex from the user code, but comment out json_repair import unless I install it.
# Wait, user explicitly `import json_repair`. I should `pip install json_repair`.

try:
    import json_repair
except ImportError:
    json_repair = None

from typing import List
from app.analysis.schemas import DQI, DQIMetric  # Adjusted import to app.analysis.schemas

# NOTE: The User's schemas.py above did NOT include DQI or DQIMetric. 
# It only had FSIR, TimelineEvent, DQIBreakdown, etc.
# The user's dqi_calculator code imports `DQI, DQIMetric` from `schemas`.
# But `schemas.py` provided by user (second block) DOES NOT HAVE IT.
# I need to infer DQI and DQIMetric or add them to schemas.py.
# Looking at dqi_calculator usage:
# return DQI(simulation_id=..., overall_score=..., metrics=[DQIMetric(...)], agent_feedback_summary=...)
# I will Add these classes to schemas.py first.

class DQICalculator:
    """
    Calculates the Decision Quality Index (DQI) based on Observer Agent logs.
    """

    def _extract_json(self, text: str) -> str:
        """Robustly finds and cleans JSON blocks."""
        if json_repair:
            try:
                # Improvement: Use json_repair to handle bad JSON from LLMs
                decoded_object = json_repair.loads(text)
                # Return it as a string so the rest of the existing code can process it
                return json.dumps(decoded_object)
            except Exception:
                pass
        
        # Fallback to regex if repair matches or fails
        try:
            match = re.search(r"(\{.*\})", text.replace("\n", " "), re.DOTALL)
            if match:
                return match.group(1).strip()
            return text
        except:
            return text

    def calculate_score(self, simulation_id: str, observer_logs: List[str]) -> DQI:
        """
        Parses unstructured observer notes into structured metrics.
        """
        total_score = 0.0
        count = 0
        metrics = []

        # Default feedback if logs are empty
        if not observer_logs:
            return DQI(
                simulation_id=simulation_id,
                overall_score=0.0,
                metrics=[],
                agent_feedback_summary="No data collected."
            )

        for log_entry in observer_logs:
            try:
                # Clean up markdown and extract JSON block
                clean_entry = self._extract_json(log_entry).strip()
                if clean_entry.startswith("```"):
                    clean_entry = clean_entry.replace("```json", "").replace("```", "").strip()
                
                # Attempt to parse JSON line
                data = json.loads(clean_entry)
                
                # Handle cases where keys might be slightly different
                score = float(data.get("score", 0)) or float(data.get("rating", 5))
                reason = data.get("notes") or data.get("reason", "No reasoning provided.")
                
                total_score += score
                count += 1
                
                metrics.append(DQIMetric(
                    category="General Performance", 
                    score=score,
                    reasoning=reason
                ))
            except (json.JSONDecodeError, ValueError, Exception) as e:
                print(f"Warning: Failed to parse observer log. Error: {e}")
                continue

        final_score = round(total_score / count, 2) if count > 0 else 0.0

        # Generate a summary string
        summary = f"Evaluated {count} interaction points. "
        if final_score > 8:
            summary += "Candidate showed strong incident management skills."
        elif final_score > 5:
            summary += "Candidate was competent but lacked speed or precision."
        else:
            summary += "Candidate struggled with diagnosis and resolution."

        return DQI(
            simulation_id=simulation_id,
            overall_score=final_score,
            metrics=metrics,
            agent_feedback_summary=summary
        )

# Create the instance
dqi_calculator = DQICalculator()
