# Frontend Guide: Implementing the Pressure Agent Popup

This guide provides the code to implement a **Pressure Agent Popup** that behaves exactly like the **Mole Popup** (bottom-right toast notification).

## 1. Create the Component

Create a new file: `src/components/PressurePopup.tsx`

```tsx
"use client";

import { useState, useEffect } from 'react';
import { useDataChannel } from "@livekit/components-react";
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Zap } from 'lucide-react'; // Make sure to install lucide-react if needed

export default function PressurePopup() {
    const [messages, setMessages] = useState<{ id: number, text: string }[]>([]);

    // Listen for "PRESSURE_ALERT" from Backend
    useDataChannel((msg) => {
        try {
            const text = new TextDecoder().decode(msg.payload);
            const data = JSON.parse(text);
            
            if (data.type === "PRESSURE_ALERT") {
                console.log("⚠️ Pressure Alert:", data.text);
                addMessage(data.text);
            }
        } catch (e) {
            // Ignore non-JSON
        }
    });

    const addMessage = (text: string) => {
        setMessages(prev => {
            // Keep last 3 messages to avoid clutter
            const newMsgs = [...prev, { id: Date.now(), text }];
            if (newMsgs.length > 3) return newMsgs.slice(-3);
            return newMsgs;
        });

        // Auto dismiss after 8 seconds
        setTimeout(() => {
            setMessages(prev => prev.filter(m => m.text !== text));
        }, 8000);
    };

    if (messages.length === 0) return null;

    return (
        <div className="absolute bottom-20 right-8 w-96 flex flex-col gap-3 z-[90] pointer-events-none">
            {messages.map(m => (
                <div 
                    key={m.id} 
                    className="bg-zinc-950/90 backdrop-blur-md border border-yellow-500/30 text-yellow-50 p-4 rounded-lg font-mono text-sm shadow-[0_0_20px_rgba(234,179,8,0.2)] animate-in slide-in-from-right-10 fade-in duration-300"
                >
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="font-bold text-yellow-400 text-xs tracking-wider uppercase">STAKEHOLDER ALERT</span>
                    </div>
                    {m.text}
                </div>
            ))}
        </div>
    );
}
```

## 2. Integrate into Page

Edit your main page file (e.g., `src/app/page.tsx`).

1.  **Import the component:**
    ```tsx
    import PressurePopup from "@/components/PressurePopup";
    ```

2.  **Add it to your layout** (inside `<LiveKitRoom>` or near the other popups):
    ```tsx
    return (
        <div className="...">
            {/* ... other components ... */}
            
            <Mole />
            
            {/* NEW: Pressure Popup */}
            <PressurePopup />
            
            {/* ... */}
        </div>
    );
    ```

## 3. Backend Requirement

Ensure your backend (Python agent) sends the event:

```python
import json

payload = json.dumps({
    "type": "PRESSURE_ALERT",
    "text": "We are losing money! Fix it now!"
}).encode("utf-8")

await room.local_participant.publish_data(payload, reliable=True)
```
