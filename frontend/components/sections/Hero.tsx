"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Play } from "lucide-react";
import Link from "next/link";
import React from "react";

export const Hero = () => {
    return (
        <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center pt-20">

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center space-x-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full px-3 py-1 mb-8 backdrop-blur-sm"
            >
                <span className="flex h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></span>
                <span className="text-sm text-cyan-700 dark:text-cyan-100/80 tracking-wider font-mono">SYSTEM ONLINE V2.4</span>
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl md:text-8xl font-bold tracking-tight mb-6 font-[family-name:var(--font-space-grotesk)] text-black dark:text-white drop-shadow-md dark:drop-shadow-none"
            >
                The Executable <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                    Interview Protocol
                </span>
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-2xl text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed"
            >
                Turn conversations into structured data with Agentic Proctoring. <br className="hidden md:block" />
                Automate the hiring pipeline with military-grade precision.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col md:flex-row items-center gap-4"
            >
                <Link href="/dashboard">
                    <button className="group relative px-8 py-4 bg-cyan-500 text-black font-bold rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)]">
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 transform skew-y-12"></div>
                        <span className="relative flex items-center gap-2">
                            Deploy Agent <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </span>
                    </button>
                </Link>

                <button className="px-8 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-md">
                    View Documentation <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
            </motion.div>
        </section>
    );
};
