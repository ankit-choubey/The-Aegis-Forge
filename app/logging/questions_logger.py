"""
Questions Logger
Logs all questions, answers, and code submissions during an interview.
"""
import json
import logging
import re
from datetime import datetime
from typing import Optional, Dict, Any, List

logger = logging.getLogger("aegis.logging.questions_logger")


class QuestionsLogger:
    """
    Logs all Q&A interactions during an interview session.
    
    Tracks:
    - Theory questions and answers
    - Code submissions and evaluations
    - Crisis questions
    - Dynamic questions
    """
    
    def __init__(self, session_id: str, candidate_name: str = "Candidate", domain: str = "unknown"):
        self.session_id = session_id
        self.candidate_name = candidate_name
        self.domain = domain
        self.start_time = datetime.now()
        self.end_time: Optional[datetime] = None
        
        self._questions: List[Dict[str, Any]] = []
        self._question_counter = 0
        self._last_question_id: Optional[int] = None
        
    def log_question(
        self,
        question: str,
        question_type: str = "theory",
        source: str = "IncidentLead"
    ) -> int:
        """
        Log a question asked by the agent.
        
        Args:
            question: The question text
            question_type: "theory", "code", "crisis", "dynamic"
            source: Which agent asked (IncidentLead, CrisisPopup, etc.)
            
        Returns:
            Question ID for associating answers
        """
        self._question_counter += 1
        question_id = self._question_counter
        
        entry = {
            "id": question_id,
            "timestamp": datetime.now().isoformat(),
            "type": question_type,
            "question": question,
            "answer": None,  # To be filled when candidate answers
            "source": source
        }
        
        self._questions.append(entry)
        self._last_question_id = question_id
        
        logger.info(f">>> Logged question #{question_id}: {question[:50]}...")
        return question_id
        
    def log_answer(self, answer: str, question_id: Optional[int] = None) -> bool:
        """
        Log a candidate's answer to a question.
        
        Args:
            answer: The answer text
            question_id: Specific question ID, or None for last question
            
        Returns:
            True if answer was associated with a question
        """
        target_id = question_id or self._last_question_id
        
        if target_id is None:
            logger.warning(">>> No question to associate answer with")
            return False
            
        # Find the question and update it
        for q in self._questions:
            if q["id"] == target_id:
                q["answer"] = answer
                logger.info(f">>> Logged answer for question #{target_id}")
                return True
                
        logger.warning(f">>> Question #{target_id} not found")
        return False
        
    def log_code_submission(self, code: str, evaluation: Optional[str] = None) -> int:
        """
        Log a code submission from the candidate.
        
        Args:
            code: The submitted code
            evaluation: Agent's evaluation of the code (optional)
            
        Returns:
            Question ID
        """
        self._question_counter += 1
        question_id = self._question_counter
        
        entry = {
            "id": question_id,
            "timestamp": datetime.now().isoformat(),
            "type": "code",
            "question": "[Code Submission Requested]",
            "answer": code,
            "evaluation": evaluation,
            "source": "Notepad"
        }
        
        self._questions.append(entry)
        logger.info(f">>> Logged code submission #{question_id}: {len(code)} chars")
        return question_id
        
    def log_crisis_question(self, question: str) -> int:
        """Log a crisis question."""
        return self.log_question(question, question_type="crisis", source="CrisisPopup")
        
    def log_dynamic_question(self, question: str) -> int:
        """Log a dynamically generated question."""
        return self.log_question(question, question_type="dynamic", source="QuestionGenerator")
        
    def detect_and_log_question(self, agent_speech: str) -> bool:
        """
        Automatically detect if agent speech is a question and log it.
        
        Args:
            agent_speech: The agent's speech text
            
        Returns:
            True if a question was detected and logged
        """
        # Simple heuristics to detect questions
        speech_lower = agent_speech.lower().strip()
        
        # Check for question patterns
        question_patterns = [
            r'\?$',  # Ends with ?
            r'^(what|how|why|when|where|who|can you|could you|would you|tell me|explain|describe)',
            r'(your approach|your first|what would|how would)',
        ]
        
        is_question = any(re.search(p, speech_lower) for p in question_patterns)
        
        if is_question and len(agent_speech) > 20:  # Ignore short phrases
            self.log_question(agent_speech, question_type="theory", source="IncidentLead")
            return True
            
        return False
        
    def finalize(self):
        """Mark the session as ended."""
        self.end_time = datetime.now()
        logger.info(f">>> Questions log finalized: {len(self._questions)} questions")
        
    def export_json(self) -> Dict[str, Any]:
        """Export the full questions log as a dictionary."""
        return {
            "session_id": self.session_id,
            "candidate_name": self.candidate_name,
            "domain": self.domain,
            "start_time": self.start_time.isoformat(),
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "total_questions": len(self._questions),
            "questions": self._questions
        }
        
    def save_to_file(self, filename: Optional[str] = None) -> str:
        """
        Save the questions log to a JSON file.
        
        Args:
            filename: Custom filename, or auto-generate
            
        Returns:
            Path to saved file
        """
        if filename is None:
            filename = f"questions_{self.session_id}.json"
            
        self.finalize()
        
        with open(filename, "w") as f:
            json.dump(self.export_json(), f, indent=2)
            
        logger.info(f">>> Questions log saved: {filename}")
        return filename
