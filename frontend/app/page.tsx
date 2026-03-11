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

      <section className="relative w-full px-4 md:px-8 py-10 md:py-14">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-cyan-300/20 shadow-[0_0_50px_rgba(34,211,238,0.12)]">
          <img
            src="/dark-vector-network.png"
            alt="Green tech network visual"
            className="h-auto w-full object-cover"
          />
        </div>
      </section>

      <FooterCTA />
    </main>
  );
}
