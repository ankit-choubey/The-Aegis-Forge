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
    
    prompt = f"""You are a senior technical interviewer. Generate 5 unique interview questions for a {field} candidate.

CANDIDATE PROFILE:
- Name: {name}
- Field: {field}
- Verified Skills (from GitHub): {', '.join(verified_skills[:5]) if verified_skills else 'None'}
- Claimed Skills (from Resume): {', '.join(all_skills[:8]) if all_skills else 'None'}
- GitHub Repos: {', '.join(github_repos[:5]) if github_repos else 'None'}
- Project Highlights: {'; '.join([p[:80] for p in projects[:3]]) if projects else 'None'}

REQUIREMENTS:
1. Generate exactly 5 questions in this order:
   - 1 question about a SPECIFIC skill they claim (probe depth)
   - 1 question about a SPECIFIC project or repo (verify ownership)
   - 1 scenario-based question for their domain
   - 1 system design / architecture question
   - 1 behavioral / problem-solving question

2. Questions should be SPECIFIC to THIS candidate, not generic.
3. If they claim "Python", ask about specific Python concepts they should know.
4. If they have a repo called "ml-pipeline", ask about its architecture.

OUTPUT FORMAT:
Return ONLY the 5 questions, one per line, numbered 1-5. No explanations.
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
    """Default questions if generation fails."""
    return [
        "Can you walk me through a challenging project you've worked on recently?",
        "How do you approach debugging a complex issue in production?",
        "Tell me about a time you had to learn a new technology quickly.",
        "How do you ensure code quality in your projects?",
        "What's your approach to system design for a scalable application?"
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
