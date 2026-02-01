"use client";

import { motion } from "framer-motion";
import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";

const testimonials = [
    { name: "Alex Vahn", role: "CTO, CyberDyne", text: "The structured reports save us 15 hours per hire." },
    { name: "Sarah Chen", role: "VP Engineering, Nexus", text: "Finally, an AI that understands system design nuance." },
    { name: "Marcus Ray", role: "Lead Recruiter, Aegis", text: "The telemetry data is a game changer for debriefs." },
    { name: "Elena K.", role: "Founder, Stealth", text: "Setup was instant. The candidates loved the interface." },
];

export const Testimonials = () => {
    return (
        <section className="py-20 overflow-hidden relative z-10">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Build Trust</h2>
                <p className="text-slate-600 dark:text-slate-400">Validated by engineering leaders.</p>
            </div>

            <div className="flex relative w-full overflow-hidden mask-linear-gradient">
                {/* Marquee Animation */}
                <motion.div
                    className="flex gap-6 whitespace-nowrap"
                    animate={{ x: [0, -1000] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                    {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
                        <GlassCard key={i} className="w-[300px] md:w-[400px] shrink-0 whitespace-normal p-6 border-slate-200 dark:border-cyan-500/10 hover:border-cyan-500/30 transition-colors">
                            <p className="text-slate-700 dark:text-slate-300 italic mb-4">"{t.text}"</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                                    {t.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-slate-900 dark:text-white font-bold text-sm">{t.name}</h4>
                                    <p className="text-xs text-slate-500">{t.role}</p>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
