from typing import Dict, List, TypedDict, Optional

class ProtocolScenario(TypedDict):
    """Schema for interview scenarios with constraints and failure modes."""
    id: str
    name: str
    role_match: List[str]
    objective: str
    context_trigger: str
    constraints: List[str]
    failure_modes: List[str]
    success_criteria: List[str]

# The Ultimate Brain DB - Scenario Vault
SCENARIO_DB: Dict[str, ProtocolScenario] = {
    "backend_latency": {
        "id": "scenario_001",
        "name": "The 500ms Latency Spike",
        "role_match": ["backend", "sre", "devops", "systems", "engineer"],
        "objective": "Identify the root cause of high latency in us-east-1.",
        "context_trigger": "MARKET INTEL: Recent AWS us-east-1 outages.",
        "constraints": [
            "Cannot reboot the primary database",
            "Cannot rollback without approval",
            "Must maintain service availability"
        ],
        "failure_modes": [
            "Rebooting servers without checking logs first",
            "Assuming it's the database without evidence",
            "Ignoring the stakeholder's timeline questions"
        ],
        "success_criteria": [
            "Check CloudWatch metrics",
            "Identify region failure pattern",
            "Propose multi-region failover",
            "Communicate ETA to stakeholder"
        ]
    },
    "security_breach": {
        "id": "scenario_002",
        "name": "The Ransomware Trap",
        "role_match": ["security", "cyber", "infosec", "soc"],
        "objective": "Contain the active intrusion without alerting the attacker.",
        "context_trigger": "MARKET INTEL: New 'DarkSide' ransomware variant detected in wild.",
        "constraints": [
            "Do not shut down the infected node (alerts attacker)",
            "Do not access the C2 domain directly",
            "Must preserve forensic evidence"
        ],
        "failure_modes": [
            "Immediately shutting down infected machines",
            "Running antivirus during active breach",
            "Alerting the attacker by failed login attempts"
        ],
        "success_criteria": [
            "Isolate affected network segment",
            "Capture memory dump for forensics",
            "Identify lateral movement indicators",
            "Report to CISO with timeline"
        ]
    },
    "ai_model_drift": {
        "id": "scenario_003",
        "name": "The Model Performance Drift",
        "role_match": ["ml", "ai", "data", "scientist", "machine learning"],
        "objective": "Identify why the recommendation model is returning irrelevant products.",
        "context_trigger": "MARKET INTEL: Data drift is a major cause of ML model degradation.",
        "constraints": [
            "Cannot retrain the model without approval",
            "Must maintain current traffic flow",
            "Cannot access raw PII data"
        ],
        "failure_modes": [
            "Immediately retraining without diagnosing root cause",
            "Assuming the model is broken (vs data issue)",
            "Rolling back without A/B test data"
        ],
        "success_criteria": [
            "Check input feature distributions",
            "Identify upstream ETL failures",
            "Propose A/B rollback strategy",
            "Quantify business impact"
        ]
    }
}

def get_scenario_for_role(role_title: str) -> ProtocolScenario:
    """
    Returns the best matching scenario for a given role title.
    Falls back to backend_latency if no match found.
    """
    role_lower = role_title.lower()
    
    for key, scenario in SCENARIO_DB.items():
        for keyword in scenario["role_match"]:
            if keyword in role_lower:
                return scenario
    
    # Default fallback
    return SCENARIO_DB["backend_latency"]

def list_all_scenarios() -> List[Dict[str, str]]:
    """Returns a list of all available scenarios with basic info."""
    return [
        {"id": s["id"], "name": s["name"], "objective": s["objective"]} 
        for s in SCENARIO_DB.values()
    ]
