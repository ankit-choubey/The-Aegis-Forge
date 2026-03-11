"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scan, Activity, Eye, Cpu, Database } from "lucide-react";

type LogEntry = {
    id: number;
    text: string;
    icon: any;
    color: string;
};

export const TelemetryPopup = ({ currentAlert }: { currentAlert?: { text: string; icon: any; color: string } | null }) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const idCounter = useRef(0);

    const simulationSequence = [
        { text: "INITIALIZING FACE MESH", icon: Scan, color: "text-[#00E5FF]", delay: 2000 },
        { text: "CALIBRATING LANDMARKS...", icon: Activity, color: "text-emerald-400", delay: 4000 },
        { text: "GAZE VECTORS LOCKED", icon: Eye, color: "text-[#00E5FF]", delay: 8000 },
        { text: "COGNITIVE LOAD: STABLE", icon: Cpu, color: "text-amber-400", delay: 15000 },
        { text: "BIOMETRIC SYNC ENGAGED", icon: Database, color: "text-[#00E5FF]", delay: 25000 },
        { text: "MICRO-EXPRESSION TRACKING", icon: Scan, color: "text-fuchsia-400", delay: 35000 },
        { text: "STRESS BASELINE EST.", icon: Activity, color: "text-emerald-400", delay: 45000 },
    ];

    useEffect(() => {
        const timeouts: NodeJS.Timeout[] = [];

        simulationSequence.forEach((event) => {
            const timeout = setTimeout(() => {
                const newId = idCounter.current++;
                setLogs(currentLogs => {
                    const newLogs = [...currentLogs, { id: newId, text: event.text, icon: event.icon, color: event.color }];
                    // Keep only 1 record for single column layout
                    if (newLogs.length > 1) return newLogs.slice(-1);
                    return newLogs;
                });
            }, event.delay);
            timeouts.push(timeout);
        });

        // Add periodic background scanning logs
        const interval = setInterval(() => {
            const newId = idCounter.current++;
            setLogs(currentLogs => {
                const newLogs = [...currentLogs, { 
                    id: newId, 
                    text: `HEARTBEAT_ACK_${Math.floor(Math.random() * 9999)}`, 
                    icon: Activity, 
                    color: "text-zinc-500" 
                }];
                if (newLogs.length > 1) return newLogs.slice(-1);
                return newLogs;
            });
        }, 12000);

        return () => {
            timeouts.forEach(clearTimeout);
            clearInterval(interval);
        };
    }, []);

    // Determine what to display: currentAlert overrides normal logs
    const displayLog = currentAlert 
        ? { id: idCounter.current + 9999, ...currentAlert } 
        : (logs.length > 0 ? logs[0] : null);

    return (
        <div className="relative w-full h-12 z-50 pointer-events-none flex flex-col justify-center overflow-hidden shrink-0 mt-2">
            <AnimatePresence mode="wait">
                {displayLog && (
                    <motion.div
                        key={currentAlert ? "alert" : displayLog.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-3 bg-[#050508] border border-white/10 rounded-lg p-2.5 shadow-[0_0_15px_rgba(0,0,0,0.5)] w-full"
                    >
                        <div className={`p-1.5 rounded bg-white/5 border border-white/10 ${displayLog.color}`}>
                            <displayLog.icon className="w-4 h-4" />
                        </div>
                        <span className={`font-mono text-[10px] sm:text-xs font-bold tracking-wider ${displayLog.color} truncate`}>
                            {displayLog.text}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
