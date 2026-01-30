from pydantic import BaseModel
from typing import List, Optional

# --- Nested Components matching AegisForge PDF ---

class TimelineEvent(BaseModel):
    time: str
    action: str
    state_change: str
    evaluation: str

class DQIBreakdown(BaseModel):
    score: int
    correct_decisions: int
    recoverable_mistakes: int
    unjustified_assumptions: int
    critical_misses: int

class IntegrityData(BaseModel):
    confidence_score: str
    signals_observed: List[str]

class CommunicationMetric(BaseModel):
    metric: str
    observation: str

class SkillValidation(BaseModel):
    skill: str
    observed_behavior: str
    alignment: str

class AgentConsensus(BaseModel):
    incident_lead: str
    pressure_agent: str
    observer_agent: str
    protocol_governor: str
    panel_confidence: str

# --- The Final Report Structure ---

class FSIR(BaseModel):
    # Executive Block
    candidate_id: str
    role_screened: str
    decision: str
    overall_confidence: str
    primary_reason: str
    
    # Detailed Sections
    crisis_timeline: List[TimelineEvent]
    dqi_breakdown: DQIBreakdown
    integrity_signals: IntegrityData
    communication_metrics: List[CommunicationMetric]
    skill_validation: List[SkillValidation]
    agent_consensus: AgentConsensus

# --- DQI Calculator Schemas (Inferred) ---
class DQIMetric(BaseModel):
    category: str
    score: float
    reasoning: str

class DQI(BaseModel):
    simulation_id: str
    overall_score: float
    metrics: List[DQIMetric]
    agent_feedback_summary: str
