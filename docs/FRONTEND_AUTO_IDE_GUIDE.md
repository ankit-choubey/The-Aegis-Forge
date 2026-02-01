# Auto-IDE Injection Integration Guide

**Feature:** When the AI Agent (or Crisis System) asks a coding question, the code snippet is automatically "pushed" to the user's Code Editor (Notepad).

## 1. Data Channel Protocol
The backend broadcasts a JSON message over the LiveKit Data Channel.

**Event Name:** `CODE_SNAPSHOT`
**Reliability:** `True` (Reliable)

### Payload Structure
```json
{
  "type": "CODE_SNAPSHOT",
  "code": "def solution(arr):\n    # Write your code here\n    pass"
}
```

## 2. Frontend Implementation (React)
You need to listen to the data channel in your Code Editor component.

### Example (`Notepad.tsx` or `CodeEditor.tsx`)

```tsx
import { useDataChannel, useRoomContext } from "@livekit/components-react";
import { useState } from "react";

export default function CodeEditor() {
    const [code, setCode] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const room = useRoomContext(); // Needed for sending

    // [NEW] Listen for Auto-Code Events
    useDataChannel((msg) => {
        try {
            const text = new TextDecoder().decode(msg.payload);
            const data = JSON.parse(text);

            // 1. Check for Event Type
            if (data.type === "CODE_SNAPSHOT") {
                console.log("🚀 Received Auto-Code from Agent");
                
                // 2. Update Editor Content
                setCode(data.code);
                
                // 3. Auto-Open the Editor (User Experience)
                setIsVisible(true); 
            }
        } catch (e) {
            console.error("Error parsing data message:", e);
        }
    });

    // ... render logic
}
```

## 3. When does this trigger?
1.  **Technical Questions:** If the Interviewer says "Here is a Python function...", the code block is extracted and sent.
2.  **Crisis Events:** If a production bug occurs (e.g., "Critical Memory Leak"), the broken code is sent immediately.

---

## 4. Sending Code TO Agent (Code Submission)
When the user finishes writing code, the frontend must send it back to the agent for evaluation.

**Method:** `room.localParticipant.publishData`
**Event Type:** `ALGO_SUBMIT`

### Payload Structure
```json
{
  "type": "ALGO_SUBMIT",
  "code": "def solution(arr):\n    return sorted(arr)"
}
```

### React Implementation Example
```tsx
const submitCode = async () => {
    if (!room || !room.localParticipant) return;

    const payload = JSON.stringify({
        type: "ALGO_SUBMIT",
        code: code // The current value of your editor
    });

    const encoder = new TextEncoder();
    await room.localParticipant.publishData(encoder.encode(payload), { reliable: true });

    console.log("Code submitted to Agent!");
};
```
**Agent Behavior:**
- The agent will receive the code.
- It will say "I have received your code. Let me check it."
- It will then evaluate the code syntax and logic.
