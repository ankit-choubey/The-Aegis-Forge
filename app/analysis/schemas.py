from pydantic import BaseModel
from typing import List, Optional, Dict

# --- Nested Components matching AegisForge PDF ---

# --- Nested Components matching AegisForge PDF ---

# [NEW] Radar Chart Data (Moved here to avoid NameError)
class DQIRadar(BaseModel):
    communication: int
    problem_solving: int
    technical: int
    testing: int
    system_design: int
    crisis_management: int

class TimelineEvent(BaseModel):
    time: str
    action: str
    state_change: str
    evaluation: str
    pressure_handling_score: int  # 1-10 (For Graph)
    sentiment_score: Optional[int] = None # [NEW] 1-10 Confidence/Sentiment

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
    
    # [NEW] FAANG Competency Grid
    faang_evaluation: Optional[Dict[str, str]] = None
    
    # [NEW] Radar Chart Data
    competency_radar: Optional[DQIRadar] = None

# --- DQI Calculator Schemas ---

class DQIMetric(BaseModel):
    category: str
    score: float
    reasoning: str

# [NEW] Radar Chart Data (Moved to top)
# class DQIRadar(BaseModel) -> Moved to line 6

class DQI(BaseModel):
    simulation_id: str
    overall_score: float
    metrics: List[DQIMetric]
    agent_feedback_summary: str
    radar_chart: Optional[DQIRadar] = None
