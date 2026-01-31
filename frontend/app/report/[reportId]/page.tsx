"use client";

import React, { useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
    Download, Share2, CheckCircle, AlertTriangle, XCircle,
    Clock, Shield, Activity, User, Briefcase, Calendar,
    Eye, MousePointer, Keyboard, ChevronDown, ChevronUp,
    Zap, Brain, Target, TrendingUp, FileText, ExternalLink
} from "lucide-react";
import clsx from "clsx";

// ============================================
// SAMPLE DATA (Will be replaced with Utkarsh's JSON)
// ============================================
const sampleReportData = {
    report_id: "aegis-2024-abc123",
    generated_at: "2024-01-30T21:00:00Z",

    candidate: {
        id: "candidate-9876",
        name: "John Doe",
        email: "john.doe@example.com"
    },

    interview: {
        role: "Senior DevOps Engineer",
        type: "Technical",
        difficulty: "Hard",
        duration_minutes: 45,
        date: "2024-01-30",
        required_skills: ["Kubernetes", "AWS", "Docker", "Terraform"]
    },

    decision: "ADVANCE" as "ADVANCE" | "HOLD" | "REJECT",

    scores: {
        dqi: 82,
        integrity_confidence: 95,
        technical_score: 78,
        overall_confidence: 85
    },

    timeline: [
        { timestamp: "10:00:00", event: "SESSION_START", severity: "info", description: "Interview session initiated" },
        { timestamp: "10:05:23", event: "CORRECT_ACTION", severity: "success", description: "Correct approach to system design question" },
        { timestamp: "10:15:30", event: "FACE_GAZE", severity: "warning", description: "Looking away from screen for 3.2 seconds" },
        { timestamp: "10:17:45", event: "TAB_SWITCH", severity: "danger", description: "Switched to external browser tab" },
        { timestamp: "10:18:02", event: "TAB_RETURN", severity: "info", description: "Returned to interview tab" },
        { timestamp: "10:25:00", event: "CODE_SUBMIT", severity: "success", description: "Submitted working solution for coding challenge" },
        { timestamp: "10:38:00", event: "KEYSTROKE_BURST", severity: "warning", description: "Rapid keystroke pattern detected (possible paste)" },
        { timestamp: "10:42:00", event: "CORRECT_ACTION", severity: "success", description: "Excellent explanation of CI/CD pipeline" },
        { timestamp: "10:45:00", event: "SESSION_END", severity: "info", description: "Interview session completed" }
    ],

    agent_consensus: {
        technical_assessment: "Demonstrated strong understanding of cloud infrastructure and DevOps practices. Code quality was professional with proper error handling.",
        integrity_assessment: "Minor behavioral flags detected but within acceptable parameters. No critical violations observed.",
        recommendation: "Recommend advancing to final round interview with focus on live system design exercise.",
        strengths: ["Cloud Architecture", "Problem Solving", "Communication"],
        areas_for_improvement: ["Time Management", "Code Optimization"]
    },

    transcript: [
        { speaker: "AGENT", text: "Welcome to your technical interview. Let's start with a system design question.", timestamp: "10:00:00" },
        { speaker: "CANDIDATE", text: "Thank you, I'm ready to begin.", timestamp: "10:00:15" },
        { speaker: "AGENT", text: "Design a scalable notification system that can handle 10 million users.", timestamp: "10:00:30" },
        { speaker: "CANDIDATE", text: "I would approach this using a message queue architecture with Redis for real-time delivery...", timestamp: "10:01:00" }
    ]
};

// ============================================
// COMPONENTS
// ============================================

