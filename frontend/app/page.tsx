import { SideVectors } from "@/components/visuals/SideVectors";
import { Hero } from "@/components/sections/Hero";
import { FlowChart } from "@/components/visuals/FlowChart";
import { FlowDetails } from "@/components/sections/FlowDetails";
import { CapabilitiesSection } from "@/components/sections/CapabilitiesSection";
import { Testimonials } from "@/components/sections/Testimonials";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden selection:bg-cyan-500/30">
      <Navbar />
      <SideVectors />

      <div className="relative z-10 flex flex-col gap-10">
        <Hero />
        <FlowChart />
        <FlowDetails />
        <CapabilitiesSection />
        <Testimonials />
        <Footer />
      </div>
    </main>
  );
}
