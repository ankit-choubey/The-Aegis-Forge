"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import {
    Mic, Play, Star, ArrowRight, Sparkles, Bot, BarChart3, Radio
} from "lucide-react";
import Link from "next/link";

// Sidebar data - Updated with Aegis features
const sidebarLinks: {
    category: string;
    items: { name: string; icon: React.ComponentType<{ className?: string }>; href: string; active?: boolean }[];
}[] = [
        {
            category: "Core Features",
            items: [
                { name: "Interview Copilot", icon: Mic, href: "/features", active: true },
                { name: "Agent Swarm", icon: Bot, href: "/features/agent-swarm" },
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

// Stats
const stats = [
    { value: "93%", label: "Success Rate" },
    { value: "50K+", label: "Interviews Assisted" },
    { value: "4.9", label: "User Rating", icon: Star }
];

// Testimonials
const testimonials = [
    { name: "Alex Chen", role: "Software Engineer at Google", text: "Interview Copilot helped me land my dream job. The real-time suggestions were incredibly helpful during my system design interview." },
    { name: "Sarah Kim", role: "Product Manager at Meta", text: "I was skeptical at first, but the AI understood exactly what the interviewer was asking and gave me perfect talking points." },
    { name: "James Wilson", role: "Data Scientist at Amazon", text: "The coding copilot feature is a game-changer. It helped me explain my thought process while coding in real-time." }
];

export default function FeaturesPage() {
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
                                                    ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold border-l-2 border-orange-500"
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

                    {/* How-to Card */}
                    <div className="mt-8 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-slate-500">How to:</span>
                            <button className="text-slate-400 hover:text-slate-600">×</button>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Set up your interview copilot</p>
                        <div className="w-full h-24 bg-slate-200 dark:bg-white/10 rounded-lg flex items-center justify-center">
                            <Play className="w-8 h-8 text-slate-400" />
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 lg:ml-64 p-6 md:p-10">
                    <div className="max-w-5xl mx-auto">

                        {/* Page Header */}
                        <div className="mb-12">
                            <span className="inline-block px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-500/20 text-xs font-bold text-orange-600 dark:text-orange-400 mb-4">
                                CORE FEATURE
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                                Interview Copilot
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-3xl">
                                Get real-time AI help during your interviews, completely invisible to interviewers with our AI Interview Copilot.
                                When you're in an interview and the interviewer asks a question, Interview Copilot instantly gives you personalized
                                answers based on your resume and experience. It works with <span className="text-orange-600 font-medium">Zoom, Teams, Google Meet, and more</span> platforms.
                                Your interviewer will never know it's there, it's completely undetectable.
                            </p>
                            <button className="mt-6 px-8 py-4 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition-colors flex items-center gap-2">
                                Try Interview Copilot <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Stats Bar */}
                        <div className="flex flex-wrap justify-center gap-8 mb-16 py-8 border-y border-slate-200 dark:border-white/10">
                            {stats.map((stat, i) => (
                                <div key={i} className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <span className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</span>
                                        {stat.icon && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
                                    </div>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Feature Demo Placeholder */}
                        <div className="mb-16 p-8 rounded-2xl bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/20 dark:to-pink-900/20">
                            <div className="w-full aspect-video bg-white dark:bg-black/30 rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                                        <Play className="w-10 h-10 text-orange-500" />
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Watch Interview Copilot in Action</p>
                                </div>
                            </div>
                        </div>

                        {/* Testimonials */}
                        <div className="mb-16">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
                                Loved by thousands of job seekers
                            </h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                {testimonials.map((t, i) => (
                                    <div key={i} className="p-6 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                        <div className="flex gap-1 mb-4">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 text-yellow-500 fill-yellow-500" />)}
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-300 text-sm mb-4 italic">"{t.text}"</p>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white text-sm">{t.name}</p>
                                            <p className="text-xs text-slate-500">{t.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className="text-center py-12 px-8 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                            <h2 className="text-3xl font-bold mb-4">Ready to ace your next interview?</h2>
                            <p className="text-orange-100 mb-8 max-w-xl mx-auto">
                                Join thousands of successful job seekers who landed their dream jobs with Interview Copilot.
                            </p>
                            <button className="px-8 py-4 bg-white text-orange-600 font-bold rounded-full hover:shadow-xl transition-shadow flex items-center gap-2 mx-auto">
                                Get Started Free <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
