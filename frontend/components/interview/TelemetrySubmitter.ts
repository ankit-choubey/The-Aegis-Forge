type MediaPipeSummary = Record<string, unknown>;

declare global {
    interface Window {
        __AEGIS_MEDIAPIPE_SUMMARY?: MediaPipeSummary;
    }
}

export const submitMediaPipeTelemetry = async (sessionId: string, candidateId: string) => {
    try {
        const summary = window.__AEGIS_MEDIAPIPE_SUMMARY || {};
        const avgEye = Number(summary.avg_eye_contact_score ?? 0.75);
        const totalGazeAway = Number(summary.total_gaze_deviation_sec ?? 0);
        const suspectedCheating = Number(summary.suspected_cheating_events ?? 0);
        const avgPosture = Number(summary.avg_posture_score ?? 0.75);
        const fidgetRate = Number(summary.fidget_frequency_per_min ?? 0);
        const confidence = Number(summary.overall_confidence_score ?? 0.75);
        const engagement = Number(summary.overall_engagement_score ?? 0.75);
        const authenticity = Number(summary.authenticity_score ?? 0.75);
        const dominantEmotion = String(summary.dominant_emotion_overall ?? "neutral");

        const payload = {
            session_id: sessionId,
            candidate_id: candidateId,
            avg_eye_contact_score: Math.max(0, Math.min(1, avgEye)),
            emotion_timeline: Array.isArray(summary.emotion_timeline) ? summary.emotion_timeline : [
                { timestamp_sec: 0, dominant_emotion: dominantEmotion, confidence: 0.8, valence: 0.0 }
            ],
            dominant_emotion_overall: dominantEmotion,
            stress_peak_count: Number(summary.stress_peak_count ?? 0),
            gaze_deviations: Array.isArray(summary.gaze_deviations) ? summary.gaze_deviations : [],
            total_gaze_deviation_sec: Math.max(0, totalGazeAway),
            suspected_cheating_events: Math.max(0, Math.floor(suspectedCheating)),
            posture_snapshots: Array.isArray(summary.posture_snapshots) ? summary.posture_snapshots : [
                { timestamp_sec: 0, posture_label: "upright", fidget_detected: false, shoulder_alignment: 0.8 }
            ],
            avg_posture_score: Math.max(0, Math.min(1, avgPosture)),
            fidget_frequency_per_min: Math.max(0, fidgetRate),
            speech_segments: Array.isArray(summary.speech_segments) ? summary.speech_segments : [],
            avg_words_per_minute: Number(summary.avg_words_per_minute ?? 120),
            total_filler_words: Number(summary.total_filler_words ?? 0),
            avg_pause_before_answer_sec: Number(summary.avg_pause_before_answer_sec ?? 1.2),
            longest_silence_sec: Number(summary.longest_silence_sec ?? 2.5),
            overall_confidence_score: Math.max(0, Math.min(1, confidence)),
            overall_engagement_score: Math.max(0, Math.min(1, engagement)),
            authenticity_score: Math.max(0, Math.min(1, authenticity))
        };

        const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
        console.log("[AEGIS] Submitting MediaPipe behavioral metrics to:", `${API_BASE}/mediapipe-metrics`);
        
        const response = await fetch(`${API_BASE}/mediapipe-metrics`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error("[AEGIS] Failed to submit MediaPipe metrics:", await response.text());
        } else {
            console.log("[AEGIS] MediaPipe metrics accepted by backend successfully.");
        }
    } catch (error) {
        console.error("[AEGIS] Error submitting telemetry:", error);
    }
};
