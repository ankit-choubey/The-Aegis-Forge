"use client";

import { useRef, useEffect } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

export const GameOfNumbers = () => {
    return (
        <section className="relative w-full py-24 bg-[#04100C] z-20 flex justify-center px-4 md:px-8">
            <div className="w-full max-w-7xl glass-panel glass-panel-hover rounded-3xl p-8 md:p-12 relative overflow-hidden border border-emerald-500/20">
                {/* Subtle Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-emerald-500/5 pointer-events-none" />

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 divide-y md:divide-y-0 md:divide-x divide-white/10">

                    {/* Stat 1 */}
                    <StatCounter
                        prefix="70-"
                        to={80}
                        suffix="%"
                        label="Interview Time Reduction"
                        desc="By shifting to executable state-machines rather than open-ended LLM chat, we reduce a 45-minute interview to a highly targeted 10-minute simulation."
                    />

                    {/* Stat 2 */}
                    <StatCounter
                        prefix=""
                        to={60}
                        suffix="%+"
                        label="Cost Reduction (<$2k per role)"
                        desc="Utilizing edge-browser telemetry instead of streaming continuous heavy video feeds back to servers. Less bandwidth = lower server energy consumption."
                    />

                    {/* Stat 3 */}
                    <StatCounter
                        prefix=""
                        to={0}
                        suffix=""
                        label="Interviewer Variance"
                        desc="Traditional hiring burns compute on unqualified rounds. Our 60-second FSIR ensures human and server energy is only spent on top-tier talent."
                    />

                </div>
            </div>
        </section>
    );
};

const StatCounter = ({ prefix, to, suffix, label, desc }: { prefix: string, to: number, suffix: string, label: string, desc: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const numRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (isInView && numRef.current) {
            let start = 0;
            const duration = 2000; // 2 seconds
            const startTime = performance.now();

            const updateNumber = (currentTime: number) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Ease out expo
                const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

                const currentVal = Math.floor(easeProgress * to);

                if (numRef.current) {
                    numRef.current.innerText = currentVal.toString();
                }

                if (progress < 1) {
                    requestAnimationFrame(updateNumber);
                }
            };
            requestAnimationFrame(updateNumber);
        }
    }, [isInView, to]);

    return (
        <div ref={ref} className="flex flex-col items-center text-center px-4 pt-8 md:pt-0 first:pt-0">
            <div className="mb-4">
                <span className="text-5xl md:text-6xl lg:text-7xl font-sans font-bold text-white drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                    {prefix}<span ref={numRef}>0</span>{suffix}
                </span>
            </div>
            <h4 className="text-xl font-bold text-emerald-400 mb-3 font-mono tracking-wide">
                {label}
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                {desc}
            </p>
        </div>
    );
};