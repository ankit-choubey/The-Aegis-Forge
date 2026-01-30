# Aegis-Forge Frontend Codebase

**For:** Utkarsh (AI/Backend Developer)  
**From:** Devraj (Frontend Developer)  
**Date:** January 30, 2026

Complete frontend code for integrating notepad features and backend connectivity.

---

## Project Structure

```
aegis-landing/
├── app/
│   ├── api/
│   │   └── livekit/
│   │       └── token/
│   │           └── route.ts          # LiveKit token generation API
│   ├── interview/
│   │   └── room/
│   │       └── page.tsx              # Interview room (main feature)
│   ├── features/                     # Feature pages
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Homepage
├── components/
│   ├── layout/
│   │   └── Navbar.tsx
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── Footer.tsx
│   │   └── ...
│   └── ui/
│       └── ThemeToggle.tsx
├── .env.local                        # Environment variables
└── package.json
```

---

## 1. package.json

```json
{
  "name": "aegis-landing",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@livekit/components-react": "^2.9.19",
    "clsx": "^2.1.1",
    "framer-motion": "^12.29.2",
    "livekit-client": "^2.17.0",
    "livekit-server-sdk": "^2.15.0",
    "lucide-react": "^0.563.0",
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "tailwind-merge": "^3.4.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

---

## 2. .env.local (Environment Variables)

```env
LIVEKIT_URL=wss://ai-interviewer-b5tsniq0.livekit.cloud
LIVEKIT_API_KEY=APIsvYTegD3nqmA
LIVEKIT_API_SECRET=YYBjwyKfeaDxyI0lGqH1eDpJElWjVW8eiM3esazXh3vC

# Fixed room name - Agent should join this exact room
NEXT_PUBLIC_LIVEKIT_ROOM=aegis-interview-room
```

---

## 3. app/layout.tsx (Root Layout)

```tsx
import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk"
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "Aegis-Forge | Agentic Interview Protocol",
  description: "Automated hiring pipeline with military-grade precision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans bg-black antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

---

## 4. app/globals.css (Global Styles)

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #0f172a;
  --card: #ffffff;
  --card-foreground: #0f172a;
  --border: #e2e8f0;
  --muted: #f1f5f9;
  --primary: #06b6d4;
}

.dark {
  --background: #000000;
  --foreground: #ffffff;
  --card: #0a0a0a;
  --card-foreground: #ffffff;
  --border: #333333;
  --muted: #1a1a1a;
  --primary: #06b6d4;
}

/* Interview Room: Void Dark Theme */
:root {
  --void-bg: #09090b;
  --void-card: #0c0c0e;
  --neon-cyan: #00E5FF;
  --border-subtle: rgba(255, 255, 255, 0.05);
  --border-low: rgba(255, 255, 255, 0.1);
}

/* Audio Visualizer Animation */
@keyframes audioBar {
  0%, 100% { transform: scaleY(0.3); }
  50% { transform: scaleY(1); }
}

.audio-bar {
  animation: audioBar 0.5s ease-in-out infinite;
}

/* Pulsing Dot */
@keyframes pulse-glow {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 8px currentColor;
  }
  50% {
    opacity: 0.6;
    box-shadow: 0 0 16px currentColor;
  }
}

.pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Scanning Animation */
@keyframes scan {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

.scanning-line {
  animation: scan 2s linear infinite;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-border: var(--border);
  --color-muted: var(--muted);
  --color-primary: var(--primary);
  --font-sans: var(--font-inter);
  --font-display: var(--font-space-grotesk);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-inter), sans-serif;
  transition: background-color 0.3s, color 0.3s;
}

