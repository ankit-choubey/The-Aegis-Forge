#!/usr/bin/env python3
"""
Quick Test Script for Full Integration.
Tests both resume validation and interview flow.
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test API health."""
    r = requests.get(f"{BASE_URL}/")
    print(f"✅ Health Check: {r.json()}")
    return r.status_code == 200

def test_with_sample_audit():
    """
    Test interview flow using pre-loaded sample audit.
    Bypasses PDF upload.
    """
    print("\n" + "="*60)
    print("🧪 Testing with Sample Audit (No PDF required)")
    print("="*60)
    
    # Load sample audit directly into Knowledge Engine
    import sys
    sys.path.insert(0, '.')
    from backend.funnel.pipeline import knowledge_engine
    from app.resume.loader import extract_candidate_context
    
    # Use the pre-existing sample audit
    audit_path = "sample_audit_aiml.json"
    if knowledge_engine.load_resume_audit(audit_path):
        print(f"✅ Loaded audit: {audit_path}")
        
        ctx = knowledge_engine.get_candidate_context()
        print(f"   Field: {ctx['field']}")
        print(f"   Scenario: {ctx['scenario_id']}")
        print(f"   Skills: {ctx['verified_skills']}")
        
        # Get the formatted prompt context
        prompt = knowledge_engine.get_candidate_prompt_context()
        print(f"\n📝 Agent will see this context:")
        print("-"*40)
        print(prompt[:500])
        print("-"*40)
        
        print("\n✅ Knowledge Engine ready!")
        print("\n👉 Now connect to LiveKit Playground:")
        print("   https://agents-playground.livekit.io")
        print("\n   The agent will ask AI/ML specific questions!")
        return True
    return False


def test_pdf_upload(pdf_path: str):
    """Test PDF upload endpoint."""
    print("\n" + "="*60)
    print(f"📄 Testing PDF Upload: {pdf_path}")
    print("="*60)
    
    try:
        with open(pdf_path, 'rb') as f:
            r = requests.post(
                f"{BASE_URL}/upload-resume",
                files={"file": (pdf_path, f, "application/pdf")}
            )
        
        if r.status_code == 200:
            data = r.json()
            print(f"✅ Upload Success!")
            print(f"   Candidate ID: {data['candidate_id']}")
            print(f"   Detected Field: {data['detected_field']}")
            print(f"   Scenario: {data['scenario']}")
            print(f"   Trust Score: {data['trust_score']}")
            return data['candidate_id']
        else:
            print(f"❌ Upload Failed: {r.text}")
            return None
    except FileNotFoundError:
        print(f"❌ File not found: {pdf_path}")
        return None


def test_start_interview(candidate_id: str):
    """Test interview start endpoint."""
    print("\n" + "="*60)
    print(f"🎤 Starting Interview for: {candidate_id}")
    print("="*60)
    
    r = requests.post(
        f"{BASE_URL}/start-interview",
        json={"candidate_id": candidate_id}
    )
    
    if r.status_code == 200:
        data = r.json()
        print(f"✅ Interview Ready!")
        print(f"   Room: {data['room_name']}")
        print(f"   Field: {data['detected_field']}")
        print(f"   Scenario: {data['scenario']}")
        print(f"\n   🔗 Join URL:")
        print(f"   {data['join_url']}")
        return data
    else:
        print(f"❌ Failed: {r.text}")
        return None


if __name__ == "__main__":
    import sys
    
    print("🧪 Aegis Forge Integration Test\n")
    
    # Test health
    if not test_health():
        print("❌ Backend not running! Start with: uvicorn backend.main:app --port 8000")
        sys.exit(1)
    
    # Check command line args
    if len(sys.argv) > 1:
        # Test with provided PDF
        pdf_path = sys.argv[1]
        candidate_id = test_pdf_upload(pdf_path)
        if candidate_id:
            test_start_interview(candidate_id)
    else:
        # Test with sample audit
        test_with_sample_audit()
        
    print("\n" + "="*60)
    print("🎉 Test Complete!")
    print("="*60)
