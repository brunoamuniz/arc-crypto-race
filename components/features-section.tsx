"use client"

import { Gamepad2, Users, Trophy, Zap, Shield, Clock } from "lucide-react"
import { useEffect, useState, useRef } from "react"

export function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
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

  const features = [
    {
      icon: Gamepad2,
      title: "PSEUDO-3D RACING",
      description: "Authentic OutRun-style engine with smooth 60fps gameplay and retro arcade physics",
      color: "var(--ferrari-red)",
      gradient: "from-ferrari-red/20 to-transparent",
    },
    {
      icon: Zap,
      title: "CRYPTO TOURNAMENTS",
      description: "Daily competitions with instant USDC prize distribution via smart contracts",
      color: "var(--racing-yellow)",
      gradient: "from-racing-yellow/20 to-transparent",
    },
    {
      icon: Trophy,
      title: "GLOBAL LEADERBOARD",
      description: "Real-time rankings with on-chain verification of all scores and results",
      color: "var(--neon-pink)",
      gradient: "from-neon-pink/20 to-transparent",
    },
    {
      icon: Users,
      title: "ARC NETWORK",
      description: "Built exclusively on ARC Testnet for fast, low-cost blockchain gaming",
      color: "var(--neon-blue)",
      gradient: "from-neon-blue/20 to-transparent",
    },
    {
      icon: Shield,
      title: "FAIR PLAY",
      description: "No pay-to-win mechanics - pure skill determines the winners every day",
      color: "var(--neon-purple)",
      gradient: "from-neon-purple/20 to-transparent",
    },
    {
      icon: Clock,
      title: "5-MIN SESSIONS",
      description: "Quick, intense races that fit your schedule - play anytime, anywhere",
      color: "var(--neon-cyan)",
      gradient: "from-neon-cyan/20 to-transparent",
    },
  ]

  return (
    <section
      ref={sectionRef}
      className="relative py-24 px-4 overflow-hidden"
      style={{ background: "linear-gradient(180deg, var(--background) 0%, var(--card) 50%, var(--background) 100%)" }}
    >
      {/* Background */}
      <div className="absolute inset-0 retro-grid opacity-5" />

      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl opacity-10"
        style={{ background: "radial-gradient(circle, var(--neon-pink) 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className={`text-center mb-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span
            className="inline-block px-4 py-2 text-xs font-mono tracking-widest uppercase border mb-6"
            style={{ borderColor: "var(--neon-cyan)", color: "var(--neon-cyan)" }}
          >
            Why Play
          </span>
          <h2
            className="font-arcade text-2xl md:text-3xl lg:text-4xl neon-glow mb-4"
            style={{ color: "var(--neon-pink)" }}
          >
            FEATURES
          </h2>
          <p className="text-sm md:text-base font-mono max-w-2xl mx-auto" style={{ color: "var(--neon-blue)" }}>
            Experience the thrill of competitive blockchain racing
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const isHovered = hoveredIndex === index

            return (
              <div
                key={index}
                className={`group relative transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Card */}
                <div
                  className="relative h-full p-8 transition-all duration-500 cursor-pointer overflow-hidden"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.6)",
                    border: `1px solid ${isHovered ? feature.color : 'rgba(255,255,255,0.1)'}`,
                    transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                    boxShadow: isHovered ? `0 20px 40px ${feature.color}30, 0 0 0 1px ${feature.color}` : 'none',
                  }}
                >
                  {/* Holographic gradient overlay */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(135deg, ${feature.color}15 0%, transparent 50%, ${feature.color}10 100%)`,
                    }}
                  />

                  {/* Animated shine effect */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `linear-gradient(105deg, transparent 40%, ${feature.color}20 50%, transparent 60%)`,
                      backgroundSize: '200% 100%',
                      animation: isHovered ? 'gradient-shift 2s ease infinite' : 'none',
                    }}
                  />

                  {/* Icon */}
                  <div className="relative mb-6">
                    <div
                      className="relative w-14 h-14 flex items-center justify-center transition-all duration-300"
                      style={{
                        border: `2px solid ${feature.color}`,
                        boxShadow: isHovered ? `0 0 30px ${feature.color}60` : `0 0 15px ${feature.color}30`,
                      }}
                    >
                      <Icon
                        className="w-7 h-7 transition-transform duration-300 group-hover:scale-110"
                        style={{ color: feature.color }}
                      />
                    </div>

                    {/* Floating particles on hover */}
                    {isHovered && (
                      <>
                        <div
                          className="absolute -top-1 -right-1 w-2 h-2 animate-ping"
                          style={{ backgroundColor: feature.color, opacity: 0.6 }}
                        />
                        <div
                          className="absolute -bottom-1 -left-1 w-1.5 h-1.5 animate-ping"
                          style={{ backgroundColor: feature.color, opacity: 0.4, animationDelay: '0.3s' }}
                        />
                      </>
                    )}
                  </div>

                  {/* Content */}
                  <h3
                    className="font-display text-base lg:text-lg font-bold mb-3 tracking-wider transition-all duration-300"
                    style={{ color: isHovered ? feature.color : 'var(--foreground)' }}
                  >
                    {feature.title}
                  </h3>

                  <p className="text-sm font-mono text-muted-foreground leading-relaxed relative z-10">
                    {feature.description}
                  </p>

                  {/* Bottom accent */}
                  <div
                    className="absolute bottom-0 left-0 h-0.5 transition-all duration-500"
                    style={{
                      backgroundColor: feature.color,
                      width: isHovered ? '100%' : '0%',
                    }}
                  />

                  {/* Corner accents */}
                  <div
                    className="absolute top-0 left-0 w-3 h-3 border-t border-l transition-all duration-300"
                    style={{
                      borderColor: isHovered ? feature.color : 'transparent',
                    }}
                  />
                  <div
                    className="absolute top-0 right-0 w-3 h-3 border-t border-r transition-all duration-300"
                    style={{
                      borderColor: isHovered ? feature.color : 'transparent',
                    }}
                  />
                  <div
                    className="absolute bottom-0 left-0 w-3 h-3 border-b border-l transition-all duration-300"
                    style={{
                      borderColor: isHovered ? feature.color : 'transparent',
                    }}
                  />
                  <div
                    className="absolute bottom-0 right-0 w-3 h-3 border-b border-r transition-all duration-300"
                    style={{
                      borderColor: isHovered ? feature.color : 'transparent',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom tagline */}
        <div
          className={`text-center mt-16 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <p className="text-lg font-display tracking-widest glitch" style={{ color: "var(--neon-pink)" }}>
            NO PAY-TO-WIN. PURE SKILL.
          </p>
        </div>
      </div>
    </section>
  )
}
