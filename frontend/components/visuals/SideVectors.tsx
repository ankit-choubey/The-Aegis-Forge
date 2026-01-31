"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React from "react";

export const SideVectors = () => {
    const { scrollY } = useScroll();

    // Left moves left (-50px), Right moves right (50px) as we scroll down
    const xLeft = useTransform(scrollY, [0, 500], [0, -50]);
    const xRight = useTransform(scrollY, [0, 500], [0, 50]);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Left Vector */}
            <motion.div
                style={{ x: xLeft }}
                className="absolute left-0 top-1/4 w-[500px] h-[800px] opacity-10 text-cyan-500"
            >
                <svg viewBox="0 0 200 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <path
                        d="M0 0C50 200 150 300 100 800H0V0Z"
                        fill="currentColor"
                    />
                </svg>
            </motion.div>

            {/* Right Vector */}
            <motion.div
                style={{ x: xRight }}
                className="absolute right-0 top-0 w-[500px] h-[800px] opacity-10 text-blue-500"
            >
                <svg viewBox="0 0 200 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full transform scale-x-[-1]">
                    <path
                        d="M0 0C50 200 150 300 100 800H0V0Z"
                        fill="currentColor"
                    />
                </svg>
            </motion.div>
        </div>
    );
};
