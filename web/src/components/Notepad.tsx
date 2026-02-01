import { useDataChannel, useRoomContext } from "@livekit/components-react"; // Import useRoomContext
import { useState, useEffect } from "react";

export default function Notepad() {
    const [isVisible, setIsVisible] = useState(false);
    const [code, setCode] = useState("// Write your solution here...\n\nfunction solution() {\n  \n}");
    const [status, setStatus] = useState("RECORDING");

    // Get Room Context to send data
    const room = useRoomContext();

    // Listen for "TOGGLE_NOTEPAD" messages from the Agent
    useDataChannel((msg) => {
        try {
            const text = new TextDecoder().decode(msg.payload);
            const data = JSON.parse(text);
            if (data.type === "TOGGLE_NOTEPAD") {
                console.log("Notepad Toggle Triggered:", data.visible);
                setIsVisible(data.visible);
            }
            // [NEW] Handle Code Injection from Agent
            if (data.type === "CODE_SNAPSHOT") {
                console.log("Code Snapshot Received:", data.code.length, "chars");
                setCode(data.code);
                setIsVisible(true); // Auto-open on code receipt
            }
        } catch (e) {
            // Ignore non-JSON messages
        }
    });

    const submitCode = async () => {
        if (!room || !room.localParticipant) return;

        setStatus("SENDING...");
        try {
            const payload = JSON.stringify({
                type: "ALGO_SUBMIT",
                code: code
            });
            const encoder = new TextEncoder();
            await room.localParticipant.publishData(encoder.encode(payload), { reliable: true });

            setStatus("SENT TO AGENT");
            setTimeout(() => setStatus("RECORDING"), 2000);

            console.log("Code submitted:", code.length, "chars");
        } catch (e) {
            console.error("Failed to submit code:", e);
            setStatus("ERROR SENDING");
        }
    };

    if (!isVisible) return null;

    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-zinc-900 border-2 border-cyan-500 rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="bg-cyan-950 px-4 py-2 flex justify-between items-center border-b border-cyan-800">
                <span className="text-cyan-400 font-mono text-sm tracking-wider">AEGIS_NOTEPAD_V1</span>
                <div className="flex gap-2">
                    <button onClick={submitCode} className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded transition-colors">
                        SUBMIT CODE
                    </button>
                    <button onClick={() => setIsVisible(false)} className="text-zinc-500 hover:text-red-400 transition-colors">
                        ✖
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 w-full bg-zinc-950 p-4 text-zinc-300 font-mono text-sm resize-none focus:outline-none"
                spellCheck="false"
            />

            {/* Status Footer */}
            <div className="bg-zinc-900 px-4 py-1 text-[10px] text-zinc-600 font-mono border-t border-zinc-800 flex justify-between">
                <span>MODE: PYTHON/JS</span>
                <span>STATUS: {status}</span>
            </div>
        </div>
    );
}
