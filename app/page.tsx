import { Hero } from "@/components/sections/hero"
import { ToolsShowcase } from "@/components/sections/tools-showcase"
import { PricingSection } from "@/components/sections/pricing-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CTASection } from "@/components/sections/cta-section"

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <ToolsShowcase />
      <PricingSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </main>
  )
}
