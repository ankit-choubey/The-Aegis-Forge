# 🎯 Skill Selection Feature - Frontend Integration Guide

> **For: Devraj**  
> **Date: January 31, 2026**  
> **Backend Status: Ready after this update**

---

## Overview

This guide explains how to integrate the **Skill Selection Feature** into your frontend. After showing the resume report, you'll let the recruiter select which skills/topics to focus on during the interview.

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEVRAJ'S FRONTEND                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Upload Resume                                               │
│     └── POST /api/upload-resume                                 │
│         └── Returns: candidate_id, audit report, skills list   │
│                                                                 │
│  2. Show Report + Skill Selection UI                            │
│     └── Display detected skills from audit                     │
│     └── Let recruiter SELECT skills to focus on                │
│                                                                 │
│  3. Start Interview (with selected skills)                      │
│     └── POST /api/set-focus-topics  ← NEW STEP                 │
│     └── POST /api/start-interview                              │
│         └── Returns: room_name, token                          │
│                                                                 │
│  4. Join LiveKit Room                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### Base URL
```
Production: https://your-ngrok-url.ngrok.io
Local: http://localhost:8000
```

---

### 1️⃣ Upload Resume (Already Working)

```http
POST /api/upload-resume
Content-Type: multipart/form-data
```

**Request:**
- `file`: PDF file (multipart)

**Response:**
```json
{
  "candidate_id": "849d3dd9",
  "status": "validated",
  "detected_field": "Backend Engineering",
  "scenario": "backend",
  "audit": {
    "overall_judgement": "STRONG_HIRE",
    "verification_breakdown": {
      "skills_detected": {
        "total_skills_detected": 12,
        "skills_list": ["Python", "JavaScript", "Docker", "AWS", "PostgreSQL", ...],
        "verified_skills": ["Python", "JavaScript", "Docker"],
        "unverified_skills": ["AWS", "PostgreSQL"]
      }
    }
  }
}
```

**💡 Key Data to Extract:**
- `candidate_id` → Save this for next steps
- `audit.verification_breakdown.skills_detected.skills_list` → Show these in UI for selection

---

### 2️⃣ Set Focus Topics (NEW - Call Before Starting Interview)

```http
POST /api/set-focus-topics
Content-Type: application/json
```

**Request Body:**
```json
{
  "candidate_id": "849d3dd9",
  "focus_topics": ["Python", "Docker", "System Design"]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Focus topics saved for candidate 849d3dd9",
  "topics": ["Python", "Docker", "System Design"]
}
```

**⚠️ Important:**
- Call this BEFORE `/api/start-interview`
- Maximum 5 topics recommended (agent will prioritize these)
- Topics should match skills from the audit report

---

### 3️⃣ Start Interview (Already Working)

```http
POST /api/start-interview
Content-Type: application/json
```

**Request Body:**
```json
{
  "candidate_id": "849d3dd9",
  "room_name": null
}
```

**Response:**
```json
{
  "room_name": "aegis-interview-849d3dd9",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "join_url": "wss://your-livekit-server.com"
}
```

---

## Frontend Implementation Guide

### Step 1: After Resume Upload - Show Report

```jsx
// After successful upload, you have the audit data
const auditData = response.audit;

// Extract skills for selection UI
const allSkills = auditData.verification_breakdown.skills_detected.skills_list;
const verifiedSkills = auditData.verification_breakdown.skills_detected.verified_skills;
```

### Step 2: Create Skill Selection UI

```jsx
function SkillSelector({ skills, verifiedSkills, onStartInterview }) {
  const [selectedSkills, setSelectedSkills] = useState([]);

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  return (
    <div>
      <h3>Select Skills to Focus On (Max 5)</h3>
      <div className="skill-grid">
        {skills.map(skill => (
          <button
            key={skill}
            onClick={() => toggleSkill(skill)}
            className={`skill-chip ${selectedSkills.includes(skill) ? 'selected' : ''} 
                       ${verifiedSkills.includes(skill) ? 'verified' : ''}`}
          >
            {skill}
            {verifiedSkills.includes(skill) && <span>✓ GitHub Verified</span>}
          </button>
        ))}
      </div>
      
      <button 
        onClick={() => onStartInterview(selectedSkills)}
        disabled={selectedSkills.length === 0}
      >
        Start Interview ({selectedSkills.length} topics selected)
      </button>
    </div>
  );
}
```

### Step 3: Handle Start Interview Click

```javascript
async function handleStartInterview(candidateId, selectedSkills) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Step 1: Set focus topics
  const focusResponse = await fetch(`${BASE_URL}/api/set-focus-topics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      candidate_id: candidateId,
      focus_topics: selectedSkills
    })
  });

  if (!focusResponse.ok) {
    throw new Error('Failed to set focus topics');
  }

  // Step 2: Start interview
  const interviewResponse = await fetch(`${BASE_URL}/api/start-interview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      candidate_id: candidateId
    })
  });

  const data = await interviewResponse.json();
  
  // Step 3: Use the token to connect to LiveKit
  return {
    roomName: data.room_name,
    token: data.token,
    joinUrl: data.join_url
  };
}
```

---

## What Happens Behind the Scenes

1. **You call `/api/set-focus-topics`**
   - Backend saves to `uploads/focus_config.json`

2. **You call `/api/start-interview`**
   - Backend loads the focus topics
   - Knowledge Engine stores them in `candidate_context`

3. **Interview starts**
   - AI Interviewer reads the focus topics
   - System prompt includes: *"[RECRUITER PRIORITY]: Deep dive on Python, Docker, System Design. Ask at least 2 challenging questions about these topics."*

---

## Error Handling

```javascript
// Handle errors gracefully
try {
  await handleStartInterview(candidateId, selectedSkills);
} catch (error) {
  if (error.message.includes('focus topics')) {
    // Show: "Failed to save skill preferences. Starting with default interview."
  }
}
```

---

## Testing Checklist

- [ ] Upload resume and verify `skills_list` is returned
- [ ] Show skill selection UI after report
- [ ] Select 2-3 skills and click Start Interview
- [ ] Verify both API calls succeed
- [ ] Join interview and check if agent asks about selected skills

---

## Questions?

Contact Utkarsh if you have any issues with the backend API.

---

**Backend Status: 🟢 Ready after next commit**
