"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Database, CheckCircle, ArrowRight } from "lucide-react";

export const FSIRShowcaseGSAP = () => {
    return (
        <section className="relative w-full min-h-screen bg-[#020806] py-32 flex items-center justify-center overflow-hidden">
            <div className="max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

                {/* LEFT SIDE: Sticky Narrative */}
                <div className="flex flex-col justify-center h-full relative">
                    <div className="sticky top-1/3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-emerald-400 font-mono text-sm tracking-wider font-bold">
                                OUTPUT ARTIFACT
                            </span>
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-sans font-bold text-white mb-6 leading-[1.1]">
                            First-Round Screening Intelligence Report (FSIR)
                        </h2>

                        <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-lg leading-relaxed font-medium">
                            Every execution concludes with a machine-readable decision artifact generated in under <strong className="text-slate-200">60 seconds</strong>.
                            No bloated video storage. Perfect telemetry edge-processing.
                        </p>

                        <div className="space-y-4 mb-10">
                            {[
                                "Decision Quality Index (DQI)",
                                "Behavioral Integrity Score",
                                "Technical Coherence Map"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                    <span className="text-slate-300 font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button className="flex items-center gap-3 text-emerald-400 font-bold hover:text-emerald-300 transition-colors group">
                            Explore the Graph Schema
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* RIGHT SIDE: Mock UI Sliding Up */}
                <div className="relative h-full flex items-center justify-center lg:justify-end">
                    <motion.div
                        initial={{ y: 200, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ type: "spring", stiffness: 40, damping: 20 }}
                        className="w-full max-w-lg relative"
                    >
                        {/* Glow behind widget */}
                        <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full" />

                        {/* Dashboard Widget Interface */}
                        <div className="relative bg-[#0A1410]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden">

                            {/* Header */}
                            <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-6">
                                <div className="flex items-center gap-3">
                                    <Database className="w-6 h-6 text-slate-400" />
                                    <span className="text-slate-300 font-mono text-sm font-bold">FSIR // CND-09214</span>
                                </div>
                                <span className="text-emerald-500 font-mono text-xs bg-emerald-500/10 px-2 py-1 rounded">VERIFIED</span>
                            </div>

                            {/* Huge DQI Score */}
                            <div className="text-center mb-10 relative">
                                <div className="text-[120px] font-bold text-white leading-none font-sans drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                    91
                                </div>
                                <div className="text-emerald-400 font-mono tracking-widest text-sm font-bold mt-2">
                                    DECISION QUALITY INDEX
                                </div>
                            </div>

                            {/* Metric Bars */}
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm font-bold text-slate-400 mb-2">
                                        <span>INTEGRITY CONFIDENCE</span>
                                        <span className="text-white">93%</span>
                                    </div>
                                    <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: "93%" }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm font-bold text-slate-400 mb-2">
                                        <span>TECHNICAL COHERENCE</span>
                                        <span className="text-white">88%</span>
                                    </div>
                                    <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: "88%" }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.5, delay: 0.7, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Badge */}
                            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                                <span className="text-slate-500 font-mono text-xs">CRYPTOGRAPHICALLY SIGNED</span>
                            </div>

                        </div>
                    </motion.div>
                </div>

            </div>
        </section>
    );
};