"""
Crisis Question Generator
Generates unexpected domain-specific crisis questions using Groq LLM.
"""
import logging
from typing import Optional
from livekit.agents import llm

logger = logging.getLogger("aegis.agents.crisis_generator")


CRISIS_PROMPTS = {
    "devops": """You are a senior SRE. Generate ONE sudden crisis scenario question for a DevOps interview.
The crisis should be urgent and require immediate action. Examples:
- Kubernetes cluster node failures
- Database replication lag
- Load balancer issues
- Container memory leaks

Return ONLY the crisis question, no explanation. Make it feel like a real incident alert.""",

    "ai_ml": """You are a senior ML Engineer. Generate ONE sudden crisis scenario question for an AI/ML interview.
The crisis should be urgent and about production ML systems. Examples:
- Model prediction drift
- Training pipeline failure
- GPU cluster issues
- Data pipeline corruption

Return ONLY the crisis question, no explanation. Make it feel like a real incident alert.""",

    "cybersecurity": """You are a CISO. Generate ONE sudden crisis scenario question for a Cybersecurity interview.
The crisis should be urgent and about security incidents. Examples:
- Active breach detection
- Ransomware spreading
- DDoS attack
- Credential leak

Return ONLY the crisis question, no explanation. Make it feel like a real incident alert.""",

    "blockchain": """You are a Protocol Lead. Generate ONE sudden crisis scenario question for a Blockchain interview.
The crisis should be urgent and about smart contract/DeFi issues. Examples:
- Flash loan attack
- Smart contract vulnerability
- Bridge exploit
- Gas price spike

Return ONLY the crisis question, no explanation. Make it feel like a real incident alert.""",

    "backend": """You are a VP of Engineering. Generate ONE sudden crisis scenario question for a Backend interview.
The crisis should be urgent and about API/server issues. Examples:
- API gateway 503 errors
- Database connection pool exhaustion
- Message queue backup
- Memory leak in production

Return ONLY the crisis question, no explanation. Make it feel like a real incident alert.""",

    "frontend": """You are a Tech Lead. Generate ONE sudden crisis scenario question for a Frontend interview.
The crisis should be urgent and about frontend/user-facing issues. Examples:
- Production build failure
- Critical UI bug affecting users
- Performance degradation
- CDN issues

Return ONLY the crisis question, no explanation. Make it feel like a real incident alert."""
}

DEFAULT_PROMPT = """You are a senior engineer. Generate ONE sudden crisis scenario question for a technical interview.
The crisis should be urgent and require immediate technical action.
Return ONLY the crisis question, no explanation. Make it feel like a real incident alert."""


async def generate_crisis_question(
    domain: str,
    llm_instance: llm.LLM,
    candidate_name: Optional[str] = None
) -> str:
    """
    Generate a domain-specific crisis question using Groq.
    
    Args:
        domain: The candidate's domain (devops, ai_ml, etc.)
        llm_instance: Groq LLM instance
        candidate_name: Optional candidate name for personalization
        
    Returns:
        Crisis question string
    """
    domain_key = domain.lower().replace("/", "_").replace(" ", "_")
    prompt = CRISIS_PROMPTS.get(domain_key, DEFAULT_PROMPT)
    
    if candidate_name:
        prompt += f"\n\nAddress the candidate as {candidate_name} in the question."
    
    try:
        chat_ctx = llm.ChatContext()
        chat_ctx.add_message(role="user", content=prompt)
        
        logger.info(f">>> Generating crisis question for domain: {domain}")
        
        stream = llm_instance.chat(chat_ctx=chat_ctx)
        full_response = ""
        
        async for chunk in stream:
            if chunk.choices:
                delta = chunk.choices[0].delta.content
                if delta:
                    full_response += delta
        
        question = full_response.strip()
        
        # Clean up any markdown or extra formatting
        question = question.replace("```", "").replace("**", "").strip()
        
        if question:
            logger.info(f">>> Generated crisis question: {question[:50]}...")
            return question
        else:
            return _get_fallback_crisis(domain_key)
            
    except Exception as e:
        logger.error(f">>> Crisis question generation failed: {e}")
        return _get_fallback_crisis(domain_key)


def _get_fallback_crisis(domain: str) -> str:
    """Fallback crisis questions if LLM fails."""
    fallbacks = {
        "devops": "ALERT: 3 of your Kubernetes nodes just went down. Production traffic is being affected. What's your first move?",
        "ai_ml": "ALERT: Your production recommendation model is returning random results. Conversion rate dropped 40%. What do you do?",
        "cybersecurity": "ALERT: Our SIEM detected lateral movement from a compromised workstation. Active threat in progress. What's your response?",
        "blockchain": "ALERT: Flash loan attack detected on your staking contract. $500k already drained. What's your immediate action?",
        "backend": "ALERT: API returning 503 for all requests. Database connection pool exhausted. Users can't login. How do you proceed?",
        "frontend": "ALERT: Production build just failed. Main page is blank for 50% of users. What do you do first?"
    }
    return fallbacks.get(domain, "ALERT: Critical system failure detected. How do you approach this incident?")
