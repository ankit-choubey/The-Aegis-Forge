"""
Dynamic Question Generator
Generates personalized interview questions based on candidate resume.
"""
import logging
import random
import asyncio
from typing import List, Dict, Any, Optional

logger = logging.getLogger("aegis.agents.question_generator")


# Quick 1-liner conceptual questions by domain — used in Phase 3.5
ONE_LINER_NON_CODING_QUESTIONS: Dict[str, List[str]] = {
    "ai_ml": [
        "What is the difference between overfitting and underfitting in 10 seconds?",
        "Name one tradeoff between a decision tree and a neural network.",
        "What does the learning rate control in gradient descent?",
        "What is an embedding, and where would you use one?",
        "What does 'attention' mean in a transformer model?",
    ],
    "backend": [
        "What does idempotent mean in the context of REST APIs?",
        "In one sentence: what is the difference between SQL and NoSQL?",
        "What is a database index and when would you avoid using one?",
        "What is the CAP theorem, and which trade-off would you choose for a payment system?",
        "What is memoization and when is it not useful?",
    ],
    "devops": [
        "What is the difference between a container and a virtual machine?",
        "What does horizontal scaling mean vs vertical scaling?",
        "What is a blue-green deployment strategy in one sentence?",
        "What does the 'latest' Docker tag risk in production?",
        "Name one disadvantage of a microservices architecture.",
    ],
    "cybersecurity": [
        "What is the difference between authentication and authorization?",
        "What does SQL injection exploit?",
        "In one sentence: what is a man-in-the-middle attack?",
        "Why is MD5 no longer suitable for password hashing?",
        "What is the principle of least privilege?",
    ],
    "blockchain": [
        "What makes a blockchain 'immutable'?",
        "What is the difference between a public and private blockchain?",
        "What is a smart contract in one sentence?",
        "What is a 51% attack?",
        "What does gas mean in Ethereum?",
    ],
    "frontend": [
        "What is the difference between the DOM and the virtual DOM?",
        "When would you use useCallback vs useMemo in React?",
        "What is CORS and when does it become an issue?",
        "What is the difference between CSS grid and flexbox?",
        "What does 'code splitting' mean in a bundler?",
    ],
    "default": [
        "What is the time complexity of binary search?",
        "What is the difference between a stack and a queue?",
        "When would you use a hash map over a sorted array?",
        "Explain Big O notation in one sentence.",
        "What is tail recursion?",
    ]
}


def build_question_generation_prompt(candidate_context: Dict[str, Any]) -> str:
    """
    Build a prompt for the LLM to generate personalized questions.
    
    Args:
        candidate_context: Output from knowledge_engine.get_candidate_context()
        
    Returns:
        Formatted prompt string
    """
    if not candidate_context:
        return ""
    
    name = candidate_context.get('name', 'Candidate')
    field = candidate_context.get('field', 'engineering').replace('_', '/').upper()
    verified_skills = candidate_context.get('verified_skills', [])
    all_skills = candidate_context.get('all_skills', [])
    projects = candidate_context.get('projects', [])
    github_repos = candidate_context.get('github', {}).get('repos', [])
    
    # [FIX] Conditional Requirement for Project Question
    if projects or github_repos:
        project_q_instruction = "- 1 question about a SPECIFIC project or repo listed above (verify ownership)"
    else:
        project_q_instruction = "- 1 general question about their most challenging recent project (do NOT name a project)"

    prompt = f"""You are a senior technical interviewer. Generate 5 unique technical interview questions for a {field} candidate.
    
    CANDIDATE PROFILE:
    - Name: {name}
    - Field: {field}
    - Verified Skills (from GitHub): {', '.join(verified_skills[:5]) if verified_skills else 'None'}
    - Claimed Skills (from Resume): {', '.join(all_skills[:8]) if all_skills else 'None'}
    - GitHub Repos: {', '.join(github_repos[:5]) if github_repos else 'None'}
    - Project Highlights: {'; '.join([p[:80] for p in projects[:3]]) if projects else 'None'}
    
    REQUIREMENTS:
    1. Generate exactly 5 questions in this order:
       - 1 DEBUGGING: Present a snippet of BROKEN code related to {field} and ask them to fix it.
       - 1 OPTIMIZATION: Present a suboptimal snippet and ask for Big O improvement.
       - 1 IMPLEMENTATION: Ask them to write a function for a specific algorithm or feature.
       - 1 REFACTORING: Give a "smelly" code block and ask how they would clean it up.
       - 1 PROBLEM SOLVING: A technical design or behavioral question (keep it short).
    
    2. Questions MUST be specific to THIS candidate's skills.
    3. FOR ALL CODE QUESTIONS: ALWAYS provide the starter code block in ```python (or relevant language) ... ```.
    4. QUESTIONS MUST BE CONCISE (Max 30 words).
    
    CRITICAL:
    - 85% of your output MUST be CODE SNIPPETS.
    - Do NOT ask high-level "how would you handle X" questions without code.
    - Enforce the candidate to use the IDE.
    
    OUTPUT FORMAT:
    Return ONLY the 5 questions, one per line.
    """
    return prompt


