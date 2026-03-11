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
        const triggerId = "hexagon-scroll-trigger";

        // Guard against duplicate pin instances during Fast Refresh/Strict re-mounts.
        try {
            ScrollTrigger.getById(triggerId)?.kill(true);
        } catch {}

        let ctx = gsap.context(() => {
            // Pin the section
            const tl = gsap.timeline({
                scrollTrigger: {
                    id: triggerId,
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

        return () => {
            try {
                ScrollTrigger.getById(triggerId)?.kill(true);
            } catch {}
            try {
                ctx.revert();
            } catch {}
        };
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
