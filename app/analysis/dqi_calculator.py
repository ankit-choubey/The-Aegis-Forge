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
            # More robust regex to catch the first '{' and last '}'
            match = re.search(r"(\{.*\})", text.replace("\n", " ").replace("\r", " "), re.DOTALL)
            if match:
                return match.group(1).strip()
            return text
        except:
            return text

    def calculate_score(self, simulation_id: str, observer_logs: List[str]) -> 'DQI':
        """
        Parses observer notes into structured rubric-based metrics.
        Primary source: faang_evaluation block (Strong Hire/Hire/No Hire/Strong No Hire).
        Fallback: numeric 'score' field in observer logs.
        """
        print(f"DEBUG: DQI Calculator running for {simulation_id} with {len(observer_logs)} logs")

        # Default feedback if logs are empty
        if not observer_logs:
            return DQI(
                simulation_id=simulation_id,
                overall_score=0.0,
                metrics=[],
                agent_feedback_summary="No observer data collected. DQI cannot be computed."
            )

        # --- Rating map for rubric dimensions ---
        rating_map = {
            "strong hire": 10,
            "hire": 7,
            "no hire": 3,
            "strong no hire": 0
        }

        DIMENSIONS = ["communication", "problem_solving", "technical", "testing", "system_design", "crisis_management"]

        # Accumulators for radar chart AND overall score
        radar_sums: dict = {dim: [] for dim in DIMENSIONS}
        fallback_scores: List[float] = []  # Used only if no faang_evaluation found
        metrics = []
        parsed_count = 0

        for log_entry in observer_logs:
            try:
                clean_entry = self._extract_json(log_entry).strip()
                if clean_entry.startswith("```"):
                    clean_entry = clean_entry.replace("```json", "").replace("```", "").strip()

                data = json.loads(clean_entry)
                parsed_count += 1

                # --- PRIMARY PATH: faang_evaluation rubric ---
                faang = data.get("faang_evaluation", {})
                if faang:
                    for dim in DIMENSIONS:
                        rating = faang.get(dim, "").lower().strip()
                        if rating in rating_map:
                            radar_sums[dim].append(rating_map[rating])

                    # Compute per-log rubric average for metric record
                    dim_scores = [rating_map[faang.get(d, "").lower().strip()] for d in DIMENSIONS if faang.get(d, "").lower().strip() in rating_map]
                    if dim_scores:
                        log_score = sum(dim_scores) / len(dim_scores)
                        reason = data.get("candidate_action_summary", "Rubric-based evaluation.")
                        metrics.append(DQIMetric(
                            category="FAANG Rubric",
                            score=round(log_score, 2),
                            reasoning=reason
                        ))

                # --- FALLBACK PATH: numeric score field ---
                elif "score" in data or "rating" in data:
                    raw = float(data.get("score", 0) or data.get("rating", 0))
                    # Normalize to 0-10 if score was given as 0-100
                    normalized = raw / 10.0 if raw > 10 else raw
                    fallback_scores.append(normalized)
                    reason = data.get("notes") or data.get("reasoning", "Score-based evaluation.")
                    metrics.append(DQIMetric(
                        category="General Performance",
                        score=normalized,
                        reasoning=reason
                    ))

            except (json.JSONDecodeError, ValueError, Exception) as e:
                print(f"Warning: Failed to parse observer log. Error: {e}")
                continue

        # --- Compute overall DQI score ---
        # Prefer rubric-based averages across all dimensions
        rubric_breakdown: dict = {}
        rubric_scores: List[float] = []
        for dim in DIMENSIONS:
            if radar_sums[dim]:
                avg = sum(radar_sums[dim]) / len(radar_sums[dim])
                rubric_breakdown[dim] = round(avg, 2)
                rubric_scores.append(avg)
            else:
                rubric_breakdown[dim] = 0.0

        if rubric_scores:
            final_score = round(sum(rubric_scores) / len(rubric_scores), 2)
            source = "FAANG rubric dimensions"
        elif fallback_scores:
            final_score = round(sum(fallback_scores) / len(fallback_scores), 2)
            source = "numeric score fields"
        else:
            # Truly no data — return 0 honestly, no random fallback
            final_score = 0.0
            source = "no valid data"

        # --- Build summary ---
        summary = f"Evaluated {parsed_count} interaction points (source: {source}). "
        if final_score >= 8:
            summary += "Candidate demonstrated exceptional skills — Strong Hire signals observed."
        elif final_score >= 6:
            summary += "Candidate performed competently across most dimensions — Hire level."
        elif final_score >= 4:
            summary += "Candidate showed some gaps — borderline No Hire."
        else:
            summary += "Candidate struggled significantly — Strong No Hire signals observed."

        # If metrics list is still empty (e.g., all logs failed parsing), add a note
        if not metrics:
            metrics.append(DQIMetric(
                category="Assessment",
                score=final_score,
                reasoning=f"Score derived from {source}."
            ))

        # --- Radar chart ---
        from app.analysis.schemas import DQIRadar
        radar_obj = DQIRadar(
            communication=int(rubric_breakdown.get("communication", 0)),
            problem_solving=int(rubric_breakdown.get("problem_solving", 0)),
            technical=int(rubric_breakdown.get("technical", 0)),
            testing=int(rubric_breakdown.get("testing", 0)),
            system_design=int(rubric_breakdown.get("system_design", 0)),
            crisis_management=int(rubric_breakdown.get("crisis_management", 0)),
        )

        return DQI(
            simulation_id=simulation_id,
            overall_score=final_score,
            metrics=metrics,
            agent_feedback_summary=summary,
            radar_chart=radar_obj,
            rubric_breakdown=rubric_breakdown
        )

# Create the instance
dqi_calculator = DQICalculator()
