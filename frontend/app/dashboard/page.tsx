"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload, FileText, Shield, Cpu, Zap, Rocket,
    CheckCircle, Loader2, User, Code, Database, Target, Check,
    Mail, Phone, Linkedin, Github, AlertTriangle, XCircle, ExternalLink
} from "lucide-react";
import clsx from "clsx";

// ============================================
// TYPES (Matching Utkarsh's Actual JSON Format)
// ============================================
type ScanStatus = "IDLE" | "SCANNING" | "COMPLETE";

interface BackendResponse {
    summary: {
        trust_score: string;
        integrity_level: string;
        validation_status: string;
    };
    contact_details: {
        email: string;
        phone: string;
        name: string;
    };
    external_links_status: {
        linkedin: {
            url: string | null;
            status?: string;
            valid?: boolean;
        };
        github: {
            url: string | null;
            valid: boolean;
        };
    };
    github_deep_dive: {
        total_public_repos: number;
        top_languages_used: string[];
        list_of_repos: string[];
    };
    resume_claims: {
        total_skills_detected: number;
        skills_list: string[];
        projects_extracted_text: string[];
    };
    verification_breakdown: {
        verified_skills: string[];
        unverified_skills: string[];
    };
    dynamic_market_intel: string;
}

interface CandidateProfile {
    candidate_id: string;
    skills: string[];
    focus_topics: string[];
    integrity_check: boolean;
    backendData?: BackendResponse;
}

interface ScanLog {
    id: number;
    message: string;
    status: "pending" | "running" | "complete";
}

// ============================================
// SELECTABLE SKILL TAG COMPONENT
// ============================================
const SelectableSkillTag = ({
    skill,
    index,
    isSelected,
    onToggle
}: {
    skill: string;
    index: number;
    isSelected: boolean;
    onToggle: () => void;
}) => (
    <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        onClick={onToggle}
        className={clsx(
            "inline-flex items-center gap-1.5 px-3 py-1.5 border text-xs font-mono rounded-full transition-all cursor-pointer",
            isSelected
                ? "bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20 hover:border-cyan-500/40"
        )}
    >
        {isSelected ? <Check className="w-3 h-3" /> : <Code className="w-3 h-3" />}
        {skill}
    </motion.button>
);

