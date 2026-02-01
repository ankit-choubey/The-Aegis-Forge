"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const axes = [
    { label: "Keystroke Speed", key: "keystroke" },
    { label: "Gaze Stability", key: "gaze" },
    { label: "Voice Confidence", key: "voice" },
    { label: "Code Accuracy", key: "code" },
    { label: "Response Latency", key: "latency" }
];

// Generate random values for the radar
const generateValues = () => axes.map(() => 40 + Math.random() * 55);

export const TelemetryRadar = () => {
    const [values, setValues] = useState(generateValues);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Update values every 2 seconds
        const interval = setInterval(() => {
            setValues(generateValues());
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Calculate polygon points
    const centerX = 150;
    const centerY = 150;
    const radius = 100;
    const angleStep = (2 * Math.PI) / axes.length;

    const getPoint = (index: number, value: number) => {
        const angle = angleStep * index - Math.PI / 2;
        const r = (value / 100) * radius;
        return {
            x: centerX + r * Math.cos(angle),
            y: centerY + r * Math.sin(angle)
        };
    };

    const polygonPoints = values.map((v, i) => {
        const point = getPoint(i, v);
        return `${point.x},${point.y}`;
    }).join(' ');

    const axisEndpoints = axes.map((_, i) => getPoint(i, 100));
    const labelPositions = axes.map((_, i) => getPoint(i, 125));

    if (!isClient) {
        return <div className="w-full aspect-square" />;
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <svg viewBox="0 0 300 300" className="w-full h-auto">
                {/* Background circles */}
                {[20, 40, 60, 80, 100].map((r) => (
                    <circle
                        key={r}
                        cx={centerX}
                        cy={centerY}
                        r={(r / 100) * radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                    />
                ))}

                {/* Axis lines */}
                {axisEndpoints.map((point, i) => (
                    <line
                        key={i}
                        x1={centerX}
                        y1={centerY}
                        x2={point.x}
                        y2={point.y}
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="1"
                    />
                ))}

                {/* Data polygon with animation */}
                <motion.polygon
                    points={polygonPoints}
                    fill="rgba(157, 0, 255, 0.3)"
                    stroke="#9D00FF"
                    strokeWidth="2"
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: 1,
                        points: polygonPoints
                    }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                />

                {/* Pulse effect */}
                <motion.polygon
                    points={polygonPoints}
                    fill="none"
                    stroke="#9D00FF"
                    strokeWidth="1"
                    animate={{
                        opacity: [0.5, 0, 0.5],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{ transformOrigin: `${centerX}px ${centerY}px` }}
                />

                {/* Data points */}
                {values.map((v, i) => {
                    const point = getPoint(i, v);
                    return (
                        <motion.circle
                            key={i}
                            cx={point.x}
                            cy={point.y}
                            r="4"
                            fill="#9D00FF"
                            stroke="white"
                            strokeWidth="2"
                            initial={{ scale: 0 }}
                            animate={{
                                scale: 1,
                                cx: point.x,
                                cy: point.y
                            }}
                            transition={{ duration: 0.5, delay: i * 0.05 }}
                        />
                    );
                })}

                {/* Labels */}
                {labelPositions.map((pos, i) => (
                    <text
                        key={i}
                        x={pos.x}
                        y={pos.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-slate-400 text-[10px] font-medium"
                    >
                        {axes[i].label}
                    </text>
                ))}

                {/* Center indicator */}
                <circle
                    cx={centerX}
                    cy={centerY}
                    r="8"
                    fill="#9D00FF"
                    className="animate-pulse"
                />
            </svg>

            {/* Live indicator */}
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-slate-400">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
                <span>Live Telemetry • Analyzing 5 Vectors</span>
            </div>

            {/* Current values */}
            <div className="grid grid-cols-5 gap-2 mt-4">
                {axes.map((axis, i) => (
                    <motion.div
                        key={axis.key}
                        className="text-center p-2 rounded-lg bg-white/5 border border-white/10"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className="text-purple-400 font-bold text-lg">
                            {Math.round(values[i])}%
                        </div>
                        <div className="text-[8px] text-slate-500 uppercase tracking-wider">
                            {axis.key}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
