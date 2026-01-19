"use client"

import { Trophy, Medal, Award, Loader2, Crown, Flame } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { getCurrentDayId } from "@/lib/dayId"

interface LeaderboardEntry {
  wallet: string
  best_score: number
  updated_at: string
  username: string | null
}

interface LeaderboardData {
  dayId: number
  leaderboard: LeaderboardEntry[]
  checkpoints: Array<{ tx_hash: string; created_at: string }>
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return (
        <div className="relative">
          <Crown className="h-8 w-8 trophy-gold animate-bounce" />
          <div className="absolute inset-0 animate-ping opacity-30">
            <Crown className="h-8 w-8 trophy-gold" />
          </div>
        </div>
      )
    case 2:
      return <Medal className="h-7 w-7 trophy-silver" />
    case 3:
      return <Award className="h-6 w-6 trophy-bronze" />
    default:
      return (
        <span
          className="font-arcade text-lg"
          style={{ color: rank <= 10 ? 'var(--neon-cyan)' : 'var(--muted-foreground)' }}
        >
          #{rank}
        </span>
      )
  }
}

function getRankStyle(rank: number) {
  switch (rank) {
    case 1:
      return {
        border: '3px solid #ffd700',
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(0,0,0,0.8) 100%)',
        boxShadow: '0 0 30px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(255, 215, 0, 0.1)',
      }
    case 2:
      return {
        border: '3px solid #c0c0c0',
        background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.15) 0%, rgba(0,0,0,0.8) 100%)',
        boxShadow: '0 0 25px rgba(192, 192, 192, 0.3), inset 0 0 15px rgba(192, 192, 192, 0.1)',
      }
    case 3:
      return {
        border: '3px solid #cd7f32',
        background: 'linear-gradient(135deg, rgba(205, 127, 50, 0.15) 0%, rgba(0,0,0,0.8) 100%)',
        boxShadow: '0 0 20px rgba(205, 127, 50, 0.3), inset 0 0 15px rgba(205, 127, 50, 0.1)',
      }
    default:
      return {
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(0,0,0,0.6)',
        boxShadow: 'none',
      }
  }
}

function formatWallet(wallet: string): string {
  if (!wallet) return "N/A"
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
}

