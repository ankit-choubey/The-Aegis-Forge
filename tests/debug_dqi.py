
import sys
import os

# Add project root to path
sys.path.append(os.getcwd())

from app.analysis.dqi_calculator import DQICalculator

def test_dqi():
    calc = DQICalculator()
    
    # 1. Test Clean JSON
    log1 = """{
        "timestamp": "2024-01-01T12:00:00Z",
        "score": 8,
        "notes": "Good job"
    }"""
    
    # 2. Test Markdown JSON
    log2 = """
    Here is the log:
    ```json
    {
        "timestamp": "2024-01-01T12:01:00Z",
        "score": 5,
        "notes": "Average"
    }
    ```
    """
    
    # 3. Test Broken JSON (extra comma) - Regex vs json_repair
    log3 = """
    {
        "score": 2,
        "notes": "Bad",
    }
    """

    logs = [log1, log2, log3]
    
    print(">>> Testing DQI Calculator...")
    dqi = calc.calculate_score("test_sim", logs)
    
    print(f"Overall Score: {dqi.overall_score}")
    print(f"Metrics: {len(dqi.metrics)}")
    for m in dqi.metrics:
        print(f" - Score: {m.score}, Reason: {m.reasoning}")

if __name__ == "__main__":
    test_dqi()
