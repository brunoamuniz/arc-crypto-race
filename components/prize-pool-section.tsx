"use client"

import { useState, useEffect, useRef } from "react"
import { Trophy, ExternalLink, Twitter, Loader2, Sparkles, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getDayInfo } from "@/lib/contract"
import { getCurrentDayId } from "@/lib/dayId"

// Animated counter hook
function useAnimatedCounter(target: number, duration: number = 1500) {
  const [count, setCount] = useState(0)
  const prevTarget = useRef(target)

  useEffect(() => {
    if (target === prevTarget.current && count !== 0) return
    prevTarget.current = target

    const startTime = Date.now()
    const startValue = count

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentValue = startValue + (target - startValue) * easeOut

      setCount(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [target, duration])

  return count
}

export function PrizePoolSection() {
  const [prizeAmount, setPrizeAmount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  const animatedPrize = useAnimatedCounter(prizeAmount, 2000)

  // Intersection observer for scroll animations
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

  const fetchPrizePool = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const dayId = getCurrentDayId()
      const dayInfo = await getDayInfo(dayId)

      if (dayInfo) {
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
    fetchPrizePool()
    setShareUrl(encodeURIComponent("https://arccryptorace.xyz"))

    const refreshInterval = setInterval(() => {
      fetchPrizePool()
    }, 30000)

    return () => clearInterval(refreshInterval)
  }, [])

  // Calculate prize splits (after 10% site fee)
  const siteFee = prizeAmount * 0.1
  const prizePool = prizeAmount - siteFee
  const firstPlace = prizePool * 0.6
  const secondPlace = prizePool * 0.25
  const thirdPlace = prizePool * 0.15

  const shareText = encodeURIComponent(
    `The ARC CRYPTO RACE prize pool is at $${prizeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC (FAUCET)! \nRace with me and win big on @ARC Testnet!\n\n#ARC #DeFi #Web3 #ARCTestnet`,
  )

  const podiumData = [
    {
      place: 2,
      label: "2ND",
      amount: secondPlace,
      percentage: "25%",
      color: "var(--neon-blue)",
      height: "h-32",
      icon: "trophy-silver",
      delay: "delay-200",
    },
    {
      place: 1,
      label: "1ST",
      amount: firstPlace,
      percentage: "60%",
      color: "var(--racing-yellow)",
      height: "h-44",
      icon: "trophy-gold",
      delay: "delay-100",
    },
    {
      place: 3,
      label: "3RD",
      amount: thirdPlace,
      percentage: "15%",
      color: "var(--neon-purple)",
      height: "h-24",
      icon: "trophy-bronze",
      delay: "delay-300",
    },
  ]

  return (
    <section
      ref={sectionRef}
      className="relative py-24 px-4 overflow-hidden"
      style={{ background: "linear-gradient(180deg, var(--card) 0%, var(--background) 100%)" }}
    >
      {/* Background effects */}
      <div className="absolute inset-0 retro-grid opacity-5" />
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{ background: "radial-gradient(circle, var(--racing-yellow) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-20"
        style={{ background: "radial-gradient(circle, var(--neon-pink) 0%, transparent 70%)" }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5" style={{ color: "var(--racing-yellow)" }} />
            <span className="text-sm font-mono tracking-widest uppercase" style={{ color: "var(--racing-yellow)" }}>
              Daily Tournament
            </span>
            <Sparkles className="w-5 h-5" style={{ color: "var(--racing-yellow)" }} />
          </div>
          <h2
            className="font-arcade text-2xl md:text-3xl lg:text-4xl neon-glow mb-4"
            style={{ color: "var(--neon-pink)" }}
          >
            PRIZE POOL
          </h2>
          <p className="text-sm md:text-base font-mono" style={{ color: "var(--neon-blue)" }}>
            ENTRY FEE: <span className="font-bold">5 USDC (FAUCET)</span> ON ARC TESTNET
          </p>
        </div>

        {/* Main Prize Display - Jackpot Style */}
        <div
          className={`relative mb-16 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div
            className="relative p-8 md:p-12 text-center card-premium"
            style={{
              backgroundColor: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2" style={{ borderColor: "var(--racing-yellow)" }} />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2" style={{ borderColor: "var(--racing-yellow)" }} />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2" style={{ borderColor: "var(--racing-yellow)" }} />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2" style={{ borderColor: "var(--racing-yellow)" }} />

            <div className="text-sm md:text-base mb-6 font-display tracking-widest uppercase" style={{ color: "var(--neon-cyan)" }}>
              <Coins className="w-5 h-5 inline-block mr-2 animate-bounce" />
              CURRENT JACKPOT
              <Coins className="w-5 h-5 inline-block ml-2 animate-bounce" style={{ animationDelay: "0.2s" }} />
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="relative">
                  <Loader2 className="w-12 h-12 animate-spin" style={{ color: "var(--racing-yellow)" }} />
                  <div className="absolute inset-0 w-12 h-12 animate-ping opacity-30 rounded-full" style={{ backgroundColor: "var(--racing-yellow)" }} />
                </div>
                <span className="ml-4 text-lg font-mono" style={{ color: "var(--neon-blue)" }}>
                  Loading...
                </span>
              </div>
            ) : error ? (
              <div className="py-12">
                <div className="text-2xl font-bold mb-4" style={{ color: "var(--ferrari-red)" }}>
                  Connection Error
                </div>
                <Button
                  onClick={fetchPrizePool}
                  variant="outline"
                  className="btn-legendary"
                  style={{ borderColor: "var(--neon-blue)", color: "var(--neon-blue)" }}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <>
                {/* Big Prize Number */}
                <div className="relative inline-block mb-2">
                  <span
                    className="font-arcade text-5xl sm:text-6xl md:text-7xl lg:text-8xl neon-glow"
                    style={{ color: "var(--racing-yellow)" }}
                  >
                    ${animatedPrize.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-xs md:text-sm font-mono text-muted-foreground mb-4">
                  USDC (FAUCET) ON ARC TESTNET
                </div>

                {prizeAmount === 0 && (
                  <div
                    className="inline-block px-4 py-2 mt-4 border border-dashed"
                    style={{ borderColor: "var(--neon-blue)", color: "var(--neon-blue)" }}
                  >
                    <span className="font-mono text-sm">Be the first to enter today!</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Podium Display */}
        {!isLoading && !error && prizeAmount > 0 && (
          <div
            className={`flex justify-center items-end gap-4 md:gap-8 mb-16 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            {podiumData.map((item) => (
              <div
                key={item.place}
                className={`flex flex-col items-center transition-all duration-500 ${item.delay} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              >
                {/* Trophy Icon */}
                <div className={`mb-4 ${item.icon}`}>
                  <Trophy
                    className={`w-8 h-8 md:w-10 md:h-10 ${item.place === 1 ? 'animate-bounce' : ''}`}
                    style={{
                      color: item.color,
                      filter: `drop-shadow(0 0 10px ${item.color})`,
                    }}
                  />
                </div>

                {/* Amount */}
                <div
                  className="text-lg md:text-2xl font-bold mb-2"
                  style={{ color: item.color }}
                >
                  ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>

                {/* Podium Block */}
                <div
                  className={`w-24 md:w-32 ${item.height} flex flex-col items-center justify-start pt-4 transition-all duration-300 hover:scale-105`}
                  style={{
                    backgroundColor: "rgba(0,0,0,0.6)",
                    border: `2px solid ${item.color}`,
                    boxShadow: `0 0 20px ${item.color}40, inset 0 0 20px ${item.color}20`,
                  }}
                >
                  <span
                    className="font-arcade text-lg md:text-2xl"
                    style={{ color: item.color }}
                  >
                    {item.label}
                  </span>
                  <span
                    className="text-xs font-mono mt-1"
                    style={{ color: item.color, opacity: 0.7 }}
                  >
                    {item.percentage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div
          className={`flex flex-col sm:flex-row gap-6 justify-center items-center transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="text-center">
            <p className="text-xs font-mono mb-3 tracking-wider" style={{ color: "var(--racing-yellow)" }}>
              NEED TEST USDC?
            </p>
            <Button
              size="lg"
              variant="outline"
              className="group px-8 py-6 font-bold tracking-wider bg-black/40 backdrop-blur-sm btn-legendary hover:bg-neon-blue/20"
              style={{
                borderColor: "var(--neon-blue)",
                color: "var(--neon-blue)",
              }}
              asChild
            >
              <a href="https://easyfaucetarc.xyz/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                GET FAUCET
                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs font-mono mb-3 tracking-wider" style={{ color: "var(--neon-pink)" }}>
              SPREAD THE WORD
            </p>
            <Button
              size="lg"
              variant="outline"
              className="group px-8 py-6 font-bold tracking-wider bg-black/40 backdrop-blur-sm btn-legendary hover:bg-neon-pink/20"
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
                className="flex items-center gap-2"
              >
                <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />
                SHARE
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
