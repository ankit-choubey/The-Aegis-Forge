"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

export const ComparisonSlider = () => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        setSliderPosition((x / rect.width) * 100);
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    useEffect(() => {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    const handleMouseDown = () => {
        isDragging.current = true;
    };

    const fsirData = `{
  "candidate_id": "8821",
  "DQI_Score": 94.2,
  "hire_recommendation": "STRONG_YES",
  "red_flags": 0,
  "competencies": {
    "technical": 96,
    "communication": 91,
    "problem_solving": 95
  }
}`;

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-white/10 select-none"
        >
            {/* Left Side - Old Method */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                <div className="p-6 h-full flex flex-col">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold mb-4 w-fit">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        TIME CONSUMING
                    </div>
                    <h4 className="text-slate-400 font-bold mb-3">Traditional Interview Notes</h4>
                    <div className="flex-1 bg-slate-800/50 rounded-lg p-4 font-mono text-xs text-slate-500 blur-[1px] leading-relaxed overflow-hidden">
                        <p>Candidate seemed nervous at start...</p>
                        <p className="mt-2">Asked about previous experience with databases. Said they used MySQL and PostgreSQL...</p>
                        <p className="mt-2">Technical question: How would you optimize a slow query? Answer was okay but not great...</p>
                        <p className="mt-2">Behavioral: Tell me about a time... [unclear notes]</p>
                        <p className="mt-2">Overall impression: Maybe? Need to discuss with team...</p>
                        <p className="mt-2 text-red-400/50">⚠️ Missing structured data</p>
                        <p className="mt-2 text-red-400/50">⚠️ Subjective assessment</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Aegis FSIR */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-slate-950 to-purple-950/50"
                style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
            >
                <div className="p-6 h-full flex flex-col">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold mb-4 w-fit">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        AEGIS FSIR
                    </div>
                    <h4 className="text-purple-300 font-bold mb-3">Structured Interview Report</h4>
                    <div className="flex-1 bg-black/50 rounded-lg p-4 font-mono text-xs overflow-hidden border border-purple-500/30">
                        <pre className="text-purple-300 leading-relaxed">
                            <code>
                                {fsirData.split('\n').map((line, i) => (
                                    <span key={i} className="block">
                                        {line.includes(':') ? (
                                            <>
                                                <span className="text-slate-500">{line.split(':')[0]}:</span>
                                                <span className={
                                                    line.includes('STRONG_YES') ? 'text-green-400' :
                                                        line.includes('94.2') || line.includes('96') || line.includes('95') ? 'text-cyan-400' :
                                                            line.includes('0') && line.includes('red_flags') ? 'text-green-400' :
                                                                'text-white'
                                                }>{line.split(':').slice(1).join(':')}</span>
                                            </>
                                        ) : (
                                            <span className="text-slate-400">{line}</span>
                                        )}
                                    </span>
                                ))}
                            </code>
                        </pre>
                    </div>
                </div>
            </div>

            {/* Slider Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10"
                style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                onMouseDown={handleMouseDown}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                    <div className="flex gap-0.5">
                        <div className="w-0.5 h-4 bg-slate-400 rounded" />
                        <div className="w-0.5 h-4 bg-slate-400 rounded" />
                    </div>
                </div>
            </div>

            {/* Labels */}
            <div className="absolute bottom-4 left-4 text-xs font-bold text-slate-500 bg-black/50 px-2 py-1 rounded">
                BEFORE
            </div>
            <div className="absolute bottom-4 right-4 text-xs font-bold text-purple-400 bg-black/50 px-2 py-1 rounded">
                AFTER
            </div>
        </div>
    );
};
