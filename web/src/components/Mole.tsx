"use client";

import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export default function Mole() {
    const [messages, setMessages] = useState<{ id: number, text: string }[]>([]);

    useEffect(() => {
        const handleMoleMessage = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail) {
                setMessages(prev => {
                    // Keep last 3 messages
                    const newMsgs = [...prev, { id: Date.now(), text: customEvent.detail }];
                    if (newMsgs.length > 3) return newMsgs.slice(-3);
                    return newMsgs;
                });

                // Auto dismiss after 10s
                setTimeout(() => {
                    setMessages(prev => prev.filter(m => m.text !== customEvent.detail));
                }, 10000);
            }
        };

        window.addEventListener('mole-message', handleMoleMessage);
        return () => window.removeEventListener('mole-message', handleMoleMessage);
    }, []);

    if (messages.length === 0) return null;

    return (
        <div className="absolute bottom-20 right-8 w-96 flex flex-col gap-3 z-50 pointer-events-none">
            {messages.map(m => (
                <div key={m.id} className="bg-zinc-950/90 backdrop-blur-md border border-cyan-500/30 text-cyan-50 p-4 rounded-lg font-mono text-sm shadow-[0_0_20px_rgba(6,182,212,0.2)] animate-in slide-in-from-right-10 fade-in duration-300">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="font-bold text-cyan-400 text-xs tracking-wider uppercase">THE MOLE</span>
                    </div>
                    {m.text}
                </div>
            ))}
        </div>
    );
}
