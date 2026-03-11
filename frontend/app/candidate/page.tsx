"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Key, Loader2, AlertCircle, ChevronRight, User } from "lucide-react";
import { CustomCursor } from "@/components/visuals/CustomCursor";

export default function CandidateLogin() {
    const router = useRouter();
    const [candidateId, setCandidateId] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (!candidateId || !password) {
            setError("Please enter both Session ID and Passcode.");
            return;
        }

        setIsLoading(true);

        try {
            const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://f6bd14bc925f.ngrok-free.app";
            
            const response = await fetch(`${API_BASE}/candidate-login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true"
                },
                body: JSON.stringify({
                    candidate_id: candidateId,
                    password: password
                })
            });

            if (response.ok) {
                // Successful login! Push to interview room
                router.push(`/interview/room?candidate=${encodeURIComponent(candidateId)}&room=aegis-demo-room`);
            } else {
                const data = await response.json();
                setError(data.detail || "Invalid credentials provided.");
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError("Unable to connect to Aegis servers. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen bg-[#09090b] selection:bg-[#00E5FF]/30 font-sans tracking-tight flex items-center justify-center overflow-hidden">
            <CustomCursor />
            
            {/* Background Grid & Scanlines */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.03)_0%,transparent_100%)]" />
                <div className="absolute inset-0" style={{
                    backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px'
                }} />
                <div className="absolute inset-0 bg-black/50" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md p-6"
            >
                <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden relative group">
                    {/* Glowing Accents */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00E5FF]/50 to-transparent opacity-50" />
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#00E5FF]/20 to-purple-500/20 blur opacity-0 group-hover:opacity-10 transition duration-1000" />
                    
                    <div className="relative text-center mb-10">
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 mb-6 relative"
                        >
                            <Shield className="w-8 h-8 text-[#00E5FF]" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00E5FF] rounded-full animate-ping opacity-75" />
                        </motion.div>
                        <h1 className="font-mono text-2xl font-bold tracking-widest text-white mb-2 uppercase">Aegis Portal</h1>
                        <p className="text-zinc-500 font-mono text-xs tracking-wider">SECURE CANDIDATE ENTRY</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono text-zinc-500 tracking-wider mb-2 uppercase">Session ID</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                    <input 
                                        type="text" 
                                        value={candidateId}
                                        onChange={(e) => setCandidateId(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-11 pr-4 text-white font-mono placeholder:text-zinc-700 focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/50 transition-all"
                                        placeholder="e.g. 8f92a1b"
                                        autoComplete="off"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-mono text-zinc-500 tracking-wider mb-2 uppercase">Passcode</label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-11 pr-4 text-emerald-400 font-mono placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all tracking-widest"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded flex items-start gap-2 p-3"
                            >
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </motion.div>
                        )}

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full relative group overflow-hidden rounded-lg font-mono tracking-widest text-sm font-bold uppercase transition-all disabled:opacity-50"
                        >
                            <div className="absolute inset-0 bg-[#00E5FF] opacity-90 group-hover:opacity-100 transition-opacity" />
                            <div className="relative px-6 py-4 text-black flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>AUTHENTICATING...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>INITIALIZE INTERVIEW</span>
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </div>
                        </button>
                    </form>
                    
                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">
                            Aegis Forge Neural Architecture v2.0
                        </p>
                    </div>
                </div>
            </motion.div>
        </main>
    );
}
