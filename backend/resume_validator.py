"""
Resume Validator - Server Adapted Version
Adapted from user's tkinter-based validator for API use.
"""
import pdfplumber
import re
import requests
import json
import logging
import os
from typing import Dict, Any, Optional, List
from pathlib import Path

logger = logging.getLogger("aegis.resume_validator")

# Try to import OCR dependencies (optional)
try:
    import pytesseract
    from pdf2image import convert_from_path
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False
    logger.warning("OCR dependencies not available (pytesseract, pdf2image)")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

TARGET_SKILLS = {
    "Languages": ["python", "c++", "java", "javascript", "typescript", "sql", "html", "css", "go", "rust"],
    "AI_ML": ["pytorch", "tensorflow", "scikit-learn", "keras", "pandas", "numpy", "opencv", "llm", "transformers", "langchain", "huggingface"],
    "Cybersecurity": ["penetration", "siem", "threat", "firewall", "nmap", "wireshark", "metasploit", "burpsuite", "osint", "malware"],
    "Blockchain": ["solidity", "web3", "ethereum", "smart contract", "hardhat", "truffle", "defi", "nft"],
    "Backend": ["fastapi", "flask", "django", "node", "express", "docker", "kubernetes", "aws", "postgresql", "mongodb"],
    "Frontend": ["react", "vue", "angular", "nextjs", "tailwind"],
    "Tools": ["git", "github", "docker", "jenkins", "jira"]
}

SECTION_HEADERS = [
    "PROJECTS", "PERSONAL PROJECTS", "ACADEMIC PROJECTS",
    "EXPERIENCE", "WORK EXPERIENCE", "EMPLOYMENT"
]


def extract_content_smart(pdf_path: str) -> tuple[str, Dict[str, Optional[str]]]:
    """Extract text and links from PDF."""
    text = ""
    all_urls = set()
    found_links = {"linkedin": None, "github": None}
    
    logger.info(f"Extracting content from: {pdf_path}")
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                if hasattr(page, 'hyperlinks'):
                    for link in page.hyperlinks:
                        if 'uri' in link: 
                            all_urls.add(link['uri'])
                page_text = page.extract_text()
                if page_text: 
                    text += page_text + "\n"
    except Exception as e:
        logger.error(f"Digital read error: {e}")

    # Fallback to OCR if no text found
    if len(text.strip()) < 50 and OCR_AVAILABLE:
        logger.info("No digital text found. Switching to OCR...")
        try:
            images = convert_from_path(pdf_path)
            for img in images:
                ocr_text = pytesseract.image_to_string(img)
                text += ocr_text + "\n"
        except Exception as e:
            logger.error(f"OCR Error: {e}")

    # Extract URLs from text
    text_urls = re.findall(r'(?:https?://|www\.)[^\s]+', text)
    all_urls.update(text_urls)
    lazy_urls = re.findall(r'(?:linkedin\.com/in/[a-zA-Z0-9\-_%]+|github\.com/[a-zA-Z0-9\-_]+)', text)
    for url in lazy_urls: 
        all_urls.add("https://" + url)

    # Find LinkedIn and GitHub links
    for url in all_urls:
        url_clean = url.strip().rstrip('.,)')
        if "linkedin.com/in/" in url_clean and not found_links["linkedin"]:
            found_links["linkedin"] = url_clean
        if "github.com/" in url_clean and not found_links["github"]:
            if not any(x in url_clean for x in ["/pricing", "/about", "/features"]):
                found_links["github"] = url_clean

    return text, found_links


def extract_contact_info(text: str) -> Dict[str, str]:
    """Extract email and phone from text."""
    email = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
    phone = re.search(r'(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}', text)
    return {
        "email": email.group(0) if email else "Not Found",
        "phone": phone.group(0) if phone else "Not Found"
    }


