"use client";

import { formatTime } from '@/lib/scoring';
import { Gamepad2, Gauge, MapPin, Timer, Zap } from 'lucide-react';

interface HUDScoreProps {
  score: number;
  time: number;
  timeRemaining: number;
  speed: number;
  distance: number;
  isDemoMode?: boolean;
}

export function HUDScore({ score, time, timeRemaining, speed, distance, isDemoMode = false }: HUDScoreProps) {
  const speedPercentage = Math.min(speed / 200 * 100, 100);
  const isLowTime = timeRemaining < 60;
  const isCriticalTime = timeRemaining < 30;

  return (
    <>
      {/* Left Panel - Stats */}
      <div className="absolute top-4 left-4 z-50 pointer-events-none">
        {/* Demo Mode Badge */}
        {isDemoMode && (
          <div
            className="flex items-center gap-2 px-4 py-2 mb-3"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.9) 100%)',
              border: '2px solid var(--neon-blue)',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.4), inset 0 0 10px rgba(255,255,255,0.1)',
            }}
          >
            <Gamepad2 className="h-4 w-4 text-white animate-pulse" />
            <span className="font-arcade text-xs text-white tracking-wider">DEMO MODE</span>
          </div>
        )}

        {/* Score Display - Most prominent */}
        <div
          className="relative p-4 mb-3"
          style={{
            background: isDemoMode
              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(0,0,0,0.8) 100%)'
              : 'linear-gradient(135deg, rgba(255, 200, 50, 0.2) 0%, rgba(0,0,0,0.8) 100%)',
            border: `2px solid ${isDemoMode ? 'var(--neon-blue)' : 'var(--racing-yellow)'}`,
            boxShadow: isDemoMode
              ? '0 0 30px rgba(59, 130, 246, 0.3)'
              : '0 0 30px rgba(255, 200, 50, 0.3)',
          }}
        >
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2" style={{ borderColor: isDemoMode ? 'var(--neon-blue)' : 'var(--racing-yellow)' }} />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2" style={{ borderColor: isDemoMode ? 'var(--neon-blue)' : 'var(--racing-yellow)' }} />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2" style={{ borderColor: isDemoMode ? 'var(--neon-blue)' : 'var(--racing-yellow)' }} />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2" style={{ borderColor: isDemoMode ? 'var(--neon-blue)' : 'var(--racing-yellow)' }} />

          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4" style={{ color: isDemoMode ? 'var(--neon-blue)' : 'var(--racing-yellow)' }} />
            <span
              className="font-mono text-xs tracking-widest uppercase"
              style={{ color: isDemoMode ? 'var(--neon-blue)' : 'var(--racing-yellow)' }}
            >
              {isDemoMode ? 'Practice Score' : 'Score'}
            </span>
          </div>
          <div
            className="font-arcade text-3xl md:text-4xl neon-glow"
            style={{ color: isDemoMode ? 'var(--neon-cyan)' : 'var(--racing-yellow)' }}
          >
            {score.toLocaleString()}
          </div>
        </div>

        {/* Speed Gauge */}
        <div
          className="relative p-3 mb-3"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(0,0,0,0.8) 100%)',
            border: '2px solid var(--neon-cyan)',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="w-4 h-4" style={{ color: 'var(--neon-cyan)' }} />
            <span className="font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--neon-cyan)' }}>
              Speed
            </span>
          </div>

          {/* Speed value */}
          <div className="flex items-baseline gap-1 mb-2">
            <span className="font-arcade text-2xl text-white">
              {Math.round(speed)}
            </span>
            <span className="font-mono text-xs text-muted-foreground">MPH</span>
          </div>

          {/* Speed bar */}
          <div className="relative h-2 bg-black/50 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 transition-all duration-150"
              style={{
                width: `${speedPercentage}%`,
                background: speedPercentage > 80
                  ? 'linear-gradient(90deg, var(--neon-cyan), var(--ferrari-red))'
                  : speedPercentage > 50
                  ? 'linear-gradient(90deg, var(--neon-cyan), var(--racing-yellow))'
                  : 'var(--neon-cyan)',
                boxShadow: `0 0 10px ${speedPercentage > 80 ? 'var(--ferrari-red)' : 'var(--neon-cyan)'}`,
              }}
            />
          </div>
        </div>

        {/* Distance */}
        <div
          className="relative p-3"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 100, 0.1) 0%, rgba(0,0,0,0.8) 100%)',
            border: '2px solid var(--neon-green)',
            boxShadow: '0 0 20px rgba(0, 255, 100, 0.2)',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4" style={{ color: 'var(--neon-green)' }} />
            <span className="font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--neon-green)' }}>
              Distance
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-arcade text-xl text-white">
              {Math.round(distance).toLocaleString()}
            </span>
            <span className="font-mono text-xs text-muted-foreground">M</span>
          </div>
        </div>
      </div>

      {/* Top Center - Time Display */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div
          className={`relative p-4 ${isCriticalTime ? 'animate-pulse' : ''}`}
          style={{
            background: isCriticalTime
              ? 'linear-gradient(135deg, rgba(255, 50, 50, 0.3) 0%, rgba(0,0,0,0.9) 100%)'
              : isLowTime
              ? 'linear-gradient(135deg, rgba(255, 200, 50, 0.2) 0%, rgba(0,0,0,0.9) 100%)'
              : 'linear-gradient(135deg, rgba(255, 50, 100, 0.1) 0%, rgba(0,0,0,0.9) 100%)',
            border: `3px solid ${isCriticalTime ? 'var(--ferrari-red)' : isLowTime ? 'var(--racing-yellow)' : 'var(--neon-pink)'}`,
            boxShadow: isCriticalTime
              ? '0 0 40px rgba(255, 50, 50, 0.5)'
              : '0 0 30px rgba(255, 50, 100, 0.3)',
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Timer
              className={`w-4 h-4 ${isCriticalTime ? 'animate-bounce' : ''}`}
              style={{ color: isCriticalTime ? 'var(--ferrari-red)' : isLowTime ? 'var(--racing-yellow)' : 'var(--neon-pink)' }}
            />
            <span
              className="font-mono text-xs tracking-widest uppercase"
              style={{ color: isCriticalTime ? 'var(--ferrari-red)' : isLowTime ? 'var(--racing-yellow)' : 'var(--neon-pink)' }}
            >
              Time Left
            </span>
          </div>
          <div
            className={`font-arcade text-4xl md:text-5xl text-center ${isCriticalTime ? 'glitch' : 'neon-glow'}`}
            style={{
              color: isCriticalTime ? 'var(--ferrari-red)' : isLowTime ? 'var(--racing-yellow)' : 'white',
            }}
          >
            {formatTime(timeRemaining)}
          </div>
        </div>
      </div>

      {/* Scanline overlay for CRT effect */}
      <div className="absolute inset-0 pointer-events-none z-[100] scanlines opacity-30" />
    </>
  );
}
