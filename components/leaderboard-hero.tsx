export function LeaderboardHero() {
  return (
    <section className="relative overflow-hidden border-b-4 border-primary bg-gradient-to-b from-background to-black py-12">
      {/* Neon grid background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
            linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
          `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto max-w-6xl px-4 text-center">
        <h1 className="mb-4 font-mono text-4xl font-bold uppercase tracking-wider text-primary drop-shadow-[0_0_20px_hsl(var(--primary))] md:text-6xl">
          Daily Leaderboard
        </h1>
        <p className="mb-2 font-mono text-sm tracking-wide text-accent md:text-base">
          Top racers of ARC CRYPTO RACE (ARC Testnet)
        </p>
        <p className="font-mono text-xs text-muted-foreground">Only your best score of the day counts.</p>
      </div>
    </section>
  )
}