def extract_name(text: str, filename: str, email: str) -> str:
    """
    Extract candidate name with high precision.
    
    Priority:
    1. First line of Resume (High confidence)
    2. Filename (Medium confidence)
    3. Email username (Low confidence)
    """
    # 1. Try First Line of Text (Most accurate for resumes)
    if text:
        first_line = text.strip().split('\n')[0].strip()
        # Clean: remove common headers if coincidentally on first line
        clean_first = re.sub(r'[^a-zA-Z ]', '', first_line)
        if len(clean_first.split()) >= 2 and len(clean_first) < 30:
            # Check against blocklist
            if not any(x in clean_first.lower() for x in ["resume", "curriculum", "bio", "profile", "cv"]):
                logger.info(f"Name extracted from text: {clean_first}")
                return clean_first.title()

    # 2. Try Filename
    clean_name = Path(filename).stem
    # Remove common suffixes like "resume", "cv", "profile"
    for junk in ["resume", "cv", "profile", "updated", "final"]:
        clean_name = re.sub(f"_{junk}", "", clean_name, flags=re.IGNORECASE)
        clean_name = re.sub(f" {junk}", "", clean_name, flags=re.IGNORECASE)
        clean_name = re.sub(f"-{junk}", "", clean_name, flags=re.IGNORECASE)
    
    # Replace separators with spaces
    clean_name = clean_name.replace("_", " ").replace("-", " ")
    # Remove digits
    clean_name = re.sub(r"\d+", "", clean_name)
    
    # Check if it looks like a name (at least 2 words)
    if re.match(r"^[a-zA-Z ]{3,}$", clean_name.strip()):
        return clean_name.strip().title()
        
    # 3. Try Email
    if email and "@" in email:
        username = email.split("@")[0]
        # Remove numbers
        username = re.sub(r"\d+", "", username)
        # Replace dot/underscore with space
        name = username.replace(".", " ").replace("_", " ")
        if len(name) > 2:
            return name.title()
            
    return "Candidate"


