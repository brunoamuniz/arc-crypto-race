"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Twitter, Linkedin, Github } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
  const [shareUrl, setShareUrl] = useState("")

  useEffect(() => {
    // Set share URL to fixed site URL
    setShareUrl(encodeURIComponent("https://arccryptorace.xyz"))
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
    { label: "PLAY NOW", href: "#" },
    { label: "LEADERBOARD", href: "/leaderboard" },
    { label: "ARC TESTNET", href: "https://www.arc.network/" },
    { label: "GET FAUCET", href: "https://easyfaucetarc.xyz/" },
  ]

  const shareText = encodeURIComponent(
    "Just joined ARC CRYPTO RACE! 🏎️\nRacing for real USDC prizes on ARC Testnet.\nJoin the ultimate Web3 racing tournament! 🚀\n\n@ARC\n\n#ARC #DeFi #Web3 #ARCTestnet",
  )

  return (
    <footer className="py-12 px-4 bg-card border-t-2" style={{ borderColor: "var(--neon-pink)" }}>
      <div className="max-w-6xl mx-auto">
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
