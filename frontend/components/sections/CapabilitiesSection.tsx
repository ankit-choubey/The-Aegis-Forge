"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Zap, Radio, BarChart3, ChevronDown } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

// Capability data
const capabilities = [
    {
        title: "Scenario Injection",
        description: "Inject real-world crisis scenarios into interviews in real-time.",
        icon: Zap
    },
    {
        title: "Adversarial Swarm",
        description: "Four AI agents probe candidates from multiple angles simultaneously.",
        icon: Bot
    },
    {
        title: "Edge Telemetry",
        description: "Track 5 behavioral vectors invisibly during the interview.",
        icon: Radio
    },
    {
        title: "DQI Scoring",
        description: "Quantifiable Data Quality Index for every candidate interaction.",
        icon: BarChart3
    }
];

// Terminal Visualization
const TerminalView = () => {
    const [displayedText, setDisplayedText] = useState("");
    const fullText = "> INJECTING: POSTGRES_DEADLOCK...";

    useEffect(() => {
        setDisplayedText("");
        let i = 0;
        const interval = setInterval(() => {
            if (i < fullText.length) {
                setDisplayedText(fullText.slice(0, i + 1));
                i++;
            } else {
                clearInterval(interval);
            }
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-black/80 rounded-lg border border-cyan-500/30 overflow-hidden">
                {/* Terminal Header */}
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border-b border-white/10">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="ml-2 text-xs text-slate-500 font-mono">aegis-inject</span>
                </div>
                {/* Terminal Body */}
                <div className="p-4 font-mono text-sm">
                    <span className="text-cyan-400">{displayedText}</span>
                    <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-0.5" />
                </div>
            </div>
        </div>
    );
};

// Adversarial Swarm Diamond
const SwarmView = () => {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="relative w-48 h-48">
                {/* Center */}
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-cyan-500/30 flex items-center justify-center border border-cyan-500"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Bot className="w-6 h-6 text-cyan-400" />
                </motion.div>
                {/* Top */}
                <motion.div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center border border-purple-500"
                    animate={{ opacity: [0.5, 1, 0.5], y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                >
                    <Bot className="w-5 h-5 text-purple-400" />
                </motion.div>
                {/* Right */}
                <motion.div
                    className="absolute top-1/2 right-0 -translate-y-1/2 w-10 h-10 rounded-full bg-green-500/30 flex items-center justify-center border border-green-500"
                    animate={{ opacity: [0.5, 1, 0.5], x: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                    <Zap className="w-5 h-5 text-green-400" />
                </motion.div>
                {/* Bottom */}
                <motion.div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-orange-500/30 flex items-center justify-center border border-orange-500"
                    animate={{ opacity: [0.5, 1, 0.5], y: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                    <Radio className="w-5 h-5 text-orange-400" />
                </motion.div>
                {/* Left */}
                <motion.div
                    className="absolute top-1/2 left-0 -translate-y-1/2 w-10 h-10 rounded-full bg-pink-500/30 flex items-center justify-center border border-pink-500"
                    animate={{ opacity: [0.5, 1, 0.5], x: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                >
                    <BarChart3 className="w-5 h-5 text-pink-400" />
                </motion.div>
                {/* Connection lines */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                    <motion.line
                        x1="100" y1="40" x2="100" y2="80"
                        stroke="rgba(0, 229, 255, 0.3)" strokeWidth="1"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                    />
                    <motion.line
                        x1="160" y1="100" x2="120" y2="100"
                        stroke="rgba(0, 229, 255, 0.3)" strokeWidth="1"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                    />
                    <motion.line
                        x1="100" y1="160" x2="100" y2="120"
                        stroke="rgba(0, 229, 255, 0.3)" strokeWidth="1"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, delay: 0.6 }}
                    />
                    <motion.line
                        x1="40" y1="100" x2="80" y2="100"
                        stroke="rgba(0, 229, 255, 0.3)" strokeWidth="1"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, delay: 0.8 }}
                    />
                </svg>
            </div>
        </div>
    );
};

// Radar Chart Visualization
const RadarView = () => {
    const [points, setPoints] = useState("100,30 170,80 150,160 50,160 30,80");

    useEffect(() => {
        const generatePoints = () => {
            const center = { x: 100, y: 100 };
            const angles = [0, 72, 144, 216, 288].map(a => (a - 90) * (Math.PI / 180));
            const newPoints = angles.map(angle => {
                const radius = 40 + Math.random() * 50;
                const x = center.x + radius * Math.cos(angle);
                const y = center.y + radius * Math.sin(angle);
                return `${x.toFixed(0)},${y.toFixed(0)}`;
            }).join(' ');
            setPoints(newPoints);
        };

        const interval = setInterval(generatePoints, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-64 h-64">
                {/* Background grid */}
                {[20, 40, 60, 80].map(r => (
                    <circle
                        key={r}
                        cx="100" cy="100" r={r}
                        fill="none" stroke="rgba(0, 229, 255, 0.1)" strokeWidth="1"
                    />
                ))}
                {/* Axis lines */}
                {[0, 72, 144, 216, 288].map(angle => {
                    const rad = (angle - 90) * (Math.PI / 180);
                    return (
                        <line
                            key={angle}
                            x1="100" y1="100"
                            x2={100 + 80 * Math.cos(rad)} y2={100 + 80 * Math.sin(rad)}
                            stroke="rgba(0, 229, 255, 0.2)" strokeWidth="1"
                        />
                    );
                })}
                {/* Data polygon */}
                <motion.polygon
                    points={points}
                    fill="rgba(0, 229, 255, 0.2)"
                    stroke="#00E5FF"
                    strokeWidth="2"
                    animate={{ points }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                />
                {/* Pulse effect */}
                <motion.polygon
                    points={points}
                    fill="none"
                    stroke="#00E5FF"
                    strokeWidth="1"
                    animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    style={{ transformOrigin: "100px 100px" }}
                />
                {/* Center dot */}
                <circle cx="100" cy="100" r="4" fill="#00E5FF" className="animate-pulse" />
            </svg>
        </div>
    );
};

// DQI Score Visualization
const DQIView = () => {
    const [progress, setProgress] = useState(0);
    const circumference = 2 * Math.PI * 80;

    useEffect(() => {
        const timeout = setTimeout(() => setProgress(98), 300);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="relative">
                <svg viewBox="0 0 200 200" className="w-48 h-48">
                    {/* Background circle */}
                    <circle
                        cx="100" cy="100" r="80"
                        fill="none" stroke="rgba(0, 229, 255, 0.1)" strokeWidth="8"
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx="100" cy="100" r="80"
                        fill="none" stroke="#00E5FF" strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: circumference - (progress / 100) * circumference }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        style={{ transform: "rotate(-90deg)", transformOrigin: "100px 100px" }}
                    />
                </svg>
                {/* Score number */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <span className="text-5xl font-bold text-cyan-400 font-[family-name:var(--font-space-grotesk)]">
                        {progress}
                    </span>
                </motion.div>
            </div>
        </div>
    );
};

// Content mapping
const viewportContent = [
    <TerminalView key="terminal" />,
    <SwarmView key="swarm" />,
    <RadarView key="radar" />,
    <DQIView key="dqi" />
];

export const CapabilitiesSection = () => {
    const [activeCapability, setActiveCapability] = useState(0);
    const [expandedMobile, setExpandedMobile] = useState<number | null>(0);

    return (
        <section className="py-24 bg-black">
            <div className="max-w-6xl mx-auto px-6">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-2 rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-bold mb-6"
                    >
                        CAPABILITIES
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-white mb-6 font-[family-name:var(--font-space-grotesk)]"
                    >
                        The Aegis Arsenal
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-slate-400 max-w-2xl mx-auto"
                    >
                        Four core capabilities that transform how you conduct technical interviews.
                    </motion.p>
                </div>

                {/* Desktop: Split Screen */}
                <div className="hidden lg:grid grid-cols-2 gap-12">
                    {/* Left Column - Controller */}
                    <div className="space-y-2">
                        {capabilities.map((cap, i) => (
                            <motion.button
                                key={i}
                                onClick={() => setActiveCapability(i)}
                                onMouseEnter={() => setActiveCapability(i)}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`w-full text-left p-5 rounded-lg border-l-4 transition-all duration-300 ${activeCapability === i
                                    ? "border-l-cyan-400 bg-gradient-to-r from-cyan-500/10 to-transparent"
                                    : "border-l-transparent hover:border-l-cyan-400/50 hover:bg-white/5"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${activeCapability === i ? "bg-cyan-500/20" : "bg-white/5"
                                        }`}>
                                        <cap.icon className={`w-5 h-5 ${activeCapability === i ? "text-cyan-400" : "text-slate-400"
                                            }`} />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold transition-colors font-[family-name:var(--font-space-grotesk)] ${activeCapability === i ? "text-white" : "text-slate-400"
                                            }`}>
                                            {cap.title}
                                        </h3>
                                        <p className={`text-sm transition-colors ${activeCapability === i ? "text-slate-300" : "text-slate-500"
                                            }`}>
                                            {cap.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    {/* Right Column - Viewport */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <GlassCard className="h-[400px] w-full relative overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeCapability}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full h-full"
                                >
                                    {viewportContent[activeCapability]}
                                </motion.div>
                            </AnimatePresence>
                        </GlassCard>
                    </motion.div>
                </div>

                {/* Mobile: Accordion Style */}
                <div className="lg:hidden space-y-4">
                    {capabilities.map((cap, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="rounded-xl border border-white/10 overflow-hidden"
                        >
                            <button
                                onClick={() => setExpandedMobile(expandedMobile === i ? null : i)}
                                className={`w-full text-left p-4 flex items-center justify-between transition-colors ${expandedMobile === i ? "bg-cyan-500/10" : "bg-white/5"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <cap.icon className={`w-5 h-5 ${expandedMobile === i ? "text-cyan-400" : "text-slate-400"
                                        }`} />
                                    <span className={`font-bold font-[family-name:var(--font-space-grotesk)] ${expandedMobile === i ? "text-white" : "text-slate-400"
                                        }`}>
                                        {cap.title}
                                    </span>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedMobile === i ? "rotate-180" : ""
                                    }`} />
                            </button>
                            <AnimatePresence>
                                {expandedMobile === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 border-t border-white/10">
                                            <p className="text-sm text-slate-400 mb-4">{cap.description}</p>
                                            <div className="h-[250px] bg-black/50 rounded-lg">
                                                {viewportContent[i]}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
