"""
Dynamic Question Generator
Generates personalized interview questions based on candidate resume.
"""
import logging
import asyncio
from typing import List, Dict, Any, Optional

logger = logging.getLogger("aegis.agents.question_generator")


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


def format_questions_for_prompt(questions: List[str]) -> str:
    """
    Format questions for injection into agent system prompt.
    
    Args:
        questions: List of question strings
        
    Returns:
        Formatted string for prompt injection
    """
    if not questions:
        return ""
    
    lines = [
        "",
        "=== CANDIDATE-SPECIFIC QUESTIONS ===",
        "Use these personalized questions during the interview:",
        ""
    ]
    
    for i, q in enumerate(questions, 1):
        lines.append(f"{i}. {q}")
    
    lines.append("")
    lines.append("Ask these naturally throughout the conversation, not all at once.")
    lines.append("================================")
    
    return "\n".join(lines)
