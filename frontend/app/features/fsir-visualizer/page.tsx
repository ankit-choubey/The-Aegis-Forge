"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Mic, ArrowRight, Sparkles, Bot, BarChart3, Radio, Check } from "lucide-react";
import Link from "next/link";
import { ComparisonSlider } from "@/components/features/ComparisonSlider";

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
                { name: "FSIR Visualizer", icon: BarChart3, href: "/features/fsir-visualizer", active: true },
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

const benefits = [
    "Structured JSON output for every interview",
    "Quantifiable DQI (Data Quality Index) scores",
    "Automatic red flag detection",
    "Hire/No-Hire recommendations with confidence levels",
    "Competency breakdown across multiple dimensions"
];

export default function FSIRVisualizerPage() {
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
                                                    ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 font-semibold border-l-2 border-green-500"
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
                            <span className="inline-block px-3 py-1 rounded-full bg-green-100 dark:bg-green-500/20 text-xs font-bold text-green-600 dark:text-green-400 mb-4">
                                AEGIS PLATFORM
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                                FSIR Visualizer
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-3xl mb-8">
                                The Full Structured Interview Report (FSIR) transforms messy, subjective interview notes into
                                quantifiable, structured data. Drag the slider below to see the before and after.
                            </p>
                        </div>

                        {/* Comparison Slider Component */}
                        <div className="mb-16">
                            <ComparisonSlider />
                        </div>

                        {/* Benefits */}
                        <div className="mb-16 p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-100 dark:border-green-500/20">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                                Why Structured Reports Matter
                            </h2>
                            <ul className="space-y-4">
                                {benefits.map((benefit, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* CTA Section */}
                        <div className="text-center py-12 px-8 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                            <h2 className="text-3xl font-bold mb-4">Transform Your Interview Data</h2>
                            <p className="text-green-100 mb-8 max-w-xl mx-auto">
                                Start generating structured, actionable interview reports today.
                            </p>
                            <button className="px-8 py-4 bg-white text-green-600 font-bold rounded-full hover:shadow-xl transition-shadow flex items-center gap-2 mx-auto">
                                Get Started <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
