import sys
import os
import glob
from pathlib import Path

# Add current dir to path
sys.path.insert(0, os.getcwd())

from backend.funnel.pipeline import knowledge_engine
from app.resume.loader import detect_candidate_field, get_scenario_for_field, format_context_for_prompt

def verify_knowledge_engine():
    print("🔍 DIAGNOSTIC: Knowledge Engine State")
    print("="*60)

    # 1. Find latest audit
    uploads_dir = Path("uploads")
    if not uploads_dir.exists():
        print("❌ No uploads directory found.")
        return

    audit_files = sorted(uploads_dir.glob("*_audit.json"), key=lambda p: p.stat().st_mtime, reverse=True)
    if not audit_files:
        print("❌ No audit files found.")
        return

    latest_audit = str(audit_files[0])
    print(f"📄 Latest Audit File: {latest_audit}")

    # 2. Load into Knowledge Engine
    success = knowledge_engine.load_resume_audit(latest_audit)
    if not success:
        print("❌ Failed to load audit into Knowledge Engine.")
        return

    # 3. Inspect Context
    ctx = knowledge_engine.get_candidate_context()
    if not ctx:
        print("❌ Knowledge Engine context is empty!")
        return

    print(f"✅ Context Loaded Properly")
    print(f"   • Detected Field: {ctx['field']}")
    print(f"   • Mapped Scenario: {ctx['scenario_id']}")
    print(f"   • Verified Skills: {ctx['verified_skills']}")
    print(f"   • GitHub Repos: {len(ctx['github']['repos'])}")

    # 4. Check Prompt Injection
    prompt = knowledge_engine.get_candidate_prompt_context()
    print("\n📝 Prompt Injection Preview:")
    print("-" * 40)
    print(prompt[:500] + "..." if len(prompt) > 500 else prompt)
    print("-" * 40)

    # 5. Check Market Intel
    print("\n📊 Market Intelligence Check:")
    intel = knowledge_engine.get_market_intel(ctx['field'])
    print(f"   • Intel Source: {ctx['field'].upper()}")
    print(f"   • Snippet: {intel[:100]}...")

    print("\n✅ DIAGNOSIS: Knowledge Engine is FULLY OPERATIONAL 🚀")

if __name__ == "__main__":
    verify_knowledge_engine()
