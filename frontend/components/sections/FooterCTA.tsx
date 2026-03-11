"use client";

import { motion } from "framer-motion";
import { Leaf } from "lucide-react";
import Link from "next/link";

export const FooterCTA = () => {
    return (
        <footer className="relative w-full pt-32 pb-12 overflow-hidden flex flex-col items-center">
            {/* Background Lighting Extention */}
            <div className="absolute inset-0 bg-[#050A08]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

            {/* Main CTA */}
            <div className="relative z-10 w-full max-w-4xl px-4 text-center mb-32">
                <h2 className="text-4xl md:text-6xl font-bold text-slate-100 font-sans tracking-tight mb-8">
                    Stop burning compute on bad interviews.
                </h2>
                <p className="text-slate-400 text-lg md:text-2xl mb-12 max-w-2xl mx-auto font-mono">
                    Deploy sustainable screening infrastructure today.
                </p>

                <button className="relative group inline-flex items-center justify-center px-12 py-5 text-lg font-bold font-mono tracking-widest hover:scale-105 transition-transform duration-300">
                    {/* Pulsing Backlight */}
                    <div className="absolute inset-0 rounded-full bg-emerald-500/40 blur-[20px] group-hover:bg-emerald-400/60 transition-colors animate-pulse" />
                    {/* Solid button */}
                    <div className="absolute inset-0 rounded-full bg-[#10B981] shadow-[0_0_40px_rgba(16,185,129,0.5)] border-2 border-emerald-300/50" />
                    <span className="relative z-10 text-slate-950 group-hover:text-black drop-shadow-md">
                        INITIALIZE PROTOCOL
                    </span>
                </button>
            </div>

            {/* Actual Footer */}
            <div className="relative z-10 w-full max-w-7xl px-8 border-t border-slate-800/60 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-mono text-slate-400 font-bold tracking-widest">
                        ENGINEERED FOR SUSTAINABILITY.
                    </span>
                </div>

                <nav className="flex gap-6 text-sm font-mono text-slate-500">
                    <Link href="#" className="hover:text-emerald-400 transition-colors">Privacy</Link>
                    <Link href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</Link>
                    <Link href="#" className="hover:text-emerald-400 transition-colors">Docs</Link>
                </nav>
            </div>
        </footer>
    );
};