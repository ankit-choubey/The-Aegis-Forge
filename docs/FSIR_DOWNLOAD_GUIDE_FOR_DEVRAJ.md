# 📄 FSIR Report Download - Integration Guide for Devraj

> **Date:** January 31, 2026  
> **Status:** ✅ Backend Ready - No Changes Needed  
> **For:** Devraj (Frontend Implementation)

---

## 🎉 Good News: The Backend Already Exists!

The FSIR (First-Round Screening Intelligence Report) PDF download feature is **fully implemented** on the backend. Here's what you need to know.

---

## How It Works

### After Interview Ends:

```
┌──────────────────────────────────────────────────────────┐
│                 BACKEND (Utkarsh's Side)                 │
│                                                          │
│  Interview Ends → cleanup() function triggers:           │
│                                                          │
│  1. Generate DQI Report (Decision Quality Index)         │
│  2. Create FSIR Pydantic Object                          │
│  3. Save: fsir_{session_id}.json                         │
│  4. Generate PDF: fsir_{session_id}.pdf                  │
│  5. Send: INTERVIEW_END signal to frontend               │
│                                                          │
└──────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│               FRONTEND (Devraj's Side)                   │
│                                                          │
│  1. Listen for INTERVIEW_END event                       │
│  2. Show "Download Report" button                        │
│  3. Button calls: GET /download-report/{candidate_id}    │
│  4. Browser downloads PDF automatically                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## API Endpoint (Already Exists)

### `GET /download-report/{candidate_id}`

| Property | Value |
|----------|-------|
| **URL** | `/download-report/{candidate_id}` |
| **Method** | GET |
| **Response** | PDF file (application/pdf) |
| **Headers** | Content-Disposition: attachment; filename=Aegis_Report_{id}.pdf |

**Example:**
```
GET http://localhost:8000/download-report/849d3dd9
```

Returns: `Aegis_Report_849d3dd9.pdf` (auto-download)

---

## Frontend Implementation

### Option 1: Simple Download Button (Easiest)

```jsx
function DownloadReportButton({ candidateId }) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  const handleDownload = () => {
    // Opens in new tab and triggers download
    window.open(`${BASE_URL}/download-report/${candidateId}`, '_blank');
  };

  return (
    <button onClick={handleDownload} className="download-btn">
      📄 Download FSIR Report
    </button>
  );
}
```

### Option 2: Using Anchor Tag (Best Practice)

```jsx
function DownloadReportLink({ candidateId }) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  return (
    <a 
      href={`${BASE_URL}/download-report/${candidateId}`}
      download={`Aegis_Report_${candidateId}.pdf`}
      className="download-link"
    >
      📄 Download FSIR Report
    </a>
  );
}
```

### Option 3: Fetch with Progress (Advanced)

```javascript
async function downloadReport(candidateId) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  try {
    const response = await fetch(`${BASE_URL}/download-report/${candidateId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Report not found. Interview may still be processing.');
      }
      throw new Error('Failed to download report');
    }
    
    // Get the blob
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aegis_Report_${candidateId}.pdf`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return { success: true };
  } catch (error) {
    console.error('Download failed:', error);
    return { success: false, error: error.message };
  }
}
```

---

## Listening for Interview End

When the interview ends, the backend sends a data packet via LiveKit:

```javascript
// In your LiveKit room component
useEffect(() => {
  if (!room) return;

  const handleDataReceived = (packet) => {
    try {
      const data = JSON.parse(new TextDecoder().decode(packet.payload));
      
      if (data.type === 'INTERVIEW_END') {
        console.log('Interview ended:', data.reason);
        // Show download button
        setShowDownloadButton(true);
        setInterviewEnded(true);
      }
    } catch (e) {
      console.error('Failed to parse data packet:', e);
    }
  };

  room.on('dataReceived', handleDataReceived);
  return () => room.off('dataReceived', handleDataReceived);
}, [room]);
```

---

## Complete Component Example

```jsx
import { useState, useEffect } from 'react';

function InterviewReportDownload({ candidateId, room }) {
  const [showButton, setShowButton] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Listen for INTERVIEW_END event
  useEffect(() => {
    if (!room) return;

    const handleData = (packet) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(packet.payload));
        if (data.type === 'INTERVIEW_END') {
          // Small delay to ensure backend finishes generating report
          setTimeout(() => setShowButton(true), 2000);
        }
      } catch (e) {}
    };

    room.on('dataReceived', handleData);
    return () => room.off('dataReceived', handleData);
  }, [room]);

  const handleDownload = async () => {
    setDownloading(true);
    
    try {
      const response = await fetch(`${BASE_URL}/download-report/${candidateId}`);
      
      if (!response.ok) {
        alert('Report is still being generated. Please try again in a few seconds.');
        return;
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Aegis_Report_${candidateId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  if (!showButton) return null;

  return (
    <div className="report-download-container">
      <div className="interview-ended-message">
        ✅ Interview Complete
      </div>
      
      <button 
        onClick={handleDownload}
        disabled={downloading}
        className="download-report-btn"
      >
        {downloading ? (
          <>⏳ Downloading...</>
        ) : (
          <>📄 Download FSIR Report</>
        )}
      </button>
    </div>
  );
}

export default InterviewReportDownload;
```

---

## Data Flow Summary

```
1. Interview ends (user says goodbye OR 40-min timeout)
        │
        ▼
2. Backend cleanup() runs:
   - Generates DQI scores
   - Creates FSIR report (JSON + PDF)
   - Saves: fsir_{session_id}.json, fsir_{session_id}.pdf
   - Sends INTERVIEW_END signal
        │
        ▼
3. Frontend receives INTERVIEW_END
        │
        ▼
4. Frontend shows "Download Report" button
        │
        ▼
5. User clicks button
        │
        ▼
6. GET /download-report/{candidate_id}
        │
        ▼
7. Backend generates PDF on-the-fly OR serves cached PDF
        │
        ▼
8. Browser downloads: Aegis_Report_{candidate_id}.pdf
```

---

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| 404 Not Found | Candidate ID not in system | Ensure correct candidate_id from upload |
| 500 Server Error | PDF generation failed | Check backend logs, retry |
| Timeout | Large report | Add loading indicator, increase timeout |

---

## Testing

### Using curl:
```bash
# Test download
curl -O http://localhost:8000/download-report/849d3dd9

# Verify candidate exists
curl http://localhost:8000/candidate/849d3dd9
```

### Using Ngrok (for remote testing):
```bash
curl -O https://your-ngrok-url.ngrok.io/download-report/849d3dd9
```

---

## Files Generated by Backend

After each interview, these files are created in the project root:

```
/Users/utkarshsingh/agents/
├── fsir_AJ_3uDr23UUyfsj.json    # Raw FSIR data
├── fsir_AJ_3uDr23UUyfsj.pdf     # PDF report (downloadable)
├── questions_AJ_3uDr23UUyfsj.json  # Questions log
└── uploads/
    └── 849d3dd9_audit.json      # Candidate audit data
```

---

## Summary for Devraj

| Task | Status |
|------|--------|
| Backend endpoint | ✅ Already exists |
| PDF generation | ✅ Already works |
| INTERVIEW_END signal | ✅ Already sent |
| Frontend download button | ❌ **You need to add this** |
| Listen for end event | ❌ **You need to add this** |

**You only need to implement the frontend pieces shown above!**
