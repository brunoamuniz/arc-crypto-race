"use client"

import { Wallet, DollarSign, Car, Trophy, ExternalLink, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState, useRef } from "react"

export function HowItWorksSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.15 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const steps = [
    {
      icon: Wallet,
      title: "CONNECT WALLET",
      description: "Link your ARC Testnet wallet to enter the arena",
      color: "var(--neon-purple)",
      number: "01",
    },
    {
      icon: DollarSign,
      title: "PAY ENTRY FEE",
      description: "Deposit 5 USDC (FAUCET) to join the daily tournament",
      color: "var(--racing-yellow)",
      number: "02",
    },
    {
      icon: Car,
      title: "RACE 5 MINUTES",
      description: "Drive fast, avoid crashes, and maximize your score",
      color: "var(--ferrari-red)",
      number: "03",
    },
    {
      icon: Trophy,
      title: "WIN PRIZES",
      description: "Top 3 racers split the daily prize pool",
      color: "var(--neon-pink)",
      number: "04",
    },
  ]

  return (
    <section
      ref={sectionRef}
      className="relative py-24 px-4 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 retro-grid opacity-5" />

      {/* Gradient orbs */}
      <div
        className="absolute top-1/3 left-0 w-96 h-96 rounded-full blur-3xl opacity-10"
        style={{ background: "radial-gradient(circle, var(--neon-purple) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-1/3 right-0 w-80 h-80 rounded-full blur-3xl opacity-10"
        style={{ background: "radial-gradient(circle, var(--ferrari-red) 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className={`text-center mb-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span
            className="inline-block px-4 py-2 text-xs font-mono tracking-widest uppercase border mb-6"
            style={{ borderColor: "var(--neon-pink)", color: "var(--neon-pink)" }}
          >
            Getting Started
          </span>
          <h2
            className="font-arcade text-2xl md:text-3xl lg:text-4xl neon-glow mb-4"
            style={{ color: "var(--neon-pink)" }}
          >
            HOW TO PLAY
          </h2>
          <p className="text-sm md:text-base font-mono max-w-xl mx-auto" style={{ color: "var(--neon-blue)" }}>
            Four simple steps to start racing and winning
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon
            const delayClass = `delay-${(index + 1) * 100}`

            return (
              <div
                key={index}
                className={`group relative transition-all duration-700 ${delayClass} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              >
                {/* Connection line (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/4 -right-2 w-4 z-20">
                    <ArrowRight
                      className="w-4 h-4 animate-pulse"
                      style={{ color: "var(--muted-foreground)" }}
                    />
                  </div>
                )}

                {/* Card */}
                <div
                  className="relative h-full p-6 lg:p-8 transition-all duration-300 hover:scale-105 group-hover:-translate-y-2"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.5)",
                    border: `2px solid transparent`,
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), linear-gradient(135deg, ${step.color}40, transparent)`,
                    backgroundOrigin: "border-box",
                    backgroundClip: "padding-box, border-box",
                  }}
                >
                  {/* Glow effect on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      boxShadow: `0 0 40px ${step.color}30, inset 0 0 40px ${step.color}10`,
                    }}
                  />

                  {/* Step Number */}
                  <div
                    className="absolute -top-3 -right-3 w-12 h-12 flex items-center justify-center font-arcade text-sm"
                    style={{
                      backgroundColor: "var(--background)",
                      border: `2px solid ${step.color}`,
                      color: step.color,
                    }}
                  >
                    {step.number}
                  </div>

                  {/* Icon Container */}
                  <div
                    className="relative w-16 h-16 mb-6 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{
                      border: `2px solid ${step.color}`,
                      boxShadow: `0 0 20px ${step.color}40`,
                    }}
                  >
                    <Icon
                      className="w-8 h-8"
                      style={{ color: step.color }}
                    />

                    {/* Animated ring on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 animate-ping"
                      style={{
                        border: `1px solid ${step.color}`,
                      }}
                    />
                  </div>

                  {/* Content */}
                  <h3
                    className="font-display text-base lg:text-lg font-bold mb-3 tracking-wider"
                    style={{ color: step.color }}
                  >
                    {step.title}
                  </h3>

                  <p className="text-sm font-mono text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>

                  {/* Bottom accent line */}
                  <div
                    className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500"
                    style={{ backgroundColor: step.color }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA Section */}
        <div
          className={`text-center transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div
            className="inline-block p-8 relative"
            style={{
              backgroundColor: "rgba(0,0,0,0.6)",
              border: "1px solid var(--neon-blue)",
            }}
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: "var(--neon-blue)" }} />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: "var(--neon-blue)" }} />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: "var(--neon-blue)" }} />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: "var(--neon-blue)" }} />

            <p
              className="text-sm font-mono mb-4 tracking-wider"
              style={{ color: "var(--racing-yellow)" }}
            >
              NEED TESTNET USDC TO PLAY?
            </p>
            <Button
              size="lg"
              className="group px-8 py-6 font-bold tracking-wider btn-legendary btn-racing"
              style={{
                backgroundColor: "var(--neon-blue)",
                color: "var(--background)",
              }}
              asChild
            >
              <a href="https://easyfaucetarc.xyz/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                GET FREE FAUCET
                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
