"use client";

import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw, Home, List, Twitter } from 'lucide-react';
import Link from 'next/link';
import { formatTime, calculateScore } from '@/lib/scoring';
import type { GameStats } from '@/lib/types';

interface EndGameOverlayProps {
  stats: GameStats;
  onPlayAgain: () => void;
}

export function EndGameOverlay({ stats, onPlayAgain }: EndGameOverlayProps) {
  const finalScore = calculateScore(stats);

  const handleShareOnTwitter = () => {
    const scoreText = finalScore.toLocaleString();
    const distanceText = Math.round(stats.distance).toString();
    const speedText = Math.round(stats.maxSpeed).toString();
    
    const shareText = 
      'Just finished a race on ARC CRYPTO RACE! 🏎️💨\n\n' +
      'Final Score: ' + scoreText + '\n' +
      'Distance: ' + distanceText + 'm | Max Speed: ' + speedText + 'mph\n\n' +
      '#ARC #DeFi #Web3 #ARCTestnet';
    
    const shareUrl = encodeURIComponent('https://arccryptorace.xyz');
    const text = encodeURIComponent(shareText);
    const twitterUrl = 'https://twitter.com/intent/tweet?text=' + text + '&url=' + shareUrl;
    
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

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

          {/* Action Buttons - Aligned with stats grid */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Button
              onClick={handleShareOnTwitter}
              size="default"
              className="bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-bold font-mono text-sm"
            >
              <Twitter className="mr-2 h-4 w-4" />
              Share on X
            </Button>
            <Button
              onClick={onPlayAgain}
              size="default"
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold font-mono text-sm"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Play Again
            </Button>
            <Link href="/" className="w-full">
              <Button
                size="default"
                variant="outline"
                className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 font-bold font-mono text-sm"
              >
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link href="/leaderboard" className="w-full">
              <Button
                size="default"
                variant="outline"
                className="w-full border-purple-400 text-purple-400 hover:bg-purple-400/10 font-bold font-mono text-sm"
              >
                <List className="mr-2 h-4 w-4" />
                Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
