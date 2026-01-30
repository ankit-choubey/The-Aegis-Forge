import { useDataChannel } from "@livekit/components-react";
import { useState, useEffect } from "react";

export default function CrisisAlert() {
    const [alertMessage, setAlertMessage] = useState<string | null>(null);

    // Listen for "CRISIS_ALERT" messages
    useDataChannel((msg) => {
        try {
            const text = new TextDecoder().decode(msg.payload);
            const data = JSON.parse(text);
            if (data.type === "CRISIS_ALERT") {
                console.log("CRISIS ALERT RECEIVED:", data.message);
                triggerAlert(data.message || "SYSTEM CRITICAL");
            }
        } catch (e) {
            // Ignore
        }
    });

    const triggerAlert = (msg: string) => {
        setAlertMessage(msg);
        // Play sound effect if possible (optional)
        const audio = new Audio("/crisis_pinger.mp3"); // Ensure this exists or fail silently
        audio.play().catch(() => { });

        // Auto-dismiss after 8 seconds
        setTimeout(() => {
            setAlertMessage(null);
        }, 8000);
    };

    if (!alertMessage) return null;

    return (
        <div className="fixed top-0 left-0 w-full h-[120px] bg-red-900/90 z-[100] border-b-4 border-red-500 animate-pulse flex flex-col items-center justify-center pointer-events-none">
            <div className="text-red-100 font-mono text-4xl font-black tracking-[0.2em] uppercase animate-bounce">
                ⚠ {alertMessage} ⚠
            </div>
            <div className="text-red-300 font-mono text-sm mt-2">
                PRIORITY OVERRIDE
            </div>

            {/* Scanlines Effect */}
            <div className="absolute inset-0 bg-[url('/scanlines.png')] opacity-20 pointer-events-none"></div>
        </div>
    );
}
