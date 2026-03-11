"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export const HeroGSAP = () => {
    return (
        <section className="relative w-full h-[120vh] min-h-[900px] flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/image.png"
                    alt="Sustainable City Forest"
                    fill
                    className="object-cover object-bottom"
                    priority
                />
                {/* Gradient Fade to Black at Bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#04100C] via-transparent to-[#04100C]/40" />
            </div>

            {/* Animated Light Rays from Top */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none mix-blend-screen">
                <motion.div
                    animate={{
                        opacity: [0.1, 0.3, 0.1],
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[20%] left-[10%] w-[100vw] h-[100vh]"
                    style={{
                        background: "radial-gradient(circle at 50% -20%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)",
                        clipPath: "polygon(20% 0, 80% 0, 100% 100%, 0% 100%)",
                        filter: "blur(40px)",
                    }}
                />
                <motion.div
                    animate={{
                        opacity: [0.05, 0.2, 0.05],
                        rotate: [-5, 0, 5, -5],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute -top-[10%] right-[5%] w-[80vw] h-[100vh]"
                    style={{
                        background: "radial-gradient(circle at 50% -10%, rgba(52, 211, 153, 0.1) 0%, transparent 70%)",
                        clipPath: "polygon(40% 0, 60% 0, 100% 100%, 0% 100%)",
                        filter: "blur(60px)",
                    }}
                />
            </div>

            {/* Massive Glassmorphic Container */}
            <div className="relative z-10 w-[90%] md:w-[80%] max-w-5xl h-auto md:h-[60vh] min-h-[500px] rounded-[40px] border border-white/10 flex flex-col items-center justify-center p-8 md:p-16 text-center mt-20 shadow-2xl"
                style={{
                    backdropFilter: "blur(25px)",
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                }}
            >
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-5xl md:text-7xl lg:text-[80px] font-bold text-white tracking-tight mb-6 font-sans leading-[1.1]"
                >
                    Programmable<br className="hidden md:block" /> Interview OS.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    className="text-lg md:text-2xl text-white/70 max-w-3xl mb-12 font-medium"
                >
                    Agentic, Avatar-Assisted, Telemetry-First Screening Infrastructure.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                    className="flex flex-col sm:flex-row items-center gap-6"
                >
                    {/* Primary Button */}
                    <button className="px-8 py-4 bg-[#10B981] hover:bg-[#0ea5e9] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 rounded-full text-black font-semibold text-lg tracking-wide hover:-translate-y-1">
                        View FSIR Demo
                    </button>

                    {/* Secondary Button */}
                    <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 transition-all duration-300 rounded-full text-white font-semibold text-lg tracking-wide hover:-translate-y-1" style={{ backdropFilter: "blur(10px)" }}>
                        Read the Architecture
                    </button>
                </motion.div>
            </div>
        </section>
    );
};
