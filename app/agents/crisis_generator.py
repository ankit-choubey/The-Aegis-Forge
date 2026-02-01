"""
Crisis Question Generator
Generates unexpected domain-specific crisis questions using Groq LLM.
"""
import logging
from typing import Optional
from livekit.agents import llm

logger = logging.getLogger("aegis.agents.crisis_generator")


CRISIS_PROMPTS = {
    "devops": """You are a senior SRE. Generate ONE sudden crisis scenario for a DevOps interview.
The crisis MUST include a TINY snippet (3-5 lines max) of BROKEN CODE (YAML/Bash) causing an outage.
Examples:
- CrashLoopBackOff due to a typo in YAML.
- `rm -rf` on wrong variable.

Return format:
"ALERT: [1 sentence description]
```yaml
[3-5 lines of code]
```
Fix this!"
""",

    "ai_ml": """You are a senior ML Engineer. Generate ONE sudden crisis scenario for an AI/ML interview.
The crisis MUST include a TINY snippet (3-5 lines max) of BROKEN CODE (Python/SQL).
Examples:
- NaN loss due to bad input.
- Memory leak in loop.

Return format:
"ALERT: [1 sentence description]
```python
[3-5 lines of code]
```
Fix this!"
""",

    "cybersecurity": """You are a CISO. Generate ONE sudden crisis scenario for a Cybersecurity interview.
The crisis MUST include a TINY snippet (3-5 lines max) of VULNERABLE CODE.
Examples:
- SQL Injection in query.
- Unsafe `eval()`.

Return format:
"ALERT: [1 sentence description]
```python
[3-5 lines of code]
```
Patch this!"
""",

    "blockchain": """You are a Protocol Lead. Generate ONE sudden crisis scenario for a Blockchain interview.
The crisis MUST include a TINY snippet (3-5 lines max) of VULNERABLE SOLIDITY.
Examples:
- Reentrancy in withdraw.
- Integer overflow.

Return format:
"ALERT: [1 sentence description]
```solidity
[3-5 lines of code]
```
Fix this!"
""",

    "backend": """You are a VP of Engineering. Generate ONE sudden crisis scenario for a Backend interview.
The crisis MUST include a TINY snippet (3-5 lines max) of BROKEN CODE (Python/Node).
Examples:
- Infinite loop.
- Unclosed db connection.

Return format:
"ALERT: [1 sentence description]
```python
[3-5 lines of code]
```
Debug this!"
""",

    "frontend": """You are a Tech Lead. Generate ONE sudden crisis scenario for a Frontend interview.
The crisis MUST include a TINY snippet (3-5 lines max) of BROKEN JS/REACT.
Examples:
- Undefined property access.
- Infinite `useEffect`.

Return format:
"ALERT: [1 sentence description]
```javascript
[3-5 lines of code]
```
Fix this!"
"""
}

DEFAULT_PROMPT = """You are a senior engineer. Generate ONE sudden crisis scenario for a technical interview.
The crisis MUST include a small snippet of BROKEN CODE that requires fixing.
Return the response in this format:
"ALERT: [Brief Description]
```python
[Code Snippet with Bug]
```
Fix this code!"
"""


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
            # Handle different chunk types safely (SDK version compatibility)
            content = ""
            if hasattr(chunk, 'choices') and chunk.choices:
                # Old format: chunk.choices[0].delta.content
                delta = chunk.choices[0].delta
                content = getattr(delta, 'content', '') or ''
            elif hasattr(chunk, 'content'):
                # New format: chunk.content directly
                content = chunk.content or ''
            elif hasattr(chunk, 'delta') and hasattr(chunk.delta, 'content'):
                # Alternative format: chunk.delta.content
                content = chunk.delta.content or ''
            
            if content:
                full_response += content
        
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
    """Fallback crisis questions with code logic."""
    # Note: Using generic text-based code descriptions if actual generation fails, 
    # but ideally we want real code.
    fallbacks = {
        "devops": "ALERT: Kubernetes deployment failing. \n```yaml\nreplicas: 'three'\n```\nFix the type error in this YAML.",
        "ai_ml": "ALERT: Model loss is NaN. \n```python\nloss = criterion(outputs, targets)\nloss.backward()\n# optimizer.step() missing\n```\nFix the training loop.",
        "cybersecurity": "ALERT: SQL Injection detected. \n```python\ncursor.execute(f'SELECT * FROM users WHERE id={user_id}')\n```\nPatch this query.",
        "blockchain": "ALERT: Reentrancy detected. \n```solidity\nmsg.sender.call.value(amount)('');\nbalances[msg.sender] -= amount;\n```\nFix the ordering.",
        "backend": "ALERT: Production API hanging. \n```python\nwhile True:\n    data = get_data()\n    # missing break condition\n```\nFix the infinite loop.",
        "frontend": "ALERT: White screen of death. \n```javascript\nconst [user, setUser] = useState();\nreturn <div>{user.name}</div>;\n```\nFix the undefined property access."
    }
    return fallbacks.get(domain, "ALERT: Code failure. \n```python\nprint(1/0)\n```\nFix the ZeroDivisionError.")
