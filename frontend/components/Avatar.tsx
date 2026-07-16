"use client";

import { useEffect, useRef, useState } from 'react';
import { useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';

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
        (t.source === Track.Source.Microphone || t.publication?.track?.kind === 'audio')
    );

    useEffect(() => {
        if (agentTrackRef && agentTrackRef.publication?.track) {
            console.log("Audio Visualizer: Agent Audio Find:", agentTrackRef.participant.identity);

            const track = agentTrackRef.publication.track;
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

    return (
        <div className="relative w-full h-full flex items-center justify-center bg-[#09090b] border-b border-white/5 overflow-hidden">
            {/* Background Ambient Glow Effect */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                    className="w-80 h-80 rounded-full bg-cyan-500/10 blur-[80px] transition-all duration-100 ease-out"
                    style={{
                        opacity: 0.3 + volume * 0.7,
                        transform: `scale(${1 + volume * 0.6})`
                    }}
                />
                <div
                    className="absolute w-64 h-64 rounded-full bg-blue-600/10 blur-[60px] transition-all duration-100 ease-out"
                    style={{
                        opacity: 0.2 + volume * 0.8,
                        transform: `scale(${1 + volume * 0.4})`
                    }}
                />
            </div>

            {/* Pulsing AI Core (Orb) */}
            <div 
                className="relative z-10 flex items-center justify-center transition-transform duration-75 ease-out will-change-transform"
                style={{ transform: `scale(${1 + volume * 0.2})` }}
            >
                {/* Outer Spinning Dashed Ring */}
                <div className="absolute w-56 h-56 rounded-full border border-dashed border-cyan-500/30 animate-[spin_20s_linear_infinite]" />
                
                {/* Inner Spinning Dotted Ring */}
                <div className="absolute w-48 h-48 rounded-full border border-dotted border-blue-400/40 animate-[spin_10s_linear_infinite_reverse]" />
                
                {/* Core Glowing Orb */}
                <div 
                    className="w-36 h-36 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.5)] transition-shadow duration-100 relative overflow-hidden"
                    style={{
                        boxShadow: `0 0 ${40 + volume * 60}px rgba(6,182,212,${0.5 + volume * 0.5})`
                    }}
                >
                    {/* Inner glowing particle container */}
                    <div className="absolute inset-1.5 rounded-full bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center border border-white/10">
                        {/* Dynamic Voice Pulse Circle */}
                        <div 
                            className="absolute rounded-full bg-cyan-400/10 transition-all duration-75"
                            style={{
                                width: `${40 + volume * 100}%`,
                                height: `${40 + volume * 100}%`,
                            }}
                        />
                        <span className="relative z-10 text-cyan-400 font-mono text-sm tracking-[0.3em] font-bold animate-pulse">
                            AEGIS
                        </span>
                        <span className="relative z-10 text-[9px] font-mono text-zinc-500 mt-1.5 uppercase tracking-widest">
                            {volume > 0.05 ? "speaking" : "listening"}
                        </span>
                    </div>
                </div>
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

            {/* Scanline overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20"></div>
        </div>
    );
}
