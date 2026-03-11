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