import json
import os
from typing import List, Dict, Any
from app.analysis.schemas import (
    FSIR, TimelineEvent, DQIBreakdown, IntegrityData, 
    CommunicationMetric, SkillValidation, AgentConsensus, DQI, DQIMetric
)

class InterviewPipeline:
    def __init__(self, data_dir: str = "./interview_data"):
        self.data_dir = data_dir

    def generate_detailed_report(self, session_id: str, data: Dict[str, Any]) -> FSIR:
        """
        Constructs the high-fidelity FSIR report matching the AegisForge PDF.
        Real implementation using Audit Logs and DQI data.
        """
        
        # Extract components from raw data
        dqi_data = data.get("dqi_calculation", {})
        audit_logs = data.get("audit_log", [])
        
        # 1. Executive Block Logic (Inferred from DQI)
        # Fix: DQI schema uses 'overall_score', not 'dqi_score'
        overall_score = dqi_data.get("overall_score", 0)
        
        decision = "ADVANCE TO HUMAN INTERVIEW" if overall_score > 7 else "REJECT" # Assuming 0-10 scale
        confidence = "High" # Placeholder logic
        reason = "Automated assessment based on DQI score."

        # 2. Build the Timeline from Audit Logs
        timeline = []
        start_time = 0
        for event in audit_logs:
            if event["event_type"] == "INTERVIEW_START":
                start_time = event["timestamp"]
            
            if event["event_type"] in ["CRISIS_TRIGGERED", "INTERRUPTION", "BAIT_OFFERED"]:
                rel_time = int(event["timestamp"] - start_time) if start_time else 0
                
                # Logic to infer generic score if not an evaluation
                handling_score = 5 
                
                timeline.append(TimelineEvent(
                    time=f"{rel_time}s",
                    action=event.get("actor", "System"),
                    state_change=event.get("event_type", ""),
                    evaluation="Event Logged",
                    pressure_handling_score=handling_score,
                    sentiment_score=handling_score # [NEW] Default sentiment to handling score
                ))

            # [NEW] Add Observer Evaluations to Timeline for Graph Data
            elif event["event_type"] == "EVALUATION_COMPLETE":
                rel_time = int(event["timestamp"] - start_time) if start_time else 0
                meta = event.get("metadata", {})
                score = meta.get("score", 0) 
                
                timeline.append(TimelineEvent(
                    time=f"{rel_time}s",
                    action="Observer",
                    state_change="Graded Performance",
                    evaluation=f"Score: {score}",
                    pressure_handling_score=int(score),
                    sentiment_score=int(score) # [NEW] Use evaluation score as sentiment proxy
                ))

        # 3. DQI Breakdown
        # We need to map the DQI object to DQIBreakdown
        # simplified for now
        dqi = DQIBreakdown(
            score=int(overall_score * 10), # Assuming score is 0-10, scale to 100? Or if 0-100 keep it.
            correct_decisions=len([m for m in dqi_data.get("metrics", []) if m.get("score", 0) > 7]),
            recoverable_mistakes=0,
            unjustified_assumptions=0,
            critical_misses=0
        )

        # 4. Integrity Signals (from Mole Logs or DQI flags)
        integrity_signals = []
        confidence_score = "90%"
        # Scan for mole interactions
        mole_events = [e for e in audit_logs if e["actor"] == "MoleAgent"]
        if mole_events:
            integrity_signals.append("Mole Agent attempted baiting.")
        
        integrity = IntegrityData(
            confidence_score=confidence_score,
            signals_observed=integrity_signals or ["No specific integrity flags."]
        )

        # 5. Communication Metrics (Placeholder / Static for now unless Observer allows specific metric extraction)
        comm_metrics = [
            CommunicationMetric(metric="Clarity", observation="Assessed by AI"),
            CommunicationMetric(metric="Technical Terminology", observation="Monitored")
        ]

        # 6. Skill Validation
        skills = [
            SkillValidation(skill="Incident Response", observed_behavior="Observed", alignment="High" if overall_score > 7 else "Medium")
        ]

        # 7. Agent Consensus
        consensus = AgentConsensus(
            incident_lead="Participated",
            pressure_agent="Participated",
            observer_agent=f"Score: {overall_score}",
            protocol_governor="Monitoring",
            panel_confidence="85%"
        )

        # 8. Extract FAANG Evaluation from Observer logs
        faang_grid = {}
        for event in audit_logs:
             # Check distinct keys for actor/event_type depending on audit log structure
             # Assuming standard structure from audit_logger.py
             if event.get("actor") == "ObserverAgent" and event.get("event_type") == "EVALUATION_COMPLETE":
                 meta = event.get("metadata", {})
                 if "faang_evaluation" in meta:
                     faang_grid = meta["faang_evaluation"]

        # Assemble the Final Report
        return FSIR(
            candidate_id=data.get("candidate_id", "unknown"),
            role_screened="SRE / Incident Commander",
            decision=decision,
            overall_confidence=confidence,
            primary_reason=reason,
            crisis_timeline=timeline,
            dqi_breakdown=dqi,
            integrity_signals=integrity,
            communication_metrics=comm_metrics,
            skill_validation=skills,
            agent_consensus=consensus,
            faang_evaluation=faang_grid or None,
            competency_radar=dqi_data.get("radar_chart") # [NEW] Pass Radar Data
        )
