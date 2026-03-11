"use client";

import { motion } from "framer-motion";
import { Puzzle, RadioTower, DatabaseZap, ScrollText } from "lucide-react";

const steps = [
    {
        icon: Puzzle,
        title: "Frai Plugin Triggered",
        description: "Recruiter initiates the role natively. No new platforms to learn.",
        color: "from-blue-500/20 to-transparent",
        border: "border-blue-500/30",
        textHover: "group-hover:text-blue-400"
    },
    {
        icon: RadioTower,
        title: "Edge-Powered Simulator",
        description: "Goal-driven avatars execute crisis-based work simulations. Telemetry runs locally, saving massive cloud compute.",
        color: "from-emerald-500/20 to-transparent",
        border: "border-emerald-500/30",
        textHover: "group-hover:text-emerald-400"
    },
    {
        icon: DatabaseZap,
        title: "Deterministic Engine",
        description: "Agent consensus replaces LLM hallucination. We rely on logic rules, not massive generative models, slashing energy use.",
        color: "from-amber-500/20 to-transparent",
        border: "border-amber-500/30",
        textHover: "group-hover:text-amber-400"
    },
    {
        icon: ScrollText,
        title: "The 60-Second FSIR",
        description: "Decision quality, integrity confidence, and micro-evidence delivered instantly back to the ATS.",
        color: "from-purple-500/20 to-transparent",
        border: "border-purple-500/30",
        textHover: "group-hover:text-purple-400"
    }
];

export const StepByStepFlow = () => {
    return (
        <section className="py-24 px-4 w-full max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-slate-100 font-sans tracking-tight mb-4">
                    How It <span className="text-emerald-400">Works</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                    The pipeline that redefines efficient talent screening.
                </p>
            </div>

            <div className="relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-[110px] left-[10%] right-[10%] h-[2px] bg-slate-800" />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: idx * 0.2 }}
                            className="relative flex flex-col items-center text-center group"
                        >
                            {/* Node Circle */}
                            <div className={`relative w-16 h-16 rounded-2xl bg-[#0A1410] border ${step.border} flex items-center justify-center mb-6 z-10 transition-transform duration-500 group-hover:scale-110 shadow-lg`}>
                                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                <step.icon className={`w-8 h-8 text-slate-500 ${step.textHover} transition-colors duration-500 relative z-10`} />
                            </div>

                            {/* Connecting Line (Mobile) */}
                            {idx !== steps.length - 1 && (
                                <div className="md:hidden w-[2px] h-8 bg-slate-800 my-2" />
                            )}

                            {/* Text Content */}
                            <div className="bg-[#050A08]/50 backdrop-blur-sm p-4 rounded-xl border border-transparent group-hover:border-slate-800 transition-colors">
                                <span className="text-[10px] font-mono text-emerald-500 mb-2 block font-bold tracking-widest">STEP 0{idx + 1}</span>
                                <h3 className="text-lg font-bold text-slate-200 mb-3">{step.title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed font-mono">
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};