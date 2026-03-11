"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import clsx from "clsx";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const tabData = [
    {
        id: "real-time",
        title: "Real-Time Intelligence",
        heading: "Live Telemetry Analysis",
        body: "Aegis-Forge monitors millisecond-level behavioral shifts, detecting hesitation and cognitive load during the session without human bias.",
        tags: ["DQI Engine", "Live Streaming", "Webhook Integration"]
    },
    {
        id: "automated",
        title: "Automated Action",
        heading: "Deterministic Resolution",
        body: "When crisis parameters are met, the Protocol Governor automatically restructures the interview, skipping unqualified tangents and focusing purely on signal.",
        tags: ["Auto-Routing", "Crisis Management", "Zero Delay"]
    },
    {
        id: "strategic",
        title: "Strategic Planning",
        heading: "Predictive Analytics",
        body: "Aggregate data from thousands of sessions to forecast candidate success rates before a single human hour is spent on final-round interviews.",
        tags: ["Org-Level Insights", "Success Forecasting", "Bias Reduction"]
    },
    {
        id: "enterprise",
        title: "Enterprise Scale",
        heading: "Unlimited Concurrency",
        body: "Designed for massive hiring scaling. Deploy 1,000 distinct interview sessions simultaneously across multiple timezones with identical baseline rigor.",
        tags: ["Infinite Scalability", "Global Deployment", "SOC2 Ready"]
    }
];

export const InteractiveTabsGSAP = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [activeTabIdx, setActiveTabIdx] = useState(0);

    const activeContent = tabData[activeTabIdx];

    useEffect(() => {
        if (!sectionRef.current) return;
        const triggerId = "interactive-tabs-trigger";

        // Guard against duplicate pin instances during Fast Refresh/Strict re-mounts.
        try {
            ScrollTrigger.getById(triggerId)?.kill(true);
        } catch {}

        let ctx = gsap.context(() => {
            // Pin the entire section and scrub through the tabs
            ScrollTrigger.create({
                id: triggerId,
                trigger: sectionRef.current,
                start: "top top",
                end: "+=3000", // Scroll 3000px to go through all 4 tabs
                pin: true,
                scrub: 0.5,
                onUpdate: (self) => {
                    const progress = self.progress;
                    // Calculate which tab should be active (4 tabs total: 0-25%, 25-50%, 50-75%, 75-100%)
                    let index = Math.floor(progress * tabData.length);
                    // Prevent out of bounds on complete scroll
                    if (index >= tabData.length) index = tabData.length - 1;

                    setActiveTabIdx(index);
                }
            });

        }, sectionRef);

        return () => {
            try {
                ScrollTrigger.getById(triggerId)?.kill(true);
            } catch {}
            try {
                ctx.revert();
            } catch {}
        };
    }, []);

    return (
        <section ref={sectionRef} className="relative w-full h-screen bg-[#04100C] z-30 flex items-center justify-center p-6">
            <div className="max-w-7xl mx-auto w-full">

                {/* Header */}
                <div className="text-center mb-10">
                    <h2 className="text-4xl md:text-5xl font-sans font-bold text-white mb-2 tracking-tight">
                        Empower Your
                    </h2>
                    <h2 className="text-4xl md:text-5xl font-sans font-bold text-emerald-400 tracking-tight drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        Hiring Operations
                    </h2>
                </div>

                {/* Split Container */}
                <div className="flex flex-col lg:flex-row gap-8 w-full h-auto lg:h-[550px]">

                    {/* LEFT SIDE: Dynamic Content Card (60%) */}
                    <div className="w-full lg:w-[60%] h-[500px] lg:h-full relative rounded-2xl overflow-hidden border border-white/10"
                        style={{
                            backdropFilter: "blur(16px)",
                            backgroundColor: "rgba(255, 255, 255, 0.03)"
                        }}
                    >
                        {/* Dark Vector Illustration (Nano Banana 2 Background) */}
                        <div className="absolute inset-0 z-0 opacity-80 mix-blend-screen transition-opacity duration-500">
                            <Image
                                src="/dark-vector-network.png"
                                alt="Secure Data Network"
                                fill
                                className="object-cover object-center"
                            />
                            {/* Fade to dark at the top for text readability */}
                            <div className="absolute inset-0 bg-gradient-to-b from-[#04100C] via-[#04100C]/60 to-transparent" />
                            <div className="absolute inset-0 bg-[#04100C]/40" />
                        </div>

                        {/* Dynamic Content */}
                        <div className="relative z-10 w-full h-full p-8 md:p-12 flex flex-col justify-start">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeContent.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className="h-full flex flex-col"
                                >
                                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                                        {activeContent.heading}
                                    </h3>
                                    <p className="text-lg text-white/70 leading-relaxed max-w-xl">
                                        {activeContent.body}
                                    </p>

                                    <div className="mt-auto flex flex-wrap gap-3 pt-8">
                                        {activeContent.tags.map((tag, i) => (
                                            <div key={i} className="px-4 py-2 rounded-full border border-emerald-500/30 bg-[#04100C]/60 backdrop-blur-md">
                                                <span className="text-emerald-400 font-mono text-sm tracking-wide">{tag}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Tab Menu (40%) */}
                    <div className="w-full lg:w-[40%] h-full rounded-2xl border border-white/10 p-4 flex flex-col gap-3 justify-center"
                        style={{
                            backdropFilter: "blur(12px)",
                            backgroundColor: "rgba(255, 255, 255, 0.03)"
                        }}
                    >
                        {tabData.map((tab, idx) => (
                            <div
                                key={tab.id}
                                className={clsx(
                                    "w-full text-left px-6 py-6 rounded-xl transition-all duration-300 relative overflow-hidden group border",
                                    activeTabIdx === idx
                                        ? "bg-slate-900 border-white/10 border-l-[4px] border-l-emerald-500 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)] text-white scale-[1.02]"
                                        : "bg-white/5 border-transparent text-white/50"
                                )}
                            >
                                <span className="relative z-10 text-lg md:text-xl font-semibold tracking-wide flex items-center justify-between pointer-events-none">
                                    {tab.title}

                                    {/* Indicator dot showing scroll progress */}
                                    <span className={clsx(
                                        "w-2 h-2 rounded-full transition-colors duration-300",
                                        activeTabIdx === idx ? "bg-emerald-400 animate-pulse drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]" : "bg-transparent"
                                    )} />
                                </span>
                            </div>
                        ))}
                    </div>

                </div>

            </div>
        </section>
    );
};
