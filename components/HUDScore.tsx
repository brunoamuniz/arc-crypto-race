"use client";

import { formatTime } from '@/lib/scoring';

interface HUDScoreProps {
  score: number;
  time: number;
  timeRemaining: number;
  speed: number;
  distance: number;
}

export function HUDScore({ score, time, timeRemaining, speed, distance }: HUDScoreProps) {
  return (
    <div className="absolute top-4 left-4 z-50 pointer-events-none">
      {/* Left side - Score and Stats */}
      <div className="flex flex-col gap-2">
        <div className="bg-black/80 border-2 border-yellow-400 px-4 py-2 rounded font-mono">
          <div className="text-yellow-400 text-xs">SCORE</div>
          <div className="text-white text-2xl font-bold">{score.toLocaleString()}</div>
        </div>
        <div className="bg-black/80 border-2 border-cyan-400 px-4 py-2 rounded font-mono">
          <div className="text-cyan-400 text-xs">SPEED</div>
          <div className="text-white text-xl font-bold">{Math.round(speed)} mph</div>
        </div>
        <div className="bg-black/80 border-2 border-green-400 px-4 py-2 rounded font-mono">
          <div className="text-green-400 text-xs">DISTANCE</div>
          <div className="text-white text-xl font-bold">{Math.round(distance)} m</div>
        </div>
      </div>
    </div>
  );
}

