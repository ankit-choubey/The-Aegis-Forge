# Aegis-Forge Green AI Landing Page Migration Guide

This document contains all the necessary dependencies, configuration, and UI component code to replicate the new "Green AI" themed landing page on your local environment. 

## 1. Install Dependencies
Run the following command in your `frontend` terminal to install the animation libraries:

```bash
npm install framer-motion gsap @gsap/react lucide-react
```

## 2. Public Assets
You will need to ensure the following two images are in your `public` folder:
1. `sustainable-hero.png`
2. `dark-vector-network.png`
(Have your teammate send these image files over Slack/Discord and drop them in the `public/` directory).

## 3. Code Implementation
Below are the exact file contents. Copy and paste these into your corresponding files. If the file doesn't exist, create it.

---

### `package.json`

```json
{
  "dependencies": {
    "@gsap/react": "^2.1.2",
    "@livekit/components-react": "^2.9.19",
    "@monaco-editor/react": "^4.7.0",
    "clsx": "^2.1.1",
    "framer-motion": "^12.29.2",
    "gsap": "^3.14.2",
    "html2canvas": "^1.4.1",
    "jspdf": "^4.0.0",
    "livekit-client": "^2.17.0",
    "livekit-server-sdk": "^2.15.0",
    "lucide-react": "^0.563.0",
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "tailwind-merge": "^3.4.0"
  }
}
```

---

### `app/globals.css`

```css
@import "tailwindcss";

:root {
  --background: #050A08;
  --foreground: #f8fafc;
  --card: #0A1410;
  --card-foreground: #f8fafc;
  --border: rgba(52, 211, 153, 0.15); /* Semi-transparent emerald border */
  --muted: #0A1410;
  --primary: #10B981; /* Emerald */
  --secondary: #34D399; /* Neon Mint */
  --accent: #0f3f2d; /* Deep Teal */
}

.dark {
  --background: #050A08;
  --foreground: #f8fafc;
  --card: #0A1410;
  --card-foreground: #f8fafc;
  --border: rgba(52, 211, 153, 0.15);
  --muted: #0A1410;
  --primary: #10B981;
  --secondary: #34D399;
  --accent: #0f3f2d;
}

/* Glassmorphism utility */
.glass-panel {
  background: rgba(10, 20, 16, 0.6);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(52, 211, 153, 0.15);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
}

.glass-panel-hover {
  transition: all 0.3s ease;
}
.glass-panel-hover:hover {
  background: rgba(10, 20, 16, 0.8);
  border-color: rgba(52, 211, 153, 0.4);
  box-shadow: 0 8px 32px 0 rgba(16, 185, 129, 0.1);
}

/* InkLantern Lighting Effect */
.ink-lantern {
  background: radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.08) 0%, transparent 70%),
              linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, transparent 20%);
}

/* Interview Room: Void Dark Theme */
:root {
  --void-bg: #09090b;
  --void-card: #0c0c0e;
  --neon-cyan: #00E5FF;
  --border-subtle: rgba(255, 255, 255, 0.05);
  --border-low: rgba(255, 255, 255, 0.1);
}

/* Audio Visualizer Animation */
@keyframes audioBar {

  0%,
  100% {
    transform: scaleY(0.3);
  }

  50% {
    transform: scaleY(1);
  }
}

.audio-bar {
  animation: audioBar 0.5s ease-in-out infinite;
}

/* Pulsing Dot */
@keyframes pulse-glow {

  0%,
  100% {
    opacity: 1;
    box-shadow: 0 0 8px currentColor;
  }

  50% {
    opacity: 0.6;
    box-shadow: 0 0 16px currentColor;
  }
}

.pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Scanning Animation */
@keyframes scan {
  0% {
    transform: translateY(-100%);
  }

  100% {
    transform: translateY(100%);
  }
}

.scanning-line {
  animation: scan 2s linear infinite;
}

/* Shimmer Animation for Buttons */
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-border: var(--border);
  --color-muted: var(--muted);
  --color-primary: var(--primary);
  --font-sans: var(--font-inter);
  --font-display: var(--font-space-grotesk);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-inter), sans-serif;
  transition: background-color 0.3s, color 0.3s;
}

/* Custom Utilities */
.mask-linear-gradient {
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}
```

---

### `app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk"
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "Aegis-Forge | Agentic Interview Protocol",
  description: "Automated hiring pipeline with military-grade precision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans bg-[#050A08] text-slate-300 antialiased min-h-screen selection:bg-emerald-500/30 selection:text-emerald-50`}>
        {children}
      </body>
    </html>
  );
}

```

---

### `app/page.tsx`

```tsx
import { CustomCursor } from "@/components/visuals/CustomCursor";
import { Navbar } from "@/components/layout/Navbar";
import { HeroGSAP } from "@/components/sections/HeroGSAP";
import { GameOfNumbers } from "@/components/sections/GameOfNumbers";
import { HexagonScrollGSAP } from "@/components/sections/HexagonScrollGSAP";
import { InteractiveTabsGSAP } from "@/components/sections/InteractiveTabsGSAP";
import { AgentBentoBox } from "@/components/sections/AgentBentoBox";
import { FSIRShowcaseGSAP } from "@/components/sections/FSIRShowcaseGSAP";
import { FooterCTA } from "@/components/sections/FooterCTA";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#04100C] text-slate-300 overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-50">
      <CustomCursor />
      <Navbar />

      <HeroGSAP />
      <GameOfNumbers />
      <HexagonScrollGSAP />
      <InteractiveTabsGSAP />
      <AgentBentoBox />
      <FSIRShowcaseGSAP />
      <FooterCTA />
    </main>
  );
}

