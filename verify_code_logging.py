import os
import json
import logging
from app.logging.questions_logger import QuestionsLogger

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("checker")

def test_questions_logger():
    print("--- Starting QuestionsLogger Test ---")
    
    # 1. Initialize Logger
    session_id = "test_session_123"
    q_logger = QuestionsLogger(session_id=session_id, candidate_name="Test User", domain="DevOps")
    
    # 2. Simulate Code Submission
    test_code = """
def solve():
    print("Hello World")
    return True
"""
    print(f"Simulating code submission: {len(test_code)} chars")
    q_logger.log_code_submission(test_code, evaluation="Good job")
    
    # 3. Save to File
    filename = f"checker_questions_{session_id}.json"
    saved_path = q_logger.save_to_file(filename)
    print(f"Saved log to: {saved_path}")
    
    # 4. Verify File Content
    if os.path.exists(saved_path):
        print("File exists.")
        with open(saved_path, "r") as f:
            data = json.load(f)
            
        print(f"Loaded {len(data['questions'])} questions from file.")
        
        # Check if code is present
        found = False
        for q in data['questions']:
            if q['type'] == 'code' and q['answer'] == test_code:
                found = True
                print("SUCCESS: Code submission found in log file.")
                print(f"Source: {q.get('source')}")
                break
        
        if not found:
            print("FAILURE: Code submission NOT found in log file.")
    else:
        print("FAILURE: Log file was not created.")

    # Clean up
    if os.path.exists(saved_path):
        os.remove(saved_path)
        print("Cleaned up test file.")

if __name__ == "__main__":
    try:
        test_questions_logger()
    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()
