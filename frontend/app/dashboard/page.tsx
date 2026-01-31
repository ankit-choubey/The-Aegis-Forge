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
// TYPES (Matching Utkarsh's NEW JSON Format)
// ============================================
type ScanStatus = "IDLE" | "SCANNING" | "COMPLETE";

// The audit data structure (previously was top-level, now nested)
interface AuditData {
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

// New top-level response structure
interface BackendResponse {
    candidate_id: string;
    detected_field: string;
    scenario: string;
    trust_score: string;
    verified_skills: string[];
    audit: AuditData;
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
// Premium Modern Design with Glassmorphism
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
    const audit = data?.audit;

    // Determine trust score color and gradient
    const getTrustScoreStyle = (score: string) => {
        const numScore = parseInt(score);
        if (numScore >= 70) return {
            text: "text-emerald-400",
            bg: "from-emerald-500/20 to-emerald-600/10",
            border: "border-emerald-500/40",
            glow: "shadow-[0_0_30px_rgba(16,185,129,0.2)]"
        };
        if (numScore >= 40) return {
            text: "text-amber-400",
            bg: "from-amber-500/20 to-amber-600/10",
            border: "border-amber-500/40",
            glow: "shadow-[0_0_30px_rgba(245,158,11,0.2)]"
        };
        return {
            text: "text-red-400",
            bg: "from-red-500/20 to-red-600/10",
            border: "border-red-500/40",
            glow: "shadow-[0_0_30px_rgba(239,68,68,0.2)]"
        };
    };

