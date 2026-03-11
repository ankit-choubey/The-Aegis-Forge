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

# =========================================================================
# MediaPipe Behavioral Biometrics Schemas
# =========================================================================

class EmotionSnapshot(BaseModel):
    """Single emotion reading at a point in time."""
    timestamp_sec: float           # Seconds from interview start
    dominant_emotion: str          # "neutral", "happy", "surprised", "stressed", "confused", "fearful"
    confidence: float              # 0.0-1.0 confidence of the emotion detection
    valence: float                 # -1.0 (negative) to 1.0 (positive) — overall emotional tone

class GazeEvent(BaseModel):
    """A notable gaze deviation event."""
    timestamp_sec: float
    direction: str                 # "left", "right", "down", "up" — where the candidate looked
    duration_ms: int               # How long they looked away (milliseconds)
    possible_cause: Optional[str] = None  # "reading_notes", "second_screen", "thinking", "unknown"

class PostureSnapshot(BaseModel):
    """Posture reading at a point in time."""
    timestamp_sec: float
    posture_label: str             # "upright", "slouching", "leaning_forward", "leaning_back"
    fidget_detected: bool          # True if significant hand/body movement detected
    shoulder_alignment: float      # 0.0 (very uneven) to 1.0 (perfectly aligned)

class SpeechSegment(BaseModel):
    """Analysis of a speech segment."""
    timestamp_sec: float
    duration_sec: float            # Length of this speech segment
    words_per_minute: float        # Speaking speed
    filler_count: int              # Number of "um", "uh", "like", "you know"
    silence_before_sec: float      # How long the candidate paused before speaking
    volume_level: str              # "low", "normal", "loud"

class MediaPipeMetrics(BaseModel):
    """
    CONTRACT: Frontend sends this JSON to POST /mediapipe-metrics.
    This is the COMPLETE format your friend should follow.
    """
    session_id: str                # Must match the LiveKit room/session ID
    candidate_id: str              # Must match the candidate_id from upload-resume
    
    # --- Face Mesh & Emotion ---
    avg_eye_contact_score: float   # 0.0-1.0 — % of time candidate maintained eye contact
    emotion_timeline: List[EmotionSnapshot]  # Emotion readings throughout interview
    dominant_emotion_overall: str  # The most frequent emotion across the entire interview
    stress_peak_count: int         # Number of times stress/anxiety spiked above threshold
    
    # --- Gaze Tracking ---
    gaze_deviations: List[GazeEvent]  # List of notable look-away events
    total_gaze_deviation_sec: float   # Total seconds spent looking away from camera
    suspected_cheating_events: int    # Count of sustained off-screen looks (>3s to same direction)
    
    # --- Pose Estimation ---
    posture_snapshots: List[PostureSnapshot]  # Posture readings throughout interview
    avg_posture_score: float       # 0.0-1.0 — overall posture quality
    fidget_frequency_per_min: float  # Average fidgets per minute
    
    # --- Audio / Speech Analysis ---
    speech_segments: List[SpeechSegment]  # Per-segment speech analysis
    avg_words_per_minute: float    # Overall speaking speed
    total_filler_words: int        # Total "um", "uh" etc. across entire interview
    avg_pause_before_answer_sec: float  # Average think-time before responding
    longest_silence_sec: float     # Longest silence during the interview
    
    # --- Composite Scores (Frontend computes these) ---
    overall_confidence_score: float  # 0.0-1.0 composite from emotion + posture + speech
    overall_engagement_score: float  # 0.0-1.0 composite from gaze + posture + response time
    authenticity_score: float        # 0.0-1.0 — consistency of verbal vs behavioral signals

class MediaPipeSummary(BaseModel):
    """Processed summary for FSIR report inclusion."""
    # Biometric Scores (0-10 scale for PDF)
    eye_contact_score: int
    composure_score: int           # Derived from emotion stability
    posture_score: int
    fluency_score: int             # From speech analysis
    engagement_score: int
    authenticity_score: int
    
    # Key Observations (human-readable)
    biometric_signals: List[str]
    cheating_flags: List[str]
    communication_fluency_notes: List[str]
    
    # Raw composite scores for decision influence
    confidence_raw: float          # 0.0-1.0
    engagement_raw: float          # 0.0-1.0
    authenticity_raw: float        # 0.0-1.0

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
    
    # [NEW] MediaPipe Behavioral Biometrics
    mediapipe_summary: Optional[MediaPipeSummary] = None

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
    rubric_breakdown: Optional[Dict[str, float]] = None  # Per-dimension FAANG rubric scores
