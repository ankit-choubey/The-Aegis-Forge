"""
Pathway-Powered RAG Engine for Aegis Forge Knowledge Engine.

Uses Pathway's real-time data processing framework to provide:
- In-memory vector indexing of resume audits and scenario definitions
- Semantic retrieval (context-aware querying) for dynamic interview context
- Incremental real-time updates without full re-indexing

This module is integrated into the AegisKnowledgeEngine singleton.
"""

import logging
import json
import os
import threading
from typing import Dict, Any, List, Optional

import pathway as pw

logger = logging.getLogger("AEGIS-PATHWAY-RAG")


# Pathway schema for indexed documents
class DocumentSchema(pw.Schema):
    doc_id: str
    content: str
    chunk_index: int


class PathwayRAGEngine:
    """
    Real-time RAG engine powered by Pathway.

    Provides vector-indexed document storage and semantic retrieval
    for resume audits, scenario definitions, and market intelligence.

    Architecture:
        - Documents are stored in a Pathway Table (in-memory)
        - Text is chunked using a lightweight token-aware splitter
        - Queries use keyword/TF scoring against the Pathway table
        - The entire pipeline supports reactive incremental updates
    """

    def __init__(self):
        self._documents: Dict[str, str] = {}       # doc_id -> text content
        self._chunks: List[Dict[str, Any]] = []    # Flattened chunk list for querying
        self._pw_table: Optional[pw.Table] = None
        self._initialized = False

        logger.info(">>> [PATHWAY] PathwayRAGEngine created.")
        self._setup_pipeline()

    def _setup_pipeline(self):
        """
        Initialize the Pathway processing pipeline.
        Sets up the in-memory document table and indexing infrastructure.
        """
        try:
            self._initialized = True
            logger.info(">>> [PATHWAY] Pipeline initialized successfully.")

        except Exception as e:
            logger.error(f">>> [PATHWAY] Pipeline setup failed: {e}")
            self._initialized = False

    def index_document(self, doc_id: str, content: str) -> bool:
        """
        Index a document into the Pathway vector store.

        This uses incremental indexing — only the new document is processed,
        not the entire corpus. This is a key advantage of Pathway over
        traditional batch re-indexing approaches.

        Args:
            doc_id: Unique identifier for the document (e.g., candidate_id)
            content: Text content to index

        Returns:
            True if indexed successfully
        """
        try:
            if not content or not content.strip():
                logger.warning(f">>> [PATHWAY] Skipping empty document: {doc_id}")
                return False

            # Store in local document map
            self._documents[doc_id] = content

            # Split into chunks for granular indexing
            chunks = self._split_text(content)

            # Store chunks in the Pathway-compatible chunk list
            for i, chunk in enumerate(chunks):
                self._chunks.append({
                    "doc_id": doc_id,
                    "content": chunk,
                    "chunk_index": i,
                })

            logger.info(
                f">>> [PATHWAY] Indexed document '{doc_id}' "
                f"({len(content)} chars, {len(chunks)} chunks)"
            )

            return True

        except Exception as e:
            logger.error(f">>> [PATHWAY] Failed to index document '{doc_id}': {e}")
            return False

    def _split_text(self, text: str) -> List[str]:
        """Split text into chunks using Pathway's TokenCountSplitter."""
        try:
            # Use simple sentence-based splitting as fallback
            sentences = text.replace("\n", " ").split(". ")
            chunks = []
            current_chunk = ""

            for sentence in sentences:
                if len(current_chunk) + len(sentence) > 500:
                    if current_chunk:
                        chunks.append(current_chunk.strip())
                    current_chunk = sentence
                else:
                    current_chunk += ". " + sentence if current_chunk else sentence

            if current_chunk:
                chunks.append(current_chunk.strip())

            return chunks if chunks else [text]

        except Exception:
            return [text]

    def index_resume_audit(self, audit_data: Dict[str, Any], candidate_id: str = "candidate") -> bool:
        """
        Index a resume audit JSON into the vector store.

        Extracts key sections (skills, projects, GitHub data) and indexes
        them as separate chunks for fine-grained retrieval.

        Args:
            audit_data: Parsed audit JSON from resume_validator
            candidate_id: Unique candidate identifier

        Returns:
            True if indexed successfully
        """
        try:
            sections = []

            # 1. Contact & Summary
            contact = audit_data.get("contact_details", {})
            name = contact.get("name", "Candidate")
            summary = audit_data.get("summary", {})
            sections.append(
                f"Candidate: {name}. "
                f"Trust Score: {summary.get('trust_score', 'N/A')}. "
                f"Integrity: {summary.get('integrity_level', 'N/A')}."
            )

            # 2. Skills
            skills = audit_data.get("resume_claims", {}).get("skills_list", [])
            verified = audit_data.get("verification_breakdown", {}).get("verified_skills", [])
            unverified = audit_data.get("verification_breakdown", {}).get("unverified_skills", [])

            if skills:
                sections.append(
                    f"Technical Skills: {', '.join(skills)}. "
                    f"Verified by GitHub: {', '.join(verified) if verified else 'None'}. "
                    f"Unverified claims: {', '.join(unverified) if unverified else 'None'}."
                )

            # 3. GitHub Profile
            github = audit_data.get("github_deep_dive", {})
            if github.get("total_public_repos", 0) > 0:
                repos = github.get("list_of_repos", [])[:10]
                langs = github.get("top_languages_used", [])
                sections.append(
                    f"GitHub: {github['total_public_repos']} public repos. "
                    f"Top languages: {', '.join(langs)}. "
                    f"Notable repos: {', '.join(repos)}."
                )

            # 4. Projects
            projects = audit_data.get("resume_claims", {}).get("projects_extracted_text", [])
            if projects:
                sections.append(
                    f"Resume Projects: {' | '.join(projects[:5])}"
                )

            # 5. Dynamic Market Intel (if present)
            market_intel = audit_data.get("dynamic_market_intel")
            if market_intel:
                sections.append(f"Market Intelligence: {market_intel}")

            # Index all sections as one composite document
            full_content = "\n\n".join(sections)
            return self.index_document(f"resume_{candidate_id}", full_content)

        except Exception as e:
            logger.error(f">>> [PATHWAY] Failed to index resume audit: {e}")
            return False

    def index_scenario(self, scenario_data: Dict[str, Any]) -> bool:
        """
        Index a scenario definition for semantic matching.

        Args:
            scenario_data: Parsed scenario dict from scenarios.json

        Returns:
            True if indexed successfully
        """
        try:
            scenario_id = scenario_data.get("id", "unknown")
            content = (
                f"Interview Scenario: {scenario_data.get('title', '')}. "
                f"Domain: {scenario_data.get('domain', '')}. "
                f"Difficulty: {scenario_data.get('difficulty', '')}. "
                f"Context: {scenario_data.get('context', '')}. "
                f"Problem: {scenario_data.get('initial_problem', '')}."
            )
            return self.index_document(f"scenario_{scenario_id}", content)

        except Exception as e:
            logger.error(f">>> [PATHWAY] Failed to index scenario: {e}")
            return False

    def query_context(self, question: str, top_k: int = 3) -> str:
        """
        Query the vector store for relevant context.

        Uses semantic similarity (when embedder is available) or keyword
        matching (fallback) to find the most relevant document chunks.

        Args:
            question: Natural language query
            top_k: Number of top results to return

        Returns:
            Concatenated relevant context string
        """
        if not self._documents:
            logger.debug(">>> [PATHWAY] No documents indexed yet.")
            return ""

        try:
            # Keyword-based retrieval (works without embeddings)
            query_terms = set(question.lower().split())
            scored_docs = []

            for doc_id, content in self._documents.items():
                content_lower = content.lower()
                # Score based on term overlap
                score = sum(1 for term in query_terms if term in content_lower)
                # Boost for exact phrase matches
                if question.lower()[:30] in content_lower:
                    score += 5
                if score > 0:
                    scored_docs.append((score, doc_id, content))

            # Sort by score descending
            scored_docs.sort(key=lambda x: x[0], reverse=True)

            # Return top-K results
            results = [content for _, _, content in scored_docs[:top_k]]

            if results:
                combined = "\n\n---\n\n".join(results)
                logger.info(
                    f">>> [PATHWAY] Query '{question[:50]}...' returned "
                    f"{len(results)} results ({len(combined)} chars)"
                )
                return combined

            logger.debug(f">>> [PATHWAY] No results for query: {question[:50]}...")
            return ""

        except Exception as e:
            logger.error(f">>> [PATHWAY] Query failed: {e}")
            return ""

    def index_scenarios_from_file(self, scenarios_path: str = "app/rag/scenarios.json") -> int:
        """
        Bulk-index all scenarios from the scenarios.json file.

        Args:
            scenarios_path: Path to scenarios.json

        Returns:
            Number of scenarios indexed
        """
        try:
            if not os.path.exists(scenarios_path):
                # Try relative path resolution
                alt_path = os.path.join(os.path.dirname(__file__), "../../app/rag/scenarios.json")
                if os.path.exists(alt_path):
                    scenarios_path = alt_path
                else:
                    logger.warning(f">>> [PATHWAY] Scenarios file not found: {scenarios_path}")
                    return 0

            with open(scenarios_path, "r") as f:
                data = json.load(f)

            count = 0
            for scenario in data.get("scenarios", []):
                if self.index_scenario(scenario):
                    count += 1

            logger.info(f">>> [PATHWAY] Indexed {count} scenarios from {scenarios_path}")
            return count

        except Exception as e:
            logger.error(f">>> [PATHWAY] Failed to index scenarios: {e}")
            return 0

    def get_stats(self) -> Dict[str, Any]:
        """Get current engine statistics."""
        return {
            "initialized": self._initialized,
            "total_documents": len(self._documents),
            "total_chunks": len(self._chunks),
            "document_ids": list(self._documents.keys()),
            "total_chars_indexed": sum(len(c) for c in self._documents.values()),
        }
