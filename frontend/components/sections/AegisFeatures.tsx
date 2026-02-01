"use client";

import React from "react";
import { motion } from "framer-motion";
import { AgentSelector } from "@/components/features/AgentSelector";
import { ComparisonSlider } from "@/components/features/ComparisonSlider";
import { TelemetryRadar } from "@/components/features/TelemetryRadar";

export const AegisFeatures = () => {
    return (
        <section className="py-20 bg-slate-950">
            {/* Header */}
            <div className="max-w-5xl mx-auto px-6 text-center mb-16">
                <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="inline-block px-4 py-2 rounded-full bg-purple-500/20 text-purple-400 text-sm font-bold mb-6"
                >
                    AEGIS PLATFORM
                </motion.span>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-bold text-white mb-6"
                >
                    The Operating System for Hiring.
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-slate-400 max-w-2xl mx-auto"
                >
                    Plug Aegis into your existing Final Round AI pipeline. No migration needed.
                </motion.p>
            </div>

            {/* Feature Block 1: Agent Swarm */}
            <div className="max-w-5xl mx-auto px-6 mb-24">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="p-8 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
                        <h3 className="text-2xl font-bold text-white">The Agent Swarm</h3>
                    </div>
                    <p className="text-slate-400 mb-8 max-w-2xl">
                        Four autonomous AI agents work in parallel during every interview. Click an agent to see its real-time activity.
                    </p>
                    <AgentSelector />
                </motion.div>
            </div>

            {/* Feature Block 2: FSIR Visualizer */}
            <div className="max-w-5xl mx-auto px-6 mb-24">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="p-8 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                        <h3 className="text-2xl font-bold text-white">FSIR Visualizer</h3>
                    </div>
                    <p className="text-slate-400 mb-8 max-w-2xl">
                        See the difference between traditional interview notes and Aegis's structured FSIR output. Drag the slider to compare.
                    </p>
                    <ComparisonSlider />
                </motion.div>
            </div>

            {/* Feature Block 3: Telemetry Radar */}
            <div className="max-w-5xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="p-8 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse" />
                        <h3 className="text-2xl font-bold text-white">Telemetry Radar</h3>
                    </div>
                    <p className="text-slate-400 mb-8 max-w-2xl">
                        Invisible proctoring analyzes 5 behavioral vectors in real-time. Watch the radar pulse with live data.
                    </p>
                    <TelemetryRadar />
                </motion.div>
            </div>
        </section>
    );
};
