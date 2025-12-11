"use client"

import { useState, useEffect } from "react"
import { Home, Twitter, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LeaderboardFooter() {
  const [shareUrl, setShareUrl] = useState("")

  useEffect(() => {
    // Set share URL to fixed site URL
    setShareUrl(encodeURIComponent("https://arccryptorace.xyz/leaderboard"))
  }, [])

  const shareText = encodeURIComponent(
    "Just checked the ARC CRYPTO RACE leaderboard! 🏆\nThe fastest racers are dominating ARC Testnet — think you can beat them? 🏎️💨\n\n@ARC\n\n#ARC #DeFi #Web3 #ARCTestnet",
  )

  return (
    <footer className="border-t-4 border-accent bg-black py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Back to Home */}
          <a
            href="/"
            className="group flex items-center gap-2 rounded-none border-4 border-primary bg-primary/20 px-6 py-3 font-mono font-bold uppercase tracking-wider text-primary transition-all hover:bg-primary hover:text-black hover:shadow-[0_0_30px_hsl(var(--primary))]"
          >
            <Home className="h-5 w-5" />
            Back to Home
          </a>

          {/* Share on X button for leaderboard */}
          <Button
            size="lg"
            variant="outline"
            className="rounded-none border-4 px-6 py-3 font-mono font-bold uppercase tracking-wider transition-all hover:scale-105 bg-transparent"
            style={{
              borderColor: "var(--racing-yellow)",
              color: "var(--racing-yellow)",
              backgroundColor: "rgba(255, 215, 0, 0.1)",
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
              Share Leaderboard
            </a>
          </Button>

          {/* Social Links */}
          <div className="flex gap-4">
            <a
              href="https://x.com/arc_crypto_bros"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-none border-4 border-accent bg-accent/20 p-3 transition-all hover:border-accent hover:bg-accent hover:text-black hover:shadow-[0_0_20px_hsl(var(--accent))]"
              aria-label="Twitter"
            >
              <Twitter className="h-6 w-6" />
            </a>
            <a
              href="https://t.me/arc_crypto_bros"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-none border-4 border-secondary bg-secondary/20 p-3 transition-all hover:border-secondary hover:bg-secondary hover:text-black hover:shadow-[0_0_20px_hsl(var(--secondary))]"
              aria-label="Telegram"
            >
              <MessageCircle className="h-6 w-6" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 text-center">
          <p className="font-mono text-xs text-muted-foreground">
            © 2025 ARC CRYPTO RACE. Built on ARC Testnet.
          </p>
          <p className="font-mono text-xs text-muted-foreground mt-2 opacity-60">
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
