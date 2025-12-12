"use client";

import { formatTime } from '@/lib/scoring';
import { Gamepad2 } from 'lucide-react';

interface HUDScoreProps {
  score: number;
  time: number;
  timeRemaining: number;
  speed: number;
  distance: number;
  isDemoMode?: boolean;
}

export function HUDScore({ score, time, timeRemaining, speed, distance, isDemoMode = false }: HUDScoreProps) {
  return (
    <div className="absolute top-4 left-4 z-50 pointer-events-none">
      {/* Demo Mode Badge */}
      {isDemoMode && (
        <div className="bg-blue-500/90 border-2 border-blue-400 px-3 py-1.5 rounded font-mono mb-2 flex items-center gap-2">
          <Gamepad2 className="h-4 w-4 text-blue-200" />
          <span className="text-blue-200 text-xs font-bold">DEMO MODE</span>
        </div>
      )}
      
      {/* Left side - Score and Stats */}
      <div className="flex flex-col gap-2">
        <div className={`bg-black/80 border-2 px-4 py-2 rounded font-mono ${
          isDemoMode ? 'border-blue-400' : 'border-yellow-400'
        }`}>
          <div className={`text-xs ${isDemoMode ? 'text-blue-400' : 'text-yellow-400'}`}>
            {isDemoMode ? 'PRACTICE SCORE' : 'SCORE'}
          </div>
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

