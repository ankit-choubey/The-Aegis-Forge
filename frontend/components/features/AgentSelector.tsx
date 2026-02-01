"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Zap, Eye, Shield } from "lucide-react";

const agents = [
    {
        id: "incident-lead",
        name: "Incident Lead",
        icon: Bot,
        log: "Injecting Database Outage Scenario...",
        description: "Orchestrates crisis simulations"
    },
    {
        id: "pressure-agent",
        name: "Pressure Agent",
        icon: Zap,
        log: "Challenging candidate's SQL optimization...",
        description: "Tests under pressure"
    },
    {
        id: "observer",
        name: "Observer",
        icon: Eye,
        log: "Detected elevated stress markers (Heart Rate proxy)...",
        description: "Monitors biometrics"
    },
    {
        id: "governor",
        name: "Governor",
        icon: Shield,
        log: "Bias Check: Passed. Protocol Adherence: 100%.",
        description: "Ensures fairness"
    }
];

export const AgentSelector = () => {
    const [activeAgent, setActiveAgent] = useState(0);

    return (
        <div className="w-full">
            {/* Agent Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {agents.map((agent, i) => (
                    <motion.button
                        key={agent.id}
                        onClick={() => setActiveAgent(i)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative p-4 rounded-xl backdrop-blur-md border transition-all duration-300 ${activeAgent === i
                                ? "bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/20"
                                : "bg-white/5 border-white/10 hover:border-white/20"
                            }`}
                    >
                        {/* Glow effect for active */}
                        {activeAgent === i && (
                            <motion.div
                                layoutId="agent-glow"
                                className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-violet-500/20"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            />
                        )}

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${activeAgent === i
                                    ? "bg-purple-500 text-white"
                                    : "bg-white/10 text-slate-400"
                                }`}>
                                <agent.icon className="w-6 h-6" />
                            </div>
                            <h4 className={`font-bold text-sm transition-colors ${activeAgent === i ? "text-purple-400" : "text-slate-300"
                                }`}>
                                {agent.name}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">{agent.description}</p>
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* Console Display */}
            <div className="relative p-6 rounded-xl bg-black/80 border border-white/10 font-mono overflow-hidden">
                {/* Scan line effect */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent animate-pulse" />
                </div>

                <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="ml-2">aegis-console</span>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeAgent}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="text-slate-400 text-sm mb-2">
                            <span className="text-purple-400">$</span> agent-swarm --select {agents[activeAgent].id}
                        </div>
                        <div className="text-green-400 text-sm">
                            <span className="text-slate-500">[{agents[activeAgent].name.toUpperCase()}]</span> {agents[activeAgent].log}
                        </div>
                        <div className="text-slate-600 text-xs mt-2 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Agent Active • Response Time: 12ms
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};