.mask-linear-gradient {
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}
```

---

## 5. app/api/livekit/token/route.ts (Token API)

```typescript
import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const room = req.nextUrl.searchParams.get('room');
    const username = req.nextUrl.searchParams.get('username');

    if (!room) {
        return NextResponse.json(
            { error: 'Missing "room" query parameter' },
            { status: 400 }
        );
    }

    if (!username) {
        return NextResponse.json(
            { error: 'Missing "username" query parameter' },
            { status: 400 }
        );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
        return NextResponse.json(
            { error: 'Server misconfigured: missing LiveKit credentials' },
            { status: 500 }
        );
    }

    const at = new AccessToken(apiKey, apiSecret, {
        identity: username,
        ttl: '2h', // Token valid for 2 hours
    });

    at.addGrant({
        roomJoin: true,
        room: room,
        canPublish: true,
        canSubscribe: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({
        token,
        wsUrl,
        room,
    });
}
```

---

## 6. app/interview/room/page.tsx (MAIN INTERVIEW PAGE)

This is the core interview room with all components.

```tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Mic, MicOff, Video, VideoOff, PhoneOff,
    Settings, Shield, Wifi, Terminal, Play, Square, Radio,
    ChevronDown, ChevronUp, Loader2, Code, Laptop,
    Activity, Volume2, Camera, Send, Zap, Cpu, Clock
} from "lucide-react";
import clsx from "clsx";
import {
    LiveKitRoom,
    VideoTrack,
    useRemoteParticipants,
    useLocalParticipant,
    useTracks,
    RoomAudioRenderer,
    useMediaDeviceSelect
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

// ============================================
// COMPONENTS
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
                        {/* Animated Avatar */}
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
        <div className="flex-1 bg-[#0a0a0f] flex flex-col min-h-0 border-t border-[#00E5FF]/20">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-[#00E5FF]/5 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-[#00E5FF]" />
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
            <div className="flex-1 flex overflow-hidden">
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
    
    const cameraTracks = useTracks([Track.Source.Camera], { onlyLocal: true });
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
// ROOM CONTENT WRAPPER
// ============================================
const RoomContent = ({ onEndCall }: { onEndCall: () => void }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", timestamp: new Date().toLocaleTimeString(), sender: "SYSTEM", text: "Neural link established. Waiting for AI interviewer..." }
    ]);
    const [msgInput, setMsgInput] = useState("");

    const getTimestamp = () => new Date().toLocaleTimeString();

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

    const handleCodeSubmit = (code: string) => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            timestamp: getTimestamp(),
            sender: "CODE",
            text: code
        }]);
    };

    return (
        <div className="grid grid-cols-12 h-screen bg-[#050508] text-zinc-400 overflow-hidden font-sans">
            <RoomAudioRenderer />

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
        </div>
    );
};

// ============================================
// MAIN PAGE
// ============================================
export default function InterviewRoomPage() {
    const router = useRouter();
    const [token, setToken] = useState("");
    const [wsUrl, setWsUrl] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const room = process.env.NEXT_PUBLIC_LIVEKIT_ROOM || "aegis-interview-room";
                const username = "candidate-" + Math.random().toString(36).slice(2, 7);

                const res = await fetch(`/api/livekit/token?room=${room}&username=${username}`);
                const data = await res.json();

                if (data.error) {
                    setError(data.error);
                } else {
                    setToken(data.token);
                    setWsUrl(data.wsUrl);
                }
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setIsConnecting(false);
            }
        };
        init();
    }, []);

    // Loading State
    if (isConnecting) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#050508]">
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 rounded-full border-2 border-[#00E5FF]/20 animate-ping" />
                    <div className="absolute inset-2 rounded-full border border-[#00E5FF]/40 animate-pulse" />
                    <div className="absolute inset-4 rounded-full bg-[#00E5FF]/10 flex items-center justify-center">
                        <Loader2 className="w-10 h-10 text-[#00E5FF] animate-spin" />
                    </div>
                </div>
                <div className="text-[#00E5FF] font-mono text-lg tracking-[0.3em] animate-pulse mb-2">
                    INITIALIZING
                </div>
                <div className="text-zinc-600 font-mono text-xs tracking-widest">
                    ESTABLISHING NEURAL UPLINK...
                </div>
            </div>
        );
    }

    // Error State
    if (error || !token) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#050508]">
                <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
                    <Wifi className="w-10 h-10 text-red-500" />
                </div>
                <div className="text-red-500 font-mono text-lg tracking-[0.2em] mb-2">
                    CONNECTION FAILURE
                </div>
                <div className="text-zinc-600 font-mono text-xs mb-6 max-w-md text-center">
                    {error || "Unable to establish connection with the interview server."}
                </div>
                <button
                    onClick={() => router.push('/')}
                    className="px-6 py-3 border border-zinc-700 text-zinc-400 hover:text-white hover:border-white transition-all font-mono text-sm rounded"
                >
                    RETURN TO LOBBY
                </button>
            </div>
        );
    }

    // Connected State
    return (
        <LiveKitRoom
            token={token}
            serverUrl={wsUrl}
            connect={true}
            video={true}
            audio={true}
            onDisconnected={() => console.log("Disconnected from server")}
        >
            <RoomContent onEndCall={() => router.push('/')} />
        </LiveKitRoom>
    );
}
```

---

## 7. components/sections/Hero.tsx (Landing Page Hero)

```tsx
"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Play } from "lucide-react";
import Link from "next/link";
import React from "react";

