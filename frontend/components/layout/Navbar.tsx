"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { motion } from "framer-motion";

export const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-border">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-bold text-white">
                        A
                    </div>
                    <span className="font-bold text-xl font-[family-name:var(--font-space-grotesk)] text-foreground">
                        Aegis-Forge
                    </span>
                </Link>

                {/* Links (Desktop) */}
                <div className="hidden md:flex items-center gap-8 font-medium text-sm text-foreground/80">
                    <a href="/features" className="hover:text-primary transition-colors">Features</a>
                    <a href="#solutions" className="hover:text-primary transition-colors">Solutions</a>
                    <a href="#protocol" className="hover:text-primary transition-colors">Protocol</a>
                    <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <a href="#" className="hidden md:block text-sm font-medium hover:text-primary">
                        Log In
                    </a>
                    <ThemeToggle />
                    <button className="bg-foreground text-background px-5 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-opacity">
                        Initialize
                    </button>
                </div>
            </div>
        </nav>
    );
};
