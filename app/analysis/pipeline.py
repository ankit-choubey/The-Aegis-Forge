import json
import os
from typing import List, Dict, Any
from app.analysis.schemas import (
    FSIR, TimelineEvent, DQIBreakdown, IntegrityData, 
    CommunicationMetric, SkillValidation, AgentConsensus, DQI, DQIMetric,
    MediaPipeSummary
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
        effective_overall_score = overall_score
        rubric = dqi_data.get("rubric_breakdown") or {}
        
        decision = "ADVANCE TO HUMAN INTERVIEW" if overall_score > 7 else "REJECT"
        
        # [FIX] Confidence derived from DQI score spread
        if overall_score >= 8:
            confidence = f"{min(95, int(overall_score * 10))}% — Very High"
        elif overall_score >= 6:
            confidence = f"{int(overall_score * 10)}% — Moderate"
        elif overall_score >= 4:
            confidence = f"{int(overall_score * 10)}% — Low"
        else:
            confidence = f"{max(10, int(overall_score * 10))}% — Very Low"
        
        # [FIX] Primary Reason derived from rubric strengths/weaknesses
        strengths = [dim.replace('_', ' ').title() for dim, score in rubric.items() if score >= 7]
        weaknesses = [dim.replace('_', ' ').title() for dim, score in rubric.items() if score < 4]
        dqi_summary = dqi_data.get("agent_feedback_summary", "")
        
        if strengths and weaknesses:
            reason = f"Strong in {', '.join(strengths[:3])}. Needs improvement in {', '.join(weaknesses[:3])}. {dqi_summary}"
        elif strengths:
            reason = f"Strong across {', '.join(strengths[:3])}. {dqi_summary}"
        elif weaknesses:
            reason = f"Struggled in {', '.join(weaknesses[:3])}. {dqi_summary}"
        else:
            reason = dqi_summary or "Assessment completed — see detailed breakdown below."

        # 2. Build the Timeline from Audit Logs
        timeline = []
        start_time = 0
        for event in audit_logs:
            try:
                evt_type = event.get("event_type", "")
                if evt_type == "INTERVIEW_START":
                    start_time = event.get("timestamp", 0)
                
                if evt_type in ["CRISIS_TRIGGERED", "INTERRUPTION", "BAIT_OFFERED"]:
                    rel_time = int(event.get("timestamp", 0) - start_time) if start_time else 0
                    
                    # Logic to infer generic score if not an evaluation
                    handling_score = 5 
                    
                    timeline.append(TimelineEvent(
                        time=f"{rel_time}s",
                        action=event.get("actor", "System"),
                        state_change=evt_type,
                        evaluation="Event Logged",
                        pressure_handling_score=handling_score,
                        sentiment_score=handling_score # [NEW] Default sentiment to handling score
                    ))

                # [NEW] Add Observer Evaluations to Timeline for Graph Data
                elif evt_type == "EVALUATION_COMPLETE":
                    rel_time = int(event.get("timestamp", 0) - start_time) if start_time else 0
                    meta = event.get("metadata", {})
                    score = meta.get("score", 0) 
                    
                    timeline.append(TimelineEvent(
                        time=f"{rel_time}s",
                        action="Observer",
                        state_change="Graded Performance",
                        evaluation=f"Score: {score}",
                        pressure_handling_score=int(score) if score else 0,
                        sentiment_score=int(score) if score else 0
                    ))
            except Exception:
                continue  # Skip malformed events

        # 3. DQI Breakdown — use rubric_breakdown if available for accuracy
        rubric = dqi_data.get("rubric_breakdown") or {}
        
        if rubric:
            # Count rubric dimension ratings: Strong Hire(10)/Hire(7) = correct, No Hire(3) = mistake, Strong No Hire(0) = critical miss
            correct = sum(1 for v in rubric.values() if v >= 7)
            mistakes = sum(1 for v in rubric.values() if 3 <= v < 7)
            critical = sum(1 for v in rubric.values() if v < 3)
            # Unjustified assumptions: No Hire on problem_solving without explicit system design issues
            unjustified = 1 if rubric.get("problem_solving", 7) < 4 and rubric.get("technical", 7) >= 7 else 0
        else:
            # Legacy fallback: simple metric count
            correct = len([m for m in dqi_data.get("metrics", []) if m.get("score", 0) > 7])
            mistakes = 0
            critical = 0
            unjustified = 0
        
        # 4. Integrity Signals (from Mole Logs + Candidate Behavior)
        integrity_signals = []
        
        # Scan for mole interactions
        mole_events = [e for e in audit_logs if e.get("actor") == "MoleAgent"]
        bait_accepted = [e for e in audit_logs if e.get("event_type") == "BAIT_ACCEPTED"]
        bait_rejected = [e for e in audit_logs if e.get("event_type") == "BAIT_REJECTED"]
        
        if bait_rejected:
            integrity_signals.append(f"Candidate rejected {len(bait_rejected)} unethical shortcut(s) — strong integrity signal.")
        if bait_accepted:
            integrity_signals.append(f"WARNING: Candidate accepted {len(bait_accepted)} unethical shortcut(s) — integrity concern.")
        if mole_events and not bait_accepted and not bait_rejected:
            integrity_signals.append(f"Mole Agent attempted {len(mole_events)} bait(s) — candidate response inconclusive.")
        
        # Check if candidate's answers were consistent with resume claims
        eval_events = [e for e in audit_logs if e.get("event_type") == "EVALUATION_COMPLETE"]
        if eval_events:
            avg_eval = sum(e.get("metadata", {}).get("score", 5) for e in eval_events) / len(eval_events)
            if avg_eval >= 7:
                integrity_signals.append("Candidate's demonstrated skills are consistent with resume claims.")
            elif avg_eval < 4:
                integrity_signals.append("Candidate's performance significantly below resume-claimed skill level.")
        
        # Derive confidence from actual signals
        if bait_accepted:
            integrity_confidence = "40% — Low (Ethical concern detected)"
        elif bait_rejected and len(eval_events) > 0:
            integrity_confidence = f"{min(95, 70 + len(bait_rejected) * 10)}% — High"
        elif eval_events:
            integrity_confidence = f"{min(90, int(avg_eval * 10))}% — Moderate"
        else:
            integrity_confidence = "60% — Moderate (Limited signal)"
        
        integrity = IntegrityData(
            confidence_score=integrity_confidence,
            signals_observed=integrity_signals or ["No mole interactions or integrity events recorded."]
        )

        # 5. Communication Metrics (Derived from rubric + observer data)
        comm_metrics = []
        comm_score = rubric.get("communication", 0)
        if comm_score >= 8:
            comm_metrics.append(CommunicationMetric(metric="Clarity", observation="Excellent — candidate explained approach clearly before coding and communicated trade-offs."))
        elif comm_score >= 5:
            comm_metrics.append(CommunicationMetric(metric="Clarity", observation="Adequate — candidate communicated when prompted but didn't always think aloud."))
        else:
            comm_metrics.append(CommunicationMetric(metric="Clarity", observation="Below expectations — candidate coded silently and struggled to explain reasoning."))
        
        # Technical vocabulary from observer
        tech_score = rubric.get("technical", 0)
        if tech_score >= 7:
            comm_metrics.append(CommunicationMetric(metric="Technical Vocabulary", observation="Strong — used appropriate domain-specific terminology and explained concepts accurately."))
        else:
            comm_metrics.append(CommunicationMetric(metric="Technical Vocabulary", observation="Moderate — occasionally used imprecise or incorrect technical terms."))
        
        # Pressure response
        crisis_score = rubric.get("crisis_management", 0)
        pressure_events = [e for e in audit_logs if e.get("event_type") == "INTERRUPTION"]
        if pressure_events:
            if crisis_score >= 7:
                comm_metrics.append(CommunicationMetric(metric="Composure Under Pressure", observation=f"Handled {len(pressure_events)} interruption(s) calmly and adapted approach."))
            else:
                comm_metrics.append(CommunicationMetric(metric="Composure Under Pressure", observation=f"Received {len(pressure_events)} interruption(s) — showed signs of stress."))
        
        # Candidate interaction count
        candidate_responses = [e for e in audit_logs if e.get("actor") == "Candidate"]
        if candidate_responses:
            comm_metrics.append(CommunicationMetric(metric="Engagement Level", observation=f"{len(candidate_responses)} active interactions logged during session."))

        # 6. Skill Validation (Derived from rubric dimensions)
        skills = []
        skill_dim_map = {
            "problem_solving": "Problem Solving & Algorithmic Thinking",
            "technical": "Technical Competency & Code Quality",
            "testing": "Testing & Edge Case Awareness",
            "system_design": "System Design & Architecture",
            "crisis_management": "Incident Response & Crisis Handling",
            "communication": "Communication & Collaboration"
        }
        for dim_key, skill_name in skill_dim_map.items():
            dim_score = rubric.get(dim_key, 0)
            if dim_score >= 8:
                alignment = "Strong Hire"
                behavior = "Demonstrated exceptional competency — exceeded expectations."
            elif dim_score >= 6:
                alignment = "Hire"
                behavior = "Demonstrated solid competency — meets the hiring bar."
            elif dim_score >= 4:
                alignment = "Borderline"
                behavior = "Showed partial understanding — gaps in some areas."
            else:
                alignment = "Below Bar"
                behavior = "Insufficient demonstration of this skill during the interview."
            skills.append(SkillValidation(skill=skill_name, observed_behavior=behavior, alignment=alignment))

        # 7. Agent Consensus (Derived from actual agent participation + scores)
        # Incident Lead verdict based on overall interview flow
        if overall_score >= 8:
            lead_verdict = "Strong candidate — demonstrated depth and breadth. Recommend advancing."
        elif overall_score >= 6:
            lead_verdict = "Competent candidate — solid fundamentals. Recommend advancing with notes."
        elif overall_score >= 4:
            lead_verdict = "Borderline — some potential but significant gaps observed."
        else:
            lead_verdict = "Below hiring bar — unable to demonstrate required competencies."
        
        # Pressure Agent verdict based on crisis events
        crisis_events = [e for e in audit_logs if e.get("event_type") in ["CRISIS_TRIGGERED", "INTERRUPTION"]]
        if crisis_events:
            if crisis_score >= 7:
                pressure_verdict = f"Withstood {len(crisis_events)} pressure point(s) — composed and adaptive."
            else:
                pressure_verdict = f"Exposed to {len(crisis_events)} pressure point(s) — showed visible struggle."
        else:
            pressure_verdict = "No pressure scenarios triggered during this session."
        
        # Observer summary
        observer_verdict = f"DQI Score: {overall_score}/10. {dqi_data.get('agent_feedback_summary', '')}"
        
        # Protocol Governor — check for violations
        violations = [e for e in audit_logs if e.get("event_type") in ["BAIT_ACCEPTED", "PROTOCOL_VIOLATION"]]
        if violations:
            governor_verdict = f"WARNING: {len(violations)} protocol violation(s) detected during session."
        else:
            governor_verdict = "No protocol violations detected. Session conducted within guidelines."
        
        # Panel confidence from real data
        if overall_score >= 7 and not violations:
            panel_conf = f"{min(95, int(overall_score * 10 + 5))}% — High consensus"
        elif overall_score >= 5:
            panel_conf = f"{int(overall_score * 10)}% — Moderate consensus"
        else:
            panel_conf = f"{max(20, int(overall_score * 10))}% — Low consensus"
        
        consensus = AgentConsensus(
            incident_lead=lead_verdict,
            pressure_agent=pressure_verdict,
            observer_agent=observer_verdict,
            protocol_governor=governor_verdict,
            panel_confidence=panel_conf
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

        # =====================================================================
        # 9. MediaPipe Behavioral Biometrics Processing
        # =====================================================================
        mp_data = data.get("mediapipe_metrics")
        mp_summary = None
        
        if mp_data and isinstance(mp_data, dict):
            # --- Compute 0-10 scores from raw 0.0-1.0 composites ---
            eye_contact_score = min(10, int(mp_data.get("avg_eye_contact_score", 0) * 10))
            composure_score = min(10, int(mp_data.get("overall_confidence_score", 0) * 10))
            posture_score = min(10, int(mp_data.get("avg_posture_score", 0) * 10))
            engagement_score = min(10, int(mp_data.get("overall_engagement_score", 0) * 10))
            authenticity_mp_score = min(10, int(mp_data.get("authenticity_score", 0) * 10))
            
            # Speech fluency: penalize for too many fillers and too slow/fast pace
            avg_wpm = mp_data.get("avg_words_per_minute", 120)
            total_fillers = mp_data.get("total_filler_words", 0)
            if avg_wpm >= 100 and avg_wpm <= 160 and total_fillers < 15:
                fluency_score = 9
            elif avg_wpm >= 80 and avg_wpm <= 180 and total_fillers < 30:
                fluency_score = 7
            elif total_fillers >= 30:
                fluency_score = 4
            else:
                fluency_score = 5
            
            # --- Build human-readable observations ---
            biometric_signals = []
            
            # Eye contact
            eye_pct = mp_data.get("avg_eye_contact_score", 0) * 100
            if eye_pct >= 75:
                biometric_signals.append(f"Strong eye contact maintained ({eye_pct:.0f}% of interview).")
            elif eye_pct >= 50:
                biometric_signals.append(f"Moderate eye contact ({eye_pct:.0f}%) — some distraction observed.")
            else:
                biometric_signals.append(f"Low eye contact ({eye_pct:.0f}%) — candidate frequently looked away.")
            
            # Emotion analysis
            dominant_emotion = mp_data.get("dominant_emotion_overall", "neutral")
            stress_peaks = mp_data.get("stress_peak_count", 0)
            biometric_signals.append(f"Dominant emotion: {dominant_emotion.title()}. Stress peaks detected: {stress_peaks}.")
            
            # Posture
            fidget_rate = mp_data.get("fidget_frequency_per_min", 0)
            if fidget_rate < 2:
                biometric_signals.append("Stable posture with minimal fidgeting — confident body language.")
            elif fidget_rate < 5:
                biometric_signals.append(f"Moderate fidgeting ({fidget_rate:.1f}/min) — some nervousness detected.")
            else:
                biometric_signals.append(f"High fidgeting rate ({fidget_rate:.1f}/min) — significant anxiety indicators.")
            
            # --- Cheating Flags ---
            cheating_flags = []
            suspected_cheating = mp_data.get("suspected_cheating_events", 0)
            total_gaze_away = mp_data.get("total_gaze_deviation_sec", 0)
            
            if suspected_cheating > 0:
                cheating_flags.append(f"⚠️ {suspected_cheating} sustained off-screen gaze event(s) detected (>3s same direction).")
            if total_gaze_away > 60:
                cheating_flags.append(f"⚠️ Candidate looked away from camera for {total_gaze_away:.0f}s total — unusually high.")
            if not cheating_flags:
                cheating_flags.append("✅ No suspicious gaze patterns detected.")
            
            # --- Communication Fluency Notes ---
            fluency_notes = []
            avg_pause = mp_data.get("avg_pause_before_answer_sec", 0)
            longest_silence = mp_data.get("longest_silence_sec", 0)
            
            fluency_notes.append(f"Speaking pace: {avg_wpm:.0f} words/min {'(optimal)' if 100 <= avg_wpm <= 160 else '(outside ideal range)'}.")
            fluency_notes.append(f"Filler words: {total_fillers} total {'(acceptable)' if total_fillers < 15 else '(excessive)' if total_fillers >= 30 else '(moderate)'}.")
            fluency_notes.append(f"Avg thinking pause: {avg_pause:.1f}s. Longest silence: {longest_silence:.1f}s.")
            
            mp_summary = MediaPipeSummary(
                eye_contact_score=eye_contact_score,
                composure_score=composure_score,
                posture_score=posture_score,
                fluency_score=fluency_score,
                engagement_score=engagement_score,
                authenticity_score=authenticity_mp_score,
                biometric_signals=biometric_signals,
                cheating_flags=cheating_flags,
                communication_fluency_notes=fluency_notes,
                confidence_raw=mp_data.get("overall_confidence_score", 0),
                engagement_raw=mp_data.get("overall_engagement_score", 0),
                authenticity_raw=mp_data.get("authenticity_score", 0)
            )
            
            # --- DECISION INFLUENCE: MediaPipe affects HIRE/REJECT ---
            # Hard flag: if cheating suspected, override to reject
            if suspected_cheating >= 3:
                decision = "REJECT — INTEGRITY CONCERN (Behavioral)"
                reason = f"OVERRIDDEN: {suspected_cheating} suspected cheating events detected via gaze analysis. " + reason
            
            # Soft influence: authenticity drops confidence
            if mp_data.get("authenticity_score", 1.0) < 0.4:
                confidence = confidence.split("—")[0].strip() + " — Lowered (Behavioral authenticity score below threshold)"
                reason = f"LOW AUTHENTICITY ({mp_data.get('authenticity_score', 0):.0%}): Verbal and behavioral signals inconsistent. " + reason
            
            # Boost: high MediaPipe scores upgrade borderline decisions
            mp_composite = (eye_contact_score + composure_score + posture_score + fluency_score + engagement_score + authenticity_mp_score) / 6
            mp_adjustment = max(-1.5, min(1.5, (mp_composite - 5) * 0.25))
            effective_overall_score = max(0, min(10, overall_score + mp_adjustment))
            if mp_composite >= 8 and overall_score >= 6 and overall_score < 7:
                decision = "ADVANCE TO HUMAN INTERVIEW — BOOSTED BY BEHAVIORAL"
                reason = f"UPGRADED: Strong behavioral signals (biometric composite: {mp_composite:.1f}/10) elevated a borderline technical score. " + reason
            
            # Add MediaPipe signals to integrity section
            if suspected_cheating > 0:
                integrity.signals_observed.append(f"MediaPipe: {suspected_cheating} suspected cheating event(s) via sustained off-screen gaze.")
            else:
                integrity.signals_observed.append("MediaPipe: No cheating indicators detected — gaze consistent with camera.")
            
            # Add fluency to communication metrics
            comm_metrics.append(CommunicationMetric(
                metric="Speech Fluency (MediaPipe)", 
                observation=f"{avg_wpm:.0f} WPM, {total_fillers} filler words, {avg_pause:.1f}s avg pause."
            ))
            comm_metrics.append(CommunicationMetric(
                metric="Body Language (MediaPipe)",
                observation=f"Eye contact: {eye_pct:.0f}%, Fidget rate: {fidget_rate:.1f}/min, Posture: {'good' if posture_score >= 7 else 'fair' if posture_score >= 5 else 'poor'}."
            ))

        # DQI breakdown score includes MediaPipe influence when present.
        dqi_score_value = int(effective_overall_score * 10) if effective_overall_score <= 10 else int(effective_overall_score)
        dqi = DQIBreakdown(
            score=dqi_score_value,
            correct_decisions=correct,
            recoverable_mistakes=mistakes,
            unjustified_assumptions=unjustified,
            critical_misses=critical
        )

        # Assemble the Final Report
        # Derive role from candidate_id or data
        candidate_field = data.get("candidate_id", "unknown").replace("audit:", "").strip()
        
        # [FIX] Derive role from candidate context if available
        candidate_role = data.get("role") or data.get("candidate_role") or "Technical Engineer"
        
        return FSIR(
            candidate_id=data.get("candidate_id", "unknown"),
            role_screened=candidate_role,
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
            competency_radar=dqi_data.get("radar_chart"),  # Pass Radar Data
            mediapipe_summary=mp_summary  # Pass MediaPipe Summary
        )
