"use client";

import { motion } from "framer-motion";
import { Network, FileCheck, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export const HeroDemo = () => {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-4 overflow-hidden">
            {/* Background Lighting "InkLantern" */}
            <div className="absolute inset-0 ink-lantern opacity-60 pointer-events-none" />

            {/* Text Content */}
            <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 mb-16">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight text-slate-100 font-sans"
                >
                    Hire Faster. <br />
                    <span className="text-emerald-400">Waste Nothing.</span> <br />
                    Save the Planet.
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
                >
                    Aegis-Forge converts 45-minute carbon-heavy AI conversations into 10-minute deterministic screening protocols. Lower latency. Zero variance. 80% less carbon emission per candidate.
                </motion.p>
            </div>

            {/* Interactive Mockup Animation */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="relative w-full max-w-5xl aspect-video glass-panel rounded-2xl overflow-hidden border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)] flex flex-col"
            >
                {/* Mockup Header */}
                <div className="h-10 border-b border-emerald-500/10 bg-black/40 flex items-center px-4 gap-2 shrink-0">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-slate-700" />
                        <div className="w-3 h-3 rounded-full bg-slate-700" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <div className="ml-4 font-mono text-xs text-slate-500">protocol-execution-environment</div>
                </div>

                {/* Mockup Body */}
                <div className="flex-1 relative bg-gradient-to-br from-[#050A08] to-[#0A1410] p-8 flex items-center justify-center overflow-hidden">
                    <MockupAnimationSequence />
                </div>
            </motion.div>
        </section>
    );
};

const MockupAnimationSequence = () => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        // 0: Loading, 1: Node 1 (Incident Lead), 2: Node 2 (Pressure), 3: Node 3 (Observer), 4: Complete Modal
        const sequence = [
            { step: 0, time: 2000 },
            { step: 1, time: 1000 },
            { step: 2, time: 1000 },
            { step: 3, time: 1000 },
            { step: 4, time: 3000 },
        ];

        let current = 0;
        const runSequence = () => {
            setStep(sequence[current].step);
            setTimeout(() => {
                current = (current + 1) % sequence.length;
                runSequence();
            }, sequence[current].time);
        };

        const timeout = setTimeout(runSequence, 500);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="w-full max-w-2xl relative h-full flex flex-col items-center justify-center">

            {/* Step 0: Loading Bar */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: step === 0 ? 1 : 0 }}
                className="absolute flex flex-col items-center gap-4"
            >
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                <div className="font-mono text-emerald-400 text-sm tracking-widest">LOADING PROTOCOL</div>
                <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-emerald-400"
                        animate={{ width: step === 0 ? ["0%", "100%"] : "0%" }}
                        transition={{ duration: 1.8, ease: "easeInOut" }}
                    />
                </div>
            </motion.div>

            {/* Steps 1-3: Node Graph */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: step >= 1 && step <= 3 ? 1 : 0 }}
                className="absolute w-full h-full flex items-center justify-center p-8"
            >
                <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                    {/* SVG Connecting Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                        <motion.line
                            x1="50" y1="20" x2="20" y2="70"
                            stroke={step >= 2 ? "#10B981" : "#334155"} strokeWidth="1"
                            initial={{ pathLength: 0 }} animate={{ pathLength: step >= 2 ? 1 : 0 }}
                        />
                        <motion.line
                            x1="50" y1="20" x2="80" y2="70"
                            stroke={step >= 3 ? "#10B981" : "#334155"} strokeWidth="1"
                            initial={{ pathLength: 0 }} animate={{ pathLength: step >= 3 ? 1 : 0 }}
                        />
                        <motion.line
                            x1="20" y1="70" x2="80" y2="70"
                            stroke={step >= 3 ? "#10B981" : "#334155"} strokeWidth="1"
                            initial={{ pathLength: 0 }} animate={{ pathLength: step >= 3 ? 1 : 0 }}
                        />
                    </svg>

                    {/* Nodes */}
                    {/* Node 1: Incident Lead */}
                    <div className={`absolute top-[10%] left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-500 ${step >= 1 ? 'scale-110' : 'scale-100 opacity-50'}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-800 border-slate-700 text-slate-500'} border-2`}>
                            <Network className="w-6 h-6" />
                        </div>
                        <span className={`mt-2 font-mono text-xs ${step >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>INCIDENT_LEAD</span>
                    </div>

                    {/* Node 2: Pressure */}
                    <div className={`absolute bottom-[20%] left-[10%] flex flex-col items-center transition-all duration-500 ${step >= 2 ? 'scale-110' : 'scale-100 opacity-50'}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-800 border-slate-700 text-slate-500'} border-2`}>
                            <Network className="w-6 h-6" />
                        </div>
                        <span className={`mt-2 font-mono text-xs ${step >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>PRESSURE_SYS</span>
                    </div>

                    {/* Node 3: Observer */}
                    <div className={`absolute bottom-[20%] right-[10%] flex flex-col items-center transition-all duration-500 ${step >= 3 ? 'scale-110' : 'scale-100 opacity-50'}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-800 border-slate-700 text-slate-500'} border-2`}>
                            <Network className="w-6 h-6" />
                        </div>
                        <span className={`mt-2 font-mono text-xs ${step >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>OBSERVER</span>
                    </div>
                </div>
            </motion.div>

            {/* Step 4: Decision Artifact */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: step === 4 ? 1 : 0, scale: step === 4 ? 1 : 0.9, y: step === 4 ? 0 : 20 }}
                className="absolute bg-[#0A1410] border border-emerald-500/30 p-6 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center max-w-sm text-center"
            >
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                    <FileCheck className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-2 font-sans">Decision Artifact Generated</h3>
                <p className="text-sm text-slate-400 mb-4 font-mono">FSIR protocol successfully compiled. 80% compute saved.</p>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 w-full h-full" />
                </div>
            </motion.div>

        </div>
    );
};