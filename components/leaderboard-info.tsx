import { Trophy, Coins, LinkIcon, Zap } from "lucide-react"

export function LeaderboardInfo() {
  return (
    <section className="border-b-2 border-accent/30 bg-black/50 py-6">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* Badge 1: Network */}
          <div className="group flex items-center gap-2 rounded-none border-4 border-accent bg-background p-3 transition-all hover:border-primary hover:shadow-[0_0_20px_hsl(var(--primary))]">
            <Zap className="h-5 w-5 text-accent" />
            <div>
              <div className="font-mono text-xs text-muted-foreground">Network</div>
              <div className="font-mono text-sm font-bold text-foreground">ARC Testnet</div>
            </div>
          </div>

          {/* Badge 2: Entry Fee */}
          <div className="group flex items-center gap-2 rounded-none border-4 border-accent bg-background p-3 transition-all hover:border-primary hover:shadow-[0_0_20px_hsl(var(--primary))]">
            <Coins className="h-5 w-5 text-accent" />
            <div>
              <div className="font-mono text-xs text-muted-foreground">Entry Fee</div>
              <div className="font-mono text-sm font-bold text-foreground">5 USDC</div>
            </div>
          </div>

          {/* Badge 3: Prize Split */}
          <div className="group flex items-center gap-2 rounded-none border-4 border-accent bg-background p-3 transition-all hover:border-primary hover:shadow-[0_0_20px_hsl(var(--primary))]">
            <Trophy className="h-5 w-5 text-accent" />
            <div>
              <div className="font-mono text-xs text-muted-foreground">Prize Split</div>
              <div className="font-mono text-sm font-bold text-foreground">60/25/15%</div>
            </div>
          </div>

          {/* Badge 4: Faucet Link */}
          <a
            href="https://easyfaucetarc.xyz/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-none border-4 border-secondary bg-secondary/20 p-3 transition-all hover:border-secondary hover:bg-secondary/40 hover:shadow-[0_0_20px_hsl(var(--secondary))]"
          >
            <LinkIcon className="h-5 w-5 text-secondary" />
            <div>
              <div className="font-mono text-xs text-muted-foreground">Need Testnet?</div>
              <div className="font-mono text-sm font-bold text-secondary">Get USDC</div>
            </div>
          </a>
        </div>
      </div>
    </section>
  )
}
