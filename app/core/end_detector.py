"""
End Phrase Detector
Detects when user wants to end the interview.
"""
import re
from typing import List


# Phrases that indicate the user wants to end the interview
END_PHRASES = [
    "can we end the interview",
    "let's end the interview",
    "end the interview",
    "let's end it",
    "i want to stop",
    "i want to end",
    "let's stop here",
    "that's all for today",
    "i think we're done",
    "we can stop now",
    "can we stop",
    "let's wrap up",
    "wrap it up",
    "finish the interview",
    "conclude the interview",
    "ok i'm done",
    "okay i'm done",
    "i'm finished",
    "let's call it",
    "that's enough",
    "end interview",
    "stop interview"
]


def check_end_phrase(transcript: str) -> bool:
    """
    Check if the transcript contains an end phrase.
    
    Uses case-insensitive matching with some fuzzy tolerance.
    
    Args:
        transcript: User's speech transcript
        
    Returns:
        True if an end phrase is detected
    """
    if not transcript:
        return False
    
    # Normalize the transcript
    normalized = transcript.lower().strip()
    
    # Remove punctuation for better matching
    normalized = re.sub(r'[^\w\s]', '', normalized)
    
    # Check for exact or partial matches
    for phrase in END_PHRASES:
        # Exact substring match
        if phrase in normalized:
            return True
        
        # Check if key words are present (fuzzy matching)
        words = phrase.split()
        if len(words) >= 2:
            # Check if at least 80% of words are present
            matches = sum(1 for w in words if w in normalized)
            if matches >= len(words) * 0.8:
                return True
    
    return False


def get_goodbye_message(candidate_name: str = None) -> str:
    """
    Generate a goodbye message for the agent to say.
    
    Args:
        candidate_name: Optional candidate name for personalization
        
    Returns:
        Goodbye message string
    """
    if candidate_name and candidate_name != "Candidate":
        return (
            f"Thank you {candidate_name} for your time today. "
            f"It was great speaking with you. "
            f"We'll be in touch with the next steps. Have a great day!"
        )
    else:
        return (
            "Thank you for your time today. "
            "It was great speaking with you. "
            "We'll be in touch with the next steps. Have a great day!"
        )