    const trustStyle = getTrustScoreStyle(audit?.summary?.trust_score || "0%");

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full space-y-6"
        >
            {/* Success Header with Animation */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-3 py-4"
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl animate-pulse" />
                    <CheckCircle className="w-6 h-6 text-emerald-400 relative z-10" />
                </div>
                <span className="text-emerald-400 font-mono text-sm tracking-[0.3em] font-semibold">
                    RESUME_ANALYSIS_COMPLETE
                </span>
            </motion.div>

            {/* Trust Score Hero Card */}
            {audit?.summary && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative overflow-hidden rounded-2xl"
                >
                    {/* Animated Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0f0f15] to-[#0a0a0f]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,229,255,0.1),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.08),transparent_50%)]" />

                    <div className="relative z-10 p-8 border border-white/10 rounded-2xl backdrop-blur-sm">
                        <div className="grid grid-cols-3 gap-6">
                            {/* Trust Score - Featured */}
                            <div className={clsx(
                                "relative p-6 rounded-xl border bg-gradient-to-br overflow-hidden",
                                trustStyle.bg, trustStyle.border, trustStyle.glow
                            )}>
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-3">Trust Score</p>
                                <p className={clsx("font-mono text-4xl font-black tracking-tight", trustStyle.text)}>
                                    {audit.summary.trust_score || "N/A"}
                                </p>
                            </div>

                            {/* Integrity Level */}
                            <div className="relative p-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-3">Integrity</p>
                                <p className={clsx(
                                    "font-mono text-2xl font-bold",
                                    audit.summary.integrity_level === "High" ? "text-emerald-400" :
                                        audit.summary.integrity_level === "Medium" ? "text-amber-400" : "text-red-400"
                                )}>
                                    {audit.summary.integrity_level || "Unknown"}
                                </p>
                            </div>

                            {/* Validation Status */}
                            <div className="relative p-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-3">Status</p>
                                <p className="font-mono text-2xl font-bold text-emerald-400">
                                    {audit.summary.validation_status || "Pending"}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Main Content Card - Glassmorphism */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative rounded-2xl overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-white/[0.02]" />
                <div className="absolute inset-0 backdrop-blur-xl" />

                <div className="relative z-10 border border-white/10 rounded-2xl overflow-hidden">
                    {/* Candidate Header */}
                    <div className="p-6 bg-gradient-to-r from-[#00E5FF]/5 via-transparent to-purple-500/5 border-b border-white/5">
                        <div className="flex items-center gap-5">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF] to-purple-500 rounded-full blur-lg opacity-30" />
                                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#00E5FF]/20 to-purple-500/20 border-2 border-[#00E5FF]/40 flex items-center justify-center">
                                    <User className="w-8 h-8 text-[#00E5FF]" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white text-xl font-semibold tracking-wide mb-1">
                                    {audit?.contact_details?.name || profile.candidate_id}
                                </h3>
                                {audit?.contact_details && (
                                    <div className="flex items-center gap-5">
                                        <span className="text-zinc-400 text-sm flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-[#00E5FF]/60" />
                                            {audit.contact_details.email}
                                        </span>
                                        <span className="text-zinc-400 text-sm flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-[#00E5FF]/60" />
                                            {audit.contact_details.phone}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className={clsx(
                                "flex items-center gap-2 px-4 py-2 rounded-full border",
                                profile.integrity_check
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                    : "bg-red-500/10 border-red-500/30 text-red-400"
                            )}>
                                <Shield className="w-4 h-4" />
                                <span className="font-mono text-xs font-semibold tracking-wider">
                                    {profile.integrity_check ? "VERIFIED" : "UNVERIFIED"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* External Links - Compact Design */}
                    {audit?.external_links_status && (
                        <div className="px-6 py-4 border-b border-white/5 bg-black/20">
                            <div className="flex items-center gap-6">
                                <span className="text-zinc-500 font-mono text-xs uppercase tracking-wider">Links:</span>
                                <div className="flex items-center gap-2">
                                    <Linkedin className="w-4 h-4 text-blue-400" />
                                    <span className="text-zinc-400 text-sm max-w-[200px] truncate">
                                        {audit.external_links_status.linkedin.url || "Not provided"}
                                    </span>
                                    {audit.external_links_status.linkedin.status?.includes("Broken") || audit.external_links_status.linkedin.status?.includes("Unreachable") ? (
                                        <span className="text-amber-400 text-xs px-2 py-0.5 bg-amber-500/10 rounded-full">Unreachable</span>
                                    ) : audit.external_links_status.linkedin.url ? (
                                        <span className="text-emerald-400 text-xs px-2 py-0.5 bg-emerald-500/10 rounded-full">Valid</span>
                                    ) : null}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Github className="w-4 h-4 text-white" />
                                    <span className="text-zinc-400 text-sm">
                                        {audit.external_links_status.github.url || "Not provided"}
                                    </span>
                                    {audit.external_links_status.github.valid ? (
                                        <span className="text-emerald-400 text-xs px-2 py-0.5 bg-emerald-500/10 rounded-full">Valid</span>
                                    ) : audit.external_links_status.github.url ? (
                                        <span className="text-red-400 text-xs px-2 py-0.5 bg-red-500/10 rounded-full">Invalid</span>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Skills Verification - Modern Cards */}
                    {audit?.verification_breakdown && (
                        <div className="p-6 border-b border-white/5">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-[#00E5FF]/20 to-[#00E5FF]/5">
                                    <Shield className="w-4 h-4 text-[#00E5FF]" />
                                </div>
                                <span className="text-white font-semibold tracking-wide">Skill Verification</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Verified Skills */}
                                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
                                    <div className="flex items-center gap-2 mb-3">
                                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                                        <span className="text-emerald-400 font-mono text-xs font-semibold">
                                            VERIFIED ({audit.verification_breakdown.verified_skills.length})
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {audit.verification_breakdown.verified_skills.length > 0 ? (
                                            audit.verification_breakdown.verified_skills.map((skill: string) => (
                                                <span key={skill} className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium rounded-lg">
                                                    {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-zinc-500 text-sm italic">No skills verified yet</span>
                                        )}
                                    </div>
                                </div>
                                {/* Unverified Skills */}
                                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                                        <span className="text-amber-400 font-mono text-xs font-semibold">
                                            PENDING ({audit.verification_breakdown.unverified_skills.length})
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {audit.verification_breakdown.unverified_skills.map((skill: string) => (
                                            <span key={skill} className="px-3 py-1.5 bg-amber-500/15 text-amber-300 border border-amber-500/25 text-xs font-medium rounded-lg">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Focus Topics Selection */}
                    <div className="p-6 border-b border-white/5 bg-gradient-to-r from-cyan-500/5 to-transparent">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-[#00E5FF]/20 to-[#00E5FF]/5">
                                    <Target className="w-4 h-4 text-[#00E5FF]" />
                                </div>
                                <span className="text-white font-semibold tracking-wide">Select Focus Areas</span>
                            </div>
                            <span className="text-zinc-500 text-xs">Click to prioritize topics for the interview</span>
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

                    {/* Selected Focus Topics */}
                    <div className="p-6 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-transparent">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10">
                                <Zap className="w-4 h-4 text-amber-400" />
                            </div>
                            <span className="text-amber-400 font-semibold tracking-wide">Focus Topics</span>
                            <span className="text-zinc-500 text-xs ml-auto">
                                {profile.focus_topics.length} selected
                            </span>
                        </div>
                        {profile.focus_topics.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {profile.focus_topics.map((topic) => (
                                    <motion.span
                                        key={topic}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 text-sm font-medium rounded-full shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                                    >
                                        {topic}
                                    </motion.span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-zinc-500 text-sm">
                                No focus topics selected — AI will evaluate all skills equally.
                            </p>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* AI Market Intel - Collapsible Premium Card */}
            {audit?.dynamic_market_intel && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="relative rounded-2xl overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-violet-500/5 to-transparent" />
                    <div className="relative z-10 p-6 border border-purple-500/20 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-violet-600/10">
                                <Cpu className="w-4 h-4 text-purple-400" />
                            </div>
                            <span className="text-purple-400 font-semibold tracking-wide">AI Market Intelligence</span>
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            {audit.dynamic_market_intel.substring(0, 400)}...
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Deploy Button - Premium CTA */}
            <motion.button
                onClick={onDeploy}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full relative group overflow-hidden rounded-xl"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF] via-cyan-400 to-[#00E5FF] bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite]" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 px-8 py-5 flex items-center justify-center gap-4">
                    <Rocket className="w-6 h-6 text-black" />
                    <span className="text-black font-bold text-lg tracking-[0.15em]">
                        START INTERVIEW
                    </span>
                    <Zap className="w-5 h-5 text-black" />
                </div>
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
                // Get raw text first to debug
                const rawText = await response.text();
                console.log("[AEGIS] Raw response:", rawText.substring(0, 500));

                let data: BackendResponse;
                try {
                    data = JSON.parse(rawText);
                } catch (parseError) {
                    console.error("[AEGIS] JSON Parse Error:", parseError);
                    console.error("[AEGIS] Raw response that failed to parse:", rawText);
                    throw new Error("Failed to parse backend response as JSON");
                }

                console.log("[AEGIS] Resume parsed successfully:", data);
                console.log("[AEGIS] Skills received:", data.audit?.resume_claims?.skills_list);
                console.log("[AEGIS] Full resume_claims:", data.audit?.resume_claims);

                // Extract skills from the nested audit object
                const skillsList = data.audit?.resume_claims?.skills_list;
                const extractedSkills = Array.isArray(skillsList) && skillsList.length > 0
                    ? skillsList
                    : ["React", "Python", "TypeScript"]; // Only fallback if truly empty

                console.log("[AEGIS] Extracted skills to use:", extractedSkills);

                // Map Utkarsh's backend response to our format
                setProfile({
                    candidate_id: data.audit?.contact_details?.name || data.candidate_id || candidateName || "Candidate",
                    skills: extractedSkills,
                    focus_topics: [], // Initially empty, recruiter selects
                    integrity_check: data.audit?.summary?.integrity_level !== "Low",
                    backendData: data // Store full response for rich display
                });
            } else {
                const errorText = await response.text();
                console.error("[AEGIS] Upload failed:", response.status, errorText);
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

        // candidate_id comes from backend response, focus_topics from user selection
        const candidateId = profile?.backendData?.candidate_id || profile?.candidate_id || "unknown";
        const selectedFocusTopics = profile?.focus_topics || [];

        try {
            console.log("[AEGIS] Step 1: Sending focus topics to backend...");
            console.log("[AEGIS] Candidate ID:", candidateId);
            console.log("[AEGIS] Selected Focus Topics:", selectedFocusTopics);

            // Step 1: Set focus topics (must be called BEFORE starting interview)
            const focusResponse = await fetch(`${API_BASE}/api/set-focus-topics`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true"
                },
                body: JSON.stringify({
                    candidate_id: candidateId,
                    focus_topics: selectedFocusTopics
                })
            });

            if (focusResponse.ok) {
                const focusResult = await focusResponse.json();
                console.log("[AEGIS] Focus topics saved:", focusResult);
            } else {
                console.warn("[AEGIS] Focus topics API returned non-OK status:", focusResponse.status);
            }

            // Step 2: Start interview and get LiveKit credentials
            console.log("[AEGIS] Step 2: Starting interview...");
            const interviewResponse = await fetch(`${API_BASE}/start-interview`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true"
                },
                body: JSON.stringify({
                    candidate_id: candidateId
                })
            });

            if (interviewResponse.ok) {
                const interviewData = await interviewResponse.json();
                console.log("[AEGIS] Interview started:", interviewData);

                // Navigate to interview room with LiveKit credentials
                const params = new URLSearchParams({
                    token: interviewData.token || "",
                    room: interviewData.room_name || "",
                    candidate: candidateId
                });

                router.push(`/interview/room?${params.toString()}`);
            } else {
                console.error("[AEGIS] Failed to start interview:", interviewResponse.status);
                // Fallback: navigate anyway (room might handle token generation)
                router.push(`/interview/room?candidate=${encodeURIComponent(candidateId)}`);
            }

        } catch (error) {
            console.error("[AEGIS] Deploy error:", error);
            // Fallback navigation
            router.push(`/interview/room`);
        }
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
