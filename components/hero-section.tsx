"use client"

import { Button } from "@/components/ui/button"
import { Trophy, ExternalLink, Zap, ChevronDown } from "lucide-react"
import Link from "next/link"
import { WalletConnectButton } from "@/components/WalletConnectButton"
import { useEffect, useState } from "react"

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Layered Background Effects */}

      {/* Base gradient mesh */}
      <div className="absolute inset-0 gradient-mesh" />

      {/* Background image with enhanced treatment */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          backgroundImage: "url(/images/retro-racing-hero.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.5) saturate(1.2)",
          mixBlendMode: "luminosity",
        }}
      />

      {/* Perspective grid floor effect */}
      <div className="perspective-grid z-[2]" />

      {/* Animated gradient overlay */}
      <div
        className="absolute inset-0 z-[3] opacity-60"
        style={{
          background: `
            linear-gradient(180deg,
              transparent 0%,
              rgba(0,0,0,0.4) 50%,
              rgba(0,0,0,0.9) 100%
            )
          `,
        }}
      />

      {/* Retro grid overlay */}
      <div className="absolute inset-0 z-[4] retro-grid" />

      {/* Noise texture */}
      <div className="absolute inset-0 z-[5] noise-overlay opacity-50" />

      {/* Scanlines */}
      <div className="absolute inset-0 z-[6] scanlines pointer-events-none" />

      {/* Floating orbs for atmosphere */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full z-[3] blur-3xl animate-pulse"
        style={{ background: "radial-gradient(circle, rgba(255,50,100,0.15) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full z-[3] blur-3xl animate-pulse"
        style={{
          background: "radial-gradient(circle, rgba(100,50,255,0.15) 0%, transparent 70%)",
          animationDelay: "1s",
        }}
      />

      {/* Main Content */}
      <div className="relative z-20 text-center px-4 max-w-6xl mx-auto">

        {/* Subtitle - appears first */}
        <div
          className={`mb-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <span
            className="inline-block px-4 py-2 text-xs md:text-sm font-mono tracking-[0.3em] uppercase border border-neon-cyan/30 bg-black/40 backdrop-blur-sm"
            style={{ color: "var(--neon-cyan)" }}
          >
            The Ultimate Web3 Racing Tournament
          </span>
        </div>

        {/* Main Title with staggered animation */}
        <div className="mb-4">
          <h1
            className={`font-arcade text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl mb-2 glitch transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ color: "var(--ferrari-red)" }}
          >
            ARC CRYPTO
          </h1>
          <h2
            className={`font-arcade text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl neon-glow transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ color: "var(--neon-cyan)" }}
          >
            RACE
          </h2>
        </div>

        {/* Tagline */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 mb-12 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <p className="text-sm md:text-base font-display tracking-wider" style={{ color: "var(--neon-blue)" }}>
            SKILL-BASED RACING
          </p>
          <span className="hidden sm:block w-2 h-2 rounded-full bg-neon-pink animate-pulse" />
          <p className="text-sm md:text-base font-display tracking-wider" style={{ color: "var(--neon-purple)" }}>
            DAILY TOURNAMENTS
          </p>
          <span className="hidden sm:block w-2 h-2 rounded-full bg-neon-pink animate-pulse" />
          <p className="text-sm md:text-base font-display tracking-wider" style={{ color: "var(--racing-yellow)" }}>
            WIN USDC
          </p>
        </div>

        {/* CTA Buttons - Premium styling */}
        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {/* Primary CTA - Play Now */}
          <Button
            size="lg"
            className="group relative px-10 py-7 text-base md:text-lg font-bold tracking-wider btn-legendary btn-racing"
            style={{
              backgroundColor: "var(--ferrari-red)",
              color: "white",
              boxShadow: "0 0 30px rgba(255,50,50,0.4), inset 0 0 20px rgba(255,255,255,0.1)",
            }}
            asChild
          >
            <Link href="/game" className="flex items-center gap-3">
              <Zap className="w-5 h-5 group-hover:animate-pulse" />
              PLAY NOW
            </Link>
          </Button>

          {/* Secondary CTA - Leaderboard */}
          <Button
            size="lg"
            variant="outline"
            className="group relative px-8 py-7 text-base md:text-lg font-bold tracking-wider bg-black/40 backdrop-blur-sm btn-legendary hover:bg-neon-purple/20"
            style={{
              borderColor: "var(--neon-purple)",
              color: "var(--neon-purple)",
              boxShadow: "0 0 20px rgba(150,50,255,0.2)",
            }}
            asChild
          >
            <Link href="/leaderboard" className="flex items-center gap-3">
              <Trophy className="w-5 h-5 group-hover:scale-110 transition-transform" />
              LEADERBOARD
            </Link>
          </Button>

          {/* Wallet Connect */}
          <WalletConnectButton />

          {/* Faucet */}
          <Button
            size="lg"
            variant="outline"
            className="group relative px-8 py-7 text-base md:text-lg font-bold tracking-wider bg-black/40 backdrop-blur-sm btn-legendary hover:bg-racing-yellow/20"
            style={{
              borderColor: "var(--racing-yellow)",
              color: "var(--racing-yellow)",
              boxShadow: "0 0 20px rgba(255,200,50,0.2)",
            }}
            asChild
          >
            <a href="https://easyfaucetarc.xyz/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              GET FAUCET
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          </Button>
        </div>

        {/* Insert Coin - Arcade style */}
        <div
          className={`transition-all duration-700 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        >
          <div
            className="inline-flex items-center gap-3 px-6 py-3 border-2 border-dashed animate-pulse"
            style={{
              borderColor: "var(--racing-yellow)",
              backgroundColor: "rgba(0,0,0,0.6)",
            }}
          >
            <div
              className="w-3 h-3 rounded-full animate-ping"
              style={{ backgroundColor: "var(--racing-yellow)" }}
            />
            <span
              className="font-arcade text-xs md:text-sm tracking-widest"
              style={{ color: "var(--racing-yellow)" }}
            >
              INSERT COIN TO CONTINUE
            </span>
            <div
              className="w-3 h-3 rounded-full animate-ping"
              style={{ backgroundColor: "var(--racing-yellow)", animationDelay: "0.5s" }}
            />
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-700 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="flex flex-col items-center gap-2 animate-bounce">
            <span className="text-xs font-mono text-muted-foreground tracking-wider">SCROLL</span>
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 z-10 pointer-events-none">
        <div className="absolute top-4 left-4 w-16 h-[2px]" style={{ backgroundColor: "var(--ferrari-red)" }} />
        <div className="absolute top-4 left-4 w-[2px] h-16" style={{ backgroundColor: "var(--ferrari-red)" }} />
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 z-10 pointer-events-none">
        <div className="absolute top-4 right-4 w-16 h-[2px]" style={{ backgroundColor: "var(--neon-cyan)" }} />
        <div className="absolute top-4 right-4 w-[2px] h-16" style={{ backgroundColor: "var(--neon-cyan)" }} />
      </div>
      <div className="absolute bottom-0 left-0 w-32 h-32 z-10 pointer-events-none">
        <div className="absolute bottom-4 left-4 w-16 h-[2px]" style={{ backgroundColor: "var(--neon-purple)" }} />
        <div className="absolute bottom-4 left-4 w-[2px] h-16" style={{ backgroundColor: "var(--neon-purple)" }} />
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 z-10 pointer-events-none">
        <div className="absolute bottom-4 right-4 w-16 h-[2px]" style={{ backgroundColor: "var(--neon-pink)" }} />
        <div className="absolute bottom-4 right-4 w-[2px] h-16" style={{ backgroundColor: "var(--neon-pink)" }} />
      </div>
    </section>
  )
}
