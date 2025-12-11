import { LeaderboardHero } from "@/components/leaderboard-hero"
import { LeaderboardInfo } from "@/components/leaderboard-info"
import { LeaderboardTable } from "@/components/leaderboard-table"
import { LeaderboardFooter } from "@/components/leaderboard-footer"

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <LeaderboardHero />
      <LeaderboardInfo />
      <LeaderboardTable />
      <LeaderboardFooter />
    </main>
  )
}
