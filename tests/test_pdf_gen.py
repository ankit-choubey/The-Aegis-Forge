import sys
import os
import json
sys.path.append(os.getcwd())
try:
    from app.analysis.pdf_generator import PDFReportGenerator
except ImportError:
    # If app not found, try adding parent (if running from tests/)
    sys.path.append(os.path.join(os.getcwd(), '..'))
    from app.analysis.pdf_generator import PDFReportGenerator

# User Provided JSON
data = json.loads(r'''
{
  "candidate_id": "First Last Contact",
  "role_screened": "SRE / Incident Commander",
  "decision": "REJECT",
  "overall_confidence": "High",
  "primary_reason": "Automated assessment based on DQI score.",
  "crisis_timeline": [
    {
      "time": "39s",
      "action": "PressureAgent",
      "state_change": "INTERRUPTION",
      "evaluation": "N/A"
    },
    {
      "time": "56s",
      "action": "MoleAgent",
      "state_change": "BAIT_OFFERED",
      "evaluation": "N/A"
    },
    {
      "time": "60s",
      "action": "CrisisPopupAgent",
      "state_change": "CRISIS_TRIGGERED",
      "evaluation": "N/A"
    },
    {
      "time": "78s",
      "action": "PressureAgent",
      "state_change": "INTERRUPTION",
      "evaluation": "N/A"
    },
    {
      "time": "98s",
      "action": "PressureAgent",
      "state_change": "INTERRUPTION",
      "evaluation": "N/A"
    },
    {
      "time": "153s",
      "action": "PressureAgent",
      "state_change": "INTERRUPTION",
      "evaluation": "N/A"
    },
    {
      "time": "180s",
      "action": "PressureAgent",
      "state_change": "INTERRUPTION",
      "evaluation": "N/A"
    },
    {
      "time": "218s",
      "action": "PressureAgent",
      "state_change": "INTERRUPTION",
      "evaluation": "N/A"
    }
  ],
  "dqi_breakdown": {
    "score": 0,
    "correct_decisions": 0,
    "recoverable_mistakes": 0,
    "unjustified_assumptions": 0,
    "critical_misses": 0
  },
  "integrity_signals": {
    "confidence_score": "90%",
    "signals_observed": [
      "Mole Agent attempted baiting."
    ]
  },
  "communication_metrics": [
    {
      "metric": "Clarity",
      "observation": "Assessed by AI"
    },
    {
      "metric": "Technical Terminology",
      "observation": "Monitored"
    }
  ],
  "skill_validation": [
    {
      "skill": "Incident Response",
      "observed_behavior": "Observed",
      "alignment": "Medium"
    }
  ],
  "agent_consensus": {
    "incident_lead": "Participated",
    "pressure_agent": "Participated",
    "observer_agent": "Score: 0.0",
    "protocol_governor": "Monitoring",
    "panel_confidence": "85%"
  },
  "faang_evaluation": null
}
''')

# UNCOMMENT to test Graph (User JSON lacks scores, so graph will be empty otherwise)
# for e in data['crisis_timeline']:
#     e['pressure_handling_score'] = 5

print("Generating PDF...")
gen = PDFReportGenerator()
pdf_bytes = gen.generate_report_bytes(data)

output_path = "test_report.pdf"
with open(output_path, "wb") as f:
    f.write(pdf_bytes)

print(f"PDF Generated Success: {os.path.abspath(output_path)}")
