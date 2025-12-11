"use client";

import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw, Home, List } from 'lucide-react';
import Link from 'next/link';
import { formatTime, calculateScore } from '@/lib/scoring';
import type { GameStats } from '@/lib/types';

interface EndGameOverlayProps {
  stats: GameStats;
  onPlayAgain: () => void;
}

export function EndGameOverlay({ stats, onPlayAgain }: EndGameOverlayProps) {
  const finalScore = calculateScore(stats);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
      <div className="text-center space-y-6 p-8 border-4 border-yellow-400 bg-black/90 rounded-lg max-w-2xl">
        <Trophy className="h-20 w-20 text-yellow-400 mx-auto mb-4" />
        <h1 className="text-5xl font-bold text-yellow-400 neon-glow mb-2">
          RACE FINISHED!
        </h1>
        
        <div className="space-y-4 mt-8">
          <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 p-6 rounded border-2 border-yellow-400">
            <div className="text-yellow-400 text-sm font-mono mb-2">FINAL SCORE</div>
            <div className="text-6xl font-bold text-white">{finalScore.toLocaleString()}</div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-black/50 p-4 rounded border border-cyan-400/50">
              <div className="text-cyan-400 text-xs font-mono mb-1">TIME</div>
              <div className="text-white text-2xl font-bold">{formatTime(stats.elapsedTime)}</div>
            </div>
            <div className="bg-black/50 p-4 rounded border border-green-400/50">
              <div className="text-green-400 text-xs font-mono mb-1">DISTANCE</div>
              <div className="text-white text-2xl font-bold">{Math.round(stats.distance)} m</div>
            </div>
            <div className="bg-black/50 p-4 rounded border border-purple-400/50">
              <div className="text-purple-400 text-xs font-mono mb-1">MAX SPEED</div>
              <div className="text-white text-2xl font-bold">{Math.round(stats.maxSpeed)} mph</div>
            </div>
            <div className="bg-black/50 p-4 rounded border border-red-400/50">
              <div className="text-red-400 text-xs font-mono mb-1">CRASHES</div>
              <div className="text-white text-2xl font-bold">{stats.crashes || 0}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8 justify-center">
          <Button
            onClick={onPlayAgain}
            size="lg"
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Play Again
          </Button>
          <Link href="/">
            <Button
              size="lg"
              variant="outline"
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
            >
              <Home className="mr-2 h-5 w-5" />
              Home
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button
              size="lg"
              variant="outline"
              className="border-purple-400 text-purple-400 hover:bg-purple-400/10"
            >
              <List className="mr-2 h-5 w-5" />
              Leaderboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

