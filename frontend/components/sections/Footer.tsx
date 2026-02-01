
import React from "react";

export const Footer = () => {
    return (
        <footer className="py-10 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black relative z-10 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-cyan-500 flex items-center justify-center font-bold text-white">A</div>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">Aegis-Forge</span>
                </div>

                <p className="text-slate-500 text-sm">
                    © {new Date().getFullYear()} Aegis-Forge. All rights reserved.
                </p>

                <div className="flex gap-6">
                    <a href="#" className="text-slate-400 hover:text-cyan-400 text-sm">Privacy</a>
                    <a href="#" className="text-slate-400 hover:text-cyan-400 text-sm">Terms</a>
                    <a href="#" className="text-slate-400 hover:text-cyan-400 text-sm">Contact</a>
                </div>
            </div>
        </footer>
    );
};
