import logging
import asyncio
import json
import os
from typing import Dict, Any, Optional

# Import Resume Validator
from backend.resume_validator import validate_resume

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AEGIS-PATHWAY")

# Field-specific market intel
FIELD_MARKET_INTEL = {
    "ai_ml": (
        "MARKET INTEL: Data drift is the #1 cause of ML model degradation. "
        "Feature stores are becoming standard infrastructure. "
        "LLM hallucination detection is a hot research area. "
        "MLOps maturity is a key differentiator for teams. "
        "Model monitoring and A/B testing are critical skills."
    ),
    "cybersecurity": (
        "MARKET INTEL: VPN zero-days and supply chain attacks are trending. "
        "Ransomware groups using 'double extortion' tactics. "
        "AI-generated phishing is a major new threat vector. "
        "SIEM tuning and threat hunting are in-demand skills. "
        "SOC automation and SOAR platforms are growing."
    ),
    "blockchain": (
        "MARKET INTEL: Smart contract audits are critical after recent exploits. "
        "Gas optimization is a key differentiator. "
        "Cross-chain bridges are major security risks. "
        "DeFi protocol design requires deep understanding of MEV. "
        "L2 solutions like Arbitrum and Optimism are dominant."
    ),
    "devops": (
        "MARKET INTEL: AWS outages, Kubernetes deprecations, "
        "and Terraform licensing are hot topics. "
        "GitOps and ArgoCD adoption is accelerating. "
        "Platform engineering is the new DevOps. "
        "FinOps and cost optimization are critical."
    ),
    "backend": (
        "MARKET INTEL: Moving from microservices back to monoliths is discussed. "
        "AsyncIO performance tuning is a common interview topic. "
        "Vector Database integration is a high-demand skill. "
        "Connection pooling issues are common in high-traffic systems."
    ),
    "frontend": (
        "MARKET INTEL: React Server Components are changing the game. "
        "Edge rendering and ISR are key performance topics. "
        "TypeScript adoption is now standard. "
        "Core Web Vitals optimization is critical for SEO."
    )
}