// Score Card Component
const ScoreCard = ({
    title,
    value,
    icon: Icon,
    color,
    suffix = "%"
}: {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
    suffix?: string;
}) => {
    const getBarColor = () => {
        if (value >= 80) return "bg-emerald-500";
        if (value >= 60) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-2.5 rounded-lg ${color}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-zinc-400 text-sm font-medium tracking-wide">{title}</span>
            </div>
            <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl font-bold text-white font-mono">{value}</span>
                <span className="text-zinc-500 text-lg mb-1">{suffix}</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                    className={`h-full ${getBarColor()} rounded-full transition-all duration-1000`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
};

// Decision Badge Component
const DecisionBadge = ({ decision }: { decision: "ADVANCE" | "HOLD" | "REJECT" }) => {
    const config = {
        ADVANCE: {
            icon: CheckCircle,
            label: "ADVANCE",
            bg: "bg-gradient-to-r from-emerald-500/20 to-emerald-600/10",
            border: "border-emerald-500/50",
            text: "text-emerald-400",
            glow: "shadow-emerald-500/20"
        },
        HOLD: {
            icon: AlertTriangle,
            label: "HOLD FOR REVIEW",
            bg: "bg-gradient-to-r from-yellow-500/20 to-yellow-600/10",
            border: "border-yellow-500/50",
            text: "text-yellow-400",
            glow: "shadow-yellow-500/20"
        },
        REJECT: {
            icon: XCircle,
            label: "REJECT",
            bg: "bg-gradient-to-r from-red-500/20 to-red-600/10",
            border: "border-red-500/50",
            text: "text-red-400",
            glow: "shadow-red-500/20"
        }
    };

    const { icon: Icon, label, bg, border, text, glow } = config[decision];

    return (
        <div className={`${bg} ${border} border-2 rounded-2xl p-6 flex items-center justify-center gap-4 shadow-lg ${glow}`}>
            <Icon className={`w-12 h-12 ${text}`} />
            <div>
                <p className="text-zinc-500 text-xs font-mono tracking-widest mb-1">FINAL DECISION</p>
                <p className={`text-3xl font-bold ${text} font-mono tracking-wider`}>{label}</p>
            </div>
        </div>
    );
};

// Timeline Event Component
const TimelineEvent = ({
    event
}: {
    event: typeof sampleReportData.timeline[0]
}) => {
    const severityConfig = {
        info: { icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
        success: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
        warning: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
        danger: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" }
    };

    const eventIcons: Record<string, React.ElementType> = {
        FACE_GAZE: Eye,
        TAB_SWITCH: ExternalLink,
        TAB_RETURN: ExternalLink,
        KEYSTROKE_BURST: Keyboard,
        CODE_SUBMIT: FileText,
        CORRECT_ACTION: CheckCircle,
        SESSION_START: Zap,
        SESSION_END: Zap
    };

    const severity = event.severity as keyof typeof severityConfig;
    const config = severityConfig[severity] || severityConfig.info;
    const EventIcon = eventIcons[event.event] || config.icon;

    return (
        <div className={`flex items-start gap-4 p-4 ${config.bg} ${config.border} border rounded-lg`}>
            <div className={`p-2 rounded-lg ${config.bg} ${config.border} border`}>
                <EventIcon className={`w-4 h-4 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                    <span className="text-white font-mono text-sm font-medium">{event.event}</span>
                    <span className="text-zinc-600 text-xs font-mono">{event.timestamp}</span>
                </div>
                <p className="text-zinc-400 text-sm">{event.description}</p>
            </div>
        </div>
    );
};

// ============================================
// MAIN PAGE
// ============================================
export default function FSIRReportPage() {
    const params = useParams();
    const reportRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showTranscript, setShowTranscript] = useState(false);

    // In production, fetch report by params.reportId
    const report = sampleReportData;

    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        try {
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;

            if (!reportRef.current) return;

            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                backgroundColor: '#050508',
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`FSIR-Report-${report.report_id}.pdf`);
        } catch (error) {
            console.error('PDF generation error:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Report link copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-[#050508] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#050508]/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF] to-cyan-600 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">AEGIS-FORGE</h1>
                            <p className="text-xs text-zinc-500 font-mono">FSIR Report</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-800 border border-white/10 rounded-lg text-zinc-300 text-sm transition-all"
                        >
                            <Share2 className="w-4 h-4" />
                            Share
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isDownloading}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00E5FF] to-cyan-600 hover:from-[#00E5FF]/90 hover:to-cyan-600/90 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-50"
                        >
                            <Download className={clsx("w-4 h-4", isDownloading && "animate-bounce")} />
                            {isDownloading ? "Generating..." : "Download PDF"}
                        </button>
                    </div>
                </div>
            </header>

            {/* Report Content */}
            <main ref={reportRef} className="max-w-6xl mx-auto px-6 py-8 space-y-8">
                {/* Report Header */}
                <div className="text-center mb-8">
                    <p className="text-[#00E5FF] font-mono text-xs tracking-[0.3em] mb-2">FIRST-ROUND SCREENING INTELLIGENCE REPORT</p>
                    <h2 className="text-2xl font-bold text-white mb-1">Interview Assessment Report</h2>
                    <p className="text-zinc-500 text-sm font-mono">Report ID: {report.report_id}</p>
                </div>

                {/* Decision Banner */}
                <DecisionBadge decision={report.decision} />

                {/* Score Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ScoreCard
                        title="DQI SCORE"
                        value={report.scores.dqi}
                        icon={Target}
                        color="bg-gradient-to-br from-[#00E5FF] to-cyan-600"
                    />
                    <ScoreCard
                        title="INTEGRITY"
                        value={report.scores.integrity_confidence}
                        icon={Shield}
                        color="bg-gradient-to-br from-emerald-500 to-emerald-600"
                    />
                    <ScoreCard
                        title="TECHNICAL"
                        value={report.scores.technical_score}
                        icon={Brain}
                        color="bg-gradient-to-br from-violet-500 to-violet-600"
                    />
                    <ScoreCard
                        title="CONFIDENCE"
                        value={report.scores.overall_confidence}
                        icon={TrendingUp}
                        color="bg-gradient-to-br from-amber-500 to-amber-600"
                    />
                </div>

                {/* Candidate & Interview Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Candidate Info */}
                    <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-white font-semibold">Candidate Information</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-zinc-500 text-sm">Name</span>
                                <span className="text-white font-medium">{report.candidate.name}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-zinc-500 text-sm">Email</span>
                                <span className="text-zinc-300 font-mono text-sm">{report.candidate.email}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-zinc-500 text-sm">Candidate ID</span>
                                <span className="text-zinc-400 font-mono text-xs">{report.candidate.id}</span>
                            </div>
                        </div>
                    </div>

                    {/* Interview Info */}
                    <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2.5 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-white font-semibold">Interview Details</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-zinc-500 text-sm">Role</span>
                                <span className="text-white font-medium">{report.interview.role}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-zinc-500 text-sm">Type / Difficulty</span>
                                <span className="text-zinc-300">{report.interview.type} • {report.interview.difficulty}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-zinc-500 text-sm">Duration</span>
                                <span className="text-zinc-300">{report.interview.duration_minutes} minutes</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-zinc-500 text-sm">Date</span>
                                <span className="text-zinc-300">{new Date(report.interview.date).toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Skills Required */}
                <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border border-white/10 rounded-xl p-6">
                    <h3 className="text-white font-semibold mb-4">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {report.interview.required_skills.map((skill, i) => (
                            <span key={i} className="px-3 py-1.5 bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded-lg text-[#00E5FF] text-sm font-medium">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Event Timeline */}
                <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2.5 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-white font-semibold">Event Timeline</h3>
                        <span className="text-zinc-500 text-sm ml-auto">{report.timeline.length} events</span>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {report.timeline.map((event, i) => (
                            <TimelineEvent key={i} event={event} />
                        ))}
                    </div>
                </div>

                {/* Agent Consensus */}
                <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2.5 rounded-lg bg-gradient-to-br from-[#00E5FF] to-cyan-600">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-white font-semibold">AI Agent Consensus</h3>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <h4 className="text-zinc-400 text-xs font-mono tracking-wider mb-2">TECHNICAL ASSESSMENT</h4>
                            <p className="text-zinc-300 leading-relaxed">{report.agent_consensus.technical_assessment}</p>
                        </div>

                        <div>
                            <h4 className="text-zinc-400 text-xs font-mono tracking-wider mb-2">INTEGRITY ASSESSMENT</h4>
                            <p className="text-zinc-300 leading-relaxed">{report.agent_consensus.integrity_assessment}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-zinc-400 text-xs font-mono tracking-wider mb-2">STRENGTHS</h4>
                                <div className="flex flex-wrap gap-2">
                                    {report.agent_consensus.strengths.map((s, i) => (
                                        <span key={i} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-zinc-400 text-xs font-mono tracking-wider mb-2">AREAS FOR IMPROVEMENT</h4>
                                <div className="flex flex-wrap gap-2">
                                    {report.agent_consensus.areas_for_improvement.map((a, i) => (
                                        <span key={i} className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400 text-xs">
                                            {a}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-[#00E5FF]/5 border border-[#00E5FF]/20 rounded-xl">
                            <h4 className="text-[#00E5FF] text-xs font-mono tracking-wider mb-2">FINAL RECOMMENDATION</h4>
                            <p className="text-white font-medium">{report.agent_consensus.recommendation}</p>
                        </div>
                    </div>
                </div>

                {/* Transcript (Collapsible) */}
                <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border border-white/10 rounded-xl overflow-hidden">
                    <button
                        onClick={() => setShowTranscript(!showTranscript)}
                        className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-gradient-to-br from-zinc-600 to-zinc-700">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-white font-semibold">Interview Transcript</h3>
                            <span className="text-zinc-500 text-sm">{report.transcript.length} messages</span>
                        </div>
                        {showTranscript ? (
                            <ChevronUp className="w-5 h-5 text-zinc-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-zinc-400" />
                        )}
                    </button>

                    {showTranscript && (
                        <div className="px-6 pb-6 space-y-3 border-t border-white/5 pt-4">
                            {report.transcript.map((msg, i) => (
                                <div key={i} className={clsx(
                                    "p-3 rounded-lg",
                                    msg.speaker === "AGENT"
                                        ? "bg-[#00E5FF]/5 border border-[#00E5FF]/10"
                                        : "bg-zinc-800/50 border border-white/5"
                                )}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={clsx(
                                            "text-xs font-mono font-bold",
                                            msg.speaker === "AGENT" ? "text-[#00E5FF]" : "text-zinc-400"
                                        )}>
                                            {msg.speaker}
                                        </span>
                                        <span className="text-zinc-600 text-xs">{msg.timestamp}</span>
                                    </div>
                                    <p className="text-zinc-300 text-sm">{msg.text}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center py-8 border-t border-white/5">
                    <p className="text-zinc-600 text-xs font-mono">
                        Generated by AEGIS-FORGE Intelligence Engine • {new Date(report.generated_at).toLocaleString()}
                    </p>
                    <p className="text-zinc-700 text-xs mt-1">
                        This report is confidential and intended for authorized recruiters only.
                    </p>
                </div>
            </main>
        </div>
    );
}