function formatTimeAgo(dateString: string, isMounted: boolean): string {
  if (!isMounted) return "--"

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

export function LeaderboardTable() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Don't set up observer while loading
    if (isLoading) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [isLoading])

  useEffect(() => {
    async function fetchLeaderboard() {
      setIsLoading(true)
      setError(null)

      try {
        const dayId = getCurrentDayId()
        const response = await fetch(`/api/leaderboard?dayId=${dayId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard')
        }

        const data: LeaderboardData = await response.json()
        setLeaderboardData(data)
      } catch (err: any) {
        console.error('Error fetching leaderboard:', err)
        setError(err.message || 'Failed to load leaderboard')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const leaderboard = leaderboardData?.leaderboard || []
  const isEmpty = !isLoading && leaderboard.length === 0
  const topThree = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div
            className="flex min-h-[400px] flex-col items-center justify-center p-12 text-center"
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: '2px solid var(--neon-purple)',
            }}
          >
            <div className="relative mb-6">
              <Loader2 className="h-16 w-16 animate-spin" style={{ color: 'var(--neon-pink)' }} />
              <div className="absolute inset-0 animate-ping opacity-30">
                <div className="h-16 w-16 rounded-full" style={{ backgroundColor: 'var(--neon-pink)' }} />
              </div>
            </div>
            <h3 className="font-arcade text-xl mb-2" style={{ color: 'var(--neon-pink)' }}>
              LOADING RANKINGS
            </h3>
            <p className="font-mono text-sm text-muted-foreground">Fetching today's leaderboard...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div
            className="flex min-h-[400px] flex-col items-center justify-center p-12 text-center"
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: '2px solid var(--ferrari-red)',
            }}
          >
            <h3 className="font-arcade text-xl mb-2" style={{ color: 'var(--ferrari-red)' }}>
              CONNECTION ERROR
            </h3>
            <p className="font-mono text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className="py-12">
      <div className="container mx-auto max-w-6xl px-4">
        {isEmpty ? (
          <div
            className={`flex min-h-[400px] flex-col items-center justify-center p-12 text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: '2px dashed var(--neon-purple)',
            }}
          >
            <Trophy className="mb-6 h-20 w-20 text-muted-foreground float" />
            <h3 className="font-arcade text-2xl mb-4" style={{ color: 'var(--neon-pink)' }}>
              NO RACERS YET
            </h3>
            <p className="font-mono text-sm text-muted-foreground mb-8">
              Be the first to race and claim the top spot!
            </p>
            <a
              href="/game"
              className="px-8 py-4 font-bold tracking-wider transition-all duration-300 hover:scale-105 btn-legendary"
              style={{
                backgroundColor: 'var(--ferrari-red)',
                color: 'white',
                boxShadow: '0 0 30px rgba(255,50,50,0.4)',
              }}
            >
              START RACING
            </a>
          </div>
        ) : (
          <>
            {/* Top 3 Podium Display */}
            {topThree.length > 0 && (
              <div
                className={`mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              >
                <div className="flex justify-center items-end gap-4 md:gap-6">
                  {/* Reorder for podium: 2nd, 1st, 3rd */}
                  {[topThree[1], topThree[0], topThree[2]].map((entry, i) => {
                    if (!entry) return null
                    const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3
                    const heights = ['h-32', 'h-44', 'h-24']
                    const delays = ['delay-200', 'delay-100', 'delay-300']

                    return (
                      <div
                        key={entry.wallet}
                        className={`flex flex-col items-center transition-all duration-700 ${delays[i]} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                      >
                        {/* Trophy Icon */}
                        <div className="mb-3">
                          {getRankIcon(actualRank)}
                        </div>

                        {/* Player Info */}
                        <div className="text-center mb-3">
                          {entry.username ? (
                            <div
                              className="font-display text-sm md:text-base font-bold mb-1"
                              style={{ color: actualRank === 1 ? '#ffd700' : actualRank === 2 ? '#c0c0c0' : '#cd7f32' }}
                            >
                              {entry.username}
                            </div>
                          ) : (
                            <div className="font-mono text-xs text-muted-foreground mb-1">
                              {formatWallet(entry.wallet)}
                            </div>
                          )}
                          <div
                            className="font-arcade text-lg md:text-2xl neon-glow"
                            style={{ color: actualRank === 1 ? '#ffd700' : actualRank === 2 ? '#c0c0c0' : '#cd7f32' }}
                          >
                            {entry.best_score.toLocaleString()}
                          </div>
                        </div>

                        {/* Podium Block */}
                        <div
                          className={`w-24 md:w-32 ${heights[i]} flex items-center justify-center transition-all duration-300 hover:scale-105`}
                          style={getRankStyle(actualRank)}
                        >
                          <span
                            className="font-arcade text-2xl md:text-3xl"
                            style={{ color: actualRank === 1 ? '#ffd700' : actualRank === 2 ? '#c0c0c0' : '#cd7f32' }}
                          >
                            {actualRank}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Rest of Leaderboard */}
            {rest.length > 0 && (
              <div
                className={`space-y-3 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              >
                {rest.map((entry, index) => {
                  const rank = index + 4
                  const isTopTen = rank <= 10

                  return (
                    <div
                      key={entry.wallet}
                      className="group flex items-center gap-4 p-4 transition-all duration-300 hover:scale-[1.02]"
                      style={{
                        background: isTopTen
                          ? 'linear-gradient(135deg, rgba(100, 50, 255, 0.1) 0%, rgba(0,0,0,0.7) 100%)'
                          : 'rgba(0,0,0,0.5)',
                        border: `1px solid ${isTopTen ? 'var(--neon-purple)' : 'rgba(255,255,255,0.1)'}`,
                        boxShadow: isTopTen ? '0 0 15px rgba(100, 50, 255, 0.2)' : 'none',
                      }}
                    >
                      {/* Rank */}
                      <div className="w-12 flex justify-center">
                        {getRankIcon(rank)}
                      </div>

                      {/* Player Info */}
                      <div className="flex-1 min-w-0">
                        {entry.username ? (
                          <div className="flex flex-col">
                            <span
                              className="font-display font-bold truncate"
                              style={{ color: isTopTen ? 'var(--neon-cyan)' : 'var(--foreground)' }}
                            >
                              {entry.username}
                            </span>
                            <span className="font-mono text-xs text-muted-foreground">
                              {formatWallet(entry.wallet)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-mono text-sm">
                            {formatWallet(entry.wallet)}
                          </span>
                        )}
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <div
                          className="font-arcade text-xl"
                          style={{ color: isTopTen ? 'var(--racing-yellow)' : 'var(--foreground)' }}
                        >
                          {entry.best_score.toLocaleString()}
                        </div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {formatTimeAgo(entry.updated_at, isMounted)}
                        </div>
                      </div>

                      {/* Hot streak indicator for top 10 */}
                      {isTopTen && (
                        <Flame
                          className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: 'var(--electric-orange)' }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
