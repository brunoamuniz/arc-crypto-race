"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import Script from 'next/script';
import type { GameStats } from '@/lib/types';

interface GameCanvasProps {
  onStatsUpdate: (stats: GameStats) => void;
  onGameEnd: () => void;
  isRunning: boolean;
  timeLimit: number;
}

declare global {
  interface Window {
    Game?: any;
    Dom?: any;
    Util?: any;
    gameState?: {
      position: number;
      speed: number;
      maxSpeed: number;
      crashes: number;
      totalGameTime: number;
      playerX: number;
      trackLength: number;
      segmentLength: number;
      isInitialized: boolean;
      isRunning: boolean;
    };
    gameInstance?: {
      init: (canvas: HTMLCanvasElement) => void;
      start: () => void;
      stop: () => void;
      reset: () => void;
    };
  }
}

export function GameCanvas({ onStatsUpdate, onGameEnd, isRunning, timeLimit }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [gameInitialized, setGameInitialized] = useState(false);
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Load game scripts
  useEffect(() => {
    if (scriptsLoaded) return;

    const loadScripts = async () => {
      try {
        // Load stats.js
        await loadScript('/game/stats.js');
        
        // Load common.js
        await loadScript('/game/common.js');
        
        // Wait a bit for scripts to initialize
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Load game wrapper
        await loadScript('/game/game-wrapper.js');
        
        // Wait for wrapper to load
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setScriptsLoaded(true);
      } catch (error) {
        console.error('Failed to load game scripts:', error);
      }
    };

    loadScripts();
  }, [scriptsLoaded]);

  // Initialize game when scripts are loaded
  useEffect(() => {
    if (!scriptsLoaded || !canvasRef.current) return;
    
    // Check if already initialized (both React state and window.gameState)
    if (gameInitialized || (window.gameState && window.gameState.isInitialized)) {
      return;
    }

    const canvas = canvasRef.current;
    
    if (window.gameInstance) {
      try {
        // Double-check before calling init
        if (window.gameState && window.gameState.isInitialized) {
          setGameInitialized(true);
          return;
        }
        
        window.gameInstance.init(canvas);
        setGameInitialized(true);
      } catch (error) {
        console.error('Failed to initialize game:', error);
      }
    }
  }, [scriptsLoaded, gameInitialized]);

  // Handle game start/stop
  useEffect(() => {
    if (!gameInitialized || !window.gameInstance) return;

    if (isRunning) {
      window.gameInstance.start();
      startTimeRef.current = Date.now();
    } else {
      window.gameInstance.stop();
    }
  }, [isRunning, gameInitialized]);

  // Poll for stats when game is running
  useEffect(() => {
    if (!isRunning || !gameInitialized || !window.gameState) {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
        statsIntervalRef.current = null;
      }
      return;
    }

    statsIntervalRef.current = setInterval(() => {
      if (!window.gameState) return;

      const stats: GameStats = {
        distance: window.gameState.position,
        maxSpeed: window.gameState.maxSpeed,
        elapsedTime: window.gameState.totalGameTime,
        crashes: window.gameState.crashes,
        currentSpeed: window.gameState.speed,
        position: window.gameState.position,
      };

      onStatsUpdate(stats);

      // Check time limit
      if (window.gameState.totalGameTime >= timeLimit) {
        onGameEnd();
      }
    }, 100); // Update every 100ms

    return () => {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
        statsIntervalRef.current = null;
      }
    };
  }, [isRunning, gameInitialized, timeLimit, onStatsUpdate, onGameEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
      if (window.gameInstance) {
        window.gameInstance.stop();
      }
    };
  }, []);

  // Initialize music when game starts
  useEffect(() => {
    if (!isRunning || !gameInitialized) return;

    const musicElement = document.getElementById('game-music') as HTMLAudioElement;
    if (musicElement && window.Game && window.Game.playMusic) {
      // Set up music element for Game.playMusic
      musicElement.loop = true;
      musicElement.volume = 0.05;
      const muted = localStorage.getItem('game-muted') === 'true';
      musicElement.muted = muted;
      
      // Try to play music (may require user interaction)
      musicElement.play().catch((error) => {
        console.log('Music autoplay prevented:', error);
      });
    }
  }, [isRunning, gameInitialized]);

  // Stop music when game stops
  useEffect(() => {
    if (isRunning) return;

    const musicElement = document.getElementById('game-music') as HTMLAudioElement;
    if (musicElement) {
      musicElement.pause();
      musicElement.currentTime = 0;
    }
  }, [isRunning]);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center bg-black">
      {/* Audio element for game music */}
      <audio id="game-music" preload="auto">
        <source src="/game/assets/music/racer.ogg" type="audio/ogg" />
        <source src="/game/assets/music/racer.mp3" type="audio/mpeg" />
      </audio>

      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full"
        style={{ imageRendering: 'pixelated' }}
      />
      {(!scriptsLoaded || !gameInitialized) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-white text-xl font-mono">
            {!scriptsLoaded ? 'Loading game scripts...' : 'Initializing game...'}
          </div>
        </div>
      )}
    </div>
  );
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}
