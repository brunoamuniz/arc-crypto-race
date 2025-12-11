import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { PrizePoolSection } from "@/components/prize-pool-section"
import { FeaturesSection } from "@/components/features-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <AboutSection />
      <HowItWorksSection />
      <PrizePoolSection />
      <FeaturesSection />
      <Footer />
    </main>
  )
}
