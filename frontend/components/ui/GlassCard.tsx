import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard = ({ children, className, ...props }: GlassCardProps) => {
  return (
    <div
      className={cn(
        "backdrop-blur-lg bg-card/60 dark:bg-white/5 border border-black/10 dark:border-white/10 shadow-xl rounded-2xl p-6 transition-colors duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
