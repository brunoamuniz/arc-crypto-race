"use client"

import { useState, useEffect } from "react"
import { Trophy, ExternalLink, Twitter, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getDayInfo } from "@/lib/contract"
import { getCurrentDayId } from "@/lib/dayId"

export function PrizePoolSection() {
  const [prizeAmount, setPrizeAmount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState("")

  // Fetch prize pool from contract
  const fetchPrizePool = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const dayId = getCurrentDayId()
      const dayInfo = await getDayInfo(dayId)
      
      if (dayInfo) {
        // totalPool is already formatted as string with 6 decimals
        const poolValue = parseFloat(dayInfo.totalPool)
        setPrizeAmount(poolValue)
      } else {
        setError("Failed to fetch prize pool")
        setPrizeAmount(0)
      }
    } catch (err) {
      console.error("Error fetching prize pool:", err)
      setError("Error loading prize pool")
      setPrizeAmount(0)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Fetch on mount
    fetchPrizePool()

    // Set share URL to fixed site URL
    setShareUrl(encodeURIComponent("https://arccryptorace.xyz"))

    // Optional: Refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchPrizePool()
    }, 30000) // 30 seconds

    return () => clearInterval(refreshInterval)
  }, [])

  // Calculate prize splits (after 10% site fee)
  // Prize distribution: 60% / 25% / 15% of prize pool (after 10% site fee)
  const siteFee = prizeAmount * 0.1
  const prizePool = prizeAmount - siteFee
  const firstPlace = prizePool * 0.6
  const secondPlace = prizePool * 0.25
  const thirdPlace = prizePool * 0.15

  const shareText = encodeURIComponent(
    `The ARC CRYPTO RACE prize pool is at $${prizeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC (FAUCET)! 💰\nRace with me and win big on @ARC Testnet! 🏎️🔥\n\n#ARC #DeFi #Web3 #ARCTestnet`,
  )

  return (
    <section className="py-20 px-4 bg-card">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-4 neon-glow" style={{ color: "var(--neon-pink)" }}>
          DAILY PRIZE POOL
        </h2>

        <p className="text-center text-sm font-mono mb-12" style={{ color: "var(--neon-blue)" }}>
          ENTRY FEE: 5 USDC (FAUCET) (ARC TESTNET)
        </p>

        <div
          className="p-8 md:p-12 pixel-border text-center mb-12"
          style={{
            borderColor: "var(--racing-yellow)",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="text-sm md:text-base mb-4 font-mono" style={{ color: "var(--neon-blue)" }}>
            CURRENT POOL
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--racing-yellow)" }} />
              <span className="ml-3 text-lg font-mono" style={{ color: "var(--neon-blue)" }}>
                Loading prize pool...
              </span>
            </div>
          ) : error ? (
            <div className="py-12">
              <div className="text-2xl font-bold mb-2" style={{ color: "var(--ferrari-red)" }}>
                Error Loading Pool
              </div>
              <div className="text-sm font-mono text-muted-foreground mb-4">{error}</div>
              <Button
                onClick={fetchPrizePool}
                variant="outline"
                size="sm"
                className="pixel-border"
                style={{ borderColor: "var(--neon-blue)", color: "var(--neon-blue)" }}
              >
                Retry
              </Button>
            </div>
          ) : prizeAmount === 0 ? (
            <div className="py-12">
              <div className="text-4xl md:text-5xl font-bold mb-4 neon-glow" style={{ color: "var(--racing-yellow)" }}>
                $0
              </div>
              <div className="text-xs md:text-sm font-mono text-muted-foreground mb-4">USDC (TESTNET)</div>
              <div className="text-base md:text-lg font-mono" style={{ color: "var(--neon-blue)" }}>
                No entries yet today
              </div>
              <div className="text-sm font-mono text-muted-foreground mt-2">
                Be the first to enter and start the prize pool!
              </div>
            </div>
          ) : (
            <>
              <div className="text-5xl md:text-7xl font-bold mb-4 neon-glow" style={{ color: "var(--racing-yellow)" }}>
                ${prizeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs md:text-sm font-mono text-muted-foreground mb-8">USDC (TESTNET)</div>
            </>
          )}

          {!isLoading && !error && prizeAmount > 0 && (
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="pixel-border p-6" style={{ borderColor: "var(--racing-yellow)" }}>
                <Trophy className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--racing-yellow)" }} />
                <div className="text-2xl font-bold mb-2" style={{ color: "var(--racing-yellow)" }}>
                  1ST PLACE
                </div>
                <div className="text-xl font-bold mb-1">
                  ${firstPlace.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-sm font-mono" style={{ color: "var(--neon-blue)" }}>
                  60% OF POOL
                </div>
              </div>

              <div className="pixel-border p-6" style={{ borderColor: "var(--neon-blue)" }}>
                <Trophy className="w-7 h-7 mx-auto mb-3" style={{ color: "var(--neon-blue)" }} />
                <div className="text-xl font-bold mb-2" style={{ color: "var(--neon-blue)" }}>
                  2ND PLACE
                </div>
                <div className="text-lg font-bold mb-1">
                  ${secondPlace.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-sm font-mono" style={{ color: "var(--neon-pink)" }}>
                  25% OF POOL
                </div>
              </div>

              <div className="pixel-border p-6" style={{ borderColor: "var(--neon-purple)" }}>
                <Trophy className="w-6 h-6 mx-auto mb-3" style={{ color: "var(--neon-purple)" }} />
                <div className="text-lg font-bold mb-2" style={{ color: "var(--neon-purple)" }}>
                  3RD PLACE
                </div>
                <div className="text-base font-bold mb-1">
                  ${thirdPlace.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-sm font-mono" style={{ color: "var(--ferrari-red)" }}>
                  15% OF POOL
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="text-center">
            <p className="text-sm font-mono mb-4" style={{ color: "var(--racing-yellow)" }}>
              NEED TEST USDC? GET IT HERE
            </p>
            <Button
              size="lg"
              variant="outline"
              className="pixel-border text-sm px-8 py-6 font-bold hover:scale-105 transition-transform bg-transparent"
              style={{
                borderColor: "var(--neon-blue)",
                color: "var(--neon-blue)",
              }}
              asChild
            >
              <a href="https://easyfaucetarc.xyz/" target="_blank" rel="noopener noreferrer">
                https://easyfaucetarc.xyz/ <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm font-mono mb-4" style={{ color: "var(--neon-pink)" }}>
              SPREAD THE WORD
            </p>
            <Button
              size="lg"
              variant="outline"
              className="pixel-border text-sm px-8 py-6 font-bold hover:scale-105 transition-transform bg-transparent"
              style={{
                borderColor: "var(--neon-pink)",
                color: "var(--neon-pink)",
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
              SHARE THE PRIZE POOL
            </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
