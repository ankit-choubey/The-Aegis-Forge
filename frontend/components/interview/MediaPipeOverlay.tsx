"use client";

import { useEffect, useRef, useState } from "react";
import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";
import { useLocalParticipant, VideoTrack } from "@livekit/components-react";
import { Track } from "livekit-client";
import { AlertTriangle, type LucideIcon } from "lucide-react";
import { TelemetryPopup } from "./TelemetryPopup";

type BlendshapeCategory = { categoryName: string; score: number };
type MediaPipeSummary = Record<string, unknown>;

declare global {
    interface Window {
        __AEGIS_MEDIAPIPE_SUMMARY?: MediaPipeSummary;
    }
}

export const MediaPipeOverlay = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const landmarkerRef = useRef<FaceLandmarker | null>(null);
    const requestRef = useRef<number>(0);
    const lastVideoTimeRef = useRef<number>(-1);
    const lastFrameTsRef = useRef<number>(0);
    const lastNosePointRef = useRef<{ x: number; y: number } | null>(null);
    const gazeAwayStreakRef = useRef<number>(0);
    const metricsRef = useRef({
        frames: 0,
        eyeContactSum: 0,
        gazeAwaySec: 0,
        suspectedCheating: 0,
        stressPeaks: 0,
        fidgetEvents: 0,
        postureScoreSum: 0,
        emotionCounts: {} as Record<string, number>,
    });

    const activeAlertRef = useRef<string | null>(null);
    const [criticalAlert, setCriticalAlert] = useState<{ text: string; icon: LucideIcon; color: string } | null>(null);

    const updateAlert = (type: string | null, payload?: {text: string; icon: LucideIcon; color: string}) => {
        if (activeAlertRef.current !== type) {
            activeAlertRef.current = type;
            setCriticalAlert(payload || null);
        }
    };

    const updateTelemetrySummary = () => {
        const m = metricsRef.current;
        const frames = Math.max(1, m.frames);
        const durationSec = Math.max(1, (performance.now() - lastFrameTsRef.current) / 1000);
        const dominantEmotion =
            Object.entries(m.emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "neutral";
        const avgEye = m.eyeContactSum / frames;
        const avgPosture = m.postureScoreSum / frames;
        const fidgetPerMin = m.fidgetEvents / (durationSec / 60);
        const engagement = Math.max(0, Math.min(1, 1 - (m.gazeAwaySec / durationSec)));
        const confidence = Math.max(0, Math.min(1, (avgEye + avgPosture) / 2));
        const authenticity = Math.max(0, Math.min(1, 1 - Math.min(1, m.suspectedCheating * 0.2)));

        window.__AEGIS_MEDIAPIPE_SUMMARY = {
            avg_eye_contact_score: avgEye,
            emotion_timeline: [{ timestamp_sec: durationSec, dominant_emotion: dominantEmotion, confidence: 0.8, valence: dominantEmotion === "happy" ? 0.4 : 0.0 }],
            dominant_emotion_overall: dominantEmotion,
            stress_peak_count: m.stressPeaks,
            gaze_deviations: [],
            total_gaze_deviation_sec: m.gazeAwaySec,
            suspected_cheating_events: m.suspectedCheating,
            posture_snapshots: [{ timestamp_sec: durationSec, posture_label: avgPosture >= 0.7 ? "upright" : "slouching", fidget_detected: fidgetPerMin > 3, shoulder_alignment: avgPosture }],
            avg_posture_score: avgPosture,
            fidget_frequency_per_min: fidgetPerMin,
            speech_segments: [],
            avg_words_per_minute: 120,
            total_filler_words: 0,
            avg_pause_before_answer_sec: 1.2,
            longest_silence_sec: 2.5,
            overall_confidence_score: confidence,
            overall_engagement_score: engagement,
            authenticity_score: authenticity,
        };
    };

    const { localParticipant } = useLocalParticipant();
    const videoTrack = Array.from(localParticipant?.videoTrackPublications.values() || [])
        .find(p => p.source === Track.Source.Camera)?.videoTrack;

    useEffect(() => {
        lastFrameTsRef.current = performance.now();
        const originalError = console.error;
        console.error = (...args: unknown[]) => {
            const first = args[0];
            if (typeof first === "string" && first.includes("Created TensorFlow Lite XNNPACK delegate for CPU")) {
                return;
            }
            originalError(...args);
        };
        const initModel = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm"
                );
                
                const landmarker = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
                        delegate: "GPU"
                    },
                    outputFaceBlendshapes: true,
                    runningMode: "VIDEO",
                    numFaces: 2
                });
                
                landmarkerRef.current = landmarker;
                setIsModelLoaded(true);
            } catch (error) {
                console.error("Failed to load FaceLandmarker:", error);
            }
        };
        initModel();

        return () => {
            console.error = originalError;
            if (landmarkerRef.current) {
                landmarkerRef.current.close();
            }
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, []);

    // Detect Tab Switches
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                updateAlert('TAB_SWITCH', {
                    text: "UNAUTHORIZED APP SWITCH DETECTED",
                    icon: AlertTriangle,
                    color: "text-red-500"
                });
            } else if (activeAlertRef.current === 'TAB_SWITCH') {
                updateAlert(null);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, []);

    useEffect(() => {
        if (!isModelLoaded || !videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const predict = async () => {
            if (video.videoWidth > 0 && video.videoHeight > 0) {
                // Ensure canvas matches video dimensions exactly
                if (canvas.width !== video.videoWidth) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                }

                const startTimeMs = performance.now();
                if (lastVideoTimeRef.current !== video.currentTime && landmarkerRef.current) {
                    lastVideoTimeRef.current = video.currentTime;
                    let results: ReturnType<FaceLandmarker["detectForVideo"]> | null = null;
                    try {
                        results = landmarkerRef.current.detectForVideo(video, startTimeMs);
                    } catch (err) {
                        const msg = err instanceof Error ? err.message : String(err);
                        if (!msg.includes("XNNPACK delegate")) {
                            console.warn("MediaPipe detectForVideo failed:", msg);
                        }
                    }
                    if (!results) {
                        requestRef.current = requestAnimationFrame(predict);
                        return;
                    }

                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                        // Alert Logic for Multiple Faces
                        if (results.faceLandmarks.length > 1 && !document.hidden) {
                            updateAlert('MULTIPLE_FACES', {
                                text: "MULTIPLE FACES DETECTED",
                                icon: AlertTriangle,
                                color: "text-red-500"
                            });
                        } else if (activeAlertRef.current === 'MULTIPLE_FACES') {
                            updateAlert(null);
                        }

                        const landmarks = results.faceLandmarks[0];
                        const now = performance.now();
                        const deltaSec = Math.max(0, (now - lastFrameTsRef.current) / 1000);
                        const nose = landmarks[1] || landmarks[4] || landmarks[168];

                        // Basic gaze/eye-contact estimation from nose horizontal offset.
                        let eyeContactScore = 0.5;
                        if (nose) {
                            eyeContactScore = Math.max(0, 1 - Math.min(1, Math.abs(nose.x - 0.5) * 2.2));
                        }
                        metricsRef.current.frames += 1;
                        metricsRef.current.eyeContactSum += eyeContactScore;

                        if (eyeContactScore < 0.35) {
                            gazeAwayStreakRef.current += 1;
                            metricsRef.current.gazeAwaySec += deltaSec;
                            if (gazeAwayStreakRef.current === 90) {
                                metricsRef.current.suspectedCheating += 1;
                            }
                        } else {
                            gazeAwayStreakRef.current = 0;
                        }

                        if (nose && lastNosePointRef.current) {
                            const dx = Math.abs(nose.x - lastNosePointRef.current.x);
                            const dy = Math.abs(nose.y - lastNosePointRef.current.y);
                            if (dx + dy > 0.03) {
                                metricsRef.current.fidgetEvents += 1;
                            }
                        }
                        if (nose) {
                            lastNosePointRef.current = { x: nose.x, y: nose.y };
                        }

                        const postureScore = Math.max(0, 1 - Math.min(1, metricsRef.current.fidgetEvents / Math.max(1, metricsRef.current.frames * 2)));
                        metricsRef.current.postureScoreSum += postureScore;

                        const blendshapes = (results.faceBlendshapes?.[0]?.categories || []) as BlendshapeCategory[];
                        const topEmotion = blendshapes.reduce<BlendshapeCategory>(
                            (best, curr) => (curr.score > best.score ? curr : best),
                            { categoryName: "neutral", score: 0 }
                        );
                        const emotion = topEmotion.categoryName?.toLowerCase().includes("smile")
                            ? "happy"
                            : topEmotion.categoryName?.toLowerCase().includes("surprise")
                                ? "surprised"
                                : topEmotion.categoryName?.toLowerCase().includes("browdown")
                                    ? "stressed"
                                    : "neutral";
                        metricsRef.current.emotionCounts[emotion] = (metricsRef.current.emotionCounts[emotion] || 0) + 1;
                        if (emotion === "stressed" && topEmotion.score > 0.5) {
                            metricsRef.current.stressPeaks += 1;
                        }
                        lastFrameTsRef.current = now;
                        updateTelemetrySummary();

                        // Draw futuristic mesh
                        ctx.fillStyle = "rgba(0, 229, 255, 0.8)";
                        ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
                        ctx.lineWidth = 1;

                        // Draw points
                        landmarks.forEach(point => {
                            const x = point.x * canvas.width;
                            const y = point.y * canvas.height;
                            ctx.beginPath();
                            ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
                            ctx.fill();
                        });

                        // Highlight eyes
                        ctx.fillStyle = "rgba(16, 185, 129, 0.9)"; // Emerald glow for eyes
                        const leftEyeIndices = [33, 133, 160, 159, 158, 144, 145, 153];
                        const rightEyeIndices = [362, 263, 387, 386, 385, 373, 374, 380];
                        
                        [...leftEyeIndices, ...rightEyeIndices].forEach(idx => {
                            if (landmarks[idx]) {
                                const x = landmarks[idx].x * canvas.width;
                                const y = landmarks[idx].y * canvas.height;
                                ctx.beginPath();
                                ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
                                ctx.fill();
                            }
                        });
                    } else if (!document.hidden) {
                        // Alert Logic for Looking Away / Face Not Detected
                        updateAlert('NO_FACE', {
                            text: "FACE NOT DETECTED - LOOKING AWAY?",
                            icon: AlertTriangle,
                            color: "text-amber-500"
                        });
                        metricsRef.current.gazeAwaySec += 0.05;
                        updateTelemetrySummary();
                    }
                }
            }
            requestRef.current = requestAnimationFrame(predict);
        };

        requestRef.current = requestAnimationFrame(predict);

        return () => {
            cancelAnimationFrame(requestRef.current);
        };
    }, [isModelLoaded, videoTrack]);

    if (!videoTrack) {
        return (
            <div className="w-full h-full bg-black/50 border border-white/10 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/scan-lines.png')] opacity-20 pointer-events-none" />
                <span className="text-zinc-500 font-mono text-xs animate-pulse">NO CAMERA SIGNAL</span>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-2">
            <div className="relative w-full h-48 sm:h-56 rounded-lg overflow-hidden border border-[#00E5FF]/20 bg-black shadow-[0_0_15px_rgba(0,229,255,0.1)] group shrink-0">
                {/* The actual video from LiveKit */}
                <VideoTrack
                    trackRef={{ participant: localParticipant!, source: Track.Source.Camera, publication: Array.from(localParticipant!.videoTrackPublications.values()).find(p => p.source === Track.Source.Camera)! }}
                    className="w-full h-full object-cover"
                    // Extract underlying video element so MediaPipe can read it
                    ref={(element) => {
                        const videoEl = element as HTMLVideoElement;
                        if (videoEl && !videoRef.current) {
                            videoRef.current = videoEl;
                            // Mute local video
                            videoEl.muted = true;
                            videoEl.play().catch(() => {});
                        }
                    }}
                />

                {/* Canvas for Face Mesh Overlay */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
                    style={{ transform: "scaleX(-1)" }} // Match LiveKit's default mirrored view
                />

                {/* Scanning Scanline Effect */}
                <div className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-hidden mix-blend-screen opacity-50">
                    <div className="w-full h-[2px] bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] animate-scan" style={{ animationDuration: '3s', animationIterationCount: 'infinite' }} />
                </div>

                {/* Corner Bracket Decorations */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#00E5FF]/70 z-30" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#00E5FF]/70 z-30" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#00E5FF]/70 z-30" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#00E5FF]/70 z-30" />

                {/* HUD Overlay Label */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/60 px-2 py-0.5 rounded border border-[#00E5FF]/30 z-30 flex items-center gap-1 backdrop-blur-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[9px] font-mono text-[#00E5FF] tracking-widest font-bold">BIOMETRIC TRACKING</span>
                </div>
            </div>

            {/* Floating Popups shifted below video container */}
            <TelemetryPopup currentAlert={criticalAlert} />
        </div>
    );
};
