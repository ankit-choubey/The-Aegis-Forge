import sys
import os
import json
import time

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.analysis.pipeline import InterviewPipeline
from app.analysis.dqi_calculator import DQICalculator
from app.analysis.pdf_generator import PDFReportGenerator

def simulate_interview():
    print("🚀 Starting Aegis Forge Full Simulation...")
    
    # 1. Mock Audit Logs (Synthesizing a 10-minute interview)
    # We include events that trigger the Radar Chart and Crisis Timeline
    base_time = time.time() - 600
    
    mock_logs = [
        {"event_type": "INTERVIEW_START", "actor": "System", "timestamp": base_time, "metadata": {}},
        
        # Turn 1: Introduction (Communication High)
        {
            "event_type": "EVALUATION_COMPLETE", 
            "actor": "ObserverAgent", 
            "timestamp": base_time + 30,
            "metadata": {
                "score": 9,
                "notes": "Candidate communicated clearly.",
                "faang_evaluation": {
                    "communication": "Strong Hire",
                    "problem_solving": "Hire",
                    "technical": "Hire",
                    "testing": "Hire",
                    "system_design": "Hire",
                    "crisis_management": "Hire"
                }
            }
        },
        
        # Turn 2: Coding (Technical High)
        {
            "event_type": "EVALUATION_COMPLETE", 
            "actor": "ObserverAgent", 
            "timestamp": base_time + 150,
            "metadata": {
                "score": 8,
                "notes": "Optimal solution provided O(n).",
                "faang_evaluation": {
                    "communication": "Hire", # Slightly less chatter
                    "problem_solving": "Strong Hire",
                    "technical": "Strong Hire",
                    "testing": "Hire",
                    "system_design": "Hire",
                    "crisis_management": "Hire"
                }
            }
        },
        
        # Turn 3: Crisis Injection (Crisis Mgmt Test)
        {"event_type": "CRISIS_TRIGGERED", "actor": "System", "timestamp": base_time + 300, "metadata": {"scenario": "Database Outage"}},
        
        {
            "event_type": "EVALUATION_COMPLETE", 
            "actor": "ObserverAgent", 
            "timestamp": base_time + 360,
            "metadata": {
                "score": 7, # Dipped slightly due to panic
                "notes": "Candidate hesitated but recovered.",
                "faang_evaluation": {
                    "communication": "Hire",
                    "problem_solving": "Hire",
                    "technical": "Hire",
                    "testing": "No Hire", # Forgot to test fix
                    "system_design": "Hire",
                    "crisis_management": "Hire" 
                }
            }
        },
        
        # Turn 4: Mole Agent (Integrity Test)
        {"event_type": "BAIT_OFFERED", "actor": "MoleAgent", "timestamp": base_time + 450, "metadata": {"bait": "Skip unit tests"}},
        
        {
            "event_type": "EVALUATION_COMPLETE", 
            "actor": "ObserverAgent", 
            "timestamp": base_time + 480,
            "metadata": {
                "score": 10,
                "notes": "Candidate firmly rejected the bad advice.",
                "faang_evaluation": {
                    "communication": "Strong Hire",
                    "problem_solving": "Strong Hire",
                    "technical": "Strong Hire",
                    "testing": "Strong Hire",
                    "system_design": "Strong Hire",
                    "crisis_management": "Strong Hire" 
                }
            }
        },
        
        {"event_type": "INTERVIEW_END", "actor": "System", "timestamp": base_time + 600, "metadata": {}}
    ]

    print(f"✅ Generated {len(mock_logs)} mock audit events.")

    # 2. Run DQI Calculator
    print("📊 Calculating DQI Scores...")
    # Convert logs to strings as DQI Calculator expects (simulating raw log read)
    # Actually, the DQI calculator expects a list of JSON strings for the logs argument? 
    # Let's verify dqi_calculator.py signature.
    # calculate_score(simulation_id, observer_logs: List[str])
    
    observer_logs = [json.dumps(l["metadata"]) for l in mock_logs if l["event_type"] == "EVALUATION_COMPLETE"]
    
    dqi_calc = DQICalculator()
    dqi_result = dqi_calc.calculate_score("SIM-001", observer_logs)
    print(f"   Overall Score: {dqi_result.overall_score}")
    if dqi_result.radar_chart:
        print(f"   Radar Chart Data: {dqi_result.radar_chart.model_dump()}")
    else:
        print("   ❌ Radar Chart Data MISSING!")

    # 3. Pipeline Processing
    print("⚙️ Running Analysis Pipeline...")
    pipeline = InterviewPipeline()
    
    # Prepare data dict as pipeline expects
    data_payload = {
        "candidate_id": "SIM_CANDIDATE_JDOE",
        "dqi_calculation": dqi_result.model_dump(),
        "audit_log": mock_logs,
        "raw_transcript": "Transcript not available in simulation."
    }
    
    fsir_report = pipeline.generate_detailed_report("SIM-SESSION-123", data_payload)
    print("   FSIR Object Created.")

    # 4. Generate PDF
    print("📄 Generating PDF...")
    pdf_gen = PDFReportGenerator()
    pdf_bytes = pdf_gen.generate_report_bytes(fsir_report.model_dump())
    
    output_filename = "simulation_fsir_report_v2.pdf"
    with open(output_filename, "wb") as f:
        f.write(pdf_bytes)
        
    print(f"\n🎉 SUCCESS! Full project simulation complete.")
    print(f"📂 Report saved to: {os.path.abspath(output_filename)}")
    print("Open this file to verify the Radar Chart and Sentiment Arc.")

if __name__ == "__main__":
    simulate_interview()
