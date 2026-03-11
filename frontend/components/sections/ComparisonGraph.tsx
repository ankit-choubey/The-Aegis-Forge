"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { TrendingUp, BadgeAlert, Sparkles } from "lucide-react";

export const ComparisonGraph = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

    return (
        <section ref={ref} className="py-24 px-4 w-full max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-slate-100 font-sans tracking-tight mb-4">
                    Data Drives The <span className="text-emerald-400">Decision</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-8">
                    Comparing traditional continuous video LLM streams vs Aegis-Forge's deterministic burst architecture.
                </p>
            </div>

            <div className="relative w-full max-w-5xl mx-auto glass-panel p-8 rounded-2xl">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-6 text-sm font-mono">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                            <span className="text-slate-300">Legacy AI Interviwer (LLM)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                            <span className="text-emerald-400 font-bold">Aegis-Forge Protocols</span>
                        </div>
                    </div>
                </div>

                {/* The Graph Canvas */}
                <div className="relative w-full aspect-[2/1] md:aspect-[3/1] bg-[#050A08] rounded-xl border border-slate-800 overflow-hidden group">

                    {/* Grid Lines */}
                    <div className="absolute inset-x-0 bottom-0 h-full flex flex-col justify-between pt-8 pb-10 px-8 pointer-events-none">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-full h-px border-b border-dashed border-slate-800/50 relative">
                                <span className="absolute -left-6 -top-2 text-[10px] text-slate-600 font-mono hidden md:block">
                                    {100 - (i * 25)}%
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* X Axis Labels */}
                    <div className="absolute bottom-2 inset-x-8 flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>START</span>
                        <span>Q1</span>
                        <span>Q2</span>
                        <span>Q3</span>
                        <span>EVAL</span>
                    </div>

                    <svg className="absolute inset-0 w-full h-full p-8 overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 300">
                        {/* Red Line - Legacy */}
                        <motion.path
                            d="M 0 250 Q 250 200 500 100 T 1000 20"
                            fill="none"
                            stroke="#EF4444"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray="1500"
                            initial={{ strokeDashoffset: 1500 }}
                            animate={isInView ? { strokeDashoffset: 0 } : { strokeDashoffset: 1500 }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                        />

                        {/* Green Line - Aegis Forge */}
                        <motion.path
                            d="M 0 250 L 250 240 L 500 230 L 750 220 L 1000 200"
                            fill="none"
                            stroke="#10B981"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray="1100"
                            initial={{ strokeDashoffset: 1100 }}
                            animate={isInView ? { strokeDashoffset: 0 } : { strokeDashoffset: 1100 }}
                            transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                            style={{ filter: "drop-shadow(0 0 8px rgba(16,185,129,0.8))" }}
                        />

                        {/* Data Points for Green Line interaction */}
                        {[
                            { cx: 0, cy: 250, tip: "Init State" },
                            { cx: 250, cy: 240, tip: "First Phase" },
                            { cx: 500, cy: 230, tip: "Middle Phase" },
                            { cx: 750, cy: 220, tip: "Deep Signal" },
                            { cx: 1000, cy: 200, tip: "Artifact Generation" }
                        ].map((pt, i) => (
                            <g key={i}>
                                <motion.circle
                                    cx={pt.cx} cy={pt.cy} r="6" fill="#050A08" stroke="#34D399" strokeWidth="3"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                                    transition={{ delay: 1 + (i * 0.2) }}
                                    onMouseEnter={() => setHoveredPoint(i)}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                    className="cursor-crosshair transition-all hover:r-8 hover:brightness-150"
                                    style={{ filter: hoveredPoint === i ? "drop-shadow(0 0 10px #34D399)" : "none" }}
                                />

                                {/* Tooltip implementation using SVG <foreignObject> or just standard React state overlay below */}
                            </g>
                        ))}
                    </svg>

                    {/* Interactive Tooltip Overlay (HTML based for better styling) */}
                    <div className="absolute inset-0 pointer-events-none p-8">
                        <div className="relative w-full h-full">
                            {[
                                { left: "0%", top: "83%", tip: "Connection Established (~20kb)" },
                                { left: "25%", top: "80%", tip: "Phase 1 Complete. Minimal API calls. Max signal." },
                                { left: "50%", top: "76%", tip: "Phase 2 Complete. Edge Telemetry active." },
                                { left: "75%", top: "73%", tip: "Finalizing execution trace." },
                                { left: "100%", top: "66%", tip: "FSIR Generated. 2.4kg CO2 prevented." }
                            ].map((pos, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: hoveredPoint === i ? 1 : 0, y: hoveredPoint === i ? -20 : 10 }}
                                    className="absolute bg-emerald-950/90 border border-emerald-500 text-emerald-100 text-[10px] md:text-xs p-2 rounded shadow-2xl backdrop-blur-md max-w-[150px] whitespace-normal pointer-events-none font-mono z-20"
                                    style={{ left: pos.left, top: pos.top, transform: "translate(-50%, -100%)" }}
                                >
                                    <Sparkles className="w-3 h-3 inline mb-1 mr-1 text-emerald-400" />
                                    {pos.tip}
                                </motion.div>
                            ))}

                            {/* Legacy warning tooltip mock */}
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: isInView ? 1 : 0 }} transition={{ delay: 2.5 }}
                                className="absolute right-0 top-[10%] bg-red-950/80 border border-red-500/50 text-red-200 text-[10px] p-2 rounded flex items-center gap-2 pointer-events-none font-mono"
                            >
                                <BadgeAlert className="w-4 h-4 text-red-500" />
                                Massive Cloud Compute Burn
                            </motion.div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};