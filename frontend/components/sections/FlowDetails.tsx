"use client";

import React from "react";
import { Check, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const details = [
    {
        tag: "Setup in minutes",
        title: "Create your AI interview",
        description: "Generate from a job description, then customize questions, branding and languages.",
        checks: [
            "Generate questions from your job description",
            "Customize competencies and follow-ups",
            "Choose languages and avatar",
            "Review scoring rubric"
        ],
        button: "AI Interviews"
    },
    {
        tag: "Frictionless",
        title: "Publish and invite",
        description: "Publish to your portal or share a link. Candidates self serve and start immediately.",
        checks: [
            "Publish to your branded portal",
            "Invite via link, QR or ATS",
            "Mobile and desktop friendly",
            "Automatic reminders"
        ],
        button: "Interview Portal"
    },
    {
        tag: "Real-time",
        title: "AI interview & scoring",
        description: "Candidates speak with the AI recruiter, answers are scored and risk checks run automatically.",
        checks: [
            "Natural voice conversation with follow-ups",
            "Transcript, audio/video recording",
            "Multi-language support",
            "Candidate can ask about the job position"
        ],
        button: "Candidate Experience"
    },
    {
        tag: "Decide faster",
        title: "Review and select",
        description: "Ranked results with transcripts, scores and risk flags. Move the best forward in seconds.",
        checks: [
            "Ranked list with match scores",
            "See transcripts, audio/video",
            "Risk flags and notes",
            "One-click advance to next stage"
        ],
        button: "Risk Assessment"
    }
];

export const FlowDetails = () => {
    return (
        <section className="py-20 relative z-10 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {details.map((item, i) => (
                    <GlassCard key={i} className="flex flex-col items-start text-left p-8 border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 hover:shadow-2xl transition-all duration-300">
                        <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 mb-6">
                            {item.tag}
                        </span>

                        <h3 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900 dark:text-white">
                            {item.title}
                        </h3>

                        <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                            {item.description}
                        </p>

                        <ul className="space-y-3 mb-8 w-full">
                            {item.checks.map((check, j) => (
                                <li key={j} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                                    {check}
                                </li>
                            ))}
                        </ul>

                        <button className="mt-auto px-6 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
                            {item.button} <ArrowRight className="w-4 h-4" />
                        </button>
                    </GlassCard>
                ))}
            </div>
        </section>
    );
};
