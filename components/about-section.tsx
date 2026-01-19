"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Twitter, Flame, Target, Zap } from "lucide-react"

export function AboutSection() {
  const [shareUrl, setShareUrl] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setShareUrl(encodeURIComponent("https://arccryptorace.xyz"))
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const shareText = encodeURIComponent(
    "Just joined ARC CRYPTO RACE!\nRacing for USDC (FAUCET) prizes on @ARC Testnet.\nJoin the ultimate Web3 racing tournament!\n\n#ARC #DeFi #Web3 #ARCTestnet",
  )

  const highlights = [
    { icon: Flame, text: "5 USDC Entry", color: "var(--ferrari-red)" },
    { icon: Target, text: "5 Min Races", color: "var(--neon-cyan)" },
    { icon: Zap, text: "Top 3 Win", color: "var(--racing-yellow)" },
  ]

  return (
    <section
      ref={sectionRef}
      className="relative py-24 px-4 overflow-hidden"
      style={{ background: "linear-gradient(180deg, var(--background) 0%, var(--card) 100%)" }}
    >
      {/* Background effects */}
      <div className="absolute inset-0 retro-grid opacity-5" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
        style={{ background: "radial-gradient(circle, var(--neon-cyan) 0%, transparent 70%)" }}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span
            className="inline-block px-4 py-2 text-xs font-mono tracking-widest uppercase border mb-6"
            style={{ borderColor: "var(--neon-pink)", color: "var(--neon-pink)" }}
          >
            The Mission
          </span>
          <h2
            className="font-arcade text-2xl md:text-3xl lg:text-4xl neon-glow mb-4"
            style={{ color: "var(--neon-pink)" }}
          >
            ABOUT THE GAME
          </h2>
        </div>

        {/* Main Content Card */}
        <div
          className={`relative p-8 md:p-12 mb-12 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{
            background: "rgba(0,0,0,0.6)",
            border: "1px solid var(--neon-blue)",
            boxShadow: "0 0 30px rgba(100, 150, 255, 0.1)",
          }}
        >
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2" style={{ borderColor: "var(--neon-blue)" }} />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2" style={{ borderColor: "var(--neon-blue)" }} />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2" style={{ borderColor: "var(--neon-blue)" }} />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2" style={{ borderColor: "var(--neon-blue)" }} />

          <div className="space-y-6 text-center">
            <p className="font-display text-lg md:text-xl tracking-wide" style={{ color: "var(--neon-cyan)" }}>
              WELCOME TO ARC CRYPTO RACE
            </p>

            <p className="font-mono text-sm md:text-base text-foreground leading-relaxed max-w-2xl mx-auto">
              The Web3 racing tournament that runs exclusively on ARC Testnet.
              Pay to enter, race for 5 minutes, set the highest score, and compete
              for daily prize pools distributed to the top 3 players.
            </p>

            <p className="font-mono text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Join the ARC Network community and prove your skills on the fastest
              blockchain testnet. Real builders, real racing, real rewards.
            </p>

            {/* Highlights */}
            <div className="flex flex-wrap justify-center gap-6 pt-4">
              {highlights.map((item, index) => {
                const Icon = item.icon
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2"
                    style={{
                      border: `1px solid ${item.color}`,
                      boxShadow: `0 0 15px ${item.color}30`,
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: item.color }} />
                    <span className="font-mono text-sm font-bold" style={{ color: item.color }}>
                      {item.text}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Tagline */}
            <div className="pt-6">
              <p className="font-arcade text-base md:text-lg glitch" style={{ color: "var(--racing-yellow)" }}>
                NO PAY-TO-WIN. PURE SKILL.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          className={`text-center transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <Button
            size="lg"
            className="group px-8 py-6 font-bold tracking-wider btn-legendary"
            style={{
              backgroundColor: "transparent",
              border: "2px solid var(--neon-cyan)",
              color: "var(--neon-cyan)",
              boxShadow: "0 0 20px rgba(100, 200, 255, 0.2)",
            }}
            asChild
          >
            <a
              href={shareUrl ? `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}` : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3"
            >
              <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />
              SHARE & INVITE FRIENDS
            </a>
          </Button>

          <p className="mt-6 text-xs font-mono text-muted-foreground">
            Available only on{" "}
            <a
              href="https://www.arc.network/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: "var(--neon-purple)" }}
            >
              ARC Testnet
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
