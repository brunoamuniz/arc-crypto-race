"use client"

import { Trophy, Medal, Award, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { getCurrentDayId } from "@/lib/dayId"

interface LeaderboardEntry {
  wallet: string
  best_score: number
  updated_at: string
}

interface LeaderboardData {
  dayId: number
  leaderboard: LeaderboardEntry[]
  checkpoints: Array<{ tx_hash: string; created_at: string }>
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="h-6 w-6 text-primary drop-shadow-[0_0_10px_hsl(var(--primary))]" />
    case 2:
      return <Medal className="h-6 w-6 text-accent drop-shadow-[0_0_10px_hsl(var(--accent))]" />
    case 3:
      return <Award className="h-6 w-6 text-secondary drop-shadow-[0_0_10px_hsl(var(--secondary))]" />
    default:
      return <span className="font-mono text-lg font-bold text-muted-foreground">#{rank}</span>
  }
}

function getRankBorder(rank: number) {
  switch (rank) {
    case 1:
      return "border-primary shadow-[0_0_20px_hsl(var(--primary)/0.5)]"
    case 2:
      return "border-accent shadow-[0_0_15px_hsl(var(--accent)/0.4)]"
    case 3:
      return "border-secondary shadow-[0_0_15px_hsl(var(--secondary)/0.4)]"
    default:
      return "border-muted hover:border-accent/50"
  }
}

function formatWallet(wallet: string): string {
  if (!wallet) return "N/A"
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
}

function formatTimeAgo(dateString: string, isMounted: boolean): string {
  // Return a placeholder during SSR to prevent hydration mismatch
  if (!isMounted) {
    return "--"
  }
  
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

  // Set mounted flag to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

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

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-none border-4 border-dashed border-muted bg-black/30 p-12 text-center">
            <Loader2 className="mb-4 h-16 w-16 animate-spin text-primary" />
            <h3 className="mb-2 font-mono text-2xl font-bold text-foreground">Loading Leaderboard...</h3>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-none border-4 border-dashed border-red-500/50 bg-black/30 p-12 text-center">
            <h3 className="mb-2 font-mono text-2xl font-bold text-red-400">Error Loading Leaderboard</h3>
            <p className="font-mono text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12">
      <div className="container mx-auto max-w-6xl px-4">
        {isEmpty ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-none border-4 border-dashed border-muted bg-black/30 p-12 text-center">
            <Trophy className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 font-mono text-2xl font-bold text-foreground">No Racers Yet</h3>
            <p className="mb-6 font-mono text-sm text-muted-foreground">Be the first to race and claim the top spot!</p>
            <a
              href="/"
              className="rounded-none border-4 border-primary bg-primary/20 px-6 py-3 font-mono font-bold uppercase tracking-wider text-primary transition-all hover:bg-primary hover:text-black hover:shadow-[0_0_30px_hsl(var(--primary))]"
            >
              Start Racing
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="w-full border-4 border-accent bg-black/80">
                <thead>
                  <tr className="border-b-4 border-accent bg-accent/20">
                    <th className="border-r-2 border-accent/50 p-4 text-left font-mono text-sm font-bold uppercase tracking-wider text-accent">
                      Rank
                    </th>
                    <th className="border-r-2 border-accent/50 p-4 text-left font-mono text-sm font-bold uppercase tracking-wider text-accent">
                      Wallet
                    </th>
                    <th className="border-r-2 border-accent/50 p-4 text-left font-mono text-sm font-bold uppercase tracking-wider text-accent">
                      Score
                    </th>
                    <th className="border-r-2 border-accent/50 p-4 text-left font-mono text-sm font-bold uppercase tracking-wider text-accent">
                      Best Time
                    </th>
                    <th className="p-4 text-left font-mono text-sm font-bold uppercase tracking-wider text-accent">
                      Last Race
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => {
                    const rank = index + 1
                    return (
                      <tr
                        key={entry.wallet}
                        className={`border-b-2 border-accent/30 transition-all hover:bg-accent/10 ${
                          rank <= 3 ? "bg-accent/5" : ""
                        }`}
                      >
                        <td className="border-r-2 border-accent/30 p-4">
                          <div className="flex items-center gap-2">{getRankIcon(rank)}</div>
                        </td>
                        <td className="border-r-2 border-accent/30 p-4 font-mono text-sm text-foreground">
                          {formatWallet(entry.wallet)}
                        </td>
                        <td className="border-r-2 border-accent/30 p-4">
                          <span className="font-mono text-lg font-bold text-primary drop-shadow-[0_0_10px_hsl(var(--primary)/0.5)]">
                            {entry.best_score.toLocaleString()}
                          </span>
                        </td>
                        <td className="border-r-2 border-accent/30 p-4 font-mono text-sm text-secondary">
                          {formatTimeAgo(entry.updated_at, isMounted)}
                        </td>
                        <td className="p-4 font-mono text-xs text-muted-foreground">
                          {formatTimeAgo(entry.updated_at, isMounted)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-4 md:hidden">
              {leaderboard.map((entry, index) => {
                const rank = index + 1
                return (
                  <div key={entry.wallet} className={`rounded-none border-4 ${getRankBorder(rank)} bg-black/80 p-4`}>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">{getRankIcon(rank)}</div>
                      <span className="font-mono text-2xl font-bold text-primary drop-shadow-[0_0_10px_hsl(var(--primary)/0.5)]">
                        {entry.best_score.toLocaleString()}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-mono text-muted-foreground">Wallet:</span>
                        <span className="font-mono text-foreground">{formatWallet(entry.wallet)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-mono text-muted-foreground">Last Race:</span>
                        <span className="font-mono text-muted-foreground">{formatTimeAgo(entry.updated_at, isMounted)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
