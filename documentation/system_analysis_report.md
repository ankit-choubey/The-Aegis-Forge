# Aegis Forge: System Analysis & Diagnostics Report

## 1. System connectivity & Agent Health
- **Main Entry Point (`app/main.py`)**: Correctly initializes and connects all core agents.
- **Agents Check**:
    - `IncidentLead` (Hiring Manager): **CONNECTED**. Receives resume context and market intel.
    - `PressureAgent` (Stakeholder): **CONNECTED**. Runs in background loop.
    - `ObserverAgent` (Evaluator): **CONNECTED**. Wired to transcript events.
    - `CrisisPopupAgent`: **CONNECTED**. Correctly instantiated.
    - `MoleAgent`: **CONNECTED**.
- **Data Flow**: Frontend -> LiveKit Room -> Main Dispatch -> Agents -> Knowledge Engine -> LLM -> Response.

## 2. Resume Ingestion Flow
1.  **Input**: User Uploads PDF or `audit:` metadata is passed.
2.  **Processing**: `backend.funnel.pipeline.knowledge_engine.process_candidate_pdf(path)` is called.
3.  **Extraction**: `validate_resume` extracts skills, projects, and contact info.
4.  **Storage**: Saves `*_audit.json` in `uploads/`.
5.  **Context**: Loaded into `knowledge_engine.candidate_context`.
6.  **Usage**: `IncidentLead` fetches this to personalize the opening ("I have reviewed your resume...") and projects.

## 3. Dynamic Knowledge Base & Rubrics
- **Mechanism**: `backend/funnel/pipeline.py` serves as the central brain.
- **Rubrics**: `FIELD_MARKET_INTEL` dictionary maps domains (e.g., "ai_ml", "backend") to specific coding standards and anti-patterns.
- **Dynamic Feed**: The `_fetch_market_data` method uses Groq (Llama 3) to generate real-time "CODING INTEL" based on the candidate's specific skills.
- **Integration**: This intel is injected directly into the `IncidentLead` system prompt under the `MARKET INTEL` section.

## 4. Crisis Control Analysis
- **Mechanism**: `CrisisPopupAgent` runs a background timer.
- **Timing Issue (FIXED)**: Original code had a 3-minute delay. **Changed to 1 minute (60s)** as per requirement.
- **Injection**:
    1.  Generates a domain-specific crisis question (e.g., "Database Lock").
    2.  Sends `CRISIS_POPUP` event to Frontend.
    3.  Injects a high-priority system prompt into `IncidentLead` to force an immediate pivot.
    4.  Forces immediate voice interruption via `session.say()`.

## 5. DQI Score (Zero Score Issue)
- **Diagnosis**: The `ObserverAgent` was likely failing to generate valid JSON logs due to:
    1.  LLM Model Failures (Rate limits or model errors on Mixtral).
    2.  JSON Parsing Errors (LLM returning Markdown or partial text).
    3.  Silent failures in the async evaluation loop.
- **Fix Applied**:
    -   Added robust `try/except` blocks in `ObserverAgent._evaluate_turn`.
    -   Added raw log storage even if JSON parsing fails (to allow post-mortem analysis).
    -   Improved JSON extraction logic to handle Markdown wrapping.
    -   Added explicit error logging to `dqi_calculator` ingestion.
- **Result**: Even if the LLM output is imperfect, the system will now attempt to salvage the score rather than defaulting to 0.

## 6. Final Reporting
- **Sequence**:
    1.  `ObserverAgent` finalizes evaluations.
    2.  `dqi_calculator` computes score.
    3.  `pipeline.InterviewPipeline` generates the FSIR JSON structure.
    4.  `PDFReportGenerator` converts JSON to PDF.
    5.  Files saved: `fsir_{session_id}.json`, `fsir_{session_id}.pdf`.
- **Status**: Logic matches the requirements.

## 7. Verification Steps
1.  Start a new interview session.
2.  Wait 60 seconds to confirm Crisis Popup triggers.
3.  Confirm `ObserverAgent` logs appear in the console ("Observer Evaluated: ...").
4.  End interview (or wait for timeout).
5.  Check output folder for non-zero DQI in `fsir_*.json`.
