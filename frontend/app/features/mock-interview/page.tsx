"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import {
    Mic, Video, Globe, Download, Sparkles, Check, Play, Star, Users,
    ArrowRight, MessageSquare, Brain, Target, Clock, Award, Zap
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

// Sidebar data
const sidebarLinks: {
    category: string;
    items: { name: string; icon: React.ComponentType<{ className?: string }>; href: string; active?: boolean; highlight?: boolean }[];
}[] = [
        {
            category: "Tools",
            items: [
                { name: "Interview Copilot", icon: Mic, href: "/features" },
                { name: "Mock Interview", icon: Video, href: "/features/mock-interview", active: true },
                { name: "Job Hunter", icon: Globe, href: "/features/job-hunter" }
            ]
        },
        {
            category: "Download for Mac/PC",
            items: [
                { name: "Download Now", icon: Download, href: "#", highlight: true }
            ]
        },
        {
            category: "Education",
            items: [
                { name: "Get Started", icon: Sparkles, href: "#" }
            ]
        }
    ];

// Trust logos
const trustLogos = ["TechCrunch", "Forbes", "Bloomberg", "Reuters", "Product Hunt"];

// Interview types for mock
const mockTypes = [
    { title: "Behavioral", icon: Users, description: "STAR method practice with AI feedback" },
    { title: "Technical", icon: Brain, description: "Coding and system design interviews" },
    { title: "Case Study", icon: Target, description: "Business case interview practice" },
    { title: "Leadership", icon: Award, description: "Executive and management interviews" }
];

// Features
const features = [
    {
        tag: "AI-Powered Feedback",
        title: "Get detailed feedback after every answer",
        description: "Our AI analyzes your responses in real-time and provides actionable feedback on content, delivery, and body language.",
        bullets: [
            "Instant scoring on clarity and relevance",
            "Body language and eye contact analysis",
            "Comparison with ideal answers",
            "Personalized improvement suggestions"
        ],
        gradient: "from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20"
    },
    {
        tag: "Realistic Scenarios",
        title: "Practice with industry-specific questions",
        description: "Choose from thousands of real interview questions used by top companies like Google, Amazon, Meta, and more.",
        bullets: [
            "10,000+ real interview questions",
            "Company-specific question banks",
            "Role-specific scenarios",
            "Updated weekly with new questions"
        ],
        gradient: "from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20"
    },
    {
        tag: "Track Progress",
        title: "Monitor your improvement over time",
        description: "See how your interview skills improve with detailed analytics and progress tracking.",
        bullets: [
            "Performance analytics dashboard",
            "Historical score comparison",
            "Weakness identification",
            "Customized practice plans"
        ],
        gradient: "from-green-100 to-teal-100 dark:from-green-900/20 dark:to-teal-900/20"
    }
];

// Testimonials
const testimonials = [
    {
        name: "Michael Zhang",
        role: "Software Engineer at Google",
        text: "I practiced 50+ mock interviews before my Google onsite. The AI feedback was incredibly detailed and helped me improve my STAR responses.",
        avatar: "MZ"
    },
    {
        name: "Emily Rodriguez",
        role: "PM at Microsoft",
        text: "The case study practice was exactly what I needed. Got an offer from Microsoft after just 2 weeks of preparation!",
        avatar: "ER"
    },
    {
        name: "David Kim",
        role: "Data Scientist at Netflix",
        text: "The technical interview section helped me nail my system design interview. Highly recommend for anyone preparing for FAANG.",
        avatar: "DK"
    }
];

// Stats
const stats = [
    { value: "10K+", label: "Mock Interviews Completed" },
    { value: "95%", label: "User Satisfaction" },
    { value: "3x", label: "Higher Success Rate" }
];