```

---

### `components/layout/Navbar.tsx`

```tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield } from "lucide-react";

export const Navbar = () => {
    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed top-5 left-1/2 -translate-x-1/2 w-full max-w-5xl z-50 px-4"
        >
            <div className="glass-panel rounded-full px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Shield className="w-6 h-6 text-emerald-400" />
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse blur-[1px]" />
                    </div>
                    <span className="font-mono font-bold tracking-widest text-slate-100 text-sm">AEGIS-FORGE</span>
                </div>

                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/dashboard" className="text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors">
                        Architecture (Dashboard)
                    </Link>
                    <Link href="#crisis-section" className="text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors">
                        Eco-Impact
                    </Link>
                    <Link href="#hexagon-scroll-section" className="text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors">
                        FSIR Protocol
                    </Link>
                </nav>

                <div>
                    <Link href="/interview/room" className="relative group flex items-center justify-center overflow-hidden rounded-full px-6 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium text-sm transition-all hover:bg-emerald-500/20 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        <span className="relative z-10">Deploy Green AI</span>
                        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent" />
                    </Link>
                </div>
            </div>
        </motion.header>
    );
};

```

---

### `components/visuals/CustomCursor.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", updateMousePosition);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);
  if (!isMounted) return null;

  return (
    <>
      {/* The glowing radial light cursor effect */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-0 w-[400px] h-[400px] rounded-full mix-blend-screen"
        animate={{
          x: mousePosition.x - 200,
          y: mousePosition.y - 200,
        }}
        transition={{
          type: "tween",
          ease: "backOut",
          duration: 0.15,
        }}
        style={{
          background: "radial-gradient(circle, rgba(52, 211, 153, 0.12) 0%, rgba(16, 185, 129, 0.03) 40%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
    </>
  );
};

```

---

### `components/sections/HeroGSAP.tsx`

```tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export const HeroGSAP = () => {
    return (
        <section className="relative w-full h-[120vh] min-h-[900px] flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/sustainable-hero.png"
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

```

---

### `components/sections/HeroDemo.tsx`

```tsx
"use client";

import { motion } from "framer-motion";
import { Network, FileCheck, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export const HeroDemo = () => {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-4 overflow-hidden">
            {/* Background Lighting "InkLantern" */}
            <div className="absolute inset-0 ink-lantern opacity-60 pointer-events-none" />

            {/* Text Content */}
            <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 mb-16">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight text-slate-100 font-sans"
                >
                    Hire Faster. <br />
                    <span className="text-emerald-400">Waste Nothing.</span> <br />
                    Save the Planet.
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
                >
                    Aegis-Forge converts 45-minute carbon-heavy AI conversations into 10-minute deterministic screening protocols. Lower latency. Zero variance. 80% less carbon emission per candidate.
                </motion.p>
            </div>

            {/* Interactive Mockup Animation */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="relative w-full max-w-5xl aspect-video glass-panel rounded-2xl overflow-hidden border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)] flex flex-col"
            >
                {/* Mockup Header */}
                <div className="h-10 border-b border-emerald-500/10 bg-black/40 flex items-center px-4 gap-2 shrink-0">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-slate-700" />
                        <div className="w-3 h-3 rounded-full bg-slate-700" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <div className="ml-4 font-mono text-xs text-slate-500">protocol-execution-environment</div>
                </div>

                {/* Mockup Body */}
                <div className="flex-1 relative bg-gradient-to-br from-[#050A08] to-[#0A1410] p-8 flex items-center justify-center overflow-hidden">
                    <MockupAnimationSequence />
                </div>
            </motion.div>
        </section>
    );
};

const MockupAnimationSequence = () => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        // 0: Loading, 1: Node 1 (Incident Lead), 2: Node 2 (Pressure), 3: Node 3 (Observer), 4: Complete Modal
        const sequence = [
            { step: 0, time: 2000 },
            { step: 1, time: 1000 },
            { step: 2, time: 1000 },
            { step: 3, time: 1000 },
            { step: 4, time: 3000 },
        ];

        let current = 0;
        const runSequence = () => {
            setStep(sequence[current].step);
            setTimeout(() => {
                current = (current + 1) % sequence.length;
                runSequence();
            }, sequence[current].time);
        };

        const timeout = setTimeout(runSequence, 500);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="w-full max-w-2xl relative h-full flex flex-col items-center justify-center">

            {/* Step 0: Loading Bar */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: step === 0 ? 1 : 0 }}
                className="absolute flex flex-col items-center gap-4"
            >
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                <div className="font-mono text-emerald-400 text-sm tracking-widest">LOADING PROTOCOL</div>
                <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-emerald-400"
                        animate={{ width: step === 0 ? ["0%", "100%"] : "0%" }}
                        transition={{ duration: 1.8, ease: "easeInOut" }}
                    />
                </div>
            </motion.div>

            {/* Steps 1-3: Node Graph */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: step >= 1 && step <= 3 ? 1 : 0 }}
                className="absolute w-full h-full flex items-center justify-center p-8"
            >
                <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                    {/* SVG Connecting Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                        <motion.line
                            x1="50" y1="20" x2="20" y2="70"
                            stroke={step >= 2 ? "#10B981" : "#334155"} strokeWidth="1"
                            initial={{ pathLength: 0 }} animate={{ pathLength: step >= 2 ? 1 : 0 }}
                        />
                        <motion.line
                            x1="50" y1="20" x2="80" y2="70"
                            stroke={step >= 3 ? "#10B981" : "#334155"} strokeWidth="1"
                            initial={{ pathLength: 0 }} animate={{ pathLength: step >= 3 ? 1 : 0 }}
                        />
                        <motion.line
                            x1="20" y1="70" x2="80" y2="70"
                            stroke={step >= 3 ? "#10B981" : "#334155"} strokeWidth="1"
                            initial={{ pathLength: 0 }} animate={{ pathLength: step >= 3 ? 1 : 0 }}
                        />
                    </svg>

                    {/* Nodes */}
                    {/* Node 1: Incident Lead */}
                    <div className={`absolute top-[10%] left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-500 ${step >= 1 ? 'scale-110' : 'scale-100 opacity-50'}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-800 border-slate-700 text-slate-500'} border-2`}>
                            <Network className="w-6 h-6" />
                        </div>
                        <span className={`mt-2 font-mono text-xs ${step >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>INCIDENT_LEAD</span>
                    </div>

                    {/* Node 2: Pressure */}
                    <div className={`absolute bottom-[20%] left-[10%] flex flex-col items-center transition-all duration-500 ${step >= 2 ? 'scale-110' : 'scale-100 opacity-50'}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-800 border-slate-700 text-slate-500'} border-2`}>
                            <Network className="w-6 h-6" />
                        </div>
                        <span className={`mt-2 font-mono text-xs ${step >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>PRESSURE_SYS</span>
                    </div>

                    {/* Node 3: Observer */}
                    <div className={`absolute bottom-[20%] right-[10%] flex flex-col items-center transition-all duration-500 ${step >= 3 ? 'scale-110' : 'scale-100 opacity-50'}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-800 border-slate-700 text-slate-500'} border-2`}>
                            <Network className="w-6 h-6" />
                        </div>
                        <span className={`mt-2 font-mono text-xs ${step >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>OBSERVER</span>
                    </div>
                </div>
            </motion.div>

            {/* Step 4: Decision Artifact */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: step === 4 ? 1 : 0, scale: step === 4 ? 1 : 0.9, y: step === 4 ? 0 : 20 }}
                className="absolute bg-[#0A1410] border border-emerald-500/30 p-6 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center max-w-sm text-center"
            >
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                    <FileCheck className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-2 font-sans">Decision Artifact Generated</h3>
                <p className="text-sm text-slate-400 mb-4 font-mono">FSIR protocol successfully compiled. 80% compute saved.</p>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 w-full h-full" />
                </div>
            </motion.div>

        </div>
    );
};

```

---

### `components/sections/GameOfNumbers.tsx`

```tsx
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

```

---

### `components/sections/ComparisonGraph.tsx`

```tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { TrendingUp, BadgeAlert, Sparkles } from "lucide-react";

export const ComparisonGraph = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

    return (
        <section ref={ref} className="py-24 px-4 w-full max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-slate-100 font-sans tracking-tight mb-4">
                    Data Drives The <span className="text-emerald-400">Decision</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-8">
                    Comparing traditional continuous video LLM streams vs Aegis-Forge's deterministic burst architecture.
                </p>
            </div>

            <div className="relative w-full max-w-5xl mx-auto glass-panel p-8 rounded-2xl">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-6 text-sm font-mono">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                            <span className="text-slate-300">Legacy AI Interviwer (LLM)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                            <span className="text-emerald-400 font-bold">Aegis-Forge Protocols</span>
                        </div>
                    </div>
                </div>

                {/* The Graph Canvas */}
                <div className="relative w-full aspect-[2/1] md:aspect-[3/1] bg-[#050A08] rounded-xl border border-slate-800 overflow-hidden group">

                    {/* Grid Lines */}
                    <div className="absolute inset-x-0 bottom-0 h-full flex flex-col justify-between pt-8 pb-10 px-8 pointer-events-none">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-full h-px border-b border-dashed border-slate-800/50 relative">
                                <span className="absolute -left-6 -top-2 text-[10px] text-slate-600 font-mono hidden md:block">
                                    {100 - (i * 25)}%
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* X Axis Labels */}
                    <div className="absolute bottom-2 inset-x-8 flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>START</span>
                        <span>Q1</span>
                        <span>Q2</span>
                        <span>Q3</span>
                        <span>EVAL</span>
                    </div>

                    <svg className="absolute inset-0 w-full h-full p-8 overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 300">
                        {/* Red Line - Legacy */}
                        <motion.path
                            d="M 0 250 Q 250 200 500 100 T 1000 20"
                            fill="none"
                            stroke="#EF4444"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray="1500"
                            initial={{ strokeDashoffset: 1500 }}
                            animate={isInView ? { strokeDashoffset: 0 } : { strokeDashoffset: 1500 }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                        />

                        {/* Green Line - Aegis Forge */}
                        <motion.path
                            d="M 0 250 L 250 240 L 500 230 L 750 220 L 1000 200"
                            fill="none"
                            stroke="#10B981"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray="1100"
                            initial={{ strokeDashoffset: 1100 }}
                            animate={isInView ? { strokeDashoffset: 0 } : { strokeDashoffset: 1100 }}
                            transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                            style={{ filter: "drop-shadow(0 0 8px rgba(16,185,129,0.8))" }}
                        />

                        {/* Data Points for Green Line interaction */}
                        {[
                            { cx: 0, cy: 250, tip: "Init State" },
                            { cx: 250, cy: 240, tip: "First Phase" },
                            { cx: 500, cy: 230, tip: "Middle Phase" },
                            { cx: 750, cy: 220, tip: "Deep Signal" },
                            { cx: 1000, cy: 200, tip: "Artifact Generation" }
                        ].map((pt, i) => (
                            <g key={i}>
                                <motion.circle
                                    cx={pt.cx} cy={pt.cy} r="6" fill="#050A08" stroke="#34D399" strokeWidth="3"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                                    transition={{ delay: 1 + (i * 0.2) }}
                                    onMouseEnter={() => setHoveredPoint(i)}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                    className="cursor-crosshair transition-all hover:r-8 hover:brightness-150"
                                    style={{ filter: hoveredPoint === i ? "drop-shadow(0 0 10px #34D399)" : "none" }}
                                />

                                {/* Tooltip implementation using SVG <foreignObject> or just standard React state overlay below */}
                            </g>
                        ))}
                    </svg>

                    {/* Interactive Tooltip Overlay (HTML based for better styling) */}
                    <div className="absolute inset-0 pointer-events-none p-8">
                        <div className="relative w-full h-full">
                            {[
                                { left: "0%", top: "83%", tip: "Connection Established (~20kb)" },
                                { left: "25%", top: "80%", tip: "Phase 1 Complete. Minimal API calls. Max signal." },
                                { left: "50%", top: "76%", tip: "Phase 2 Complete. Edge Telemetry active." },
                                { left: "75%", top: "73%", tip: "Finalizing execution trace." },
                                { left: "100%", top: "66%", tip: "FSIR Generated. 2.4kg CO2 prevented." }
                            ].map((pos, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: hoveredPoint === i ? 1 : 0, y: hoveredPoint === i ? -20 : 10 }}
                                    className="absolute bg-emerald-950/90 border border-emerald-500 text-emerald-100 text-[10px] md:text-xs p-2 rounded shadow-2xl backdrop-blur-md max-w-[150px] whitespace-normal pointer-events-none font-mono z-20"
                                    style={{ left: pos.left, top: pos.top, transform: "translate(-50%, -100%)" }}
                                >
                                    <Sparkles className="w-3 h-3 inline mb-1 mr-1 text-emerald-400" />
                                    {pos.tip}
                                </motion.div>
                            ))}

                            {/* Legacy warning tooltip mock */}
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: isInView ? 1 : 0 }} transition={{ delay: 2.5 }}
                                className="absolute right-0 top-[10%] bg-red-950/80 border border-red-500/50 text-red-200 text-[10px] p-2 rounded flex items-center gap-2 pointer-events-none font-mono"
                            >
                                <BadgeAlert className="w-4 h-4 text-red-500" />
                                Massive Cloud Compute Burn
                            </motion.div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

```

---

### `components/sections/HexagonScrollGSAP.tsx`

```tsx
"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import clsx from "clsx";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export const HexagonScrollGSAP = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const hexagonFillRef = useRef<SVGPolygonElement>(null);

    useEffect(() => {
        if (!sectionRef.current || !hexagonFillRef.current) return;

        let ctx = gsap.context(() => {
            // Pin the section
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: "+=3000",
                    pin: true,
                    scrub: 1,
                }
            });

            // Animate hexagon fill from bottom to top using strokeDashoffset or clipPath
            // Since it's a fill, we can animate an SVG clip path or a gradient stop, but a simple way is animating a mask or clipPath.
            tl.to(".hexagon-fill-mask", {
                attr: { y: 0, height: 400 }, // assuming 400px is the height
                duration: 3,
                ease: "none"
            }, 0);

            // Animate the text nodes (fade in and out)
            const texts = gsap.utils.toArray('.sim-text-hexa');

            texts.forEach((text: any, i) => {
                tl.to(text, {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power2.out"
                }, i * 1.5)

                if (i < texts.length - 1) {
                    tl.to(text, {
                        opacity: 0,
                        y: -20,
                        duration: 1,
                        ease: "power2.in"
                    }, i * 1.5 + 1)
                }
            });

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const stateData = [
        {
            text: "Currently, 70-80% of recruiter time is wasted on high-variance, subjective first-round interviews. We consume budgets before real performance is observed.",
        },
        {
            text: "Aegis-Forge converts these interviews into an executable protocol. We deploy goal-driven AI avatars to run crisis-based work simulations.",
        },
        {
            text: "The result: A 60-second First-Round Screening Intelligence Report (FSIR) that infers integrity by design and reduces cost per role to <$2k.",
        }
    ];

    return (
        <section ref={sectionRef} className="relative w-full h-screen bg-[#04100C] overflow-hidden flex flex-col pt-10" id="hexagon-scroll-section">

            {/* Header */}
            <div className="w-full text-center z-10 pt-8 pb-12">
                <h2 className="text-4xl md:text-5xl font-sans font-bold text-white tracking-tight">
                    Why we need deterministic interview execution
                </h2>
            </div>

            <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center relative px-6">

                {/* LEFT SIDE: The Hexagon Chart */}
                <div className="w-full md:w-1/2 h-full relative flex items-center justify-center">

                    {/* The Hexagon SVG */}
                    <div className="relative w-[300px] h-[350px] md:w-[400px] md:h-[450px]">
                        {/* Y Axis Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between py-[10%] z-0 pointer-events-none opacity-50">
                            {[2.0, 1.5, 1.0, 0.5, 0.0].map((val) => (
                                <div key={val} className="flex items-center w-full gap-4 relative">
                                    <span className="text-xs text-white/50 font-mono w-6">{val.toFixed(1)}</span>
                                    <div className="flex-1 border-t border-dashed border-white/20" />
                                </div>
                            ))}
                        </div>

                        {/* Hexagon Graphic */}
                        <svg viewBox="0 0 400 450" className="absolute inset-0 w-full h-full z-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                            <defs>
                                <linearGradient id="hexGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                                    <stop offset="0%" stopColor="rgba(16, 185, 129, 0.6)" />
                                    <stop offset="100%" stopColor="rgba(16, 185, 129, 0.1)" />
                                </linearGradient>
                                <clipPath id="fillClip">
                                    {/* We animate this rect from bottom (y=450, h=0) to top (y=0, h=450) */}
                                    <rect className="hexagon-fill-mask" x="0" y="450" width="400" height="0" />
                                </clipPath>
                            </defs>

                            {/* Hexagon Stroke */}
                            <polygon
                                points="200,10 380,115 380,335 200,440 20,335 20,115"
                                fill="none"
                                stroke="#10B981"
                                strokeWidth="2"
                                strokeOpacity="0.8"
                            />

                            {/* Hexagon Fill (Clipped) */}
                            <polygon
                                ref={hexagonFillRef}
                                points="200,10 380,115 380,335 200,440 20,335 20,115"
                                fill="url(#hexGradient)"
                                clipPath="url(#fillClip)"
                            />
                        </svg>
                    </div>
                </div>

                {/* RIGHT SIDE: Narrative Texts */}
                <div className="w-full md:w-1/2 h-full flex items-center p-8 md:p-16 relative">
                    <div className="w-full relative h-[300px] flex items-center">
                        {stateData.map((state, i) => (
                            <div
                                key={i}
                                className={clsx(
                                    "sim-text-hexa absolute w-full",
                                    "opacity-0 translate-y-10" // Initial GSAP state
                                )}
                            >
                                <h3 className="text-2xl md:text-3xl lg:text-4xl font-sans font-bold text-white/70 leading-[1.4]">
                                    {state.text}
                                </h3>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};

```

---

### `components/sections/InteractiveTabsGSAP.tsx`

```tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import clsx from "clsx";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const tabData = [
    {
        id: "real-time",
        title: "Real-Time Intelligence",
        heading: "Live Telemetry Analysis",
        body: "Aegis-Forge monitors millisecond-level behavioral shifts, detecting hesitation and cognitive load during the session without human bias.",
        tags: ["DQI Engine", "Live Streaming", "Webhook Integration"]
    },
    {
        id: "automated",
        title: "Automated Action",
        heading: "Deterministic Resolution",
        body: "When crisis parameters are met, the Protocol Governor automatically restructures the interview, skipping unqualified tangents and focusing purely on signal.",
        tags: ["Auto-Routing", "Crisis Management", "Zero Delay"]
    },
    {
        id: "strategic",
        title: "Strategic Planning",
        heading: "Predictive Analytics",
        body: "Aggregate data from thousands of sessions to forecast candidate success rates before a single human hour is spent on final-round interviews.",
        tags: ["Org-Level Insights", "Success Forecasting", "Bias Reduction"]
    },
    {
        id: "enterprise",
        title: "Enterprise Scale",
        heading: "Unlimited Concurrency",
        body: "Designed for massive hiring scaling. Deploy 1,000 distinct interview sessions simultaneously across multiple timezones with identical baseline rigor.",
        tags: ["Infinite Scalability", "Global Deployment", "SOC2 Ready"]
    }
];

export const InteractiveTabsGSAP = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [activeTabIdx, setActiveTabIdx] = useState(0);

    const activeContent = tabData[activeTabIdx];

    useEffect(() => {
        if (!sectionRef.current) return;

        let ctx = gsap.context(() => {
            // Pin the entire section and scrub through the tabs
            ScrollTrigger.create({
                trigger: sectionRef.current,
                start: "top top",
                end: "+=3000", // Scroll 3000px to go through all 4 tabs
                pin: true,
                scrub: 0.5,
                onUpdate: (self) => {
                    const progress = self.progress;
                    // Calculate which tab should be active (4 tabs total: 0-25%, 25-50%, 50-75%, 75-100%)
                    let index = Math.floor(progress * tabData.length);
                    // Prevent out of bounds on complete scroll
                    if (index >= tabData.length) index = tabData.length - 1;

                    setActiveTabIdx(index);
                }
            });

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="relative w-full h-screen bg-[#04100C] z-30 flex items-center justify-center p-6">
            <div className="max-w-7xl mx-auto w-full">

                {/* Header */}
                <div className="text-center mb-10">
                    <h2 className="text-4xl md:text-5xl font-sans font-bold text-white mb-2 tracking-tight">
                        Empower Your
                    </h2>
                    <h2 className="text-4xl md:text-5xl font-sans font-bold text-emerald-400 tracking-tight drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        Hiring Operations
                    </h2>
                </div>

                {/* Split Container */}
                <div className="flex flex-col lg:flex-row gap-8 w-full h-auto lg:h-[550px]">

                    {/* LEFT SIDE: Dynamic Content Card (60%) */}
                    <div className="w-full lg:w-[60%] h-[500px] lg:h-full relative rounded-2xl overflow-hidden border border-white/10"
                        style={{
                            backdropFilter: "blur(16px)",
                            backgroundColor: "rgba(255, 255, 255, 0.03)"
                        }}
                    >
                        {/* Dark Vector Illustration (Nano Banana 2 Background) */}
                        <div className="absolute inset-0 z-0 opacity-80 mix-blend-screen transition-opacity duration-500">
                            <Image
                                src="/dark-vector-network.png"
                                alt="Secure Data Network"
                                fill
                                className="object-cover object-center"
                            />
                            {/* Fade to dark at the top for text readability */}
                            <div className="absolute inset-0 bg-gradient-to-b from-[#04100C] via-[#04100C]/60 to-transparent" />
                            <div className="absolute inset-0 bg-[#04100C]/40" />
                        </div>

                        {/* Dynamic Content */}
                        <div className="relative z-10 w-full h-full p-8 md:p-12 flex flex-col justify-start">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeContent.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className="h-full flex flex-col"
                                >
                                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                                        {activeContent.heading}
                                    </h3>
                                    <p className="text-lg text-white/70 leading-relaxed max-w-xl">
                                        {activeContent.body}
                                    </p>

                                    <div className="mt-auto flex flex-wrap gap-3 pt-8">
                                        {activeContent.tags.map((tag, i) => (
                                            <div key={i} className="px-4 py-2 rounded-full border border-emerald-500/30 bg-[#04100C]/60 backdrop-blur-md">
                                                <span className="text-emerald-400 font-mono text-sm tracking-wide">{tag}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Tab Menu (40%) */}
                    <div className="w-full lg:w-[40%] h-full rounded-2xl border border-white/10 p-4 flex flex-col gap-3 justify-center"
                        style={{
                            backdropFilter: "blur(12px)",
                            backgroundColor: "rgba(255, 255, 255, 0.03)"
                        }}
                    >
                        {tabData.map((tab, idx) => (
                            <div
                                key={tab.id}
                                className={clsx(
                                    "w-full text-left px-6 py-6 rounded-xl transition-all duration-300 relative overflow-hidden group border",
                                    activeTabIdx === idx
                                        ? "bg-slate-900 border-white/10 border-l-[4px] border-l-emerald-500 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)] text-white scale-[1.02]"
                                        : "bg-white/5 border-transparent text-white/50"
                                )}
                            >
                                <span className="relative z-10 text-lg md:text-xl font-semibold tracking-wide flex items-center justify-between pointer-events-none">
                                    {tab.title}

                                    {/* Indicator dot showing scroll progress */}
                                    <span className={clsx(
                                        "w-2 h-2 rounded-full transition-colors duration-300",
                                        activeTabIdx === idx ? "bg-emerald-400 animate-pulse drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]" : "bg-transparent"
                                    )} />
                                </span>
                            </div>
                        ))}
                    </div>

                </div>

            </div>
        </section>
    );
};

```

---

### `components/sections/StepByStepFlow.tsx`

```tsx
"use client";

import { motion } from "framer-motion";
import { Puzzle, RadioTower, DatabaseZap, ScrollText } from "lucide-react";

const steps = [
    {
        icon: Puzzle,
        title: "Frai Plugin Triggered",
        description: "Recruiter initiates the role natively. No new platforms to learn.",
        color: "from-blue-500/20 to-transparent",
        border: "border-blue-500/30",
        textHover: "group-hover:text-blue-400"
    },
    {
        icon: RadioTower,
        title: "Edge-Powered Simulator",
        description: "Goal-driven avatars execute crisis-based work simulations. Telemetry runs locally, saving massive cloud compute.",
        color: "from-emerald-500/20 to-transparent",
        border: "border-emerald-500/30",
        textHover: "group-hover:text-emerald-400"
    },
    {
        icon: DatabaseZap,
        title: "Deterministic Engine",
        description: "Agent consensus replaces LLM hallucination. We rely on logic rules, not massive generative models, slashing energy use.",
        color: "from-amber-500/20 to-transparent",
        border: "border-amber-500/30",
        textHover: "group-hover:text-amber-400"
    },
    {
        icon: ScrollText,
        title: "The 60-Second FSIR",
        description: "Decision quality, integrity confidence, and micro-evidence delivered instantly back to the ATS.",
        color: "from-purple-500/20 to-transparent",
        border: "border-purple-500/30",
        textHover: "group-hover:text-purple-400"
    }
];

export const StepByStepFlow = () => {
    return (
        <section className="py-24 px-4 w-full max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-slate-100 font-sans tracking-tight mb-4">
                    How It <span className="text-emerald-400">Works</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                    The pipeline that redefines efficient talent screening.
                </p>
            </div>

            <div className="relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-[110px] left-[10%] right-[10%] h-[2px] bg-slate-800" />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: idx * 0.2 }}
                            className="relative flex flex-col items-center text-center group"
                        >
                            {/* Node Circle */}
                            <div className={`relative w-16 h-16 rounded-2xl bg-[#0A1410] border ${step.border} flex items-center justify-center mb-6 z-10 transition-transform duration-500 group-hover:scale-110 shadow-lg`}>
                                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                <step.icon className={`w-8 h-8 text-slate-500 ${step.textHover} transition-colors duration-500 relative z-10`} />
                            </div>

                            {/* Connecting Line (Mobile) */}
                            {idx !== steps.length - 1 && (
                                <div className="md:hidden w-[2px] h-8 bg-slate-800 my-2" />
                            )}

                            {/* Text Content */}
                            <div className="bg-[#050A08]/50 backdrop-blur-sm p-4 rounded-xl border border-transparent group-hover:border-slate-800 transition-colors">
                                <span className="text-[10px] font-mono text-emerald-500 mb-2 block font-bold tracking-widest">STEP 0{idx + 1}</span>
                                <h3 className="text-lg font-bold text-slate-200 mb-3">{step.title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed font-mono">
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

```

---

### `components/sections/AgentBentoBox.tsx`

```tsx
"use client";

import { motion } from "framer-motion";
import { Network, Eye, Zap, ShieldAlert } from "lucide-react";

export const AgentBentoBox = () => {
    const agents = [
        {
            id: "incident-lead",
            title: "Incident Lead",
            role: "Orchestration & State Management",
            desc: "Handles overall candidate progression through the state-machine. Keeps the simulation on track without hallucinating side-quests.",
            icon: Network,
            colSpan: "md:col-span-8",
            rowSpan: "md:row-span-2",
            wireframe: IncidentLeadWireframe,
            accent: "from-emerald-500/20 to-emerald-900/10"
        },
        {
            id: "pressure",
            title: "Pressure System",
            role: "Stress Injection",
            desc: "Introduces dynamic situational complexity (e.g. server outage scenarios) based on the candidate's latency to respond.",
            icon: Zap,
            colSpan: "md:col-span-4",
            rowSpan: "md:row-span-1",
            wireframe: DefaultWireframe,
            accent: "from-amber-500/10 to-transparent"
        },
        {
            id: "observer",
            title: "Silent Observer",
            role: "Micro-Evidence Extractor",
            desc: "Evaluates syntax, tone, and logical consistency off the critical path, ensuring zero interaction latency.",
            icon: Eye,
            colSpan: "md:col-span-4",
            rowSpan: "md:row-span-1",
            wireframe: DefaultWireframe,
            accent: "from-blue-500/10 to-transparent"
        },
        {
            id: "governor",
            title: "Protocol Governor",
            role: "Guardrails & Integrity",
            desc: "Prevents prompt injection from candidates and ensures the evaluation strictly adheres to the role's rubrics.",
            icon: ShieldAlert,
            colSpan: "md:col-span-12",
            rowSpan: "md:row-span-1",
            wireframe: ProtocolWireframe,
            accent: "from-purple-500/10 to-transparent"
        }
    ];

    return (
        <section className="py-24 px-4 w-full max-w-7xl mx-auto relative z-10" id="architecture">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-slate-100 font-sans tracking-tight mb-4">
                    The <span className="text-emerald-400">Agent</span> Network
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                    Specialized, fast, and concurrent. We rely on targeted logic rules, not massive generative models.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[250px]">
                {agents.map((agent, idx) => (
                    <motion.div
                        key={agent.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className={`group relative overflow-hidden rounded-3xl glass-panel glass-panel-hover flex flex-col p-8 ${agent.colSpan} ${agent.rowSpan}`}
                    >
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${agent.accent} opacity-50 group-hover:opacity-100 transition-opacity duration-700`} />

                        {/* Wireframe Hover Reveal */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none flex items-center justify-end overflow-hidden">
                            <div className="w-[150%] h-[150%] translate-x-[20%] opacity-20 text-emerald-400">
                                <agent.wireframe />
                            </div>
                        </div>

                        {/* Content Layer */}
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <agent.icon className="w-8 h-8 text-emerald-400 mb-6 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] transition-all duration-300" />
                                <div className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest mb-2 border border-emerald-500/30 inline-block px-2 py-1 rounded bg-black/50">
                                    {agent.role}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-100 mb-2 font-sans">{agent.title}</h3>
                            </div>
                            <p className="text-sm font-mono text-slate-400 max-w-md group-hover:text-slate-300 transition-colors">
                                {agent.desc}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

// SVG Wireframe Abstracts
const IncidentLeadWireframe = () => (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5" className="w-full h-full animate-[spin_60s_linear_infinite]">
        <circle cx="50" cy="50" r="40" strokeDasharray="4 4" />
        <circle cx="50" cy="50" r="30" strokeDasharray="2 6" />
        <path d="M 50 10 L 50 90 M 10 50 L 90 50 M 20 20 L 80 80 M 20 80 L 80 20" strokeOpacity="0.3" />
        <circle cx="50" cy="50" r="10" fill="currentColor" fillOpacity="0.1" />
    </svg>
);

const DefaultWireframe = () => (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full opacity-50">
        {[...Array(10)].map((_, i) => (
            <rect key={i} x={10 + (i * 5)} y={20} width={2} height={Math.random() * 60} opacity={0.3 + Math.random() * 0.5} />
        ))}
        <path d="M 0 50 Q 25 20 50 50 T 100 50" strokeDasharray="2 4" />
    </svg>
);

const ProtocolWireframe = () => (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5" className="w-full h-full">
        <rect x="10" y="20" width="80" height="60" rx="5" strokeDasharray="5 5" />
        <path d="M 10 40 L 90 40 M 10 60 L 90 60 L 50 20 L 10 60" opacity="0.5" />
        <circle cx="50" cy="40" r="5" fill="currentColor" fillOpacity="0.2" />
    </svg>
);

```

---

### `components/sections/FSIRShowcaseGSAP.tsx`

```tsx
"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Database, CheckCircle, ArrowRight } from "lucide-react";

export const FSIRShowcaseGSAP = () => {
    return (
        <section className="relative w-full min-h-screen bg-[#020806] py-32 flex items-center justify-center overflow-hidden">
            <div className="max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

                {/* LEFT SIDE: Sticky Narrative */}
                <div className="flex flex-col justify-center h-full relative">
                    <div className="sticky top-1/3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-emerald-400 font-mono text-sm tracking-wider font-bold">
                                OUTPUT ARTIFACT
                            </span>
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-sans font-bold text-white mb-6 leading-[1.1]">
                            First-Round Screening Intelligence Report (FSIR)
                        </h2>

                        <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-lg leading-relaxed font-medium">
                            Every execution concludes with a machine-readable decision artifact generated in under <strong className="text-slate-200">60 seconds</strong>.
                            No bloated video storage. Perfect telemetry edge-processing.
                        </p>

                        <div className="space-y-4 mb-10">
                            {[
                                "Decision Quality Index (DQI)",
                                "Behavioral Integrity Score",
                                "Technical Coherence Map"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                    <span className="text-slate-300 font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button className="flex items-center gap-3 text-emerald-400 font-bold hover:text-emerald-300 transition-colors group">
                            Explore the Graph Schema
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* RIGHT SIDE: Mock UI Sliding Up */}
                <div className="relative h-full flex items-center justify-center lg:justify-end">
                    <motion.div
                        initial={{ y: 200, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ type: "spring", stiffness: 40, damping: 20 }}
                        className="w-full max-w-lg relative"
                    >
                        {/* Glow behind widget */}
                        <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full" />

                        {/* Dashboard Widget Interface */}
                        <div className="relative bg-[#0A1410]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden">

                            {/* Header */}
                            <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-6">
                                <div className="flex items-center gap-3">
                                    <Database className="w-6 h-6 text-slate-400" />
                                    <span className="text-slate-300 font-mono text-sm font-bold">FSIR // CND-09214</span>
                                </div>
                                <span className="text-emerald-500 font-mono text-xs bg-emerald-500/10 px-2 py-1 rounded">VERIFIED</span>
                            </div>

                            {/* Huge DQI Score */}
                            <div className="text-center mb-10 relative">
                                <div className="text-[120px] font-bold text-white leading-none font-sans drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                    91
                                </div>
                                <div className="text-emerald-400 font-mono tracking-widest text-sm font-bold mt-2">
                                    DECISION QUALITY INDEX
                                </div>
                            </div>

                            {/* Metric Bars */}
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm font-bold text-slate-400 mb-2">
                                        <span>INTEGRITY CONFIDENCE</span>
                                        <span className="text-white">93%</span>
                                    </div>
                                    <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: "93%" }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm font-bold text-slate-400 mb-2">
                                        <span>TECHNICAL COHERENCE</span>
                                        <span className="text-white">88%</span>
                                    </div>
                                    <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: "88%" }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.5, delay: 0.7, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Badge */}
                            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                                <span className="text-slate-500 font-mono text-xs">CRYPTOGRAPHICALLY SIGNED</span>
                            </div>

                        </div>
                    </motion.div>
                </div>

            </div>
        </section>
    );
};

```

---

### `components/sections/FooterCTA.tsx`

```tsx
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

```

---

