# Social Integrity Integration Guide

This guide explains how to integrate the new **Social Verification Module** into the Frontend and Backend.

## 1. Backend Implementation (For Python Dev)

The file `app/analysis/social_verifier.py` has been created. To activate it:

### Step A: Update Pipeline
In `app/analysis/pipeline.py`, inside `generate_detailed_report`:

```python
from app.analysis.social_verifier import SocialVerifier

# ... inside generation logic ...
verifier = SocialVerifier()
links = verifier.extract_links(resume_text_content)
social_report = await verifier.verify_integrity(resume_text_content, links)

# Inject into Integrity Object
integrity_signals.social_data = social_report
```

### Step B: Update JSON Structure
Ensure the FSIR JSON response includes the new field:

```json
"integrity_signals": {
  "confidence_score": "90%",
  "signals_observed": ["Mole Agent attempted baiting."],
  "social_verification": {
      "consistency_score": 100,
      "verified_links": ["LinkedIn", "GitHub"],
      "signals": ["✅ LinkedIn Profile Found"]
  }
}
```

---

## 2. Frontend Integration (For Devraj/Frontend Friend)

The Frontend needs to display the **Social Consistency** score inside the Integrity Box (Purple Box).

### UI Design Reference
-   **Location:** Below "Integrity Confidence".
-   **Visual:** progress bar or Green/Red text.

### Implementation Steps (React/Next.js)

1.  **Parse the Signal:**
    Read `report.integrity_signals.social_verification`.

2.  **Display Logic:**

    ```tsx
    const SocialIntegrity = ({ data }) => {
      const { consistency_score, verified_links } = data.social_verification;
      
      return (
        <div className="mt-4 p-3 bg-white/10 rounded-lg">
          <h4 className="text-sm font-bold text-indigo-300">Social Footprint</h4>
          
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs">Consistency:</span>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
               <div 
                 className={`h-full ${consistency_score > 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                 style={{ width: `${consistency_score}%` }} 
               />
            </div>
            <span className="text-xs font-mono">{consistency_score}%</span>
          </div>

          <div className="flex gap-2 mt-2">
            {verified_links.includes("LinkedIn") && <Badge icon="linkedin" color="blue" />}
            {verified_links.includes("GitHub") && <Badge icon="github" color="gray" />}
          </div>
        </div>
      );
    }
    ```

3.  **Verification Mode:**
    If `consistency_score < 50%`, show a warning: *"⚠️ Resume details diverge from public profile."*

---

## Checklist
- [ ] Backend: Wire up `SocialVerifier` in pipeline.
- [ ] Frontend: Add `SocialIntegrity` component to Report View.
