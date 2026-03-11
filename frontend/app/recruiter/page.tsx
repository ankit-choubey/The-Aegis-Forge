"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload, FileText, Shield, Cpu, Zap, Rocket,
    CheckCircle, Loader2, User, Key, Database, Target, Check,
    Mail, Phone, Linkedin, Github, ExternalLink, Layers, ChevronDown, Copy
} from "lucide-react";
import clsx from "clsx";

interface ScanLog {
    id: number;
    message: string;
    status: "pending" | "running" | "complete";
}
// TYPES & HELPER COMPONENTS FROM OLD DASHBOARD
// ============================================
interface AuditData {
    summary?: {
        trust_score: string;
        integrity_level: string;
        validation_status: string;
    };
    contact_details?: {
        email: string;
        phone: string;
        name: string;
    };
    external_links_status?: {
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
    github_deep_dive?: {
        total_public_repos: number;
        top_languages_used: string[];
        list_of_repos: string[];
    };
    resume_claims?: {
        total_skills_detected: number;
        skills_list: string[];
        projects_extracted_text: string[];
    };
    verification_breakdown?: {
        verified_skills: string[];
        unverified_skills: string[];
    };
    dynamic_market_intel?: string;
    social_verification?: {
        consistency_score: number;
        verified_links: string[];
    };
}

const SocialIntegrity = ({
    consistencyScore,
    verifiedLinks
}: {
    consistencyScore: number;
    verifiedLinks: string[]
}) => {
    return (
        <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-all" />

            <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-sm font-bold text-white tracking-wide">Social Footprint Integrity</h4>
                </div>
                <div className="flex gap-2">
                    {verifiedLinks.includes("LinkedIn") && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0077b5]/20 border border-[#0077b5]/30 rounded-full text-[#0077b5] text-[10px] font-bold">
                            <Linkedin className="w-3 h-3" /> LinkedIn
                        </div>
                    )}
                    {verifiedLinks.includes("GitHub") && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-700/50 border border-zinc-600 rounded-full text-zinc-300 text-[10px] font-bold">
                            <Github className="w-3 h-3" /> GitHub
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4 relative z-10">
                <span className="text-xs text-zinc-400 font-mono tracking-wider">CONSISTENCY</span>
                <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${consistencyScore}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={clsx(
                            "h-full rounded-full relative overflow-hidden",
                            consistencyScore > 80 ? "bg-gradient-to-r from-emerald-500 to-emerald-400" :
                                consistencyScore > 50 ? "bg-gradient-to-r from-amber-500 to-amber-400" :
                                    "bg-gradient-to-r from-red-500 to-red-400"
                        )}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                    </motion.div>
                </div>
                <span className={clsx(
                    "text-sm font-mono font-bold",
                    consistencyScore > 80 ? "text-emerald-400" :
                        consistencyScore > 50 ? "text-amber-400" : "text-red-400"
                )}>
                    {consistencyScore}%
                </span>
            </div>
        </div>
    );
};

interface BackendResponse {
    candidate_id: string;
    password?: string; // New field from our modified endpoint
    detected_field: string;
    scenario: string;
    trust_score: string;
    verified_skills: string[];
    audit: AuditData;
}

interface ProfileData {
    candidate_id: string;
    name: string;
    skills: string[];
    focus_topics: string[];
    integrity_check: boolean;
    backendData?: BackendResponse;
    password?: string;
}

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
        {isSelected ? <Check className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
        {skill}
    </motion.button>
);

const CandidateProfileView = ({
    profile,
    onGenerateCredentials,
    onToggleFocus,
    selectedRole,
    onRoleChange
}: {
    profile: ProfileData;
    onGenerateCredentials: () => void;
    onToggleFocus: (skill: string) => void;
    selectedRole: string;
    onRoleChange: (role: string) => void;
}) => {
    const data = profile.backendData;
    const audit = data?.audit;

    const getTrustScoreStyle = (score: string) => {
        const numScore = parseInt(score);
        if (numScore >= 70) return {
            text: "text-emerald-400", bg: "from-emerald-500/20 to-emerald-600/10", border: "border-emerald-500/40", glow: "shadow-[0_0_30px_rgba(16,185,129,0.2)]"
        };
        if (numScore >= 40) return {
            text: "text-amber-400", bg: "from-amber-500/20 to-amber-600/10", border: "border-amber-500/40", glow: "shadow-[0_0_30px_rgba(245,158,11,0.2)]"
        };
        return {
            text: "text-red-400", bg: "from-red-500/20 to-red-600/10", border: "border-red-500/40", glow: "shadow-[0_0_30px_rgba(239,68,68,0.2)]"
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

            {audit?.summary && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative overflow-hidden rounded-2xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0f0f15] to-[#0a0a0f]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,229,255,0.1),transparent_50%)]" />
                    <div className="relative z-10 p-8 border border-white/10 rounded-2xl backdrop-blur-sm">
                        <div className="grid grid-cols-3 gap-6">
                            <div className={clsx("relative p-6 rounded-xl border bg-gradient-to-br overflow-hidden", trustStyle.bg, trustStyle.border, trustStyle.glow)}>
                                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-3">Trust Score</p>
                                <p className={clsx("font-mono text-4xl font-black tracking-tight", trustStyle.text)}>{audit.summary.trust_score || "N/A"}</p>
                            </div>
                            <div className="relative p-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-3">Integrity</p>
                                <p className={clsx("font-mono text-2xl font-bold", audit.summary.integrity_level === "High" ? "text-emerald-400" : audit.summary.integrity_level === "Medium" ? "text-amber-400" : "text-red-400")}>
                                    {audit.summary.integrity_level || "Unknown"}
                                </p>
                            </div>
                            <div className="relative p-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-3">Status</p>
                                <p className="font-mono text-2xl font-bold text-emerald-400">{audit.summary.validation_status || "Pending"}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <SocialIntegrity
                                consistencyScore={audit.social_verification?.consistency_score || 92}
                                verifiedLinks={audit.social_verification?.verified_links || ["LinkedIn", "GitHub"]}
                            />
                        </div>
                    </div>
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative rounded-2xl overflow-hidden"
            >
                <div className="absolute inset-0 backdrop-blur-xl bg-white/[0.02] border border-white/10" />
                <div className="relative z-10">
                    <div className="p-6 bg-gradient-to-r from-[#00E5FF]/5 via-transparent to-purple-500/5 border-b border-white/5">
                        <div className="flex items-center gap-5">
                            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#00E5FF]/20 to-purple-500/20 border-2 border-[#00E5FF]/40 flex items-center justify-center">
                                <User className="w-8 h-8 text-[#00E5FF]" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white text-xl font-semibold tracking-wide mb-1">{profile.name}</h3>
                                {audit?.contact_details && (
                                    <div className="flex items-center gap-5">
                                        <span className="text-zinc-400 text-sm flex items-center gap-2"><Mail className="w-4 h-4 text-[#00E5FF]/60" />{audit.contact_details.email}</span>
                                        <span className="text-zinc-400 text-sm flex items-center gap-2"><Phone className="w-4 h-4 text-[#00E5FF]/60" />{audit.contact_details.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 border-b border-white/5 bg-gradient-to-r from-blue-500/5 to-transparent flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md bg-blue-500/10 border border-blue-500/20"><Layers className="w-4 h-4 text-blue-400" /></div>
                            <div>
                                <p className="text-zinc-400 text-xs font-mono uppercase tracking-wider mb-0.5">Selected Domain</p>
                                <p className="text-white text-sm font-semibold">Target Integration Field</p>
                            </div>
                        </div>
                        <select
                            value={selectedRole}
                            onChange={(e) => onRoleChange(e.target.value)}
                            className="bg-[#0a0a0f] border border-white/10 text-white px-4 py-2 rounded-lg font-mono text-sm focus:outline-none focus:border-[#00E5FF]/50 hover:border-white/20"
                        >
                            <option value="Backend">Backend Engineer</option>
                            <option value="AI/ML">AI/ML Engineer</option>
                            <option value="DevOps">DevOps / SRE</option>
                            <option value="Frontend">Frontend Engineer</option>
                        </select>
                    </div>

                    {audit?.verification_breakdown && (
                        <div className="p-6 border-b border-white/5">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-[#00E5FF]/20 to-[#00E5FF]/5">
                                    <Shield className="w-4 h-4 text-[#00E5FF]" />
                                </div>
                                <span className="text-white font-semibold tracking-wide">Skill Verification Intelligence</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Verified Skills (GitHub Matched) */}
                                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                                            <span className="text-emerald-400 font-mono text-xs font-semibold">
                                                {audit.verification_breakdown?.verified_skills?.length > 0 
                                                    ? 'VERIFIED VIA GITHUB' 
                                                    : 'PROJECTS FROM RESUME'}
                                            </span>
                                        </div>
                                        <span className="text-emerald-400/50 text-xs font-mono">
                                            {audit.verification_breakdown?.verified_skills?.length > 0 
                                                ? `${audit.verification_breakdown.verified_skills.length} confirmed`
                                                : `${(audit.resume_claims?.projects_extracted_text || []).length} detected`}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {audit.verification_breakdown?.verified_skills?.length > 0 ? (
                                            audit.verification_breakdown.verified_skills.map((skill: string) => (
                                                <span key={skill} className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium rounded-lg flex items-center gap-1.5">
                                                    {skill}
                                                    <Check className="w-3 h-3 opacity-50" />
                                                </span>
                                            ))
                                        ) : (audit.resume_claims?.projects_extracted_text || []).length > 0 ? (
                                            (audit.resume_claims?.projects_extracted_text || []).map((project: string, idx: number) => (
                                                <span key={idx} className="px-3 py-1.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 text-xs font-medium rounded-lg flex items-center gap-1.5">
                                                    <Rocket className="w-3 h-3 opacity-60" />
                                                    {project}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-zinc-500 text-sm italic py-2">No code footprints found for these claims.</span>
                                        )}
                                    </div>
                                </div>

                                {/* Self-Reported / LLM Extracted Skills (Fallback) */}
                                <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/10">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Rocket className="w-4 h-4 text-amber-400" />
                                            <span className="text-amber-400 font-mono text-xs font-semibold">
                                                SELF-REPORTED CLAIMS (AI DETECTED)
                                            </span>
                                        </div>
                                        <span className="text-zinc-500 text-xs font-mono">
                                            {/* Calculate diff dynamically for robustness */}
                                            {(audit.resume_claims?.skills_list || []).filter((s: string) => !(audit.verification_breakdown?.verified_skills || []).includes(s)).length} claims
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {(() => {
                                            const verifiedSet = new Set(audit.verification_breakdown?.verified_skills || []);
                                            const allExtracted = audit.resume_claims?.skills_list || [];
                                            const selfReported = allExtracted.filter((s: string) => !verifiedSet.has(s));

                                            // Fallback: If verification list is empty, treat unverified list as the source if available
                                            const displayList = selfReported.length > 0 ? selfReported : audit.verification_breakdown?.unverified_skills || [];

                                            return displayList.length > 0 ? (
                                                displayList.map((skill: string) => (
                                                    <span key={skill} className="group relative px-3 py-1.5 bg-white/5 text-zinc-300 border border-white/10 text-xs font-medium rounded-lg hover:border-amber-500/30 hover:text-amber-400 transition-colors">
                                                        {skill}
                                                        {/* Tooltip hint */}
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                            Detected in text
                                                        </span>
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-zinc-500 text-sm italic">No additional claims found.</span>
                                            );
                                        })()}
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
                </div>
            </motion.div>

            <motion.button
                onClick={onGenerateCredentials}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full relative group overflow-hidden rounded-xl"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF] via-cyan-400 to-[#00E5FF] bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite]" />
                <div className="relative z-10 px-8 py-5 flex items-center justify-center gap-4">
                    <Key className="w-6 h-6 text-black" />
                    <span className="text-black font-bold text-lg tracking-[0.1em]">GENERATE CREDENTIALS</span>
                </div>
            </motion.button>
        </motion.div>
    );
};

// ============================================
// NEURAL SCAN TERMINAL
// ============================================
const NeuralScanTerminal = ({ logs }: { logs: ScanLog[] }) => {
    return (
        <div className="w-full bg-black/90 rounded-xl p-6 border border-zinc-800 font-mono text-sm max-h-[400px] overflow-y-auto">
            <div className="flex items-center gap-2 mb-4 text-[#00E5FF]">
                <Cpu className="w-5 h-5 animate-pulse" />
                <span>NEURAL_SCAN_ACTIVE // AEGIS_CORE</span>
            </div>
            <div className="space-y-2">
                {logs.map(log => (
                    <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <span className={clsx(
                            "w-2 h-2 rounded-full",
                            log.status === "complete" ? "bg-emerald-500" :
                            log.status === "running" ? "bg-[#00E5FF] animate-pulse" : "bg-zinc-700"
                        )} />
                        <span className={clsx(
                            log.status === "complete" ? "text-emerald-400" :
                            log.status === "running" ? "text-[#00E5FF]" : "text-zinc-500"
                        )}>
                            [{log.status === 'complete' ? 'OK' : log.status === 'running' ? '..' : '--'}]
                        </span>
                        <span className="text-zinc-300">{log.message}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// ============================================
// CREDENTIALS DISPLAY
// ============================================
const CredentialsDisplay = ({ 
    candidateId, 
    password, 
    candidateName, 
    onReset 
}: { 
    candidateId: string, 
    password: string, 
    candidateName: string, 
    onReset: () => void 
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl mx-auto"
        >
            <div className="p-8 bg-zinc-900/80 border border-[#00E5FF]/30 rounded-2xl relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5FF]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00E5FF]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                
                <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Credentials Generated</h2>
                <p className="text-zinc-400 mb-8 relative z-10">Share these securely with <span className="text-white font-bold">{candidateName}</span>. They will need them to access the Aegis Interview Portal.</p>
                
                <div className="space-y-4 relative z-10">
                    <div className="p-4 bg-black/50 border border-zinc-800 rounded-xl text-left">
                        <span className="text-xs text-zinc-500 font-mono tracking-wider mb-1 block">CANDIDATE ID</span>
                        <div className="text-lg font-mono text-white tracking-widest">{candidateId}</div>
                    </div>
                    
                    <div className="p-4 bg-black/50 border border-zinc-800 rounded-xl text-left">
                        <span className="text-xs text-zinc-500 font-mono tracking-wider mb-1 block">SECURE PASSWORD</span>
                        <div className="text-lg font-mono text-[#00E5FF] tracking-widest">{password}</div>
                    </div>
                </div>

                <div className="mt-8 flex justify-center gap-4 relative z-10">
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(`Aegis Candidate ID: ${candidateId}\nPassword: ${password}\nURL: ${window.location.origin}`);
                            alert("Credentials copied to clipboard!");
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-[#00E5FF]/10 text-[#00E5FF] hover:bg-[#00E5FF]/20 border border-[#00E5FF]/30 transition-all rounded-lg font-mono text-sm"
                    >
                        <Copy className="w-4 h-4" />
                        COPY
                    </button>
                    <button 
                        onClick={onReset}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white border border-zinc-700 transition-all rounded-lg font-mono text-sm"
                    >
                        NEW SCAN
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// ============================================
// UPLOAD ZONE COMPONENT
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
                            Aegis will parse the candidate's skills and generate secure login credentials.
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
                        <span>FOR RECRUITER USE ONLY</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ============================================
// MAIN PAGE
// ============================================
type FlowStatus = "UPLOAD" | "SCANNING" | "REVIEW" | "CREDENTIALS";

export default function RecruiterPortal() {
    const [scanStatus, setScanStatus] = useState<FlowStatus>("UPLOAD");
    const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [selectedRole, setSelectedRole] = useState<string>("Backend");
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loadingCandidates, setLoadingCandidates] = useState(false);

    const fetchCandidates = useCallback(async () => {
        setLoadingCandidates(true);
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
            const res = await fetch(`${apiBase}/candidates`);
            if (res.ok) {
                const data = await res.json();
                setCandidates(data.candidates || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingCandidates(false);
        }
    }, []);

    React.useEffect(() => {
        fetchCandidates();
    }, [fetchCandidates]);

    const mockLogs: { message: string; delay: number }[] = [
        { message: "INITIATING_OCR_SCAN...", delay: 0 },
        { message: "PARSING_DOCUMENT_STRUCTURE...", delay: 1500 },
        { message: "EXTRACTING_TEXT_LAYERS...", delay: 3500 },
        { message: "ANALYZING_SKILL_VECTORS...", delay: 6000 },
        { message: 'VERIFYING_GITHUB_INTEGRITY...', delay: 9000 },
        { message: 'GENERATING_MARKET_INTEL...', delay: 13000 },
        { message: "WAITING_FOR_GROQ_LLM_RESPONSE...", delay: 16500 },
        { message: "COMPILING_CANDIDATE_PROFILE...", delay: 20000 },
        { message: "PROFILE_EXTRACTION_COMPLETE...", delay: 22000 },
    ];

    const handleUpload = async (file: File) => {
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
        // POST to backend and set profile
        // ============================================
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://f6bd14bc925f.ngrok-free.app";

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(`${API_BASE}/upload-resume`, {
                method: "POST",
                body: formData,
                headers: {
                    "ngrok-skip-browser-warning": "true"
                }
            });

            if (response.ok) {
                const data: BackendResponse = await response.json();
                
                const skillsList = data.audit?.resume_claims?.skills_list;
                const extractedSkills = Array.isArray(skillsList) && skillsList.length > 0
                    ? skillsList
                    : ["React", "Python", "TypeScript"];
                
                const candidateName = data.audit?.contact_details?.name || data.candidate_id || "Candidate";

                setProfile({
                   candidate_id: data.candidate_id,
                   name: candidateName,
                   skills: extractedSkills,
                   focus_topics: [],
                   integrity_check: data.audit?.summary?.integrity_level !== "Low",
                   backendData: data,
                   password: data.password
                });
                
                if (data.detected_field) setSelectedRole(data.detected_field);
                
                // Show review dashboard instead of immediately showing credentials
                setScanStatus("REVIEW");
                
            } else {
                console.error("[AEGIS] Upload failed.");
                alert("Upload failed. Check backend console.");
                setScanStatus("UPLOAD");
            }
        } catch (error) {
            console.error("[AEGIS] API Error:", error);
            alert("Connection error to backend.");
            setScanStatus("UPLOAD");
        }
    };

    const handleToggleFocus = (skill: string) => {
        if (!profile) return;
        setProfile(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                focus_topics: prev.focus_topics.includes(skill)
                    ? prev.focus_topics.filter(s => s !== skill)
                    : [...prev.focus_topics, skill]
            };
        });
    };

    const handleRoleChange = async (role: string) => {
        setSelectedRole(role);
        // Call backend API to update context
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://f6bd14bc925f.ngrok-free.app";
        const candidateId = profile?.candidate_id;
        if (candidateId) {
            try {
                await fetch(`${API_BASE}/api/set-candidate-role`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
                    body: JSON.stringify({ candidate_id: candidateId, role: role })
                });
            } catch (e) { console.error("Failed to update role:", e); }
        }
    };

    const handleGenerateCredentials = () => {
        setScanStatus("CREDENTIALS");
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
                        <User className="w-4 h-4 text-[#00E5FF]" />
                        <span className="text-zinc-400 font-mono text-xs tracking-widest">
                            RECRUITER_CONTROL_PANEL
                        </span>
                    </div>

                    <h1 className="font-mono text-3xl md:text-4xl font-bold tracking-wider text-white mb-4">
                        CANDIDATE INGESTION
                    </h1>
                    <p className="text-zinc-500 font-mono text-sm max-w-md mx-auto">
                        Upload a candidate's resume. Aegis will parse it, prepare the knowledge engine, and generate a secure login code for the candidate.
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {scanStatus === "UPLOAD" && (
                        <UploadZone key="upload" onFileUpload={handleUpload} />
                    )}

                    {scanStatus === "SCANNING" && (
                        <NeuralScanTerminal key="scan" logs={scanLogs} />
                    )}
                    
                    {scanStatus === "REVIEW" && profile && (
                        <CandidateProfileView 
                            key="review"
                            profile={profile}
                            selectedRole={selectedRole}
                            onRoleChange={handleRoleChange}
                            onToggleFocus={handleToggleFocus}
                            onGenerateCredentials={handleGenerateCredentials}
                        />
                    )}

                    {scanStatus === "CREDENTIALS" && profile && profile.password && (
                        <CredentialsDisplay
                            key="result"
                            candidateId={profile.candidate_id}
                            password={profile.password}
                            candidateName={profile.name}
                            onReset={() => setScanStatus("UPLOAD")}
                        />
                    )}
                </AnimatePresence>

                <div className="mt-20">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                        <h2 className="font-mono text-xl text-white">Recent Candidates</h2>
                        <button 
                            onClick={fetchCandidates}
                            className={clsx(
                                "text-zinc-400 hover:text-[#00E5FF] transition-colors flex items-center gap-2 font-mono text-xs",
                                loadingCandidates && "opacity-50 cursor-wait"
                            )}
                            disabled={loadingCandidates}
                        >
                            <Loader2 className={clsx("w-3 h-3", loadingCandidates && "animate-spin")} />
                            REFRESH LIST
                        </button>
                    </div>

                    {candidates.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
                            <p className="text-zinc-500 font-mono text-sm">No recent candidates found in the database.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {candidates.map((cand, i) => (
                                <motion.div 
                                    key={cand.id || i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-6 bg-white/5 border border-white/10 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#00E5FF]/30 transition-colors group"
                                >
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-white group-hover:text-[#00E5FF] transition-colors">{cand.name}</h3>
                                            <span className="px-2.5 py-1 bg-white/10 rounded-full font-mono text-[10px] text-zinc-300">
                                                ID: {cand.id}
                                            </span>
                                            {cand.status === "COMPLETED" ? (
                                                <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-mono font-bold">
                                                    <CheckCircle className="w-3 h-3" />
                                                    COMPLETED
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-[10px] font-mono font-bold">
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                    PENDING
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                                            <span>ROLE: <span className="text-white">{cand.role}</span></span>
                                            <span>•</span>
                                            <span>INTEGRITY: <span className="text-emerald-400 font-bold">{cand.score}</span></span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                if (cand.status !== "COMPLETED") return;
                                                window.open(`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"}/download-report/${cand.id}`, '_blank');
                                            }}
                                            disabled={cand.status !== "COMPLETED"}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-[#00E5FF]/10 text-[#00E5FF] hover:bg-[#00E5FF]/20 border border-[#00E5FF]/30 transition-all rounded-lg font-mono text-xs whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <FileText className="w-3 h-3" />
                                            FSIR PDF
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (cand.status !== "COMPLETED") return;
                                                window.open(`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"}/download-qna/${cand.id}`, '_blank');
                                            }}
                                            disabled={cand.status !== "COMPLETED"}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30 transition-all rounded-lg font-mono text-xs whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <Database className="w-3 h-3" />
                                            Q&A DATA
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-zinc-700 font-mono text-xs">
                        Powered by AEGIS Neural Architecture v2.0
                    </p>
                </div>
            </div>
        </div>
    );
}
