# Feature Guide: Dynamic Role Selection (Domain Dropdown)

**Goal:** Allow the candidate to select their specific domain (e.g., AI/ML, DevOps) after uploading their resume, instead of relying solely on auto-detection.

## 1. The Workflow
1.  **User uploads resume** (`POST /upload-resume`) -> Returns `candidate_id` and `detected_field`.
2.  **Frontend shows Dropdown** pre-filled with `detected_field`.
3.  **User changes selection** (e.g., switches from "Backend" to "AI/ML").
4.  **Frontend calls API** (`POST /api/set-candidate-role`) to update the system.
5.  **Start Interview** (`POST /start-interview`).

## 2. New Backend Endpoint

**Endpoint:** `POST /api/set-candidate-role`

**Payload:**
```json
{
  "candidate_id": "a1b2c3d4",
  "role": "AI/ML" 
}
```

**Supported Roles (Mapped to Scenarios):**
-   `AI/ML` (Scenario: ai-model-drift)
-   `DevOps` (Scenario: devops-redis-latency)
-   `Cybersecurity` (Scenario: security-breach)
-   `Blockchain` (Scenario: smart-contract-exploit)
-   `Backend` (Scenario: backend-api-outage)

## 3. Frontend Implementation Example (React)

```tsx
export default function InterviewSetup() {
  const [candidateId, setCandidateId] = useState(null);
  const [selectedRole, setSelectedRole] = useState("Backend");

  // Step 1: Upload Resume
  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const res = await fetch("http://localhost:8000/upload-resume", {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    setCandidateId(data.candidate_id);
    setSelectedRole(data.detected_field); // Pre-fill with auto-detected
  };

  // Step 2: Update Role (When user changes dropdown)
  const handleRoleChange = async (role) => {
    setSelectedRole(role);
    
    // Call the new API to update context on backend
    await fetch("http://localhost:8000/api/set-candidate-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidate_id: candidateId,
        role: role
      })
    });
    console.log("Role updated to:", role);
  };

  return (
    <div>
      {/* Upload Component */}
      {!candidateId && <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />}

      {/* Role Selection (appears after upload) */}
      {candidateId && (
        <select value={selectedRole} onChange={(e) => handleRoleChange(e.target.value)}>
          <option value="AI/ML">AI/ML Engineer</option>
          <option value="DevOps">DevOps / SRE</option>
          <option value="Backend">Backend Engineer</option>
          <option value="Cybersecurity">Security Engineer</option>
          <option value="Blockchain">Blockchain Developer</option>
        </select>
      )}
      
      {/* Start Button */}
      <button onClick={startInterview}>Start Interview</button>
    </div>
  );
}
```
