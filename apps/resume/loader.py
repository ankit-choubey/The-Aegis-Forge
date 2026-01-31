"""
Resume Audit Loader
Parses candidate_full_audit.json and detects interview field.
"""
import json
import logging
from typing import Dict, Any, Optional, List
from pathlib import Path

logger = logging.getLogger("aegis.resume.loader")

# Field detection based on skill categories
FIELD_SKILLS = {
    "ai_ml": [
        "pytorch", "tensorflow", "keras", "scikit-learn", "pandas", "numpy",
        "opencv", "llm", "transformers", "machine learning", "deep learning",
        "nlp", "computer vision", "huggingface", "langchain"
    ],
    "cybersecurity": [
        "penetration", "siem", "threat", "firewall", "nmap", "wireshark",
        "metasploit", "burpsuite", "osint", "malware", "forensics",
        "incident response", "soc", "vulnerability"
    ],
    "blockchain": [
        "solidity", "web3", "ethereum", "smart contract", "hardhat",
        "truffle", "defi", "nft", "ipfs", "polygon", "rust", "anchor"
    ],
    "devops": [
        "docker", "kubernetes", "aws", "terraform", "jenkins", "ci/cd",
        "ansible", "prometheus", "grafana", "helm", "gcp", "azure"
    ],
    "backend": [
        "fastapi", "flask", "django", "node", "express", "postgresql",
        "mongodb", "redis", "graphql", "rest", "microservices"
    ],
    "frontend": [
        "react", "vue", "angular", "typescript", "nextjs", "tailwind",
        "css", "html", "webpack", "vite"
    ]
}

# Scenario mapping for each field
FIELD_SCENARIOS = {
    "ai_ml": "ai-model-drift",
    "cybersecurity": "security-breach",
    "blockchain": "smart-contract-exploit",
    "devops": "devops-redis-latency",
    "backend": "backend-api-outage",
    "frontend": "backend-api-outage"
}


def load_candidate_audit(json_path: str) -> Optional[Dict[str, Any]]:
    """
    Load and parse candidate_full_audit.json from resume validator.
    
    Args:
        json_path: Path to the audit JSON file
        
    Returns:
        Parsed audit data or None if file not found
    """
    path = Path(json_path)
    
    if not path.exists():
        logger.error(f"Audit file not found: {json_path}")
        return None
        
    try:
        with open(path, 'r') as f:
            data = json.load(f)
        logger.info(f"Loaded candidate audit from {json_path}")
        return data
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in audit file: {e}")
        return None


def detect_candidate_field(audit_data: Dict[str, Any]) -> str:
    """
    Detect the interview field based on ALL skills (verified + claimed).
    
    Priority: AI/ML > Cybersecurity > Blockchain > DevOps > Backend > Frontend
    
    Args:
        audit_data: Parsed candidate_full_audit.json
        
    Returns:
        Field identifier (e.g., "ai_ml", "devops")
    """
    # Get ALL skills - verified, unverified, and resume claims
    verified_skills = audit_data.get('verification_breakdown', {}).get('verified_skills', [])
    unverified_skills = audit_data.get('verification_breakdown', {}).get('unverified_skills', [])
    resume_skills = audit_data.get('resume_claims', {}).get('skills_list', [])
    github_langs = audit_data.get('github_deep_dive', {}).get('top_languages_used', [])
    
    # Combine ALL skills (lowercase) - use resume skills as primary
    all_skills = [s.lower() for s in resume_skills + verified_skills + unverified_skills + github_langs]
    
    logger.info(f"Detecting field from skills: {all_skills[:10]}...")
    
    # Count matches for each field
    field_scores = {}
    for field, keywords in FIELD_SKILLS.items():
        score = sum(1 for skill in all_skills if any(kw in skill for kw in keywords))
        field_scores[field] = score
    
    logger.info(f"Field scores: {field_scores}")
    
    # Get field with highest score
    if field_scores:
        best_field = max(field_scores, key=field_scores.get)
        if field_scores[best_field] > 0:
            logger.info(f"Detected field: {best_field} (score: {field_scores[best_field]})")
            return best_field
    
    # Default to devops
    logger.info("No strong field match, defaulting to devops")
    return "devops"


def get_scenario_for_field(field: str) -> str:
    """Get the appropriate scenario ID for a field."""
    return FIELD_SCENARIOS.get(field, "devops-redis-latency")


def extract_candidate_context(audit_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract relevant candidate context for agent prompts.
    
    Args:
        audit_data: Parsed candidate_full_audit.json
        
    Returns:
        Structured context for Knowledge Engine
    """
    field = detect_candidate_field(audit_data)
    
    return {
        "field": field,
        "scenario_id": get_scenario_for_field(field),
        "trust_score": audit_data.get('summary', {}).get('trust_score', 'Unknown'),
        "integrity_level": audit_data.get('summary', {}).get('integrity_level', 'Unknown'),
        "name": audit_data.get('contact_details', {}).get('name', 'Candidate'),
        "email": audit_data.get('contact_details', {}).get('email', 'Unknown'),
        "market_intel": audit_data.get('dynamic_market_intel'), # <--- Extracted from audit file
        "verified_skills": audit_data.get('verification_breakdown', {}).get('verified_skills', []),
        "unverified_skills": audit_data.get('verification_breakdown', {}).get('unverified_skills', []),
        "github": {
            "repos": audit_data.get('github_deep_dive', {}).get('list_of_repos', []),
            "languages": audit_data.get('github_deep_dive', {}).get('top_languages_used', []),
            "repo_count": audit_data.get('github_deep_dive', {}).get('total_public_repos', 0)
        },
        "projects": audit_data.get('resume_claims', {}).get('projects_extracted_text', []),
        "all_skills": audit_data.get('resume_claims', {}).get('skills_list', [])
    }


def format_context_for_prompt(context: Dict[str, Any]) -> str:
    """
    Format candidate context as a string for system prompts.
    
    Args:
        context: Output from extract_candidate_context()
        
    Returns:
        Formatted string for injection into agent prompts
    """
    lines = [
        "=== CANDIDATE PROFILE ===",
        f"Field: {context['field'].upper().replace('_', '/')}",
        f"Trust Score: {context['trust_score']}",
        f"Integrity Level: {context['integrity_level']}",
        "",
        "VERIFIED SKILLS (proven by GitHub):",
        ", ".join(context['verified_skills']) if context['verified_skills'] else "None",
        "",
        "UNVERIFIED CLAIMS:",
        ", ".join(context['unverified_skills']) if context['unverified_skills'] else "None",
        "",
        f"GitHub Stats: {context['github']['repo_count']} public repos",
        f"Top Languages: {', '.join(context['github']['languages'][:5])}",
        "",
        "Notable Repos:",
    ]
    
    # Add top 5 repos
    for repo in context['github']['repos'][:5]:
        lines.append(f"  - {repo}")
    
    # Add project descriptions if available
    if context['projects']:
        lines.append("")
        lines.append("Projects from Resume:")
        for proj in context['projects'][:3]:
            lines.append(f"  - {proj[:100]}...")
    
    lines.append("=========================")
    
    return "\n".join(lines)
