"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";
import { cn } from "@/lib/utils";

interface HoverBumpCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
}

export const HoverBumpCard = ({ children, className, ...props }: HoverBumpCardProps) => {
    return (
        <motion.div
            whileHover={{
                scale: 1.05,
                y: -5,
                boxShadow: "0px 10px 30px rgba(0, 229, 255, 0.2)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn("h-full", className)}
            {...props}
        >
            {children}
        </motion.div>
    );
};
