import { Button } from "@/components/ui/button"
import { Wallet, Trophy, ExternalLink } from "lucide-react"
import Link from "next/link"
import { WalletConnectButton } from "@/components/WalletConnectButton"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden scanlines">
      {/* Background image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url(/images/retro-racing-hero.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.7)",
        }}
      />

      {/* Retro grid overlay */}
      <div className="absolute inset-0 z-10 retro-grid opacity-30" />

      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
        {/* Logo/Title with neon glow */}
        <div className="mb-8">
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 neon-glow"
            style={{ color: "var(--ferrari-red)" }}
          >
            ARC CRYPTO
          </h1>
          <h2
            className="text-3xl md:text-5xl lg:text-6xl font-bold mb-2 neon-glow"
            style={{ color: "var(--neon-cyan)" }}
          >
            RACE
          </h2>
        </div>

        {/* Subtitle */}
        <p className="text-sm md:text-base mb-2 font-mono" style={{ color: "var(--neon-blue)" }}>
          THE ULTIMATE CRYPTO RACING TOURNAMENT
        </p>
        <p className="text-xs md:text-sm mb-12 font-mono" style={{ color: "var(--neon-purple)" }}>
          ONLY ON ARC TESTNET
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 flex-wrap">
          <Button
            size="lg"
            className="pixel-border text-sm md:text-base px-8 py-6 font-bold hover:scale-105 transition-transform"
            style={{
              backgroundColor: "var(--ferrari-red)",
              color: "var(--foreground)",
            }}
            asChild
          >
            <Link href="/game">
              PLAY NOW
            </Link>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="pixel-border text-sm md:text-base px-8 py-6 font-bold hover:scale-105 transition-transform bg-transparent"
            style={{
              borderColor: "var(--neon-purple)",
              color: "var(--neon-purple)",
            }}
            asChild
          >
            <Link href="/leaderboard">
              <Trophy className="mr-2 h-5 w-5" />
              LEADERBOARD
            </Link>
          </Button>

          <WalletConnectButton />

          <Button
            size="lg"
            variant="outline"
            className="pixel-border text-sm md:text-base px-8 py-6 font-bold hover:scale-105 transition-transform bg-transparent"
            style={{
              borderColor: "var(--racing-yellow)",
              color: "var(--racing-yellow)",
            }}
            asChild
          >
            <a href="https://easyfaucetarc.xyz/" target="_blank" rel="noopener noreferrer">
              GET FAUCET <ExternalLink className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>

        {/* Insert Coin animation */}
        <div className="text-xs md:text-sm animate-pulse font-mono" style={{ color: "var(--racing-yellow)" }}>
          {">"} INSERT COIN TO CONTINUE {"<"}
        </div>
      </div>
    </section>
  )
}
