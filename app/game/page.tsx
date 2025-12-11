"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { GameCanvas } from '@/components/GameCanvas';
import { HUDScore } from '@/components/HUDScore';
import { PreGameOverlay } from '@/components/PreGameOverlay';
import { EndGameOverlay } from '@/components/EndGameOverlay';
import { Button } from '@/components/ui/button';
import { Home, Square, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';
import type { GameStats, GameState } from '@/lib/types';
import { calculateScore, formatTimeRemaining, formatTime } from '@/lib/scoring';
import { getCurrentDayId } from '@/lib/dayId';
import { hasEntered } from '@/lib/contract';
import { EnterTournamentButton } from '@/components/EnterTournamentButton';

const GAME_TIME_LIMIT = 300; // 5 minutes in seconds

export default function GamePage() {
  const { isConnected, address } = useAccount();
  const [gameState, setGameState] = useState<GameState>({
    isRunning: false,
    isPaused: false,
    isFinished: false,
    startTime: null,
    endTime: null,
  });
  const [stats, setStats] = useState<GameStats>({
    distance: 0,
    maxSpeed: 0,
    elapsedTime: 0,
    crashes: 0,
    currentSpeed: 0,
    position: 0,
  });
  const [timeRemaining, setTimeRemaining] = useState(GAME_TIME_LIMIT);
  const gameInstanceRef = useRef<any>(null);
  const [hasEnteredTournament, setHasEnteredTournament] = useState<boolean | null>(null);
  const [isCheckingEntry, setIsCheckingEntry] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  // Initialize as null to prevent hydration mismatch, will be set after mount
  const [isMusicMuted, setIsMusicMuted] = useState<boolean | null>(null);

  // Define handleGameEnd with useCallback to avoid stale closures
  const handleGameEnd = useCallback(async () => {
    setGameState(prev => ({
      ...prev,
      isRunning: false,
      isFinished: true,
      endTime: Date.now(),
    }));

    // Submit score to backend
    if (isConnected && address) {
      const finalScore = calculateScore(stats);
      const dayId = getCurrentDayId();
      
      try {
        const response = await fetch('/api/submit-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet: address,
            dayId: dayId,
            score: finalScore,
          }),
        });

        const data = await response.json();
        if (data.ok) {
          console.log('✅ Score submitted successfully!', data);
        } else {
          console.error('❌ Error submitting score:', data.error);
        }
      } catch (error) {
        console.error('❌ Error submitting score:', error);
      }
    }
  }, [isConnected, address, stats]);

  // Timer countdown
  useEffect(() => {
    if (!gameState.isRunning || gameState.isFinished) return;

    const interval = setInterval(() => {
      if (gameState.startTime) {
        const elapsed = (Date.now() - gameState.startTime) / 1000;
        const remaining = Math.max(0, GAME_TIME_LIMIT - elapsed);
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          handleGameEnd();
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameState.isRunning, gameState.startTime, gameState.isFinished, handleGameEnd]);

  // Set mounted flag to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    // Load music mute state from localStorage only on client
    if (typeof window !== 'undefined') {
      const muted = localStorage.getItem('game-muted') === 'true';
      setIsMusicMuted(muted);
    }
  }, []);

  const toggleMusic = () => {
    const musicElement = document.getElementById('game-music') as HTMLAudioElement;
    if (musicElement) {
      const newMuted = !musicElement.muted;
      musicElement.muted = newMuted;
      setIsMusicMuted(newMuted);
      localStorage.setItem('game-muted', newMuted.toString());
    }
  };

  // Check tournament entry when wallet connects or component mounts
  useEffect(() => {
    if (!isMounted) return; // Wait for client-side mount
    
    const checkEntry = async () => {
      if (!isConnected || !address) {
        setHasEnteredTournament(null);
        return;
      }

      setIsCheckingEntry(true);
      try {
        const dayId = getCurrentDayId();
        const entered = await hasEntered(dayId, address);
        setHasEnteredTournament(entered);
      } catch (error) {
        console.error('Error checking tournament entry:', error);
        setHasEnteredTournament(false);
      } finally {
        setIsCheckingEntry(false);
      }
    };

    checkEntry();
  }, [isMounted, isConnected, address]);

  const handleStart = async () => {
    // Check entry before starting
    if (isConnected && address) {
      const dayId = getCurrentDayId();
      const entered = await hasEntered(dayId, address);
      
      if (!entered) {
        alert('You must enter the tournament first! Click "Enter Tournament" button.');
        return;
      }
    }

    setGameState({
      isRunning: true,
      isPaused: false,
      isFinished: false,
      startTime: Date.now(),
      endTime: null,
    });
    setTimeRemaining(GAME_TIME_LIMIT);
    setStats({
      distance: 0,
      maxSpeed: 0,
      elapsedTime: 0,
      crashes: 0,
      currentSpeed: 0,
      position: 0,
    });
  };


  const handlePlayAgain = () => {
    setGameState({
      isRunning: false,
      isPaused: false,
      isFinished: false,
      startTime: null,
      endTime: null,
    });
    setTimeRemaining(GAME_TIME_LIMIT);
    setStats({
      distance: 0,
      maxSpeed: 0,
      elapsedTime: 0,
      crashes: 0,
      currentSpeed: 0,
      position: 0,
    });
  };

  const handleStatsUpdate = (newStats: GameStats) => {
    setStats(prev => ({
      ...newStats,
      maxSpeed: Math.max(prev.maxSpeed, newStats.currentSpeed),
    }));
  };

  const handleStopPlaying = () => {
    // Stop the game and save the current score
    if (window.gameInstance) {
      window.gameInstance.stop();
    }
    handleGameEnd();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Game Canvas */}
      <GameCanvas
        onStatsUpdate={handleStatsUpdate}
        onGameEnd={handleGameEnd}
        isRunning={gameState.isRunning}
        timeLimit={GAME_TIME_LIMIT}
      />

      {/* HUD Overlay */}
      {gameState.isRunning && !gameState.isFinished && (
        <HUDScore
          score={calculateScore(stats)}
          time={stats.elapsedTime}
          timeRemaining={timeRemaining}
          speed={stats.currentSpeed}
          distance={stats.distance}
        />
      )}

      {/* Pre-game Overlay */}
      {!gameState.isRunning && !gameState.isFinished && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="text-center space-y-6 p-8 border-4 border-yellow-400 bg-black/80 rounded-lg max-w-2xl">
                    <h1 className="text-5xl font-bold text-yellow-400 neon-glow mb-4">
                      ARC CRYPTO RACE
                    </h1>
            
            {!isMounted ? (
              <div className="text-white">Loading...</div>
            ) : (
              <>
                {isConnected && address ? (
                  <>
                    {isCheckingEntry ? (
                      <div className="text-white">Checking tournament entry...</div>
                    ) : hasEnteredTournament ? (
                      <>
                        <div className="bg-green-500/20 border border-green-400 text-green-400 p-4 rounded mb-4">
                          ✅ You're entered in today's tournament!
                        </div>
                        <PreGameOverlay onStart={handleStart} />
                      </>
                    ) : (
                      <>
                        <div className="bg-yellow-500/20 border border-yellow-400 text-yellow-400 p-4 rounded mb-4">
                          ⚠️ You must enter the tournament to play (5 USDC)
                        </div>
                        <EnterTournamentButton
                          onEntered={() => {
                            setHasEnteredTournament(true);
                          }}
                        />
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="bg-yellow-500/20 border border-yellow-400 text-yellow-400 p-4 rounded mb-4">
                      Connect your wallet to enter the tournament
                    </div>
                    <PreGameOverlay onStart={handleStart} />
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* End-game Overlay */}
      {gameState.isFinished && (
        <EndGameOverlay stats={stats} onPlayAgain={handlePlayAgain} />
      )}

      {/* Control Buttons and Timers (when not in overlays) */}
      {gameState.isRunning && !gameState.isFinished && (
        <div className="absolute top-4 right-4 z-[60] flex flex-col items-end gap-2 pointer-events-auto">
          {/* Buttons Row */}
          <div className="flex gap-2">
            <Button
              onClick={toggleMusic}
              variant="outline"
              size="sm"
              className="border-purple-400/50 text-purple-400 hover:bg-purple-400/10 font-bold"
              title={isMusicMuted ? 'Unmute music' : 'Mute music'}
            >
              {isMusicMuted === true ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              onClick={handleStopPlaying}
              variant="outline"
              size="sm"
              className="border-red-400/50 text-red-400 hover:bg-red-400/10 font-bold"
            >
              <Square className="mr-2 h-4 w-4" />
              Stop Playing
            </Button>
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10"
              >
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>
          
          {/* Timers below buttons */}
          <div className="flex flex-col gap-2 pointer-events-none">
            <div className="bg-black/80 border-2 border-red-400 px-4 py-2 rounded font-mono">
              <div className="text-red-400 text-xs">TIME REMAINING</div>
              <div className={`text-white text-3xl font-bold ${timeRemaining < 60 ? 'text-red-500 animate-pulse' : ''}`}>
                {formatTime(timeRemaining)}
              </div>
            </div>
            <div className="bg-black/80 border-2 border-purple-400 px-4 py-2 rounded font-mono">
              <div className="text-purple-400 text-xs">ELAPSED</div>
              <div className="text-white text-xl font-bold">{formatTime(stats.elapsedTime)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Warning */}
      {isMounted && !isConnected && (
        <div className="absolute bottom-4 left-4 right-4 z-50 bg-yellow-500/90 text-black p-4 rounded border-2 border-yellow-400">
          <p className="text-center font-bold">
            Connect your wallet to save your score to the leaderboard!
          </p>
        </div>
      )}
    </div>
  );
}