export const Hero = () => {
    return (
        <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center pt-20">

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center space-x-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full px-3 py-1 mb-8 backdrop-blur-sm"
            >
                <span className="flex h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></span>
                <span className="text-sm text-cyan-700 dark:text-cyan-100/80 tracking-wider font-mono">SYSTEM ONLINE V2.4</span>
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl md:text-8xl font-bold tracking-tight mb-6 font-[family-name:var(--font-space-grotesk)] text-black dark:text-white drop-shadow-md dark:drop-shadow-none"
            >
                The Executable <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                    Interview Protocol
                </span>
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-2xl text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed"
            >
                Turn conversations into structured data with Agentic Proctoring. <br className="hidden md:block" />
                Automate the hiring pipeline with military-grade precision.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col md:flex-row items-center gap-4"
            >
                <Link href="/interview/room">
                    <button className="group relative px-8 py-4 bg-cyan-500 text-black font-bold rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)]">
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 transform skew-y-12"></div>
                        <span className="relative flex items-center gap-2">
                            Deploy Agent <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </span>
                    </button>
                </Link>

                <button className="px-8 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-md">
                    View Documentation <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
            </motion.div>
        </section>
    );
};
```

---

## 8. components/layout/Navbar.tsx

```tsx
"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { motion } from "framer-motion";

export const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-border">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-bold text-white">
                        A
                    </div>
                    <span className="font-bold text-xl font-[family-name:var(--font-space-grotesk)] text-foreground">
                        Aegis-Forge
                    </span>
                </Link>

                {/* Links (Desktop) */}
                <div className="hidden md:flex items-center gap-8 font-medium text-sm text-foreground/80">
                    <a href="/features" className="hover:text-primary transition-colors">Features</a>
                    <a href="#solutions" className="hover:text-primary transition-colors">Solutions</a>
                    <a href="#protocol" className="hover:text-primary transition-colors">Protocol</a>
                    <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <a href="#" className="hidden md:block text-sm font-medium hover:text-primary">
                        Log In
                    </a>
                    <ThemeToggle />
                    <button className="bg-foreground text-background px-5 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-opacity">
                        Initialize
                    </button>
                </div>
            </div>
        </nav>
    );
};
```

---

## Integration Points for Notepad Feature

### Where to Add Notepad:

1. **Option A: Add to Zone C (Telemetry Panel)**
   - Add a new expandable section below Hardware Override
   - Similar pattern to existing components

2. **Option B: Add as Tab in Zone B**
   - Create tabbed interface: "Transcript" | "Notepad"
   - Switch between views

3. **Option C: Overlay/Modal**
   - Floating notepad that can be toggled

### Suggested Notepad Component Interface:

```tsx
interface NotepadProps {
    onSave?: (notes: string) => void;
    initialNotes?: string;
}

const Notepad = ({ onSave, initialNotes = "" }: NotepadProps) => {
    const [notes, setNotes] = useState(initialNotes);
    // ... implementation
};
```

### Data Flow:
- Notes should be saved to session state
- Optionally sync with backend via API
- Autosave every 30 seconds

---

**Contact:** Devraj (Frontend) | Utkarsh (Backend/AI) | Sankalp (Backend API)
