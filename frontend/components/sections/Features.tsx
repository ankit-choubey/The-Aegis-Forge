"use client";

import React from "react";
import { BentoGrid, BentoGridItem } from "@/components/layout/BentoGrid";
import { HoverBumpCard } from "@/components/ui/HoverBumpCard";
import { Mic, Terminal, Video, FileText } from "lucide-react";

export const Features = () => {
    return (
        <section className="py-20 relative z-10" id="features">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-500 dark:from-white dark:to-white/60 mb-4">
                    Capabilities
                </h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                    Full-spectrum analysis for the modern hiring pipeline.
                </p>
            </div>

            <BentoGrid>
                {items.map((item, i) => (
                    <HoverBumpCard key={i} className={i === 3 || i === 6 ? "md:col-span-2" : ""}>
                        <BentoGridItem
                            title={item.title}
                            description={item.description}
                            header={item.header}
                            icon={item.icon}
                            className={i === 3 || i === 6 ? "md:col-span-2" : ""}
                        />
                    </HoverBumpCard>
                ))}
            </BentoGrid>
        </section>
    );
};

const Skeleton = ({ color }: { color: string }) => (
    <div className={`flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-neutral-900 dark:to-neutral-800 ${color}`} />
);

const ActivityIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
)

const items = [
    {
        title: "Live AI Interviewer",
        description: "Autonomous conversational agents that conduct technical screenings in real-time.",
        header: <Skeleton color="from-cyan-500/10 to-transparent" />,
        icon: <Mic className="h-4 w-4 text-cyan-500" />,
    },
    {
        title: "Live Telemetry",
        description: "Full-spectrum logging of candidate inputs, code execution, and sentiment.",
        header: <Skeleton color="from-blue-500/10 to-transparent" />,
        icon: <ActivityIcon className="h-4 w-4 text-blue-500" />,
    },
    {
        title: "60s FSIR Report",
        description: "Full Structured Interview Report generated instantly post-interview.",
        header: <Skeleton color="from-purple-500/10 to-transparent" />,
        icon: <FileText className="h-4 w-4 text-purple-500" />,
    },
    {
        title: "Code Execution Sandbox",
        description: "Secure, isolated environments for candidate code validation across 20+ languages.",
        header: <Skeleton color="from-emerald-500/10 to-transparent" />,
        icon: <Terminal className="h-4 w-4 text-emerald-500" />,
    },
];


