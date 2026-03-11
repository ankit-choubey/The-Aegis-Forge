"use client";

import { motion } from "framer-motion";
import { Network, Eye, Zap, ShieldAlert } from "lucide-react";

export const AgentBentoBox = () => {
    const agents = [
        {
            id: "incident-lead",
            title: "Incident Lead",
            role: "Orchestration & State Management",
            desc: "Handles overall candidate progression through the state-machine. Keeps the simulation on track without hallucinating side-quests.",
            icon: Network,
            colSpan: "md:col-span-8",
            rowSpan: "md:row-span-2",
            wireframe: IncidentLeadWireframe,
            accent: "from-emerald-500/20 to-emerald-900/10"
        },
        {
            id: "pressure",
            title: "Pressure System",
            role: "Stress Injection",
            desc: "Introduces dynamic situational complexity (e.g. server outage scenarios) based on the candidate's latency to respond.",
            icon: Zap,
            colSpan: "md:col-span-4",
            rowSpan: "md:row-span-1",
            wireframe: DefaultWireframe,
            accent: "from-amber-500/10 to-transparent"
        },
        {
            id: "observer",
            title: "Silent Observer",
            role: "Micro-Evidence Extractor",
            desc: "Evaluates syntax, tone, and logical consistency off the critical path, ensuring zero interaction latency.",
            icon: Eye,
            colSpan: "md:col-span-4",
            rowSpan: "md:row-span-1",
            wireframe: DefaultWireframe,
            accent: "from-blue-500/10 to-transparent"
        },
        {
            id: "governor",
            title: "Protocol Governor",
            role: "Guardrails & Integrity",
            desc: "Prevents prompt injection from candidates and ensures the evaluation strictly adheres to the role's rubrics.",
            icon: ShieldAlert,
            colSpan: "md:col-span-12",
            rowSpan: "md:row-span-1",
            wireframe: ProtocolWireframe,
            accent: "from-purple-500/10 to-transparent"
        }
    ];

    return (
        <section className="py-24 px-4 w-full max-w-7xl mx-auto relative z-10" id="architecture">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-slate-100 font-sans tracking-tight mb-4">
                    The <span className="text-emerald-400">Agent</span> Network
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                    Specialized, fast, and concurrent. We rely on targeted logic rules, not massive generative models.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[250px]">
                {agents.map((agent, idx) => (
                    <motion.div
                        key={agent.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className={`group relative overflow-hidden rounded-3xl glass-panel glass-panel-hover flex flex-col p-8 ${agent.colSpan} ${agent.rowSpan}`}
                    >
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${agent.accent} opacity-50 group-hover:opacity-100 transition-opacity duration-700`} />

                        {/* Wireframe Hover Reveal */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none flex items-center justify-end overflow-hidden">
                            <div className="w-[150%] h-[150%] translate-x-[20%] opacity-20 text-emerald-400">
                                <agent.wireframe />
                            </div>
                        </div>

                        {/* Content Layer */}
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <agent.icon className="w-8 h-8 text-emerald-400 mb-6 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] transition-all duration-300" />
                                <div className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest mb-2 border border-emerald-500/30 inline-block px-2 py-1 rounded bg-black/50">
                                    {agent.role}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-100 mb-2 font-sans">{agent.title}</h3>
                            </div>
                            <p className="text-sm font-mono text-slate-400 max-w-md group-hover:text-slate-300 transition-colors">
                                {agent.desc}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

// SVG Wireframe Abstracts
const IncidentLeadWireframe = () => (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5" className="w-full h-full animate-[spin_60s_linear_infinite]">
        <circle cx="50" cy="50" r="40" strokeDasharray="4 4" />
        <circle cx="50" cy="50" r="30" strokeDasharray="2 6" />
        <path d="M 50 10 L 50 90 M 10 50 L 90 50 M 20 20 L 80 80 M 20 80 L 80 20" strokeOpacity="0.3" />
        <circle cx="50" cy="50" r="10" fill="currentColor" fillOpacity="0.1" />
    </svg>
);

const DefaultWireframe = () => (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full opacity-50">
        {[...Array(10)].map((_, i) => (
            <rect key={i} x={10 + (i * 5)} y={20} width={2} height={Math.random() * 60} opacity={0.3 + Math.random() * 0.5} />
        ))}
        <path d="M 0 50 Q 25 20 50 50 T 100 50" strokeDasharray="2 4" />
    </svg>
);

const ProtocolWireframe = () => (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5" className="w-full h-full">
        <rect x="10" y="20" width="80" height="60" rx="5" strokeDasharray="5 5" />
        <path d="M 10 40 L 90 40 M 10 60 L 90 60 L 50 20 L 10 60" opacity="0.5" />
        <circle cx="50" cy="40" r="5" fill="currentColor" fillOpacity="0.2" />
    </svg>
);