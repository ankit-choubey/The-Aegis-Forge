"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Mic, Play, Star, ArrowRight, Sparkles, Bot, BarChart3, Radio } from "lucide-react";
import Link from "next/link";
import { AgentSelector } from "@/components/features/AgentSelector";

// Sidebar data
const sidebarLinks: {
    category: string;
    items: { name: string; icon: React.ComponentType<{ className?: string }>; href: string; active?: boolean }[];
}[] = [
        {
            category: "Core Features",
            items: [
                { name: "Interview Copilot", icon: Mic, href: "/features" },
                { name: "Agent Swarm", icon: Bot, href: "/features/agent-swarm", active: true },
                { name: "FSIR Visualizer", icon: BarChart3, href: "/features/fsir-visualizer" },
                { name: "Telemetry Radar", icon: Radio, href: "/features/telemetry-radar" }
            ]
        },
        {
            category: "Resources",
            items: [
                { name: "Get Started", icon: Sparkles, href: "#" }
            ]
        }
    ];

export default function AgentSwarmPage() {
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
                                                    ? "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold border-l-2 border-purple-500"
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
                            <span className="inline-block px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/20 text-xs font-bold text-purple-600 dark:text-purple-400 mb-4">
                                AEGIS PLATFORM
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                                The Agent Swarm
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-3xl mb-8">
                                Four autonomous AI agents work in parallel during every interview. Each agent has a specialized role -
                                from orchestrating crisis simulations to ensuring fairness and bias prevention. Click an agent below to see its real-time activity logs.
                            </p>
                        </div>

                        {/* Agent Selector Component */}
                        <div className="mb-16 p-8 rounded-2xl backdrop-blur-md bg-slate-900 dark:bg-white/5 border border-white/10">
                            <AgentSelector />
                        </div>

                        {/* Agent Details */}
                        <div className="grid md:grid-cols-2 gap-6 mb-16">
                            <div className="p-6 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center mb-4">
                                    <Bot className="w-6 h-6 text-purple-500" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Multi-Agent Architecture</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Unlike single-model solutions, our swarm approach allows for specialized agents that handle different aspects
                                    of the interview simultaneously.
                                </p>
                            </div>
                            <div className="p-6 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mb-4">
                                    <Star className="w-6 h-6 text-green-500" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Zero Bias Guarantee</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    The Governor agent continuously monitors for any bias in questioning or evaluation, ensuring a fair
                                    process for every candidate.
                                </p>
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className="text-center py-12 px-8 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-600 text-white">
                            <h2 className="text-3xl font-bold mb-4">Experience the Agent Swarm</h2>
                            <p className="text-purple-100 mb-8 max-w-xl mx-auto">
                                See how our multi-agent architecture transforms the interview process.
                            </p>
                            <button className="px-8 py-4 bg-white text-purple-600 font-bold rounded-full hover:shadow-xl transition-shadow flex items-center gap-2 mx-auto">
                                Schedule Demo <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
