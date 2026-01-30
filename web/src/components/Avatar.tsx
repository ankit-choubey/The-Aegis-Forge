"use client";

import { useEffect, useRef, useState } from 'react';
import { useTracks, AudioTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';
import Image from 'next/image';

export default function Avatar() {
    const [volume, setVolume] = useState(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Get remote tracks
    const tracks = useTracks([Track.Source.Microphone]);
    // Find the agent's audio track reference (for the AudioTrack component)
    const agentTrackRef = tracks.find(t =>
        t.participant.identity !== 'candidate' &&
        (t.source === Track.Source.Microphone || t.track?.kind === 'audio')
    );

    useEffect(() => {
        if (agentTrackRef && agentTrackRef.track) {
            console.log("Audio Visualizer: Agent Audio Find:", agentTrackRef.participant.identity);

            const track = agentTrackRef.track;
            // Handle both standard Track and RemoteAudioTrack
            const mediaStreamTrack = (track as any).mediaStreamTrack || (track as any).receiver?.track;

            if (!mediaStreamTrack) {
                console.warn("Audio Visualizer: No MediaStreamTrack found");
                return;
            }

            try {
                // Initialize AudioContext lazily
                if (!audioContextRef.current) {
                    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
                    if (AudioContextClass) {
                        audioContextRef.current = new AudioContextClass();
                    } else {
                        console.warn("Audio Visualizer: AudioContext not supported");
                        return;
                    }
                }

                const ctx = audioContextRef.current;

                // Safely resume context
                if (ctx.state === 'suspended') {
                    ctx.resume().catch(e => console.warn("Audio Visualizer: Context resume failed (autoplay policy):", e));
                }

                // Disconnect old nodes if they exist
                if (sourceRef.current) {
                    try { sourceRef.current.disconnect(); } catch (e) { }
                }

                if (!analyserRef.current) {
                    const analyser = ctx.createAnalyser();
                    analyser.fftSize = 256;
                    analyser.smoothingTimeConstant = 0.5;
                    analyserRef.current = analyser;
                }
                const analyser = analyserRef.current;

                const mediaStream = new MediaStream([mediaStreamTrack]);
                const source = ctx.createMediaStreamSource(mediaStream);
                source.connect(analyser);
                // Note: We DO NOT connect to destination here because the <AudioTrack /> component 
                // below handles the actual playback. Connecting here would cause echo/double audio.
                // analyser.connect(ctx.destination);

                sourceRef.current = source;

                const updateVolume = () => {
                    if (!analyser) return;
                    const dataArray = new Uint8Array(analyser.frequencyBinCount);
                    analyser.getByteFrequencyData(dataArray);

                    // Calculate average volume
                    let sum = 0;
                    const binCount = dataArray.length;
                    for (let i = 0; i < binCount; i++) {
                        sum += dataArray[i];
                    }
                    const average = sum / binCount;

                    // Normalize to a 0-1 range roughly, heavily weighted
                    const normVol = Math.min(average / 100, 1);

                    setVolume(normVol);
                    animationFrameRef.current = requestAnimationFrame(updateVolume);
                };

                updateVolume();

            } catch (error) {
                console.error("Audio Visualizer Error:", error);
            }
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (sourceRef.current) {
                try { sourceRef.current.disconnect(); } catch (e) { }
            }
        };
    }, [agentTrackRef]);

    // Calculate scale scale based on volume
    // Base scale 1.0, max scale 1.15
    const scale = 1 + (volume * 0.15);

    // Dynamic glow opacity
    const glowOpacity = 0.3 + (volume * 0.7);

    return (
        <div className="relative w-full h-full flex items-center justify-center bg-zinc-900 border-b border-zinc-800 overflow-hidden">

            {/* LiveKit Audio Track - Handles Playback */}
            {agentTrackRef && <AudioTrack trackRef={agentTrackRef} />}

            {/* Background Ambient Effect */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                    className="w-64 h-64 rounded-full bg-cyan-500/10 blur-[60px] transition-all duration-100 ease-out"
                    style={{
                        opacity: glowOpacity,
                        transform: `scale(${1 + volume * 0.5})`
                    }}
                ></div>

                <div
                    className="absolute w-48 h-48 rounded-full bg-blue-600/10 blur-[40px] transition-all duration-100 ease-out"
                    style={{
                        opacity: glowOpacity,
                        transform: `scale(${1 + volume * 0.3})`
                    }}
                ></div>
            </div>

            {/* Avatar Image container with dynamic scaling */}
            <div
                className="relative z-10 w-64 h-64 transition-transform duration-75 ease-out will-change-transform"
                style={{ transform: `scale(${scale})` }}
            >
                {/* 
                  Using DiceBear Avataaars. 
                  Seed 'Aegis' gives a consistent look. 
                  You can change the seed to anything.
                */}
                <img
                    src="https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&backgroundColor=transparent"
                    alt="AI Interviewer"
                    className="w-full h-full object-contain drop-shadow-2xl"
                />
            </div>

            {/* Status Indicators */}
            <div className="absolute top-6 right-6 flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full shadow-[0_0_10px] transition-colors duration-300 ${volume > 0.05 ? 'bg-cyan-400 shadow-cyan-400' : 'bg-green-500 shadow-green-500'}`}></div>
                    <span className="text-xs font-mono text-zinc-500 uppercase">
                        {volume > 0.05 ? 'Voice Active' : 'Online'}
                    </span>
                </div>
            </div>

            {/* Optional: Add a subtle Scanline effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20"></div>
        </div>
    );
}
