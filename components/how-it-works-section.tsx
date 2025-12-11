import { Wallet, DollarSign, Car, Trophy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HowItWorksSection() {
  const steps = [
    {
      icon: Wallet,
      title: "CONNECT WALLET",
      description: "Connect your ARC Testnet wallet (game works ONLY on ARC Testnet)",
      color: "var(--neon-purple)",
    },
    {
      icon: DollarSign,
      title: "DEPOSIT 5 USDC",
      description: "Pay 5 USDC (testnet) to enter the daily tournament",
      color: "var(--racing-yellow)",
    },
    {
      icon: Car,
      title: "RACE 5 MINUTES",
      description: "Race and score as high as possible in your 5-minute session",
      color: "var(--ferrari-red)",
    },
    {
      icon: Trophy,
      title: "TOP 3 WIN",
      description: "End of day: 1st (60%), 2nd (25%), 3rd (15%) win the prize pool",
      color: "var(--neon-pink)",
    },
  ]

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 retro-grid opacity-10" />

      <div className="max-w-6xl mx-auto relative z-10">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-4 neon-glow" style={{ color: "var(--neon-pink)" }}>
          HOW TO PLAY
        </h2>

        <p className="text-center text-sm font-mono mb-16" style={{ color: "var(--neon-blue)" }}>
          ARC CRYPTO RACE
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="text-center p-6 pixel-border" style={{ borderColor: step.color }}>
                <div className="mb-6 flex justify-center">
                  <div
                    className="w-20 h-20 flex items-center justify-center pixel-border"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.5)",
                      borderColor: step.color,
                      color: step.color,
                    }}
                  >
                    <Icon className="w-10 h-10" />
                  </div>
                </div>

                <h3 className="text-lg md:text-xl font-bold mb-4" style={{ color: step.color }}>
                  STEP {index + 1}
                </h3>

                <p className="text-base font-bold mb-2">{step.title}</p>

                <p className="text-xs font-mono text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            )
          })}
        </div>

        <div className="text-center">
          <p className="text-sm font-mono mb-4" style={{ color: "var(--racing-yellow)" }}>
            NEED TEST USDC? GET IT FROM THE FAUCET!
          </p>
          <Button
            size="lg"
            className="pixel-border text-sm px-8 py-6 font-bold hover:scale-105 transition-transform"
            style={{
              backgroundColor: "var(--neon-blue)",
              color: "var(--background)",
            }}
            asChild
          >
            <a href="https://easyfaucetarc.xyz/" target="_blank" rel="noopener noreferrer">
              GET FAUCET <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
