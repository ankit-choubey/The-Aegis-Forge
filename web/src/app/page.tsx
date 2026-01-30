"use client";

import { LiveKitRoom, RoomAudioRenderer, StartAudio, useConnectionState } from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Avatar from "@/components/Avatar";
import Mole from "@/components/Mole";
import { useFaceLogic } from "@/hooks/useFaceLogic";

const Terminal = dynamic(() => import("@/components/Terminal"), { ssr: false });

// Helper component to display connection state
function ConnectionIndicator() {
    const state = useConnectionState();
    return (
        <div className="absolute bottom-2 left-2 text-[10px] text-zinc-700 font-mono z-50">
            STATUS: {state?.toUpperCase() || 'UNKNOWN'}
        </div>
    );
}

export default function Home() {
    const [token, setToken] = useState("");

    // Activate Face Logic
    useFaceLogic((idle) => {
        // Optional: Trigger additional idle effects here
        console.log("Idle State:", idle);
    });

    useEffect(() => {
        const fetchToken = async () => {
            try {
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

    if (token === "") {
        return <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center text-cyan-500 font-mono animate-pulse">Initializing Aegis Forge...</div>;
    }

    return (
        <LiveKitRoom
            video={false}
            audio={true}
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            connect={true}
            data-lk-theme="default"
            className="h-screen w-screen flex flex-col bg-zinc-950 text-white overflow-hidden font-sans"
        >
            {/* Invisible Audio Renderer for incoming agent voice */}
            <RoomAudioRenderer />

            {/* Audio Context Starter (Crucial for browsers) */}
            <StartAudio label="INITIALIZE LINK" className="!bg-cyan-600 !text-white !font-mono !uppercase !tracking-widest !rounded-none !border-none hover:!bg-cyan-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100]" />

            {/* Top: The Looking Glass (Avatar) */}
            <div className="h-[40%] relative border-b border-zinc-800 shadow-2xl z-10">
                <Avatar />
            </div>

            {/* Bottom: The Terminal */}
            <div className="h-[60%] relative z-0">
                <Terminal />
            </div>

            {/* Overlay: The Mole */}
            <Mole />

            <ConnectionIndicator />
        </LiveKitRoom>
    );
}
