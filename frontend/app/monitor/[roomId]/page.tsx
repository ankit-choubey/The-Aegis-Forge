"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
    LiveKitRoom,
    RoomAudioRenderer,
    VideoTrack,
    useTracks,
    useRoomContext,
    useDataChannel,
    useConnectionState
} from "@livekit/components-react";
import { Track, ConnectionState } from "livekit-client";
import {
    Shield, Mic, MicOff, Video, VideoOff,
    MessageSquare, AlertTriangle, Power, Crown,
    Loader2, Hash, User
} from "lucide-react";
import clsx from "clsx";

// ============================================
// MONITOR CONTENT (Inside Room)
// ============================================
const MonitorContent = ({ candidateId }: { candidateId: string }) => {
    const room = useRoomContext();
    const connectionState = useConnectionState();
    const isConnected = connectionState === ConnectionState.Connected;

    const router = useRouter();
    const [isTakingOver, setIsTakingOver] = useState(false);
    const [isMicOn, setIsMicOn] = useState(false);
    const [isCamOn, setIsCamOn] = useState(false);
    const [messages, setMessages] = useState<{ sender: string, text: string }[]>([]);

    // Get Candidate's Tracks (Camera + Screen)
    const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare], { onlySubscribed: true });

    const candidateVideo = tracks.find(t => !t.participant.isLocal && t.source === Track.Source.Camera);
    const candidateScreen = tracks.find(t => !t.participant.isLocal && t.source === Track.Source.ScreenShare);

    // Listen for Transcripts & History Sync
    const [hasSyncedHistory, setHasSyncedHistory] = useState(false);

    useEffect(() => {
        if (!room) return;

        const handleData = (payload: Uint8Array, participant: any) => {
            try {
                const text = new TextDecoder().decode(payload);
                const data = JSON.parse(text);

                if (data.type === "TRANSCRIPT") {
                    setMessages(prev => [...prev, { sender: data.sender || "UNKNOWN", text: data.text }]);
                }

                // HISTORY SYNC (P2P)
                if (data.type === "HISTORY_SYNC") {
                    if (!hasSyncedHistory && data.history && Array.isArray(data.history)) {
                        console.log("[AEGIS MONITOR] Received History Sync:", data.history.length);
                        setMessages(data.history); // Sync full history
                        setHasSyncedHistory(true);
                    }
                }
            } catch (e) {
                console.error("Failed to parse data message", e);
            }
        };

        room.on('dataReceived', handleData);

        // Request history on connect
        const timer = setTimeout(async () => {
            if (room.state === 'connected' && messages.length === 0) {
                console.log("[AEGIS MONITOR] Requesting History...");
                const payload = JSON.stringify({ type: "REQUEST_HISTORY" });
                const encoder = new TextEncoder();
                await room.localParticipant.publishData(encoder.encode(payload), { reliable: true });
            }
        }, 1500);

        return () => {
            room.off('dataReceived', handleData);
            clearTimeout(timer);
        };
    }, [room, hasSyncedHistory, messages.length]);

    // THE KILL SWITCH
    // THE KILL SWITCH - Now Redirects to Main Interview
    const handleTakeOver = async () => {
        if (!room || !isConnected) {
            console.warn("Takeover blocked: Room not connected");
            return;
        }

        setIsTakingOver(true);

        try {
            console.log("[AEGIS MONITOR] Switching to Active Recruiter Mode...");
            // Redirect to Main Interview Room
            // Pass takeover=true to trigger auto-takeover on join
            router.push(`/interview/room?role=recruiter&takeover=true&candidate=${encodeURIComponent(candidateId)}&room=${room.name}`);
        } catch (e) {
            console.error("Takeover redirect failed:", e);
            setIsTakingOver(false);
        }
    };

    const toggleMic = async () => {
        if (!room.localParticipant) return;
        const newState = !isMicOn;
        await room.localParticipant.setMicrophoneEnabled(newState);
        setIsMicOn(newState);
    };

    const toggleCam = async () => {
        if (!room.localParticipant) return;
        const newState = !isCamOn;
        await room.localParticipant.setCameraEnabled(newState);
        setIsCamOn(newState);
    };

    return (
        <div className="h-screen bg-[#050508] text-white flex flex-col">
            {/* Header */}
            <div className="h-16 border-b border-white/10 bg-black/50 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                        <Shield className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <h1 className="font-mono font-bold tracking-wider text-amber-500">AEGIS_OVERWATCH</h1>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                            <span>ROOM: {room.name || "Detecting..."}</span>
                            <span className="w-px h-3 bg-zinc-700 mx-1" />
                            <span>PARTICIPANTS: {room.numParticipants}</span>
                            <span className="w-px h-3 bg-zinc-700 mx-1" />
                            <span className={clsx(
                                "font-bold",
                                isConnected ? "text-green-500" : "text-amber-500 animate-pulse"
                            )}>
                                {connectionState}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {isTakingOver ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg animate-pulse">
                            <Video className="w-4 h-4 text-red-500" />
                            <span className="text-red-500 font-mono text-xs font-bold">BROADCASTING</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 border border-white/10 rounded-lg">
                            <VideoOff className="w-4 h-4 text-zinc-500" />
                            <span className="text-zinc-500 font-mono text-xs">SILENT OBSERVER</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 grid grid-cols-12 min-h-0">
                {/* LEFT: Candidate View (8 cols) */}
                <div className="col-span-8 bg-zinc-900/50 relative border-r border-white/10">
                    {candidateVideo ? (
                        <VideoTrack trackRef={candidateVideo} className="w-full h-full object-contain" />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <Loader2 className="w-10 h-10 text-zinc-600 animate-spin mx-auto mb-4" />
                                <p className="text-zinc-500 font-mono text-sm">WAITING FOR CANDIDATE SIGNAL...</p>
                                <p className="text-zinc-700 font-mono text-xs mt-2">
                                    Target: {candidateId}<br />
                                    Tracks Found: {tracks.length}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Candidate Screen PIP (if exists) */}
                    {candidateScreen && (
                        <div className="absolute bottom-4 right-4 w-64 aspect-video bg-black border border-white/10 rounded shadow-xl overflow-hidden">
                            <VideoTrack trackRef={candidateScreen} className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>

                {/* RIGHT: Agent Controls & Log (4 cols) */}
                <div className="col-span-4 flex flex-col bg-[#0a0a0f]">
                    {/* Transcript Log */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={clsx(
                                "p-3 rounded-lg text-sm border",
                                msg.sender === "YOU" || msg.sender === "CANDIDATE"
                                    ? "bg-zinc-800/50 border-white/5 ml-8"
                                    : "bg-blue-500/10 border-blue-500/20 mr-8"
                            )}>
                                <div className="text-xs font-mono mb-1 opacity-50 flex items-center gap-2">
                                    {msg.sender === "AGENT" && <Crown className="w-3 h-3" />}
                                    {msg.sender}
                                </div>
                                <p className="text-zinc-300 leading-relaxed">{msg.text}</p>
                            </div>
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="p-6 border-t border-white/10 bg-black/20">
                        {!isTakingOver ? (
                            <button
                                onClick={handleTakeOver}
                                disabled={!isConnected}
                                className={clsx(
                                    "w-full group relative overflow-hidden text-white p-6 rounded-xl transition-all",
                                    isConnected
                                        ? "bg-red-500 hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.2)] hover:shadow-[0_0_50px_rgba(239,68,68,0.4)]"
                                        : "bg-zinc-800 cursor-not-allowed opacity-50"
                                )}
                            >
                                <div className="flex items-center justify-center gap-3 relative z-10">
                                    {isConnected ? <Power className="w-6 h-6" /> : <Loader2 className="w-6 h-6 animate-spin" />}
                                    <span className="font-mono font-bold text-lg tracking-widest">
                                        {isConnected ? "INITIATE TAKEOVER" : "CONNECTING..."}
                                    </span>
                                </div>
                                {isConnected && (
                                    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.1)_10px,rgba(0,0,0,0.1)_20px)] opacity-50" />
                                )}
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-amber-500 font-bold font-mono text-sm mb-1">DATA LINK ESTABLISHED</p>
                                        <p className="text-zinc-400 text-xs">You are now broadcasting directly to the candidate. AI has been suspended.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={toggleMic}
                                        className={clsx(
                                            "p-4 rounded-lg flex flex-col items-center gap-2 border transition-all",
                                            isMicOn ? "bg-zinc-800 border-white/10 hover:bg-zinc-700" : "bg-red-500/10 border-red-500/30 text-red-400"
                                        )}
                                    >
                                        {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                                        <span className="font-mono text-xs">{isMicOn ? "MUTE" : "UNMUTE"}</span>
                                    </button>
                                    <button
                                        onClick={toggleCam}
                                        className={clsx(
                                            "p-4 rounded-lg flex flex-col items-center gap-2 border transition-all",
                                            isCamOn ? "bg-zinc-800 border-white/10 hover:bg-zinc-700" : "bg-red-500/10 border-red-500/30 text-red-400"
                                        )}
                                    >
                                        {isCamOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                                        <span className="font-mono text-xs">{isCamOn ? "STOP VIDEO" : "START VIDEO"}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <RoomAudioRenderer />
        </div>
    );
};

// ============================================
// MAIN PAGE (Wrapper)
// ============================================

// ============================================
// MONITOR WRAPPER (Handles Suspense & Params)
// ============================================
const MonitorClient = () => {
    const params = useParams();
    const roomId = params?.roomId as string; // Access route param via hook

    const searchParams = useSearchParams();
    const candidateId = searchParams.get('candidate') || "Unknown Candidate";

    // In real app, fetch token relative to roomId + identity="recruiter"
    const [token, setToken] = useState("");

    useEffect(() => {
        if (!roomId) return;

        (async () => {
            try {
                // Use INTERNAL Next.js API route for token generation
                const resp = await fetch(`/api/livekit/token?room=${roomId}&username=recruiter-${Date.now()}`);
                if (!resp.ok) throw new Error("Failed to fetch token");
                const data = await resp.json();
                setToken(data.token);
            } catch (e) {
                console.error("Token fetch error:", e);
            }
        })();
    }, [roomId]);

    if (!roomId) return null;

    if (!token) return (
        <div className="h-screen w-screen bg-[#050508] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            <p className="mt-2 text-zinc-500 font-mono text-xs">JOINING SECURE CHANNEL...</p>
        </div>
    );

    return (
        <LiveKitRoom
            video={false} // Start silent
            audio={false} // Start silent
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            data-lk-theme="default"
            connect={true}
        >
            <MonitorContent candidateId={candidateId} />
        </LiveKitRoom>
    );
};

export default function MonitorPage() {
    return (
        <Suspense fallback={
            <div className="h-screen w-screen bg-[#050508] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
        }>
            <MonitorClient />
        </Suspense>
    );
}
