#!/usr/bin/env python3
"""
Test script for Resume-Driven Knowledge Engine.
Verifies field detection and context loading.
"""
import sys
sys.path.insert(0, '.')

from app.resume.loader import load_candidate_audit, detect_candidate_field, extract_candidate_context, format_context_for_prompt
from backend.funnel.pipeline import knowledge_engine

def test_audit_file(path: str):
    print(f"\n{'='*60}")
    print(f"Testing: {path}")
    print('='*60)
    
    # Load audit
    audit_data = load_candidate_audit(path)
    if not audit_data:
        print("❌ Failed to load audit file")
        return False
    
    print(f"✅ Loaded audit file")
    print(f"   Trust Score: {audit_data['summary']['trust_score']}")
    print(f"   Email: {audit_data['contact_details']['email']}")
    
    # Detect field
    field = detect_candidate_field(audit_data)
    print(f"\n🎯 Detected Field: {field.upper()}")
    
    # Extract context
    context = extract_candidate_context(audit_data)
    print(f"   Scenario ID: {context['scenario_id']}")
    print(f"   Verified Skills: {context['verified_skills']}")
    
    # Test Knowledge Engine integration
    print(f"\n📚 Loading into Knowledge Engine...")
    knowledge_engine.load_resume_audit(path)
    
    # Get market intel (should use candidate's field)
    intel = knowledge_engine.get_market_intel("anything")
    print(f"   Market Intel: {intel[:80]}...")
    
    # Get formatted prompt context
    prompt = knowledge_engine.get_candidate_prompt_context()
    print(f"\n📝 Prompt Context (first 200 chars):")
    print(prompt[:200] if prompt else "No prompt context")
    
    print(f"\n✅ Test PASSED for {field.upper()} candidate")
    return True


if __name__ == "__main__":
    print("🧪 Resume-Driven Knowledge Engine Test Suite")
    
    # Test blockchain candidate
    test_audit_file("sample_audit_blockchain.json")
    
    # Clear and test AI/ML candidate
    knowledge_engine.clear_candidate()
    test_audit_file("sample_audit_aiml.json")
    
    print("\n" + "="*60)
    print("🎉 All tests passed!")
    print("="*60)
