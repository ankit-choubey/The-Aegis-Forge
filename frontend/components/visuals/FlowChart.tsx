"use client";

import { motion } from "framer-motion";
import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowRight, FileText, LayoutDashboard, Share2, UserCheck } from "lucide-react";

export const FlowChart = () => {
    return (
        <section className="py-24 relative z-10 bg-muted/30">
            <div className="max-w-7xl mx-auto px-6 text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-500 mb-6 font-[family-name:var(--font-space-grotesk)]">
                    Create • Publish • Select
                </h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    Streamline the entire hiring lifecycle with our automated pipeline.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                {/* Horizontal Steps */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative items-start">

                    {/* Steps Map */}
                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center relative group">

                            {/* Connector Line (Desktop) */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-8 left-1/2 w-full h-[2px] bg-slate-200 dark:bg-slate-800 -z-10">
                                    <div className="absolute top-1/2 left-0 -translate-y-1/2 right-0"></div>
                                    <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 w-5 h-5 translate-x-1/2" />
                                </div>
                            )}

                            {/* Number Badge */}
                            <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-800 shadow-xl flex items-center justify-center text-xl font-bold text-primary mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10">
                                {index + 1}
                                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                    {step.badge}
                                </div>
                            </div>

                            {/* Content */}
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{step.title}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 text-center leading-relaxed">
                                {step.description}
                            </p>

                            {/* Hover Details Card (JobMojito Style simple dropdown/below) */}
                            <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute top-full w-full pt-4 pointer-events-none md:pointer-events-auto">
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 text-xs text-left text-slate-600 dark:text-slate-300">
                                    <ul className="space-y-2">
                                        {step.details.map((d, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span className="text-green-500">✓</span> {d}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>

                {/* Spacer for the hover cards */}
                <div className="h-32 hidden md:block"></div>

            </div>
        </section>
    );
};

const steps = [
    {
        title: "Create Interview",
        badge: "Fast",
        description: "Generate an interview protocol using AI or select from our library of 500+ templates.",
        details: ["Customizable competencies", "20+ Coding Languages", "Behavioral & Tech Mix"]
    },
    {
        title: "Publish & Invite",
        badge: "Secure",
        description: "Post your specialized lint to job boards or invite candidates directly via email.",
        details: ["Bulk CSV Upload", "ATS Integration", "Anti-Cheat Enabled"]
    },
    {
        title: "AI Interview",
        badge: "Live",
        description: "Candidates take the interview with our autonomous agent. Real-time probing & analysis.",
        details: ["Natural Conversation", "Code Execution", "Sentiment Analysis"]
    },
    {
        title: "Select Candidates",
        badge: "Values",
        description: "Review comprehensive FSIR reports, watch replays, and shortlist the top 1%.",
        details: ["Scored Reports", "Red Flag Detection", "One-Click Hire"]
    }
];
