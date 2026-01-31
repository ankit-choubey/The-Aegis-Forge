"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Mic, MicOff, Video, VideoOff, PhoneOff,
    Settings, Shield, Wifi, Terminal as TerminalIcon, Play, Square, Radio,
    ChevronDown, ChevronUp, Loader2, Code, Laptop,
    Activity, Volume2, Camera, Send, Zap, Cpu, Clock, Download, FileText,
    Eye, Crown, ToggleRight, User, MessageSquare
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
    useRoomContext
} from "@livekit/components-react";
import { Track } from "livekit-client";

// ============================================
// TYPES
// ============================================
interface Message {
    id: string;
    timestamp: string;
    sender: "AGENT" | "YOU" | "SYSTEM" | "CODE";
    text: string;
}

interface TranscriptEntry {
    speaker: "AGENT" | "CANDIDATE";
    text: string;
    timestamp: string;
}

type ActivePanel = "terminal" | "notepad" | null;

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
// AI INTERVIEWER PANEL (50% LEFT TOP)
// Now supports Recruiter Takeover mode
// ============================================
const AIInterviewerPanel = ({ isRecruiterTakeover }: { isRecruiterTakeover: boolean }) => {
    const remoteParticipants = useRemoteParticipants();
    const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });

    const agentVideoTrack = tracks.find(
        (track) => track.participant.identity.toLowerCase().includes('agent') ||
            track.participant.identity.toLowerCase().includes('ai')
    );
    const hasAgent = remoteParticipants.length > 0;

    // RECRUITER TAKEOVER MODE
    if (isRecruiterTakeover) {
        return (
            <div className="relative h-full bg-gradient-to-br from-[#0a0a0f] via-[#0d0d15] to-[#0a0a0f] overflow-hidden">
                {/* Grid Background */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `
                            linear-gradient(rgba(245,158,11,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(245,158,11,0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px'
                    }} />
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="relative w-40 h-40 mx-auto mb-6">
                            <div className="absolute inset-0 rounded-full border-2 border-amber-500/30 animate-pulse" />
                            <div className="absolute inset-2 rounded-full border border-amber-500/40" />
                            <div className="absolute inset-4 rounded-full border border-amber-500/50" />
                            <div className="absolute inset-6 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-900/30 backdrop-blur-sm border border-amber-500/50 flex items-center justify-center">
                                <Crown className="w-16 h-16 text-amber-400" />
                            </div>
                        </div>

                        <p className="text-amber-400 font-mono text-lg tracking-[0.3em] font-bold mb-2">
                            HUMAN_INTERVIEWER
                        </p>
                        <p className="text-zinc-600 font-mono text-xs tracking-widest">
                            :: RECRUITER CONTROL ACTIVE ::
                        </p>
                    </div>
                </div>

                {/* Status Overlay */}
                <div className="absolute top-4 left-4 flex items-center gap-3">
                    <div className="bg-black/70 backdrop-blur-xl px-4 py-2 border border-amber-500/30 flex items-center gap-3 rounded shadow-lg shadow-amber-500/10">
                        <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse shadow-lg shadow-amber-500/50" />
                        <span className="text-sm font-mono font-bold text-amber-400 tracking-wider">
                            HUMAN_CONTROL :: LOCKED
                        </span>
                    </div>
                </div>

                {/* Lock Badge */}
                <div className="absolute top-4 right-4">
                    <div className="bg-amber-500/10 backdrop-blur-xl px-3 py-1.5 border border-amber-500/30 rounded flex items-center gap-2">
                        <Shield className="w-3 h-3 text-amber-400" />
                        <span className="text-amber-400 font-mono text-xs">AI PAUSED</span>
                    </div>
                </div>
            </div>
        );
    }

    // DEFAULT AI MODE
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

// ============================================
// CODE TERMINAL (BOTTOM HALF OF LEFT ZONE)
// ============================================
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

// ============================================
// TRANSCRIPT LOG (25% MIDDLE)
// ============================================
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

// ============================================
// TELEMETRY PANEL (25% RIGHT)
// Now includes Recruiter Takeover button
// ============================================
const TelemetryPanel = ({
    onEndCall,
    activePanel,
    setActivePanel,
    isRecruiterTakeover,
    onRecruiterTakeover
}: {
    onEndCall: () => void;
    activePanel: ActivePanel;
    setActivePanel: (panel: ActivePanel) => void;
    isRecruiterTakeover: boolean;
    onRecruiterTakeover: () => void;
}) => {
    const [hardwareExpanded, setHardwareExpanded] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const audioDevices = useMediaDeviceSelect({ kind: 'audioinput' });
    const videoDevices = useMediaDeviceSelect({ kind: 'videoinput' });
    const { localParticipant } = useLocalParticipant();

    const cameraTracks = useTracks([Track.Source.Camera]);
    const localVideoTrack = cameraTracks.find(t => t.participant.identity === localParticipant?.identity);

    const togglePanel = (panel: ActivePanel) => {
        if (activePanel === panel) {
            setActivePanel(null);
        } else {
            setActivePanel(panel);
        }
    };

    const handleConfirmTakeover = () => {
        setShowConfirmModal(false);
        onRecruiterTakeover();
    };

    return (
        <div className="h-full flex flex-col bg-[#050508]">
            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#0a0a0f] border border-amber-500/30 rounded-xl p-6 max-w-md w-full shadow-2xl shadow-amber-500/10">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
                                <Crown className="w-8 h-8 text-amber-400" />
                            </div>
                            <h3 className="text-white font-mono text-lg font-bold tracking-wider mb-2">
                                RECRUITER TAKEOVER
                            </h3>
                            <p className="text-zinc-400 text-sm">
                                You are about to take control of this interview from the AI.
                            </p>
                        </div>

                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-red-400 font-mono text-xs font-bold mb-1">WARNING: IRREVERSIBLE ACTION</p>
                                    <p className="text-zinc-500 text-xs">
                                        Once you take over, you CANNOT switch back to AI mode.
                                        The AI interviewer will be paused permanently for this session.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 px-4 py-3 bg-zinc-800 text-zinc-300 font-mono text-sm border border-white/10 rounded-lg hover:bg-zinc-700 transition-colors"
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={handleConfirmTakeover}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-mono text-sm font-bold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20"
                            >
                                CONFIRM TAKEOVER
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-[#00E5FF]/5 to-transparent">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#00E5FF]" />
                    <span className="text-white font-mono text-sm font-bold tracking-widest">TELEMETRY_RADAR</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
                {/* Toggle Buttons for Terminal & Notepad */}
                <div className="flex gap-2">
                    <button
                        onClick={() => togglePanel("terminal")}
                        className={clsx(
                            "flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded text-xs font-mono font-bold transition-all",
                            activePanel === "terminal"
                                ? "bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF]"
                                : "bg-black/40 border-white/10 text-zinc-400 hover:border-[#00E5FF]/50 hover:text-[#00E5FF]"
                        )}
                    >
                        <TerminalIcon className="w-3 h-3" />
                        TERMINAL
                    </button>
                    <button
                        onClick={() => togglePanel("notepad")}
                        className={clsx(
                            "flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded text-xs font-mono font-bold transition-all",
                            activePanel === "notepad"
                                ? "bg-yellow-500/20 border-yellow-500 text-yellow-400"
                                : "bg-black/40 border-white/10 text-zinc-400 hover:border-yellow-500/50 hover:text-yellow-400"
                        )}
                    >
                        <FileText className="w-3 h-3" />
                        NOTEPAD
                    </button>
                </div>

                {/* Recruiter Takeover Section */}
                <div className={clsx(
                    "p-4 border rounded space-y-3",
                    isRecruiterTakeover
                        ? "border-amber-500/30 bg-amber-500/5"
                        : "border-white/10 bg-black/40"
                )}>
                    <div className="text-zinc-500 font-mono text-xs uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-2">
                        <Crown className={clsx("w-3 h-3", isRecruiterTakeover ? "text-amber-400" : "text-zinc-500")} />
                        <span className={isRecruiterTakeover ? "text-amber-400" : ""}>Recruiter Control</span>
                    </div>

                    {isRecruiterTakeover ? (
                        <div className="text-center py-2">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                                <span className="text-amber-400 font-mono text-xs font-bold">HUMAN MODE ACTIVE</span>
                            </div>
                            <p className="text-zinc-600 font-mono text-[10px] mt-2">AI interviewer paused</p>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowConfirmModal(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/30 rounded-lg text-amber-400 font-mono text-xs font-bold hover:from-amber-500/20 hover:to-amber-600/10 hover:border-amber-500/50 transition-all group"
                        >
                            <Crown className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            RECRUITER TAKEOVER
                        </button>
                    )}
                </div>

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
// NOTEPAD COMPONENT
// ============================================
const Notepad = () => {
    const [notes, setNotes] = useState("");

    return (
        <div className="flex-1 bg-[#0a0a0f] flex flex-col min-h-0 border-t border-yellow-500/20 relative">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-yellow-500/5 to-transparent">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-mono text-sm tracking-widest font-bold">NOTEPAD</span>
                </div>
                <span className="text-zinc-600 font-mono text-xs">Auto-saved</span>
            </div>
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex-1 bg-transparent text-zinc-300 font-mono text-sm p-4 resize-none focus:outline-none leading-6 selection:bg-yellow-500/30 placeholder:text-zinc-700"
                placeholder="Take notes during the interview...

• Key observations
• Important points
• Questions to ask
• Technical notes"
                spellCheck={false}
            />
        </div>
    );
};

// ============================================
// EMPTY PANEL PLACEHOLDER
// ============================================
const EmptyPanel = () => {
    return (
        <div className="flex-1 bg-[#0a0a0f] border-t border-white/10 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                    <TerminalIcon className="w-6 h-6 text-zinc-600" />
                </div>
                <p className="text-zinc-600 font-mono text-xs tracking-wider mb-1">NO PANEL ACTIVE</p>
                <p className="text-zinc-700 font-mono text-[10px]">Select Terminal or Notepad →</p>
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
    const [activePanel, setActivePanel] = useState<ActivePanel>(null);
    const [isRecruiterTakeover, setIsRecruiterTakeover] = useState(false);

    const getTimestamp = () => new Date().toLocaleTimeString();

    // LISTEN FOR TRANSCRIPTS (Explicit Room Event) - Utkarsh's approach
    const room = useRoomContext();

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

    const handleRecruiterTakeover = () => {
        setIsRecruiterTakeover(true);
        // Add system message about takeover
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            timestamp: getTimestamp(),
            sender: "SYSTEM",
            text: "⚠️ RECRUITER TAKEOVER: Human interviewer has taken control. AI is now paused."
        }]);

        // TODO: Send signal to Utkarsh's backend to pause AI
        // if (room && room.localParticipant) {
        //     const payload = JSON.stringify({ type: "RECRUITER_TAKEOVER" });
        //     const encoder = new TextEncoder();
        //     await room.localParticipant.publishData(encoder.encode(payload), { reliable: true });
        // }
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
                    <AIInterviewerPanel isRecruiterTakeover={isRecruiterTakeover} />
                </div>
                <div className="flex-1 flex flex-col min-h-0">
                    {activePanel === "terminal" && <CodeTerminal onCodeSubmit={handleCodeSubmit} />}
                    {activePanel === "notepad" && <Notepad />}
                    {activePanel === null && <EmptyPanel />}
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
                <TelemetryPanel
                    onEndCall={onEndCall}
                    activePanel={activePanel}
                    setActivePanel={setActivePanel}
                    isRecruiterTakeover={isRecruiterTakeover}
                    onRecruiterTakeover={handleRecruiterTakeover}
                />
            </section>

            <ConnectionIndicator />
        </div>
    );
};

// ============================================
// MAIN PAGE (Wrapper) - Using Utkarsh's approach
// ============================================
export default function InterviewRoomPage() {
    const router = useRouter();
    const [token, setToken] = useState("");
    const [isSessionEnded, setIsSessionEnded] = useState(false);
    const [isRecruiterMode, setIsRecruiterMode] = useState(false);

    // Mock transcript data (will come from Utkarsh's backend)
    const mockTranscript: TranscriptEntry[] = [
        { speaker: "AGENT", text: "Welcome to your technical interview. Let's start with a system design question.", timestamp: "10:00:00" },
        { speaker: "CANDIDATE", text: "Thank you, I'm ready to begin.", timestamp: "10:00:15" },
        { speaker: "AGENT", text: "Can you design a scalable notification system that can handle 10 million users?", timestamp: "10:00:30" },
        { speaker: "CANDIDATE", text: "I would approach this using a message queue architecture with Redis for real-time delivery and a fallback to email/push for offline users.", timestamp: "10:01:00" },
        { speaker: "AGENT", text: "Good start. How would you handle message persistence and delivery guarantees?", timestamp: "10:02:30" },
        { speaker: "CANDIDATE", text: "I'd use a combination of write-ahead logging and acknowledgment patterns. Messages would be stored in a durable queue like Kafka before processing.", timestamp: "10:03:00" },
        { speaker: "AGENT", text: "Excellent. Now let's move to a coding problem. Please implement a function to find the longest palindromic substring.", timestamp: "10:05:00" },
        { speaker: "CANDIDATE", text: "I'll use dynamic programming with O(n²) time complexity. Let me walk through my approach...", timestamp: "10:05:30" },
    ];

    useEffect(() => {
        const fetchToken = async () => {
            try {
                // Using Utkarsh's approach: unique room per session
                const uniqueRoom = `aegis-${Date.now()}`;
                const resp = await fetch(`/api/livekit/token?room=${uniqueRoom}&username=candidate`);
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
            <div className="min-h-screen bg-[#050508] text-white">
                {/* Header with Recruiter Toggle */}
                <div className="fixed top-0 left-0 right-0 z-50 bg-[#050508]/90 backdrop-blur-xl border-b border-white/5">
                    <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white">SESSION TERMINATED</h1>
                                <p className="text-xs text-zinc-500 font-mono">Interview Complete</p>
                            </div>
                        </div>

                        {/* Recruiter Mode Toggle */}
                        <button
                            onClick={() => setIsRecruiterMode(!isRecruiterMode)}
                            className={clsx(
                                "flex items-center gap-3 px-4 py-2 rounded-lg border transition-all",
                                isRecruiterMode
                                    ? "bg-gradient-to-r from-amber-500/20 to-amber-600/10 border-amber-500/50 text-amber-400"
                                    : "bg-zinc-800/50 border-white/10 text-zinc-400 hover:border-amber-500/30"
                            )}
                        >
                            {isRecruiterMode ? (
                                <>
                                    <Crown className="w-4 h-4" />
                                    <span className="text-sm font-medium font-mono">RECRUITER MODE</span>
                                    <ToggleRight className="w-5 h-5" />
                                </>
                            ) : (
                                <>
                                    <Eye className="w-4 h-4" />
                                    <span className="text-sm font-medium font-mono">SWITCH TO RECRUITER</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="pt-24 pb-12 px-6">
                    {isRecruiterMode ? (
                        // RECRUITER VIEW - Transcription
                        <div className="max-w-4xl mx-auto">
                            {/* Recruiter Banner */}
                            <div className="mb-8 p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Crown className="w-5 h-5 text-amber-400" />
                                    <div>
                                        <p className="text-amber-400 font-medium">Recruiter View Active</p>
                                        <p className="text-zinc-500 text-sm">Viewing full interview transcription and analysis.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Transcription Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-[#00E5FF]/20 to-cyan-600/10 border border-[#00E5FF]/30">
                                    <MessageSquare className="w-5 h-5 text-[#00E5FF]" />
                                </div>
                                <div>
                                    <h2 className="text-white font-semibold text-lg">Interview Transcription</h2>
                                    <p className="text-zinc-500 text-sm font-mono">{mockTranscript.length} messages</p>
                                </div>
                            </div>

                            {/* Transcription Log */}
                            <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border border-white/10 rounded-xl p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                                {mockTranscript.map((entry, i) => (
                                    <div key={i} className={clsx(
                                        "p-4 rounded-lg",
                                        entry.speaker === "AGENT"
                                            ? "bg-[#00E5FF]/5 border border-[#00E5FF]/10"
                                            : "bg-zinc-800/50 border border-white/5"
                                    )}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={clsx(
                                                "w-6 h-6 rounded-full flex items-center justify-center",
                                                entry.speaker === "AGENT"
                                                    ? "bg-[#00E5FF]/20"
                                                    : "bg-zinc-700"
                                            )}>
                                                {entry.speaker === "AGENT" ? (
                                                    <Cpu className="w-3 h-3 text-[#00E5FF]" />
                                                ) : (
                                                    <User className="w-3 h-3 text-zinc-400" />
                                                )}
                                            </div>
                                            <span className={clsx(
                                                "text-xs font-mono font-bold",
                                                entry.speaker === "AGENT" ? "text-[#00E5FF]" : "text-zinc-400"
                                            )}>
                                                {entry.speaker}
                                            </span>
                                            <span className="text-zinc-600 text-xs font-mono">{entry.timestamp}</span>
                                        </div>
                                        <p className="text-zinc-300 text-sm ml-8">{entry.text}</p>
                                    </div>
                                ))}
                            </div>

                            {/* View Full Report Button */}
                            <div className="mt-6">
                                <button
                                    onClick={() => router.push('/report/demo')}
                                    className="w-full px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-mono font-bold tracking-wider hover:from-amber-400 hover:to-amber-500 transition-all rounded-lg shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-3"
                                >
                                    <Download className="w-5 h-5" />
                                    VIEW FULL FSIR REPORT
                                </button>
                            </div>
                        </div>
                    ) : (
                        // CANDIDATE VIEW - Session Ended
                        <div className="max-w-md mx-auto text-center">
                            <div className="text-red-500 font-mono text-2xl tracking-[0.2em] animate-pulse mb-4">
                                SESSION TERMINATED
                            </div>
                            <div className="text-zinc-500 font-mono text-sm mb-8">
                                The neural link has been severed. Report generation is in progress.
                            </div>

                            <button
                                onClick={() => router.push('/report/demo')}
                                className="px-8 py-3 bg-[#00E5FF] text-black font-mono font-bold tracking-wider hover:bg-[#00E5FF]/80 transition-all rounded shadow-[0_0_20px_rgba(0,229,255,0.3)] flex items-center gap-2 mx-auto mb-6"
                            >
                                <Download className="w-5 h-5" />
                                VIEW FSIR REPORT
                            </button>

                            <button
                                onClick={() => window.location.reload()}
                                className="text-zinc-600 font-mono text-xs hover:text-white transition-colors"
                            >
                                [ RE-INITIALIZE LINK ]
                            </button>

                            {/* Hint to switch to recruiter mode */}
                            <div className="mt-12 p-4 border border-dashed border-amber-500/30 rounded-lg">
                                <p className="text-zinc-600 font-mono text-xs mb-2">For Judges / Recruiters:</p>
                                <p className="text-amber-400/80 font-mono text-xs">
                                    Click "SWITCH TO RECRUITER" in the top right to view transcription
                                </p>
                            </div>
                        </div>
                    )}
                </div>
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
            video={true}
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
