"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Mic, MicOff, Video, VideoOff, PhoneOff,
    Settings, Shield, Wifi, Terminal as TerminalIcon, Play, Square, Radio,
    ChevronDown, ChevronUp, Loader2, Code, Laptop,
    Activity, Volume2, Camera, Send, Zap, Cpu, Clock, Download
} from "lucide-react";
import clsx from "clsx";
import {
    LiveKitRoom,
    VideoTrack,
    useRemoteParticipants,
    useLocalParticipant,
    useTracks,
    RoomAudioRenderer,
    useMediaDeviceSelect,
    StartAudio,
    useConnectionState,
    useDataChannel,
    useRoomContext
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";

// Custom Integrations
import Avatar from "@/components/Avatar";
import Mole from "@/components/Mole";
import Notepad from "@/components/Notepad";
import CrisisAlert from "@/components/CrisisAlert";
import { useFaceLogic } from "@/hooks/useFaceLogic";

// ============================================
// TYPES
// ============================================
interface Message {
    id: string;
    timestamp: string;
    sender: "AGENT" | "YOU" | "SYSTEM" | "CODE";
    text: string;
}

// ============================================
// HELPER COMPONENTS
// ============================================
function ConnectionIndicator() {
    const state = useConnectionState();
    return (
        <div className="absolute bottom-2 left-2 text-[10px] text-zinc-700 font-mono z-50">
            STATUS: {state?.toUpperCase() || 'UNKNOWN'}
        </div>
    );
}

// ============================================
// FRIEND'S UI COMPONENTS (AIInterviewerPanel, CodeTerminal, etc.)
// ============================================

// --- AI INTERVIEWER PANEL (50% LEFT TOP) ---
const AIInterviewerPanel = () => {
    const remoteParticipants = useRemoteParticipants();
    const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });

    const agentVideoTrack = tracks.find(
        (track) => track.participant.identity.toLowerCase().includes('agent') ||
            track.participant.identity.toLowerCase().includes('ai')
    );
    const hasAgent = remoteParticipants.length > 0;

    return (
        <div className="relative h-full bg-gradient-to-br from-[#0a0a0f] via-[#0d0d15] to-[#0a0a0f] overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `
                        linear-gradient(rgba(0,229,255,0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,229,255,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px'
                }} />
            </div>

            {agentVideoTrack ? (
                <VideoTrack trackRef={agentVideoTrack} className="w-full h-full object-cover" />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        {/* Use existing Avatar if no video track, or the friend's animation */}
                        {/* Integrating existing Avatar here for consistency if needed, but friend's code had a fallback animation. 
                            Let's use the layout from friend's code but maybe overlay the Avatar component if we want 3D? 
                            The user said "integrate with my models", likely meaning backend. 
                            I will stick to FRIEND'S CODE for visual, but if the agent has no video, it shows the animation below. 
                        */}

                        <div className="relative w-40 h-40 mx-auto mb-6">
                            <div className="absolute inset-0 rounded-full border-2 border-[#00E5FF]/20 animate-ping" style={{ animationDuration: '2s' }} />
                            <div className="absolute inset-2 rounded-full border border-[#00E5FF]/30 animate-pulse" />
                            <div className="absolute inset-4 rounded-full border border-[#00E5FF]/40" />
                            <div className="absolute inset-6 rounded-full bg-gradient-to-br from-[#00E5FF]/20 to-cyan-900/30 backdrop-blur-sm border border-[#00E5FF]/50 flex items-center justify-center">
                                {hasAgent ? (
                                    <Radio className="w-16 h-16 text-[#00E5FF] animate-pulse" />
                                ) : (
                                    <Loader2 className="w-16 h-16 text-[#00E5FF] animate-spin" />
                                )}
                            </div>
                            <div className="absolute left-1/2 top-0 w-px h-full bg-gradient-to-b from-transparent via-[#00E5FF] to-transparent -translate-x-1/2 animate-pulse" />
                        </div>

                        <p className="text-[#00E5FF] font-mono text-lg tracking-[0.3em] font-bold mb-2">
                            {hasAgent ? "AI_INTERVIEWER" : "ESTABLISHING UPLINK"}
                        </p>
                        <p className="text-zinc-600 font-mono text-xs tracking-widest">
                            {hasAgent ? ":: CONNECTED ::" : ":: SEARCHING FOR AGENT ::"}
                        </p>

                        {!hasAgent && (
                            <div className="flex justify-center gap-2 mt-6">
                                {[0, 1, 2].map(i => (
                                    <div
                                        key={i}
                                        className="w-2 h-2 bg-[#00E5FF] rounded-full animate-bounce"
                                        style={{ animationDelay: `${i * 0.15}s` }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Optional: Render old Avatar underneath/hidden if needed for 'listening' logic? No, Avatar component was visual. */}
                    </div>
                </div>
            )}

            {/* Status Overlay */}
            <div className="absolute top-4 left-4 flex items-center gap-3">
                <div className="bg-black/70 backdrop-blur-xl px-4 py-2 border border-[#00E5FF]/30 flex items-center gap-3 rounded shadow-lg shadow-[#00E5FF]/10">
                    <div className={clsx(
                        "w-3 h-3 rounded-full",
                        hasAgent ? "bg-[#00E5FF] animate-pulse shadow-lg shadow-[#00E5FF]/50" : "bg-yellow-500 animate-pulse"
                    )} />
                    <span className="text-sm font-mono font-bold text-white tracking-wider">
                        {hasAgent ? "AI_INTERVIEWER :: ACTIVE" : "WAITING FOR AGENT"}
                    </span>
                </div>
            </div>

            {/* Time Overlay */}
            <div className="absolute top-4 right-4">
                <div className="bg-black/70 backdrop-blur-xl px-3 py-1.5 border border-white/10 rounded">
                    <span className="text-zinc-400 font-mono text-xs">SESSION ACTIVE</span>
                </div>
            </div>
        </div>
    );
};

// --- CODE TERMINAL (50% LEFT BOTTOM) ---
const CodeTerminal = ({ onCodeSubmit }: { onCodeSubmit: (code: string) => void }) => {
    const [code, setCode] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleRun = () => {
        if (!code.trim()) return;
        setIsRunning(true);
        onCodeSubmit(code);
        setTimeout(() => setIsRunning(false), 500);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.ctrlKey && e.key === 'Enter') {
            handleRun();
        }
    };

    const lines = code.split('\n');
    const lineCount = Math.max(lines.length, 15);

    return (
        <div className="flex-1 bg-[#0a0a0f] flex flex-col min-h-0 border-t border-[#00E5FF]/20 relative">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-[#00E5FF]/5 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <TerminalIcon className="w-5 h-5 text-[#00E5FF]" />
                        <span className="text-white font-mono text-sm tracking-widest font-bold">CODE_TERMINAL</span>
                    </div>
                    <div className="flex gap-1.5 ml-4">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-zinc-600 font-mono text-xs">Ctrl+Enter to run</span>
                    <button
                        onClick={handleRun}
                        disabled={isRunning}
                        className={clsx(
                            "flex items-center gap-2 px-5 py-2 border text-sm font-mono font-bold rounded transition-all",
                            isRunning
                                ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400"
                                : "bg-[#00E5FF]/10 border-[#00E5FF]/50 text-[#00E5FF] hover:bg-[#00E5FF]/20 hover:shadow-lg hover:shadow-[#00E5FF]/20"
                        )}
                    >
                        {isRunning ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                EXECUTING...
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4" />
                                EXECUTE
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 flex overflow-hidden relative z-10">
                <div className="w-14 bg-black/50 border-r border-white/5 py-4 flex flex-col items-end pr-3 overflow-hidden">
                    {Array.from({ length: lineCount }, (_, i) => (
                        <div key={i} className="text-zinc-700 font-mono text-sm leading-6 select-none">
                            {i + 1}
                        </div>
                    ))}
                </div>

                <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent text-green-400 font-mono text-sm p-4 resize-none focus:outline-none leading-6 selection:bg-[#00E5FF]/30 placeholder:text-zinc-700"
                    placeholder="// Write your solution here...
// The AI interviewer will review your code in real-time.
// Press Ctrl+Enter to submit.

function solution(input) {
    // Your code here
    
}"
                    spellCheck={false}
                />
            </div>
        </div>
    );
};

// --- TRANSCRIPT LOG (25% MIDDLE) ---
const TranscriptLog = ({ messages }: { messages: Message[] }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex-1 flex flex-col bg-[#0a0a0f] overflow-hidden min-h-0">
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-[#00E5FF]/5 to-transparent flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#00E5FF]" />
                    <span className="text-white font-mono text-sm font-bold tracking-widest">NEURAL_LINK_LOG</span>
                </div>
                <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                {messages.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-zinc-700 font-mono text-xs">// Awaiting neural link transmission...</div>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className="font-mono text-sm group">
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-zinc-600 text-xs">{msg.timestamp}</span>
                                <span className="text-zinc-700">::</span>
                                <span className={clsx("text-xs font-bold tracking-wider", {
                                    "text-[#00E5FF]": msg.sender === "YOU",
                                    "text-white": msg.sender === "AGENT",
                                    "text-green-400": msg.sender === "CODE",
                                    "text-yellow-400": msg.sender === "SYSTEM"
                                })}>{msg.sender}</span>
                            </div>

                            <div className={clsx("pl-4 border-l-2", {
                                "border-[#00E5FF]": msg.sender === "YOU",
                                "border-white": msg.sender === "AGENT",
                                "border-green-500": msg.sender === "CODE",
                                "border-yellow-500": msg.sender === "SYSTEM"
                            })}>
                                {msg.sender === "CODE" ? (
                                    <pre className="whitespace-pre-wrap text-green-400 bg-green-900/20 p-3 rounded border border-green-500/20 text-xs overflow-x-auto">{msg.text}</pre>
                                ) : (
                                    <span className={clsx("leading-relaxed", {
                                        "text-zinc-300": msg.sender !== "SYSTEM",
                                        "text-yellow-200/80 italic": msg.sender === "SYSTEM"
                                    })}>{msg.text}</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// --- TELEMETRY PANEL (25% RIGHT) ---
const TelemetryPanel = ({ onEndCall }: { onEndCall: () => void }) => {
    const [hardwareExpanded, setHardwareExpanded] = useState(true);
    const audioDevices = useMediaDeviceSelect({ kind: 'audioinput' });
    const videoDevices = useMediaDeviceSelect({ kind: 'videoinput' });
    const { localParticipant } = useLocalParticipant();

    const cameraTracks = useTracks([Track.Source.Camera]);
    const localVideoTrack = cameraTracks.find(t => t.participant.identity === localParticipant?.identity);

    return (
        <div className="h-full flex flex-col bg-[#050508]">
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-[#00E5FF]/5 to-transparent">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#00E5FF]" />
                    <span className="text-white font-mono text-sm font-bold tracking-widest">TELEMETRY_RADAR</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
                {/* System Stats */}
                <div className="p-4 border border-white/10 bg-black/40 rounded space-y-3">
                    <div className="text-zinc-500 font-mono text-xs uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-2">
                        <Cpu className="w-3 h-3" />
                        System Status
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm font-mono">
                            <span className="text-zinc-500">ENCRYPTION</span>
                            <span className="text-[#00E5FF] flex items-center gap-1">
                                <Shield className="w-3 h-3" /> AES-256-GCM
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-mono">
                            <span className="text-zinc-500">LATENCY</span>
                            <span className="text-green-400">~24ms</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-mono">
                            <span className="text-zinc-500">SIGNAL</span>
                            <span className="text-green-400">EXCELLENT</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-mono">
                            <span className="text-zinc-500">PACKET LOSS</span>
                            <span className="text-green-400">0.0%</span>
                        </div>
                    </div>
                </div>

                {/* Hardware Override */}
                <div className="border border-white/10 bg-black/40 rounded overflow-hidden">
                    <button
                        onClick={() => setHardwareExpanded(!hardwareExpanded)}
                        className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4 text-[#00E5FF]" />
                            <span className="text-white font-mono text-xs font-bold tracking-wider">HARDWARE_OVERRIDE</span>
                        </div>
                        {hardwareExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                    </button>

                    {hardwareExpanded && (
                        <div className="p-4 space-y-4 border-t border-white/5">
                            {/* Audio */}
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-zinc-500 uppercase flex items-center gap-2">
                                    <Volume2 className="w-3 h-3" /> Audio Input
                                </label>
                                <select
                                    className="w-full bg-black border border-zinc-800 text-zinc-300 text-xs p-2.5 font-mono focus:border-[#00E5FF] outline-none rounded"
                                    onChange={(e) => audioDevices.setActiveMediaDevice(e.target.value)}
                                    value={audioDevices.activeDeviceId}
                                >
                                    {audioDevices.devices.map((d) => (
                                        <option key={d.deviceId} value={d.deviceId}>{d.label || 'Unknown Device'}</option>
                                    ))}
                                </select>

                                {/* Waveform */}
                                <div className="h-10 bg-black/60 border border-white/10 flex items-end justify-between px-1 pb-1 gap-[2px] rounded">
                                    {[...Array(24)].map((_, i) => (
                                        <div key={i}
                                            className="flex-1 bg-[#00E5FF]"
                                            style={{
                                                height: `${Math.random() * 80 + 20}%`,
                                                opacity: Math.random() * 0.5 + 0.3,
                                                animation: `pulse ${Math.random() * 0.5 + 0.3}s infinite`
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Video */}
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-zinc-500 uppercase flex items-center gap-2">
                                    <Camera className="w-3 h-3" /> Video Input
                                </label>
                                <select
                                    className="w-full bg-black border border-zinc-800 text-zinc-300 text-xs p-2.5 font-mono focus:border-[#00E5FF] outline-none rounded"
                                    onChange={(e) => videoDevices.setActiveMediaDevice(e.target.value)}
                                    value={videoDevices.activeDeviceId}
                                >
                                    {videoDevices.devices.map((d) => (
                                        <option key={d.deviceId} value={d.deviceId}>{d.label || 'Unknown Device'}</option>
                                    ))}
                                </select>

                                {/* Preview */}
                                <div className="aspect-video bg-black border border-white/10 relative overflow-hidden rounded">
                                    {localVideoTrack ? (
                                        <VideoTrack trackRef={localVideoTrack} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
                                            <VideoOff className="w-8 h-8 text-zinc-700" />
                                        </div>
                                    )}
                                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 text-[10px] font-mono text-[#00E5FF] border border-[#00E5FF]/30 rounded flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                        LIVE
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* End Call */}
            <div className="p-4 border-t border-white/10 bg-black/80">
                <button
                    onClick={onEndCall}
                    className="w-full group relative px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all rounded flex items-center justify-center gap-3 overflow-hidden"
                >
                    <span className="absolute inset-0 bg-red-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <PhoneOff className="w-5 h-5 relative z-10" />
                    <span className="font-mono text-sm font-bold relative z-10 tracking-wider">TERMINATE SESSION</span>
                </button>
            </div>
        </div>
    );
};

// ============================================
// CONTENT WRAPPER (Inside Room)
// ============================================
const RoomContent = ({ onEndCall }: { onEndCall: () => void }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", timestamp: new Date().toLocaleTimeString(), sender: "SYSTEM", text: "Neural link established. Waiting for AI interviewer..." }
    ]);
    const [msgInput, setMsgInput] = useState("");

    const getTimestamp = () => new Date().toLocaleTimeString();

    // LISTEN FOR TRANSCRIPTS (Explicit Room Event)
    const room = useRoomContext(); // Access room from context

    useEffect(() => {
        if (!room) return;

        const handleData = (payload: Uint8Array, participant?: any, kind?: any, topic?: string) => {
            try {
                const text = new TextDecoder().decode(payload);
                const data = JSON.parse(text);

                // SIMPLIFIED: Just check the type. Ignore topic for maximum compatibility.
                if (data.type === "TRANSCRIPT") {
                    console.log("[TRANSCRIPT RX]", data.sender, data.text);
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        timestamp: getTimestamp(),
                        sender: data.sender || "SYSTEM",
                        text: data.text
                    }]);
                }
            } catch (e) {
                console.warn("Packet Decode Failed:", e);
            }
        };

        room.on('dataReceived', handleData);
        return () => { room.off('dataReceived', handleData); };
    }, [room]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!msgInput.trim()) return;
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            timestamp: getTimestamp(),
            sender: "YOU",
            text: msgInput
        }]);
        setMsgInput("");
    };

    const handleCodeSubmit = async (code: string) => {
        // 1. Update Local Log
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            timestamp: getTimestamp(),
            sender: "CODE",
            text: code
        }]);

        // 2. Transmit to Agent
        if (room && room.localParticipant) {
            const payload = JSON.stringify({ type: "ALGO_SUBMIT", code: code });
            const encoder = new TextEncoder();
            await room.localParticipant.publishData(encoder.encode(payload), { reliable: true });
        }
    };

    return (
        <div className="grid grid-cols-12 h-screen bg-[#050508] text-zinc-400 overflow-hidden font-sans relative">
            {/* Audio Renderer for LiveKit */}
            <RoomAudioRenderer />

            {/* Start Audio Button (Vital for browser autoplay logic) */}
            <StartAudio
                label="INITIALIZE LINK"
                className="!bg-[#00E5FF] !text-black !font-mono !uppercase !tracking-widest !rounded-none !border-none hover:!bg-[#00E5FF]/80 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100]"
            />

            {/* ZONE A: AI Video + Code Terminal (6 cols = 50%) */}
            <section className="col-span-6 border-r border-white/10 flex flex-col">
                <div className="h-[55%]">
                    <AIInterviewerPanel />
                </div>
                <div className="flex-1 flex flex-col min-h-0">
                    <CodeTerminal onCodeSubmit={handleCodeSubmit} />
                </div>
            </section>

            {/* ZONE B: Transcript Log (3 cols = 25%) */}
            <section className="col-span-3 border-r border-white/10 flex flex-col overflow-hidden">
                <TranscriptLog messages={messages} />

                <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-black/40 shrink-0">
                    <div className="flex items-center gap-2 bg-black border border-white/10 px-4 py-3 focus-within:border-[#00E5FF]/50 transition-colors rounded">
                        <span className="text-[#00E5FF] font-mono text-lg">&gt;</span>
                        <input
                            className="flex-1 bg-transparent text-sm font-mono text-white placeholder:text-zinc-700 outline-none"
                            placeholder="Type message..."
                            value={msgInput}
                            onChange={(e) => setMsgInput(e.target.value)}
                        />
                        <button type="submit" className="text-[#00E5FF] hover:text-white transition-colors">
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </section>

            {/* ZONE C: Telemetry Panel (3 cols = 25%) */}
            <section className="col-span-3">
                <TelemetryPanel onEndCall={onEndCall} />
            </section>

            {/* --- BACKEND INTEGRATION OVERLAYS --- */}

            {/* 1. Mole: The Eavesdropper (Invisible) */}
            <Mole />

            {/* 2. Notepad: The DSA Challenge Popup (Z-Index 50) */}
            {/* Notepad Removed */}

            {/* 3. Crisis Alert: The Red Warning (Z-Index 100) */}
            <div className="absolute inset-0 pointer-events-none z-[100]">
                <CrisisAlert />
            </div>

            <ConnectionIndicator />
        </div>
    );
};

// ============================================
// MAIN PAGE (Wrapper)
// ============================================

export default function Home() {
    const [token, setToken] = useState("");
    const [isSessionEnded, setIsSessionEnded] = useState(false);

    // Activate Face Logic
    useFaceLogic((idle) => {
        // console.log("Idle State:", idle);
    });

    useEffect(() => {
        const fetchToken = async () => {
            try {
                // Using existing /api/token route to match current backend
                const uniqueRoom = `incident-${Date.now()}`;
                const resp = await fetch(`/api/token?room=${uniqueRoom}&username=candidate`);
                const data = await resp.json();
                setToken(data.token);
            } catch (e) {
                console.error(e);
            }
        };
        fetchToken();
    }, []);

    if (isSessionEnded) {
        return (
            <div className="h-screen w-screen bg-[#050508] flex flex-col items-center justify-center gap-6">
                <div className="text-red-500 font-mono text-xl tracking-[0.2em] animate-pulse">SESSION TERMINATED</div>
                <div className="text-zinc-500 font-mono text-sm max-w-md text-center">
                    The neural link has been severed. Report generation is in progress.
                </div>

                <a
                    href="http://localhost:8000/download-report/candidate"
                    target="_blank"
                    className="px-8 py-3 bg-[#00E5FF] text-black font-mono font-bold tracking-wider hover:bg-[#00E5FF]/80 transition-all rounded shadow-[0_0_20px_rgba(0,229,255,0.3)] flex items-center gap-2"
                >
                    <Download className="w-5 h-5" />
                    DOWNLOAD FSIR REPORT
                </a>

                <button
                    onClick={() => window.location.reload()}
                    className="text-zinc-600 font-mono text-xs hover:text-white transition-colors mt-8"
                >
                    [ RE-INITIALIZE LINK ]
                </button>
            </div>
        );
    }

    if (token === "") {
        return (
            <div className="h-screen w-screen bg-[#050508] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-[#00E5FF] animate-spin" />
                <div className="text-[#00E5FF] font-mono text-sm tracking-[0.2em] animate-pulse">ESTABLISHING SECURE CONNECTION...</div>
            </div>
        );
    }

    return (
        <LiveKitRoom
            video={true} // Enabled for friend's UI (Camera input)
            audio={true}
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            connect={true}
            data-lk-theme="default"
            className="h-full w-full"
        >
            <RoomContent onEndCall={() => setIsSessionEnded(true)} />
        </LiveKitRoom>
    );
}