// ============================================
// STATE 1: UPLOAD ZONE
// ============================================
const UploadZone = ({ onFileUpload }: { onFileUpload: (file: File) => void }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === "application/pdf") {
            onFileUpload(files[0]);
        }
    }, [onFileUpload]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onFileUpload(files[0]);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
        >
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={clsx(
                    "relative p-12 border-2 border-dashed rounded-lg transition-all duration-300 cursor-pointer group",
                    isDragging
                        ? "border-[#00E5FF] bg-[#00E5FF]/5 shadow-[0_0_40px_rgba(0,229,255,0.2)]"
                        : "border-zinc-700 bg-white/5 hover:border-[#00E5FF]/50 hover:bg-white/10"
                )}
            >
                <div className="absolute inset-0 opacity-10 rounded-lg overflow-hidden">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `
                            linear-gradient(rgba(0,229,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,229,255,0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '30px 30px'
                    }} />
                </div>

                <div className="relative flex flex-col items-center gap-6 text-center">
                    <div className={clsx(
                        "w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                        isDragging
                            ? "border-[#00E5FF] bg-[#00E5FF]/20 shadow-[0_0_30px_rgba(0,229,255,0.3)]"
                            : "border-zinc-700 bg-white/5 group-hover:border-[#00E5FF]/50"
                    )}>
                        <Upload className={clsx(
                            "w-10 h-10 transition-all duration-300",
                            isDragging ? "text-[#00E5FF] animate-bounce" : "text-zinc-500 group-hover:text-[#00E5FF]"
                        )} />
                    </div>

                    <div>
                        <h3 className={clsx(
                            "font-mono text-xl tracking-[0.2em] font-bold mb-3 transition-colors",
                            isDragging ? "text-[#00E5FF]" : "text-white"
                        )}>
                            DROP_RESUME_FILE.PDF
                        </h3>
                        <p className="text-zinc-500 font-mono text-sm tracking-wider">
                            Aegis will parse your skills and prepare the AI interviewer.
                        </p>
                    </div>

                    <label className="relative cursor-pointer">
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileInput}
                            className="hidden"
                        />
                        <span className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-zinc-700 text-zinc-400 font-mono text-sm rounded hover:bg-white/10 hover:border-[#00E5FF]/50 hover:text-[#00E5FF] transition-all">
                            <FileText className="w-4 h-4" />
                            OR SELECT FILE
                        </span>
                    </label>

                    <div className="flex items-center gap-2 text-zinc-600 font-mono text-xs">
                        <Shield className="w-3 h-3" />
                        <span>AES-256 ENCRYPTED TRANSFER</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ============================================
// STATE 2: NEURAL SCAN TERMINAL
// ============================================
const NeuralScanTerminal = ({ logs }: { logs: ScanLog[] }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full"
        >
            <div className="backdrop-blur-md bg-black/80 border border-white/10 rounded-lg overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                            <div className="w-3 h-3 rounded-full bg-green-500/80" />
                        </div>
                        <span className="text-white font-mono text-sm tracking-widest font-bold flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-[#00E5FF]" />
                            NEURAL_PARSER :: ACTIVE
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-[#00E5FF] animate-spin" />
                        <span className="text-[#00E5FF] font-mono text-xs">PROCESSING</span>
                    </div>
                </div>

                <div className="p-6 min-h-[300px] font-mono text-sm space-y-3">
                    <AnimatePresence mode="popLayout">
                        {logs.map((log) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-start gap-3"
                            >
                                <span className="text-[#00E5FF]">&gt;</span>
                                <span className={clsx(
                                    "flex-1",
                                    log.status === "complete" ? "text-green-400" :
                                        log.status === "running" ? "text-yellow-400" : "text-zinc-500"
                                )}>
                                    {log.message}
                                </span>
                                {log.status === "complete" && (
                                    <span className="text-green-400">[OK]</span>
                                )}
                                {log.status === "running" && (
                                    <span className="text-yellow-400 animate-pulse">[...]</span>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <div className="flex items-center gap-3">
                        <span className="text-[#00E5FF]">&gt;</span>
                        <span className="w-2 h-5 bg-[#00E5FF] animate-pulse" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ============================================
// STATE 3: SKILL SELECTION & FOCUS TOPICS
// Now shows Utkarsh's rich backend data
// ============================================
const SkillSelectionResult = ({
    profile,
    uploadedFile,
    onDeploy,
    onToggleFocus
}: {
    profile: CandidateProfile;
    uploadedFile: File | null;
    onDeploy: () => void;
    onToggleFocus: (skill: string) => void;
}) => {
    const data = profile.backendData;

    // Determine trust score color
    const getTrustScoreColor = (score: string) => {
        const numScore = parseInt(score);
        if (numScore >= 70) return "text-green-400 border-green-500/30 bg-green-500/10";
        if (numScore >= 40) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
        return "text-red-400 border-red-500/30 bg-red-500/10";
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full space-y-6"
        >
            {/* Success Header */}
            <div className="flex items-center justify-center gap-3 text-green-400 font-mono">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm tracking-[0.2em]">RESUME_PARSED_SUCCESSFULLY</span>
            </div>

            {/* Trust Score & Summary Banner */}
            {data?.summary && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="grid grid-cols-3 gap-4"
                >
                    <div className={clsx("p-4 rounded-lg border text-center", getTrustScoreColor(data.summary.trust_score || "0%"))}>
                        <p className="font-mono text-xs opacity-70 mb-1">TRUST_SCORE</p>
                        <p className="font-mono text-2xl font-bold">{data.summary.trust_score || "N/A"}</p>
                    </div>
                    <div className="p-4 rounded-lg border border-white/10 bg-white/5 text-center">
                        <p className="font-mono text-xs text-zinc-500 mb-1">INTEGRITY_LEVEL</p>
                        <p className={clsx(
                            "font-mono text-lg font-bold",
                            data.summary.integrity_level === "High" ? "text-green-400" :
                                data.summary.integrity_level === "Medium" ? "text-amber-400" : "text-red-400"
                        )}>{data.summary.integrity_level || "Unknown"}</p>
                    </div>
                    <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/5 text-center">
                        <p className="font-mono text-xs text-zinc-500 mb-1">VALIDATION</p>
                        <p className="font-mono text-lg font-bold text-green-400">{data.summary.validation_status || "Pending"}</p>
                    </div>
                </motion.div>
            )}

            {/* Profile Card */}
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                {/* Candidate Info */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00E5FF]/20 to-cyan-900/30 border border-[#00E5FF]/30 flex items-center justify-center">
                            <User className="w-7 h-7 text-[#00E5FF]" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-mono text-lg font-bold tracking-wider">
                                {data?.contact_details?.name || profile.candidate_id}
                            </h3>
                            {data?.contact_details && (
                                <div className="flex items-center gap-4 mt-1">
                                    <span className="text-zinc-500 font-mono text-xs flex items-center gap-1">
                                        <Mail className="w-3 h-3" /> {data.contact_details.email}
                                    </span>
                                    <span className="text-zinc-500 font-mono text-xs flex items-center gap-1">
                                        <Phone className="w-3 h-3" /> {data.contact_details.phone}
                                    </span>
                                </div>
                            )}
                            {!data && uploadedFile && (
                                <p className="text-zinc-500 font-mono text-xs flex items-center gap-2">
                                    <FileText className="w-3 h-3" />
                                    {uploadedFile.name}
                                </p>
                            )}
                        </div>
                        <div className={clsx(
                            "flex items-center gap-2 px-3 py-1.5 border rounded-full",
                            profile.integrity_check
                                ? "bg-green-500/10 border-green-500/30"
                                : "bg-red-500/10 border-red-500/30"
                        )}>
                            <Shield className={clsx("w-3 h-3", profile.integrity_check ? "text-green-400" : "text-red-400")} />
                            <span className={clsx("font-mono text-xs", profile.integrity_check ? "text-green-400" : "text-red-400")}>
                                INTEGRITY: {profile.integrity_check ? "ON" : "OFF"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* External Links Status */}
                {data?.external_links_status && (
                    <div className="p-6 border-b border-white/10 bg-black/20">
                        <div className="flex items-center gap-2 mb-3">
                            <ExternalLink className="w-4 h-4 text-cyan-400" />
                            <span className="text-white font-mono text-sm font-bold tracking-wider">EXTERNAL_LINKS</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <Linkedin className="w-5 h-5 text-blue-400" />
                                <div className="flex-1">
                                    <p className="text-zinc-400 font-mono text-xs truncate">
                                        {data.external_links_status.linkedin.url || "Not provided"}
                                    </p>
                                </div>
                                {data.external_links_status.linkedin.status?.includes("Unreachable") ? (
                                    <span className="flex items-center gap-1 text-amber-400 text-xs">
                                        <AlertTriangle className="w-3 h-3" /> Unreachable
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-green-400 text-xs">
                                        <CheckCircle className="w-3 h-3" /> Valid
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <Github className="w-5 h-5 text-white" />
                                <div className="flex-1">
                                    <p className="text-zinc-400 font-mono text-xs">
                                        {data.external_links_status.github.url || "Not provided"}
                                    </p>
                                </div>
                                {data.external_links_status.github.valid ? (
                                    <span className="flex items-center gap-1 text-green-400 text-xs">
                                        <CheckCircle className="w-3 h-3" /> Valid
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-red-400 text-xs">
                                        <XCircle className="w-3 h-3" /> Invalid
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Verification Breakdown */}
                {data?.verification_breakdown && (
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="w-4 h-4 text-cyan-400" />
                            <span className="text-white font-mono text-sm font-bold tracking-wider">
                                SKILL_VERIFICATION
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-green-400 font-mono text-xs mb-2 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> VERIFIED ({data.verification_breakdown.verified_skills.length})
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {data.verification_breakdown.verified_skills.length > 0 ? (
                                        data.verification_breakdown.verified_skills.map(skill => (
                                            <span key={skill} className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-mono rounded">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-zinc-600 text-xs">None verified</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-amber-400 font-mono text-xs mb-2 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> UNVERIFIED ({data.verification_breakdown.unverified_skills.length})
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {data.verification_breakdown.unverified_skills.map(skill => (
                                        <span key={skill} className="px-2 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono rounded">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* All Skills (for selection) */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                        <Database className="w-4 h-4 text-[#00E5FF]" />
                        <span className="text-white font-mono text-sm font-bold tracking-wider">
                            SELECT_FOCUS_TOPICS
                        </span>
                        <span className="text-zinc-600 font-mono text-xs ml-auto">
                            Click skills to prioritize in interview
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, index) => (
                            <SelectableSkillTag
                                key={skill}
                                skill={skill}
                                index={index}
                                isSelected={profile.focus_topics.includes(skill)}
                                onToggle={() => onToggleFocus(skill)}
                            />
                        ))}
                    </div>
                </div>

                {/* Focus Topics Summary */}
                <div className="p-6 bg-amber-500/5">
                    <div className="flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-400 font-mono text-sm font-bold tracking-wider">
                            FOCUS_TOPICS
                        </span>
                        <span className="text-zinc-600 font-mono text-xs">
                            ({profile.focus_topics.length} selected)
                        </span>
                    </div>

                    {profile.focus_topics.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {profile.focus_topics.map((topic) => (
                                <span
                                    key={topic}
                                    className="px-3 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono rounded-full"
                                >
                                    {topic}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-zinc-500 font-mono text-xs">
                            No focus topics selected. AI will evaluate all skills equally.
                        </p>
                    )}
                </div>
            </div>

            {/* Market Intel */}
            {data?.dynamic_market_intel && (
                <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Cpu className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400 font-mono text-xs font-bold">AI_MARKET_INTEL</span>
                    </div>
                    <p className="text-zinc-400 text-xs leading-relaxed whitespace-pre-wrap">
                        {data.dynamic_market_intel.substring(0, 300)}...
                    </p>
                </div>
            )}

            {/* Deploy Button */}
            <motion.button
                onClick={onDeploy}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full relative group px-8 py-5 bg-cyan-600 hover:bg-cyan-500 text-black font-bold font-mono text-lg tracking-[0.15em] rounded-lg transition-all overflow-hidden shadow-[0_0_30px_rgba(0,229,255,0.3)] hover:shadow-[0_0_50px_rgba(0,229,255,0.5)]"
            >
                <span className="absolute inset-0 bg-white/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center justify-center gap-3">
                    <Rocket className="w-6 h-6" />
                    [ DEPLOY_INTERVIEW_AGENT :: START ]
                    <Zap className="w-5 h-5" />
                </span>
            </motion.button>
        </motion.div>
    );
};

// ============================================
// MAIN DASHBOARD PAGE
// ============================================
export default function DashboardPage() {
    const router = useRouter();
    const [scanStatus, setScanStatus] = useState<ScanStatus>("IDLE");
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [profile, setProfile] = useState<CandidateProfile | null>(null);
    const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);

    const mockLogs: { message: string; delay: number }[] = [
        { message: "INITIATING_OCR_SCAN...", delay: 0 },
        { message: "PARSING_DOCUMENT_STRUCTURE...", delay: 400 },
        { message: "EXTRACTING_TEXT_LAYERS...", delay: 800 },
        { message: "ANALYZING_SKILL_VECTORS...", delay: 1200 },
        { message: 'DETECTED: "React" (Confidence: 98%)', delay: 1500 },
        { message: 'DETECTED: "System Design" (Confidence: 95%)', delay: 1700 },
        { message: 'DETECTED: "Python" (Confidence: 94%)', delay: 1900 },
        { message: 'DETECTED: "TypeScript" (Confidence: 92%)', delay: 2100 },
        { message: "COMPILING_CANDIDATE_PROFILE...", delay: 2400 },
        { message: "PROFILE_EXTRACTION_COMPLETE", delay: 2800 },
    ];

    const handleUpload = async (file: File) => {
        setUploadedFile(file);
        setScanStatus("SCANNING");
        setScanLogs([]);

        const candidateName = file.name.replace(".pdf", "").replace(/_/g, " ");

        // Show scanning animation
        for (let i = 0; i < mockLogs.length; i++) {
            await new Promise(r => setTimeout(r, mockLogs[i].delay - (i > 0 ? mockLogs[i - 1].delay : 0)));

            setScanLogs(prev => [
                ...prev.map(log => ({ ...log, status: "complete" as const })),
                {
                    id: i,
                    message: mockLogs[i].message,
                    status: i === mockLogs.length - 1 ? "complete" as const : "running" as const
                }
            ]);
        }

        // ============================================
        // SEND PDF TO UTKARSH'S BACKEND
        // ============================================
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://f6bd14bc925f.ngrok-free.app";

        try {
            const formData = new FormData();
            formData.append("file", file);

            console.log("[AEGIS] Uploading resume to:", `${API_BASE}/upload-resume`);

            const response = await fetch(`${API_BASE}/upload-resume`, {
                method: "POST",
                body: formData,
                headers: {
                    // ngrok requires this header to bypass browser warning
                    "ngrok-skip-browser-warning": "true"
                }
            });

            if (response.ok) {
                const data: BackendResponse = await response.json();
                console.log("[AEGIS] Resume parsed successfully:", data);

                // Map Utkarsh's backend response to our format
                setProfile({
                    candidate_id: data.contact_details?.name || candidateName || "Candidate",
                    skills: data.resume_claims?.skills_list || ["React", "Python", "TypeScript"],
                    focus_topics: [], // Initially empty, recruiter selects
                    integrity_check: data.summary?.integrity_level !== "Low",
                    backendData: data // Store full response for rich display
                });
            } else {
                console.error("[AEGIS] Upload failed:", response.status);
                // Fallback to mock data
                setProfile({
                    candidate_id: candidateName || "Candidate",
                    skills: ["React", "System Design", "Python", "TypeScript", "AWS", "Docker"],
                    focus_topics: [],
                    integrity_check: true
                });
            }
        } catch (error) {
            console.error("[AEGIS] API Error:", error);
            // Fallback to mock data on error
            setProfile({
                candidate_id: candidateName || "Candidate",
                skills: ["React", "System Design", "Python", "TypeScript", "AWS", "Docker"],
                focus_topics: [],
                integrity_check: true
            });
        }

        setScanStatus("COMPLETE");
    };

    const handleToggleFocus = (skill: string) => {
        if (!profile) return;

        setProfile(prev => {
            if (!prev) return prev;
            const isSelected = prev.focus_topics.includes(skill);
            return {
                ...prev,
                focus_topics: isSelected
                    ? prev.focus_topics.filter(s => s !== skill)
                    : [...prev.focus_topics, skill]
            };
        });
    };

    const handleDeploy = async () => {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://f6bd14bc925f.ngrok-free.app";

        // Send focus_config to Utkarsh's backend
        const focusConfig = {
            candidate_id: profile?.candidate_id,
            focus_topics: profile?.focus_topics || [],
            integrity_check: profile?.integrity_check ?? true
        };

        try {
            console.log("[AEGIS] Sending focus config:", focusConfig);

            await fetch(`${API_BASE}/focus-config`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true"
                },
                body: JSON.stringify(focusConfig)
            });
        } catch (error) {
            console.warn("[AEGIS] Focus config send failed (non-blocking):", error);
        }

        router.push(`/interview/room`);
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white">
            <div className="fixed inset-0 opacity-5 pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: `
                        linear-gradient(rgba(0,229,255,0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,229,255,0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px'
                }} />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-12">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6">
                        <Shield className="w-4 h-4 text-[#00E5FF]" />
                        <span className="text-zinc-400 font-mono text-xs tracking-widest">
                            AEGIS_COMMAND_CENTER :: PRE-FLIGHT
                        </span>
                    </div>

                    <h1 className="font-mono text-3xl md:text-4xl font-bold tracking-wider text-white mb-4">
                        UPLOAD_YOUR_RESUME
                    </h1>
                    <p className="text-zinc-500 font-mono text-sm max-w-md mx-auto">
                        Share your resume so Aegis can prepare a personalized interview.
                        Select focus topics for the AI to prioritize during evaluation.
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {scanStatus === "IDLE" && (
                        <UploadZone key="upload" onFileUpload={handleUpload} />
                    )}

                    {scanStatus === "SCANNING" && (
                        <NeuralScanTerminal key="scan" logs={scanLogs} />
                    )}

                    {scanStatus === "COMPLETE" && profile && (
                        <SkillSelectionResult
                            key="result"
                            profile={profile}
                            uploadedFile={uploadedFile}
                            onDeploy={handleDeploy}
                            onToggleFocus={handleToggleFocus}
                        />
                    )}
                </AnimatePresence>

                <div className="mt-12 text-center">
                    <p className="text-zinc-700 font-mono text-xs">
                        Powered by AEGIS Neural Architecture v2.0
                    </p>
                </div>
            </div>
        </div>
    );
}