class AegisKnowledgeEngine:
    """
    The Central Knowledge Repository.
    Integrates Resume Parsing + Web Scraping (The Researcher) + Context Retrieval.
    Implemented as a Singleton to be shared across API and Agents.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AegisKnowledgeEngine, cls).__new__(cls)
            cls._instance.context_store = {}
            cls._instance.candidate_context = None
            cls._instance.dynamic_intel = {}  # CACHE FOR LLM RESULTS
            logger.info(">>> [SYSTEM] Knowledge Engine + Researcher Active (God Mode).")
        return cls._instance

    def process_candidate_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """
        [RESUME VALIDATOR CONNECTION]
        Process a raw PDF resume:
        1. Validate structure and extract claims.
        2. Generate Audit JSON.
        3. Save to uploads/ for persistence.
        4. Load into context.
        """
        logger.info(f">>> [PIPELINE] Processing PDF: {pdf_path}")
        
        # 1. Run Validation
        audit_data = validate_resume(pdf_path)
        
        if "error" in audit_data:
            logger.error(f">>> Resume Validation Failed: {audit_data['error']}")
            return audit_data

        # 2. Extract Candidate Name for filename
        name = audit_data.get("contact_details", {}).get("name", "candidate").lower().replace(" ", "_")
        if not name or name == "candidate":
             # Fallback to email prefix or random
             email = audit_data.get("contact_details", {}).get("email", "")
             if email:
                 name = email.split("@")[0]
             else:
                 name = "unknown_candidate"
        
        # 3. Save Audit JSON
        output_filename = f"uploads/{name}_audit.json"
        
        # Ensure uploads dir exists
        os.makedirs("uploads", exist_ok=True)
        
        with open(output_filename, "w") as f:
            json.dump(audit_data, f, indent=2)
            
        logger.info(f"[[AUDIT GENERATED]] Saved to {output_filename}")
        
        # 4. Load into Context
        self.candidate_context = audit_data 
        
        return audit_data

    async def _fetch_market_data(self, role: str) -> str:
        """
        [THE RESEARCHER]
        Uses Groq (Llama3) to generate REAL-TIME market intelligence.
        """
        import os
        from openai import AsyncOpenAI
        
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            logger.warning(">>> [RESEARCHER] No GROQ_API_KEY. Using static fallback.")
            return self._get_static_fallback(role)

        logger.info(f">>> [RESEARCHER] Generating dynamic intel for: '{role}'...")
        
        try:
            client = AsyncOpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")
            
            prompt = (
                f"You are a Senior Tech Recruiter. Provide 3 critical, modern technical trends/failures "
                f"relevant to a '{role}' role in 2024/2025. "
                f"Focus on specific technologies, outages, or architectural shifts. "
                f"Format as a concise paragraph starting with 'MARKET INTEL:'."
            )
            
            completion = await client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=150
            )
            
            intel = completion.choices[0].message.content.strip()
            logger.info(f">>> [RESEARCHER] Generated: {intel[:100]}...")
            return intel
            
        except Exception as e:
            logger.error(f">>> [RESEARCHER] Failed: {e}")
            return self._get_static_fallback(role)

    def _get_static_fallback(self, role: str) -> str:
        """Static fallback data."""
        # Dynamic Context Injection based on Role Title
        if "DevOps" in role or "SRE" in role or "Engineer" in role:
            return (
                "MARKET INTEL: Recent AWS us-east-1 outages have made multi-region failover critical. "
                "Kubernetes v1.29 deprecations are causing upgrade pain. "
                "Terraform license changes are a hot debate topic. "
                "Redis KEYS * command is a known cause of latency spikes."
            )
        elif "Security" in role or "Cyber" in role:
            return (
                "MARKET INTEL: Zero-day RCE vulnerabilities in enterprise VPNs are trending. "
                "Supply chain attacks via npm/pip packages are rising. "
                "AI-generated phishing is a major new threat vector. "
                "Ransomware groups are using 'double extortion' tactics."
            )
        elif "Backend" in role or "Python" in role or "Full-Stack" in role:
            return (
                "MARKET INTEL: Moving from microservices back to monoliths is a discussed trend. "
                "AsyncIO performance tuning is a common interview blocker. "
                "Vector Database integration is a high-demand skill. "
                "Connection pooling issues are common in high-traffic systems."
            )
        elif "ML" in role or "AI" in role or "Data" in role:
            return (
                "MARKET INTEL: Data drift is the #1 cause of ML model degradation. "
                "Feature stores are becoming standard infrastructure. "
                "LLM hallucination detection is a hot research area. "
                "MLOps maturity is a key differentiator for teams."
            )
        elif "Front" in role or "React" in role:
            return (
                 "MARKET INTEL: React Server Components are changing the game. "
                 "Edge rendering and ISR are key performance topics. "
                 "TypeScript adoption is now standard. "
                 "Core Web Vitals optimization is critical for SEO."
            )
        
        return "MARKET INTEL: Industry focus is on cost-optimization and resilience."

    async def hydrate_dynamic_intel(self, field: str) -> str:
        """
        [ASYNC CACHE WARMER]
        Triggers the Researcher to fetch data for the field and caches it.
        Returns the intel string.
        """
        if field in self.dynamic_intel:
            return self.dynamic_intel[field]
            
        logger.info(f">>> [RESEARCHER] Hydrating cache for: {field}")
        intel = await self._fetch_market_data(field)
        self.dynamic_intel[field] = intel
        logger.info(f">>> [RESEARCHER] Cache hydrated for {field}.")
        return intel

    def get_market_intel(self, domain: str) -> str:
        """
        Get market intel by domain. Prioritizes dynamic cache, then static fallback.
        """
        domain_lower = domain.lower()
        logger.info(f">>> get_market_intel called for domain: {domain_lower}")
        
        # If candidate is loaded, use their detected field
        field = None # Initialize field here
        if self.candidate_context:
            # 0. Check for Persisted Dynamic Intel (Cross-Process Handoff)
            if self.candidate_context.get('market_intel'):
                 logger.info(">>> [RESEARCHER] Serving Persisted Dynamic Intel from Audit File.")
                 return self.candidate_context['market_intel']

            field = self.candidate_context.get('field', 'devops')
            logger.info(f">>> Using candidate field: {field}")
        
        # 2. Domain Driven Fallback
        if not field:
            if "security" in domain_lower: field = "cybersecurity"
            elif "blockchain" in domain_lower: field = "blockchain"
            elif "ml" in domain_lower or "ai" in domain_lower: field = "ai_ml"
            elif "front" in domain_lower: field = "frontend"
            elif "back" in domain_lower: field = "backend"
            else: field = "devops"

        # 3. Check Dynamic Cache First
        if field in self.dynamic_intel:
            logger.info(f">>> serving DYNAMIC market intel for {field}")
            return self.dynamic_intel[field]
            
        # 4. Fallback to Static
        return FIELD_MARKET_INTEL.get(field, FIELD_MARKET_INTEL['devops'])

    def load_resume_audit(self, audit_path: str) -> bool:
        """
        Load candidate audit JSON from resume validator.
        
        Args:
            audit_path: Path to candidate_full_audit.json
            
        Returns:
            True if loaded successfully
        """
        try:
            from app.resume.loader import load_candidate_audit, extract_candidate_context
            
            audit_data = load_candidate_audit(audit_path)
            if not audit_data:
                logger.error(f">>> Failed to load audit: {audit_path}")
                return False
            
            self.candidate_context = extract_candidate_context(audit_data)
            logger.info(f">>> [RESUME] Loaded candidate: {self.candidate_context.get('email', 'Unknown')}")
            logger.info(f">>> [RESUME] Detected field: {self.candidate_context.get('field', 'Unknown')}")
            logger.info(f">>> [RESUME] Verified skills: {self.candidate_context.get('verified_skills', [])}")
            return True
            
        except Exception as e:
            logger.error(f">>> [RESUME] Load error: {e}")
            return False

    def get_candidate_context(self) -> Optional[Dict[str, Any]]:
        """
        Get loaded candidate context.
        
        Returns:
            Candidate context dict or None if not loaded
        """
        return self.candidate_context

    def get_candidate_prompt_context(self) -> str:
        """
        Get formatted candidate context for agent prompts.
        
        Returns:
            Formatted string for system prompt injection
        """
        if not self.candidate_context:
            return ""
        
        try:
            from app.resume.loader import format_context_for_prompt
            return format_context_for_prompt(self.candidate_context)
        except Exception as e:
            logger.error(f">>> [PROMPT] Format error: {e}")
            return ""

    def clear_candidate(self):
        """Clear loaded candidate context."""
        self.candidate_context = None
        logger.info(">>> [RESUME] Candidate context cleared.")


# Singleton Instance Export
knowledge_engine = AegisKnowledgeEngine()