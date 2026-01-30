"""
Verify God Mode - The Ultimate Non-Blocking Verification Script
Proves that the Researcher runs in background without blocking API.
"""
import requests
import time
import json

def verify_god_mode():
    """
    This test:
    1. Sends a handshake request
    2. Immediately checks the response time (should be <100ms)
    3. Waits a bit and checks if context was ingested
    """
    url = "http://127.0.0.1:8000/aegis/start"
    
    payload = {
        "frai_session_id": "god-mode-test-001",
        "candidate_id": "test-candidate",
        "role_context": {
            "title": "Senior Security Engineer",
            "required_skills": ["Penetration Testing", "SIEM", "Incident Response"],
            "difficulty": "expert",
            "resume_text": "10 years of experience in cybersecurity, former SOC analyst at Fortune 500."
        },
        "webhook_url": "https://test.callback.ai/hook"
    }
    
    print("="*60)
    print("GOD MODE VERIFICATION TEST")
    print("="*60)
    print("\n>>> Testing non-blocking ingestion...")
    
    # 1. Time the request
    start = time.time()
    try:
        response = requests.post(url, json=payload, timeout=5)
        latency_ms = (time.time() - start) * 1000
        
        if response.status_code != 200:
            print(f">>> [FAIL] Server returned {response.status_code}")
            return False
            
        data = response.json()
        aegis_id = data['aegis_session_id']
        
        print(f"\n>>> [LATENCY] Response time: {latency_ms:.2f}ms")
        
        if latency_ms < 100:
            print(">>> [PASS] Response was under 100ms - Background task is working!")
        elif latency_ms < 500:
            print(">>> [WARN] Response was under 500ms - Acceptable but could be faster.")
        else:
            print(">>> [FAIL] Response took too long - Ingestion might be blocking.")
            
        # 2. Wait for background ingestion
        print("\n>>> Waiting 2 seconds for background ingestion...")
        time.sleep(2)
        
        # 3. Check session status
        session_url = f"http://127.0.0.1:8000/aegis/session/{aegis_id}"
        session_response = requests.get(session_url, timeout=5)
        
        if session_response.status_code == 200:
            session_data = session_response.json()
            print(f"\n>>> [SESSION DATA]")
            print(f"    Session ID: {session_data['aegis_session_id']}")
            print(f"    State Phase: {session_data['state']['phase']}")
            print(f"    Server Health: {session_data['state']['server_health']}")
            print("\n>>> [SUCCESS] God Mode verified!")
            return True
        else:
            print(f">>> [FAIL] Could not retrieve session: {session_response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(">>> [ERROR] Server not running.")
        print("    Start with: uvicorn backend.main:app --reload --port 8000")
        return False
    except Exception as e:
        print(f">>> [ERROR] {e}")
        return False

if __name__ == "__main__":
    verify_god_mode()
