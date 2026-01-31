"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Mic, ArrowRight, Sparkles, Bot, BarChart3, Radio, Shield, Eye, Activity } from "lucide-react";
import Link from "next/link";
import { TelemetryRadar } from "@/components/features/TelemetryRadar";

// Sidebar data
const sidebarLinks: {
    category: string;
    items: { name: string; icon: React.ComponentType<{ className?: string }>; href: string; active?: boolean }[];
}[] = [
        {
            category: "Core Features",
            items: [
                { name: "Interview Copilot", icon: Mic, href: "/features" },
                { name: "Agent Swarm", icon: Bot, href: "/features/agent-swarm" },
                { name: "FSIR Visualizer", icon: BarChart3, href: "/features/fsir-visualizer" },
                { name: "Telemetry Radar", icon: Radio, href: "/features/telemetry-radar", active: true }
            ]
        },
        {
            category: "Resources",
            items: [
                { name: "Get Started", icon: Sparkles, href: "#" }
            ]
        }
    ];

const vectors = [
    { name: "Keystroke Speed", description: "Measures typing velocity patterns during coding challenges", icon: Activity },
    { name: "Gaze Stability", description: "Tracks eye movement patterns for focus and engagement", icon: Eye },
    { name: "Voice Confidence", description: "Analyzes vocal patterns for confidence and clarity", icon: Radio },
    { name: "Code Accuracy", description: "Evaluates syntax and logic correctness in real-time", icon: BarChart3 },
    { name: "Response Latency", description: "Measures reaction time to questions and prompts", icon: Shield }
];

export default function TelemetryRadarPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white transition-colors duration-300">
            <Navbar />

            <div className="flex pt-20">
                {/* Sidebar */}
                <aside className="w-64 border-r border-slate-200 dark:border-white/10 p-6 hidden lg:block fixed top-20 left-0 h-[calc(100vh-5rem)] overflow-y-auto bg-white dark:bg-black z-40">
                    {sidebarLinks.map((section, i) => (
                        <div key={i} className="mb-8">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                                {section.category}
                            </h3>
                            <ul className="space-y-1">
                                {section.items.map((item, j) => (
                                    <li key={j}>
                                        <Link
                                            href={item.href}
                                            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 text-sm transition-colors ${item.active
                                                    ? "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold border-l-2 border-cyan-500"
                                                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                                                }`}
                                        >
                                            <item.icon className="w-4 h-4" />
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </aside>

                {/* Main Content */}
                <main className="flex-1 lg:ml-64 p-6 md:p-10">
                    <div className="max-w-5xl mx-auto">

                        {/* Page Header */}
                        <div className="mb-12">
                            <span className="inline-block px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-xs font-bold text-cyan-600 dark:text-cyan-400 mb-4">
                                AEGIS PLATFORM
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                                Telemetry Radar
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-3xl mb-8">
                                Our invisible proctoring system analyzes 5 behavioral vectors in real-time, providing deep insights
                                into candidate performance without intrusive monitoring. Watch the radar pulse with live data below.
                            </p>
                        </div>

                        {/* Telemetry Radar Component */}
                        <div className="mb-16 p-8 rounded-2xl backdrop-blur-md bg-slate-900 dark:bg-white/5 border border-white/10">
                            <TelemetryRadar />
                        </div>

                        {/* Vector Explanations */}
                        <div className="mb-16">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
                                The 5 Behavioral Vectors
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {vectors.map((vector, i) => (
                                    <div key={i} className="p-5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                        <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center mb-3">
                                            <vector.icon className="w-5 h-5 text-cyan-500" />
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-1 text-sm">{vector.name}</h3>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">{vector.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className="text-center py-12 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                            <h2 className="text-3xl font-bold mb-4">Experience Invisible Proctoring</h2>
                            <p className="text-cyan-100 mb-8 max-w-xl mx-auto">
                                See how our advanced telemetry provides insights without intrusion.
                            </p>
                            <button className="px-8 py-4 bg-white text-cyan-600 font-bold rounded-full hover:shadow-xl transition-shadow flex items-center gap-2 mx-auto">
                                Request Demo <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
