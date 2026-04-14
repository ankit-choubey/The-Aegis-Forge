import requests
import os
import sys
import json
import time

# Configuration
API_URL = "http://localhost:8000"
RESUME_FILE = "DEVRAJ SAHANI Backend JavaScript Developer.pdf"

def run_test():
    print(f"--- AEGIS FORGE API INTEGRATION TEST ---")
    print(f"Target: {API_URL}")
    print(f"Resume: {RESUME_FILE}")
    print("----------------------------------------\n")

    # 1. Check if Server is Online
    try:
        r = requests.get(f"{API_URL}/")
        print(f"[1] Health Check: {r.status_code} {r.json()}")
    except Exception as e:
        print(f"[!] CRITICAL: Backend server is not running on {API_URL}")
        print("    Please run: uvicorn backend.main:app --reload --port 8000")
        return

    # 2. Upload Resume
    print("\n[2] Uploading Resume...")
    if not os.path.exists(RESUME_FILE):
        print(f"[!] Error: File '{RESUME_FILE}' not found in current directory.")
        return

    url = f"{API_URL}/upload-resume"
    files = {'file': open(RESUME_FILE, 'rb')}
    
    try:
        response = requests.post(url, files=files)
        response.raise_for_status()
        data = response.json()
        
        candidate_id = data.get("candidate_id")
        detected_field = data.get("detected_field")
        trust_score = data.get("trust_score")
        
        print(f"    SUCCESS! Candidate ID: {candidate_id}")
        print(f"    Detected Field: {detected_field}")
        print(f"    Trust Score: {trust_score}")
        print(f"    Full Response: {json.dumps(data, indent=2)[:500]}... (truncated)")
        
    except Exception as e:
        print(f"[!] Upload Failed: {e}")
        try: print(response.text)
        except: pass
        return

    # 3. Start Interview
    print("\n[3] Starting Interview Session...")
    url = f"{API_URL}/start-interview"
    payload = {
        "candidate_id": candidate_id,
        "room_name": f"test-room-{candidate_id}" # Optional
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        
        token = data.get("token")
        room = data.get("room_name")
        ws_url = data.get("livekit_url")
        
        print(f"    SUCCESS! Interview Session Created.")
        print(f"    Room Name: {room}")
        print(f"    LiveKit URL: {ws_url}")
        print(f"    Frontend Token (Prefix): {token[:20]}...")
        
    except Exception as e:
        print(f"[!] Start Interview Failed: {e}")
        try: print(response.text)
        except: pass
        return

    print("\n----------------------------------------")
    print("INTEGRATION TEST PASSED ✅")
    print("Use the 'candidate_id' and 'token' in the frontend to connect.")
    print("----------------------------------------")

if __name__ == "__main__":
    run_test()
