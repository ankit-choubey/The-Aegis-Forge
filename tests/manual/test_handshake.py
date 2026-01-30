"""
Test Handshake - Simulates the Final Round AI Server calling our Plugin
"""
import requests
import json

def test_connection():
    url = "http://127.0.0.1:8000/aegis/start"
    
    # This is exactly what FRAI sends us
    payload = {
        "frai_session_id": "frai-session-alpha-99",
        "candidate_id": "candidate-uuid-555",
        "role_context": {
            "title": "Senior DevOps Engineer",
            "required_skills": ["Kubernetes", "AWS", "Python"],
            "difficulty": "senior"
        },
        "webhook_url": "https://callback.frai.ai/hook"
    }
    
    print(f">>> [TEST] Sending Payload to {url}...")
    print(f">>> [PAYLOAD] {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print("\n>>> [SUCCESS] Connection Established!")
            print(f"    Status: {data['status']}")
            print(f"    Aegis Session ID: {data['aegis_session_id']}")
            print(f"    Message: {data['message']}")
            return True
        else:
            print(f"\n>>> [FAILURE] Status: {response.status_code}")
            print(f"    Error: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("\n>>> [ERROR] Connection refused. Is the server running?")
        print("    Start with: uvicorn backend.main:app --reload --port 8000")
        return False
    except Exception as e:
        print(f"\n>>> [ERROR] Unexpected error: {e}")
        return False

def test_health():
    """Test the health check endpoint."""
    url = "http://127.0.0.1:8000/"
    
    print(f">>> [HEALTH] Checking {url}...")
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            print(f"    Result: {response.json()}")
            return True
        return False
    except:
        print("    Server not reachable")
        return False

if __name__ == "__main__":
    print("="*50)
    print("AEGIS-FORGE HANDSHAKE TEST")
    print("="*50 + "\n")
    
    if test_health():
        test_connection()
    else:
        print("\n>>> Start the server first:")
        print("    uvicorn backend.main:app --reload --port 8000")
