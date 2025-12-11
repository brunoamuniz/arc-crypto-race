"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Home, Twitter, Linkedin, Github } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LeaderboardFooter() {
  const [shareUrl, setShareUrl] = useState("")

  useEffect(() => {
    // Set share URL to fixed site URL
    setShareUrl(encodeURIComponent("https://arccryptorace.xyz/leaderboard"))
  }, [])

  const socialLinks = [
    {
      label: "X (TWITTER)",
      href: "https://x.com/0xbrunoamuniz",
      icon: Twitter,
    },
    {
      label: "LINKEDIN",
      href: "https://www.linkedin.com/in/brunoamuniz/",
      icon: Linkedin,
    },
    {
      label: "GITHUB",
      href: "https://github.com/brunoamuniz/arc-crypto-race",
      icon: Github,
    },
  ]

  const links = [
    { label: "PLAY NOW", href: "/game" },
    { label: "LEADERBOARD", href: "/leaderboard" },
    { label: "ARC TESTNET", href: "https://www.arc.network/" },
    { label: "GET FAUCET", href: "https://easyfaucetarc.xyz/" },
  ]

  const shareText = encodeURIComponent(
    "Just checked the ARC CRYPTO RACE leaderboard! 🏆\nThe fastest racers are dominating @ARC Testnet — think you can beat them? 🏎️💨\n\n#ARC #DeFi #Web3 #ARCTestnet",
  )

  return (
    <footer className="py-12 bg-card border-t-2" style={{ borderColor: "var(--neon-pink)" }}>
      <div className="container mx-auto max-w-6xl px-4">
        {/* Back to Home and Share Leaderboard buttons - Back to Home left, Share Leaderboard right, same height */}
        <div className="flex justify-between gap-4 mb-8">
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-none border-4 border-primary bg-primary/20 px-6 py-3 font-mono font-bold uppercase tracking-wider text-primary transition-all hover:bg-primary hover:text-black hover:shadow-[0_0_30px_hsl(var(--primary))]"
            style={{ height: '48px' }}
          >
            <Home className="h-5 w-5" />
            Back to Home
          </Link>

          <a
            href={shareUrl ? `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}` : "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!shareUrl) {
                e.preventDefault()
              }
            }}
            className="flex items-center gap-2 rounded-none border-4 px-6 py-3 font-mono font-bold uppercase tracking-wider transition-all hover:scale-105 bg-transparent"
            style={{
              borderColor: "var(--racing-yellow)",
              color: "var(--racing-yellow)",
              height: '48px'
            }}
          >
            <Twitter className="h-5 w-5" />
            Share Leaderboard
          </a>
        </div>

        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-bold neon-glow" style={{ color: "var(--ferrari-red)" }}>
            ARC CRYPTO RACE
          </h3>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {links.map((link, index) =>
            link.href.startsWith("/") ? (
              <Link
                key={index}
                href={link.href}
                className="text-xs md:text-sm font-bold hover:scale-110 transition-transform"
                style={{ color: "var(--neon-purple)" }}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={index}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="text-xs md:text-sm font-bold hover:scale-110 transition-transform"
                style={{ color: "var(--neon-purple)" }}
              >
                {link.label}
              </a>
            ),
          )}
        </div>

        <div className="text-center mb-8">
          <Button
            size="lg"
            variant="outline"
            className="pixel-border text-sm px-8 py-4 font-bold hover:scale-105 transition-transform bg-transparent"
            style={{
              borderColor: "var(--racing-yellow)",
              color: "var(--racing-yellow)",
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
              INVITE FRIENDS TO RACE
            </a>
          </Button>
        </div>

        <div className="flex justify-center gap-8 mb-8">
          {socialLinks.map((social, index) => {
            const Icon = social.icon
            return (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform"
                style={{ color: "var(--neon-pink)" }}
                aria-label={social.label}
              >
                <Icon className="w-6 h-6" />
              </a>
            )
          })}
        </div>

        <div className="text-center">
          <p className="text-xs font-mono mb-2" style={{ color: "var(--racing-yellow)" }}>
            {">"} MADE FOR WEB3 ARCADE RACERS ON ARC TESTNET {"<"}
          </p>
          <p className="text-xs font-mono text-muted-foreground">© 2025 ARC CRYPTO RACE. ALL RIGHTS RESERVED.</p>
          <p className="text-xs font-mono text-muted-foreground mt-2 opacity-60">
            Based on{" "}
            <a
              href="https://github.com/jakesgordon/javascript-racer"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: "var(--neon-blue)" }}
            >
              javascript-racer by jakesgordon
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
