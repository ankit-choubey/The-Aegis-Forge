# 🔧 Backend Code Changes - Skill Selection Feature

> **Date:** January 31, 2026  
> **Author:** Utkarsh  
> **For:** Devraj (Frontend Integration)

---

## Summary

Added the `/api/set-focus-topics` endpoint to allow the frontend to send selected skills before starting an interview. The AI interviewer will prioritize questions on these topics.

---

## Files Modified

### 1. `backend/main.py`

#### Change 1: Added Pydantic Model (Line 59-61)

```python
class FocusTopicsRequest(BaseModel):
    candidate_id: str
    focus_topics: List[str]
```

#### Change 2: Added New Endpoint (Lines 217-264)

```python
@app.post("/api/set-focus-topics")
async def set_focus_topics(request: FocusTopicsRequest):
    """
    Set recruiter-selected focus topics for the interview.
    Call this BEFORE /start-interview to prioritize specific skills.
    """
    import json
    
    # Limit to 5 topics for best results
    topics = request.focus_topics[:5] if len(request.focus_topics) > 5 else request.focus_topics
    
    # Save to focus_config.json
    config = {
        "candidate_id": request.candidate_id,
        "focus_topics": topics
    }
    
    config_path = UPLOADS_DIR / "focus_config.json"
    with open(config_path, "w") as f:
        json.dump(config, f, indent=2)
    
    # Trigger Knowledge Engine reload
    knowledge_engine.load_focus_topics()
    
    return {
        "status": "success",
        "message": f"Focus topics saved for candidate {request.candidate_id}",
        "topics": topics
    }
```

---

## Existing Supporting Code (No Changes Needed)

### `backend/funnel/pipeline.py` - Knowledge Engine

Already has `load_focus_topics()` method that reads from `uploads/focus_config.json`:

```python
def load_focus_topics(self) -> list:
    """Loads recruiter-selected focus topics from uploads/focus_config.json"""
    config_path = "uploads/focus_config.json"
    if os.path.exists(config_path):
        with open(config_path, "r") as f:
            data = json.load(f)
            topics = data.get("focus_topics", [])
            self.candidate_context["focus_topics"] = topics
            return topics
    return []
```

### `app/agents/incident_lead.py` - AI Interviewer

Already reads focus topics and injects priority instruction:

```python
focus_topics_list = knowledge_engine.candidate_context.get('focus_topics', [])
if focus_topics_list:
    focus_msg = ", ".join(focus_topics_list)
    focus_instruction = f"\n[RECRUITER PRIORITY]: Deep dive on: {focus_msg}. Ask at least 2 challenging questions about these topics.\n"
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Devraj)                          │
│                                                                 │
│  1. POST /api/set-focus-topics                                  │
│     Body: {"candidate_id": "abc", "focus_topics": ["Python"]}   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (main.py)                            │
│                                                                 │
│  2. Saves to: uploads/focus_config.json                         │
│  3. Calls: knowledge_engine.load_focus_topics()                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              KNOWLEDGE ENGINE (pipeline.py)                     │
│                                                                 │
│  4. Reads focus_config.json                                     │
│  5. Stores in: candidate_context["focus_topics"]                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              AI INTERVIEWER (incident_lead.py)                  │
│                                                                 │
│  6. Reads: knowledge_engine.candidate_context["focus_topics"]   │
│  7. Injects: "[RECRUITER PRIORITY]: Deep dive on Python..."     │
│  8. Agent asks 2+ challenging questions on selected topics      │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Endpoint Details

### `POST /api/set-focus-topics`

| Property | Value |
|----------|-------|
| **URL** | `/api/set-focus-topics` |
| **Method** | POST |
| **Content-Type** | application/json |

**Request Body:**
```json
{
  "candidate_id": "849d3dd9",
  "focus_topics": ["Python", "Docker", "System Design"]
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Focus topics saved for candidate 849d3dd9",
  "topics": ["Python", "Docker", "System Design"]
}
```

**Error Response (500):**
```json
{
  "detail": "Failed to save focus topics: <error message>"
}
```

---

## File Created by Endpoint

**Path:** `uploads/focus_config.json`

**Contents:**
```json
{
  "candidate_id": "849d3dd9",
  "focus_topics": [
    "Python",
    "Docker",
    "System Design"
  ]
}
```

---

## Testing Commands

```bash
# Test the endpoint
curl -X POST http://localhost:8000/api/set-focus-topics \
  -H "Content-Type: application/json" \
  -d '{"candidate_id": "test123", "focus_topics": ["Python", "Docker", "AWS"]}'

# Verify file was created
cat uploads/focus_config.json

# Check backend health
curl http://localhost:8000/
```

---

## Frontend Integration Order

1. **Upload Resume** → `POST /upload-resume`
2. **Show Report** → Display skills from `audit.verification_breakdown.skills_detected.skills_list`
3. **User selects skills** → Store in state
4. **Set Focus Topics** → `POST /api/set-focus-topics` ← NEW
5. **Start Interview** → `POST /start-interview`
6. **Join LiveKit Room** → Use returned token

---

## Notes

- Maximum 5 topics recommended (backend auto-limits)
- Topics should match skills from the audit report
- Call `/api/set-focus-topics` BEFORE `/start-interview`
- The agent will ask at least 2 challenging questions on selected topics