def extract_skills_with_llm(text: str) -> List[str]:
    """
    Extract technical skills using Groq LLM for comprehensive detection.
    Replaces brittle Regex matching.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        logger.warning("No GROQ_API_KEY, falling back to basic extraction.")
        return []

    # Truncate text to avoid token limits (Resume text usually fits, but safety first)
    safe_text = text[:6000]

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    prompt = (
        "Extract ALL technical skills, programming languages, frameworks, tools, and platforms "
        "listed in the following resume text. \n"
        "Return ONLY a JSON list of strings (e.g. [\"Python\", \"React\", \"AWS\"]). \n"
        "Do not include soft skills like 'Communication'. \n\n"
        f"RESUME TEXT:\n{safe_text}"
    )
    
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.1,
        "response_format": {"type": "json_object"}
    }
    
    try:
        logger.info(">>> Querying Groq for skills extraction...")
        resp = requests.post(url, headers=headers, json=payload, timeout=10)
        
        if resp.status_code == 200:
            data = resp.json()
            content = data['choices'][0]['message']['content']
            # Parse JSON response
            extracted = json.loads(content)
            
            # Handle various JSON structures (key 'skills' or direct list)
            if isinstance(extracted, list):
                skills = extracted
            elif isinstance(extracted, dict):
                # Try to find the list value
                skills = next((v for v in extracted.values() if isinstance(v, list)), [])
            else:
                skills = []
                
            # Clean and dedupe
            clean_skills = list(set([str(s).strip() for s in skills if len(str(s)) < 30]))
            logger.info(f"LLM Detected {len(clean_skills)} skills: {clean_skills[:5]}...")
            return clean_skills
        else:
            logger.error(f"Groq API Error: {resp.text}")
            return []
            
    except Exception as e:
        logger.error(f"Skill Extraction Failed: {e}")
        return []

# Legacy Regex function removed/replaced



def extract_project_section(text: str) -> List[str]:
    """Extract project descriptions from resume."""
    lines = text.split('\n')
    project_content = []
    capture = False
    
    for line in lines:
        clean = line.strip().upper()
        if any(h in clean for h in SECTION_HEADERS):
            capture = True
            continue
        if capture and any(x in clean for x in ["EDUCATION", "SKILLS", "CERTIFICATIONS"]):
            capture = False
        if capture and line.strip():
            project_content.append(line.strip())
            
    return project_content


def audit_github_deep(url: Optional[str]) -> Dict[str, Any]:
    """Fetch repos and languages from GitHub."""
    if not url or "github.com/" not in url: 
        return {"valid": False, "languages": [], "repos": []}

    try:
        username = url.split("github.com/")[1].split("/")[0]
        api_url = f"https://api.github.com/users/{username}/repos"
        
        logger.info(f"Auditing GitHub for: {username}")
        resp = requests.get(api_url, headers=HEADERS, timeout=5)
        
        if resp.status_code == 200:
            repos = resp.json()
            lang_count = {}
            repo_names = []
            
            for repo in repos:
                lang = repo.get('language')
                if lang: 
                    lang_count[lang] = lang_count.get(lang, 0) + 1
                if repo.get('name'): 
                    repo_names.append(repo.get('name'))
            
            top_langs = sorted(lang_count, key=lang_count.get, reverse=True)
            
            return {
                "valid": True,
                "languages": [l.lower() for l in top_langs],
                "repos": repo_names,
                "public_repo_count": len(repos)
            }
    except Exception as e:
        logger.error(f"GitHub audit error: {e}")
    
    return {"valid": False, "languages": [], "repos": []}


def check_link(url: Optional[str]) -> str:
    """Check if a URL is reachable."""
    if not url: 
        return "Missing"
    try:
        r = requests.head(url, headers=HEADERS, timeout=3)
        return "Active ✅" if r.status_code < 400 else "Broken ❌"
    except:
        return "Unreachable ⚠️"


def validate_resume(pdf_path: str) -> Dict[str, Any]:
    """
    Main validation function.
    
    Args:
        pdf_path: Path to the PDF resume file
        
    Returns:
        Full audit dictionary
    """
    if not os.path.exists(pdf_path):
        return {"error": f"File not found: {pdf_path}"}
    
    logger.info(f"Starting resume validation: {pdf_path}")
    
    # Extract content
    raw_text, links = extract_content_smart(pdf_path)
    contact = extract_contact_info(raw_text)
    
    # Extract Name
    contact["name"] = extract_name(raw_text, pdf_path, contact.get("email", ""))
    
    # [FIX] Use LLM for comprehensive skill extraction
    resume_skills = extract_skills_with_llm(raw_text)
    resume_project_text = extract_project_section(raw_text)
    
    # Deep audit GitHub
    github_data = audit_github_deep(links['github'])
    li_status = check_link(links['linkedin'])
    
    # Verify skills against GitHub
    verified_skills = []
    unverified_skills = []
    
    for skill in resume_skills:
        if skill in github_data['languages']:
            verified_skills.append(skill)
        elif any(skill in r.lower() for r in github_data['repos']):
            verified_skills.append(skill)
        else:
            unverified_skills.append(skill)
    
    # Calculate trust score
    score = 50
    if li_status.startswith("Active"): 
        score += 10
    if github_data['valid']: 
        score += 20
    if len(verified_skills) > 0 and len(resume_skills) > 0:
        score += int((len(verified_skills) / len(resume_skills)) * 20)
    trust_score = min(100, score)
    
    # Build full audit
    full_audit = {
        "summary": {
            "trust_score": f"{trust_score}%",
            "integrity_level": "High" if trust_score > 80 else "Medium" if trust_score > 60 else "Low",
            "validation_status": "Complete"
        },
        "contact_details": contact,
        "external_links_status": {
            "linkedin": {"url": links['linkedin'], "status": li_status},
            "github": {"url": links['github'], "valid": github_data['valid']}
        },
        "github_deep_dive": {
            "total_public_repos": github_data.get('public_repo_count', 0),
            "top_languages_used": github_data.get('languages', []),
            "list_of_repos": github_data.get('repos', [])
        },
        "resume_claims": {
            "total_skills_detected": len(resume_skills),
            "skills_list": resume_skills,
            "projects_extracted_text": resume_project_text[:5]  # Limit to 5
        },
        "verification_breakdown": {
            "verified_skills": verified_skills,
            "unverified_skills": unverified_skills
        }
    }
    
    logger.info(f"Validation complete. Trust score: {trust_score}%")
    return full_audit


def save_audit(audit: Dict[str, Any], output_path: str) -> str:
    """Save audit to JSON file."""
    with open(output_path, "w") as f:
        json.dump(audit, f, indent=4)
    return output_path
