"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Twitter, Linkedin, Github, ExternalLink, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
  const [shareUrl, setShareUrl] = useState("")

  useEffect(() => {
    setShareUrl(encodeURIComponent("https://arccryptorace.xyz"))
  }, [])

  const socialLinks = [
    {
      label: "X (Twitter)",
      href: "https://x.com/0xbrunoamuniz",
      icon: Twitter,
      color: "var(--neon-cyan)",
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/brunoamuniz/",
      icon: Linkedin,
      color: "var(--neon-blue)",
    },
    {
      label: "GitHub",
      href: "https://github.com/brunoamuniz/arc-crypto-race",
      icon: Github,
      color: "var(--neon-purple)",
    },
  ]

  const links = [
    { label: "PLAY NOW", href: "/game", color: "var(--ferrari-red)" },
    { label: "LEADERBOARD", href: "/leaderboard", color: "var(--neon-pink)" },
    { label: "ARC TESTNET", href: "https://www.arc.network/", color: "var(--neon-purple)" },
    { label: "GET FAUCET", href: "https://easyfaucetarc.xyz/", color: "var(--racing-yellow)" },
  ]

  const shareText = encodeURIComponent(
    "Just joined ARC CRYPTO RACE!\nRacing for USDC (FAUCET) prizes on @ARC Testnet.\nJoin the ultimate Web3 racing tournament!\n\n#ARC #DeFi #Web3 #ARCTestnet",
  )

  return (
    <footer className="relative py-16 px-4 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, var(--card) 0%, var(--background) 100%)",
        }}
      />
      <div className="absolute inset-0 retro-grid opacity-5" />

      {/* Top border glow */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: "linear-gradient(90deg, transparent, var(--neon-pink), var(--neon-purple), var(--neon-cyan), transparent)",
          boxShadow: "0 0 20px var(--neon-pink)",
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Logo */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block group">
            <h3 className="font-arcade text-2xl md:text-3xl glitch-hover" style={{ color: "var(--ferrari-red)" }}>
              ARC CRYPTO
            </h3>
            <h4 className="font-arcade text-xl md:text-2xl neon-glow" style={{ color: "var(--neon-cyan)" }}>
              RACE
            </h4>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {links.map((link, index) =>
            link.href.startsWith("/") ? (
              <Link
                key={index}
                href={link.href}
                className="group relative font-display text-sm font-bold tracking-wider transition-all duration-300 hover:scale-110"
                style={{ color: link.color }}
              >
                {link.label}
                <span
                  className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                  style={{ backgroundColor: link.color }}
                />
              </Link>
            ) : (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative font-display text-sm font-bold tracking-wider transition-all duration-300 hover:scale-110 flex items-center gap-1"
                style={{ color: link.color }}
              >
                {link.label}
                <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                <span
                  className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                  style={{ backgroundColor: link.color }}
                />
              </a>
            ),
          )}
        </div>

        {/* Share CTA */}
        <div className="text-center mb-12">
          <Button
            size="lg"
            className="group px-8 py-6 font-bold tracking-wider btn-legendary btn-racing"
            style={{
              backgroundColor: "var(--racing-yellow)",
              color: "var(--background)",
              boxShadow: "0 0 30px rgba(255, 200, 50, 0.3)",
            }}
            asChild
          >
            <a
              href={shareUrl ? `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}` : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3"
            >
              <Zap className="w-5 h-5 group-hover:animate-pulse" />
              INVITE FRIENDS TO RACE
              <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </a>
          </Button>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-6 mb-12">
          {socialLinks.map((social, index) => {
            const Icon = social.icon
            return (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-3 transition-all duration-300 hover:scale-110"
                style={{
                  border: `1px solid ${social.color}40`,
                }}
                aria-label={social.label}
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" style={{ color: social.color }} />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ boxShadow: `0 0 20px ${social.color}40` }}
                />
              </a>
            )
          })}
        </div>

        {/* Bottom Info */}
        <div className="text-center space-y-3">
          <p className="font-arcade text-xs tracking-wider" style={{ color: "var(--racing-yellow)" }}>
            {">"} BUILT FOR WEB3 RACERS ON ARC TESTNET {"<"}
          </p>

          <p className="font-mono text-xs text-muted-foreground">
            © 2025 ARC CRYPTO RACE. ALL RIGHTS RESERVED.
          </p>

          <p className="font-mono text-xs text-muted-foreground opacity-60">
            Racing engine based on{" "}
            <a
              href="https://github.com/jakesgordon/javascript-racer"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline transition-colors"
              style={{ color: "var(--neon-blue)" }}
            >
              javascript-racer
            </a>
          </p>

          {process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS && (
            <p className="font-mono text-[10px] text-muted-foreground opacity-50">
              Contract:{" "}
              <a
                href={`https://testnet.arcscan.app/address/${process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:opacity-100 transition-all"
                style={{ color: "var(--neon-cyan)" }}
              >
                {process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS.slice(0, 6)}...
                {process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS.slice(-4)}
              </a>
            </p>
          )}
        </div>
      </div>
    </footer>
  )
}
