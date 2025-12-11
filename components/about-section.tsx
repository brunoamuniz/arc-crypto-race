"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Twitter } from "lucide-react"

export function AboutSection() {
  const [shareUrl, setShareUrl] = useState("")

  useEffect(() => {
    // Set share URL to fixed site URL
    setShareUrl(encodeURIComponent("https://arccryptorace.xyz"))
  }, [])

  const shareText = encodeURIComponent(
    "Just joined ARC CRYPTO RACE! 🏎️\nRacing for real USDC prizes on ARC Testnet.\nJoin the ultimate Web3 racing tournament! 🚀\n\n@ARC\n\n#ARC #DeFi #Web3 #ARCTestnet",
  )

  return (
    <section className="py-20 px-4 bg-card">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-4xl font-bold mb-8 neon-glow" style={{ color: "var(--neon-pink)" }}>
          ABOUT THE GAME
        </h2>

        <div className="space-y-6 text-sm md:text-base font-mono leading-relaxed">
          <p style={{ color: "var(--neon-blue)" }}>
            WELCOME TO ARC CRYPTO RACE, THE WEB3 RACING TOURNAMENT THAT RUNS EXCLUSIVELY ON ARC TESTNET!
          </p>

          <p className="text-foreground">
            PAY 5 USDC TO ENTER THE DAILY TOURNAMENT. RACE FOR 5 MINUTES AND SET THE HIGHEST SCORE. THE TOP 3 PLAYERS
            WIN THE PRIZE POOL!
          </p>

          <p className="text-foreground">
            THIS IS MORE THAN JUST A GAME - JOIN THE ARC NETWORK BUILD COMMUNITY AND PROVE YOUR SKILLS ON THE FASTEST
            BLOCKCHAIN TESTNET. REAL BUILDERS, REAL RACING, REAL REWARDS.
          </p>

          <p style={{ color: "var(--racing-yellow)" }}>NO PAY-TO-WIN. PURE SKILL. MAXIMUM FERRARI ENERGY.</p>

          <p style={{ color: "var(--neon-purple)" }} className="text-xs">
            AVAILABLE ONLY ON ARC TESTNET → https://www.arc.network/
          </p>
        </div>

        <div className="mt-8">
          <Button
            size="lg"
            variant="outline"
            className="pixel-border text-sm px-8 py-4 font-bold hover:scale-105 transition-transform bg-transparent"
            style={{
              borderColor: "var(--neon-cyan)",
              color: "var(--neon-cyan)",
            }}
            asChild
          >
            <a
              href={shareUrl ? `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}` : "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!shareUrl) {
                  e.preventDefault()
                }
              }}
            >
              <Twitter className="mr-2 h-5 w-5" />
              SHARE ON X & INVITE FRIENDS
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