export default function MockInterviewPage() {
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
                                                    : item.highlight
                                                        ? "text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10"
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

                        {/* Hero Section */}
                        <div className="mb-12">
                            <span className="inline-block px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-500/20 text-xs font-bold text-orange-600 dark:text-orange-400 mb-4">
                                AI-Powered Practice
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                                Master Your Interview with <span className="text-orange-500">AI Mock Interviews</span>
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-3xl mb-8">
                                Practice makes perfect. Our AI-powered mock interview platform simulates real interview scenarios,
                                provides instant feedback, and helps you build confidence before the big day.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button className="px-8 py-4 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition-colors flex items-center gap-2">
                                    Start Free Practice <ArrowRight className="w-5 h-5" />
                                </button>
                                <button className="px-8 py-4 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white font-medium rounded-full hover:bg-slate-50 dark:hover:bg-white/10 transition-colors flex items-center gap-2">
                                    <Play className="w-5 h-5" /> Watch Demo
                                </button>
                            </div>
                        </div>

                        {/* Trust Section */}
                        <div className="mb-16 py-8 px-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6">Trusted by candidates hired at</p>
                            <div className="flex flex-wrap justify-center gap-8 items-center">
                                {trustLogos.map((logo, i) => (
                                    <span key={i} className="text-lg font-bold text-slate-400 dark:text-slate-500">{logo}</span>
                                ))}
                            </div>
                        </div>

                        {/* Mock Interview Types */}
                        <div className="mb-16">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-4">
                                Why Should I AI Mock Interviews with Aegis?
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 text-center mb-8 max-w-2xl mx-auto">
                                Choose from multiple interview types to practice exactly what you need
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {mockTypes.map((type, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ y: -4 }}
                                        className="p-6 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:shadow-lg transition-all cursor-pointer text-center"
                                    >
                                        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                                            <type.icon className="w-7 h-7 text-orange-500" />
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">{type.title}</h3>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">{type.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* What Makes Us Different */}
                        <div className="mb-16 text-center">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
                                What Makes Us AI Mock Interview Different?
                            </h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="p-6 rounded-xl bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-900/10 dark:to-pink-900/10 border border-orange-100 dark:border-orange-500/20">
                                    <Clock className="w-10 h-10 text-orange-500 mx-auto mb-4" />
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Unlimited Practice</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Practice as many times as you want, 24/7 availability</p>
                                </div>
                                <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-500/20">
                                    <Zap className="w-10 h-10 text-blue-500 mx-auto mb-4" />
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Instant Feedback</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Get detailed AI feedback immediately after each answer</p>
                                </div>
                                <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/10 dark:to-teal-900/10 border border-green-100 dark:border-green-500/20">
                                    <Target className="w-10 h-10 text-green-500 mx-auto mb-4" />
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Personalized</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Questions tailored to your target role and company</p>
                                </div>
                            </div>
                        </div>

                        {/* Stats Bar */}
                        <div className="flex flex-wrap justify-center gap-12 mb-16 py-8 border-y border-slate-200 dark:border-white/10">
                            {stats.map((stat, i) => (
                                <div key={i} className="text-center">
                                    <span className="text-4xl font-bold text-orange-500">{stat.value}</span>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Feature Sections */}
                        {features.map((feature, i) => (
                            <div key={i} className={`mb-16 p-8 rounded-2xl bg-gradient-to-br ${feature.gradient}`}>
                                <div className="grid md:grid-cols-2 gap-8 items-center">
                                    <div className={i % 2 === 1 ? "md:order-2" : ""}>
                                        <span className="inline-block px-3 py-1 rounded-full bg-white/80 dark:bg-black/30 text-xs font-bold text-orange-600 dark:text-orange-400 mb-4">
                                            {feature.tag}
                                        </span>
                                        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                                            {feature.title}
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                                            {feature.description}
                                        </p>
                                        <ul className="space-y-3">
                                            {feature.bullets.map((bullet, j) => (
                                                <li key={j} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                                                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                                                    {bullet}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className={i % 2 === 1 ? "md:order-1" : ""}>
                                        <div className="w-full aspect-video bg-white dark:bg-black/30 rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                                                    <Play className="w-10 h-10 text-orange-500" />
                                                </div>
                                                <p className="text-sm text-slate-400">Feature Demo</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Testimonials */}
                        <div className="mb-16">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
                                Real People, Real Results
                            </h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                {testimonials.map((t, i) => (
                                    <div key={i} className="p-6 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                        <div className="flex gap-1 mb-4">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 text-yellow-500 fill-yellow-500" />)}
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-300 text-sm mb-4 italic">"{t.text}"</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                                                {t.avatar}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white text-sm">{t.name}</p>
                                                <p className="text-xs text-slate-500">{t.role}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className="text-center py-12 px-8 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 text-white mb-8">
                            <h2 className="text-3xl font-bold mb-4">Start Your Mock Interview Journey Today</h2>
                            <p className="text-orange-100 mb-8 max-w-xl mx-auto">
                                Join thousands of successful candidates who nailed their interviews with our AI-powered practice platform.
                            </p>
                            <button className="px-8 py-4 bg-white text-orange-600 font-bold rounded-full hover:shadow-xl transition-shadow flex items-center gap-2 mx-auto">
                                Start Free Practice <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