async def generate_dynamic_questions(
    candidate_context: Dict[str, Any],
    llm_instance: Any
) -> List[str]:
    """
    Generate personalized interview questions using LLM.
    
    Args:
        candidate_context: Candidate data from Knowledge Engine
        llm_instance: Groq LLM instance
        
    Returns:
        List of question strings
    """
    if not candidate_context:
        logger.warning("No candidate context provided, using default questions")
        return _get_fallback_questions()
    
    prompt = build_question_generation_prompt(candidate_context)
    
    if not prompt:
        return _get_fallback_questions()
    
    try:
        from livekit.agents import llm
        
        chat_ctx = llm.ChatContext()
        chat_ctx.add_message(role="user", content=prompt)
        
        logger.info(">>> Generating dynamic questions for candidate...")
        
        stream = llm_instance.chat(chat_ctx=chat_ctx)
        full_response = ""
        
        async for chunk in stream:
            content = ""
            # Handle different chunk types safely
            if hasattr(chunk, 'choices') and chunk.choices:
                content = chunk.choices[0].delta.content
            elif hasattr(chunk, 'content'):
                content = chunk.content
            
            if content:
                full_response += content
        
        # Parse response into list of questions
        questions = []
        for line in full_response.strip().split('\n'):
            clean_line = line.strip()
            if clean_line and len(clean_line) > 10:
                # Remove numbering like "1.", "1)", "1:"
                import re
                clean_q = re.sub(r'^[\d]+[.\):\-]\s*', '', clean_line)
                if clean_q:
                    questions.append(clean_q)
        
        if questions:
            logger.info(f">>> Generated {len(questions)} dynamic questions")
            return questions[:5]  # Limit to 5
        else:
            logger.warning(">>> LLM returned empty response, using fallback")
            return _get_fallback_questions()
            
    except Exception as e:
        logger.error(f">>> Question generation failed: {e}")
        return _get_fallback_questions()


def _get_fallback_questions() -> List[str]:
    """Default questions if generation fails (Strictly Code-Centric)."""
    return [
        "I have a piece of code here that's running at O(N^2) complexity. How would you optimize this to O(N log N)? ```python\ndef find_duplicates(items):\n    dups = []\n    for i in range(len(items)):\n        for j in range(i + 1, len(items)):\n            if items[i] == items[j]: dups.append(items[i])\n    return dups\n```",
        "There's a bug in this function where it occasionally returns the wrong result for empty inputs. Can you find it? ```python\ndef get_first_even(nums):\n    return [x for x in nums if x % 2 == 0][0]\n```",
        "How would you refactor this messy function to be more readable? ```python\ndef check(u, p):\n    if u != None:\n        if p != None:\n            if len(p) > 8:\n                return True\n    return False\n```",
        "Write a quick function to merge two sorted arrays efficiently in Python.",
        "How would you handle a race condition in a multi-threaded Python environment? Provide a code example."
    ]


def format_questions_for_prompt(questions: List[str], field: str = "default") -> str:
    """
    Format questions for injection into agent system prompt.
    Includes coding questions AND Phase 3.5 quick check-in questions.
    
    Args:
        questions: List of coding question strings
        field: The candidate's detected field (for picking relevant one-liners)
        
    Returns:
        Formatted string for prompt injection
    """
    if not questions:
        return ""
    
    # Pick 2 random one-liner questions for this field
    field_key = field.lower().replace("/", "_") if field else "default"
    pool = ONE_LINER_NON_CODING_QUESTIONS.get(field_key, ONE_LINER_NON_CODING_QUESTIONS["default"])
    quick_checks = random.sample(pool, min(2, len(pool)))
    
    lines = [
        "",
        "=== CANDIDATE-SPECIFIC QUESTIONS ===",
        "Use these personalized coding questions during Phase 3 (one at a time):",
        ""
    ]
    
    for i, q in enumerate(questions, 1):
        lines.append(f"{i}. {q}")
    
    lines.append("")
    lines.append("Ask these naturally, one per turn. Wait for the candidate's response before moving on.")
    lines.append("================================")
    
    # Add Phase 3.5 quick check questions
    lines.append("")
    lines.append("=== QUICK CHECK QUESTIONS (Phase 3.5) ===")
    lines.append("Ask ONE of these between every 2 coding questions. Keep it fast — verbal answer only, no IDE needed:")
    lines.append("")
    for i, q in enumerate(quick_checks, 1):
        lines.append(f"QC{i}. {q}")
    lines.append("================================")
    
    return "\n".join(lines)
