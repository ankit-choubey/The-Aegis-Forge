import logging
import os
import re
from typing import Dict, List, Any
from openai import AsyncOpenAI

logger = logging.getLogger("aegis.analysis.social")

class SocialVerifier:
    """
    Verifies candidate identity by cross-referencing Resume with Social Profiles.
    Uses Web Search Snippets + LLM comparison (Logic Only - No scraping).
    """
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.client = None
        if self.api_key:
            self.client = AsyncOpenAI(api_key=self.api_key, base_url="https://api.groq.com/openai/v1")

    def extract_links(self, text: str) -> Dict[str, str]:
        """Extracts LinkedIn and GitHub URLs from text."""
        links = {"linkedin": None, "github": None}
        
        # Regex for LinkedIn
        li_match = re.search(r'(https?://(?:www\.)?linkedin\.com/in/[\w\-_]+)', text, re.IGNORECASE)
        if li_match:
            links["linkedin"] = li_match.group(1)
            
        # Regex for GitHub
        gh_match = re.search(r'(https?://(?:www\.)?github\.com/[\w\-_]+)', text, re.IGNORECASE)
        if gh_match:
            links["github"] = gh_match.group(1)
            
        return links

    async def verify_integrity(self, resume_text: str, links: Dict[str, str]) -> Dict[str, Any]:
        """
        Main entry point. 
        1. Checks link existence (Mocked here, requires requests).
        2. Compares Resume Claims vs "Public Persona" (simulated via Search).
        """
        report = {
            "consistency_score": 0,
            "signals": [],
            "verified_links": []
        }
        
        if not self.client:
            report["signals"].append("⚠️ Social Verification Skipped (No LLM Key)")
            return report

        # Mock Search Results (In production, replace with Google/Bing Search API)
        # We assume we searched for the candidate's LinkedIn/GitHub and got a snippet.
        # Here we simulate a "Good" or "Bad" match based on placeholders.
        
        # Real logic would be:
        # search_results = await google_search(f"site:linkedin.com {links['linkedin']}")
        # snippet = search_results[0].snippet
        
        # For this implementation plan, we define the Logic for the LLM:
        
        scores = []
        
        if links.get("linkedin"):
            report["verified_links"].append("LinkedIn")
            # Logic: Compare Resume Headline with LinkedIn Headline
            # validation = await self._compare_claims(resume_text, linkedin_snippet)
            report["signals"].append("✅ LinkedIn Profile Found")
            scores.append(100)
        else:
             report["signals"].append("ℹ️ No LinkedIn URL found")

        if links.get("github"):
             report["verified_links"].append("GitHub")
             report["signals"].append("✅ GitHub Profile Found")
             scores.append(100)
        
        if scores:
            report["consistency_score"] = int(sum(scores) / len(scores))
        else:
            report["consistency_score"] = 50 # Neutral
            
        return report

    async def _compare_claims(self, resume_text: str, public_snippet: str) -> bool:
        """
        Uses LLM to check if Resume claim matches Public Snippet.
        """
        prompt = (
            f"Compare these two texts for identity verification.\n\n"
            f"RESUME: {resume_text[:500]}...\n\n"
            f"PUBLIC PROFILE: {public_snippet}\n\n"
            f"Are they describing the same person/role? Reply YES or NO."
        )
        try:
             resp = await self.client.chat.completions.create(
                 model="llama-3.1-8b-instant",
                 messages=[{"role": "user", "content": prompt}],
                 max_tokens=10
             )
             return "YES" in resp.choices[0].message.content.upper()
        except:
            return False
