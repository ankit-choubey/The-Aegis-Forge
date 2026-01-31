import sys
import os
import json

# Add app to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from backend.funnel.pipeline import knowledge_engine

def test_focus_loading():
    print(">>> Testing KnowledgeEngine Focus Loading...")
    
    # Init Engine
    engine = knowledge_engine
    
    # 1. Run Load
    topics = engine.load_focus_topics()
    
    print(f"Loaded Topics: {topics}")
    
    # 2. Verify
    if "Golang" in topics and "Kafka" in topics:
        print(">>> SUCCESS: Focus topics loaded from JSON.")
    else:
        print(">>> FAILURE: Topics missing.")

if __name__ == "__main__":
    test_focus_loading()
