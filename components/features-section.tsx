import { Gamepad2, Users, Trophy, Zap } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Gamepad2,
      title: "PSEUDO-3D RACING",
      description: "Retro racing engine inspired by OutRun classics with authentic arcade physics",
      color: "var(--ferrari-red)",
    },
    {
      icon: Zap,
      title: "CRYPTO TOURNAMENTS",
      description: "Daily competitions powered by Web3 with instant USDC prize distribution",
      color: "var(--racing-yellow)",
    },
    {
      icon: Trophy,
      title: "GLOBAL LEADERBOARD",
      description: "Track your rank and compete against racers from around the world",
      color: "var(--neon-pink)",
    },
    {
      icon: Users,
      title: "ARC TESTNET",
      description: "Exclusive integration with ARC Network for fast, secure blockchain gaming",
      color: "var(--neon-blue)",
    },
  ]

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 retro-grid opacity-10" />

      <div className="max-w-6xl mx-auto relative z-10">
        <h2
          className="text-2xl md:text-4xl font-bold text-center mb-16 neon-glow"
          style={{ color: "var(--neon-pink)" }}
        >
          FEATURES / HIGHLIGHTS
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="p-6 pixel-border hover:scale-105 transition-transform cursor-pointer"
                style={{
                  borderColor: feature.color,
                  backgroundColor: "rgba(0,0,0,0.5)",
                }}
              >
                <div className="mb-4">
                  <Icon className="w-12 h-12" style={{ color: feature.color }} />
                </div>

                <h3 className="text-sm md:text-base font-bold mb-3" style={{ color: feature.color }}>
                  {feature.title}
                </h3>

                <p className="text-xs font-mono text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
