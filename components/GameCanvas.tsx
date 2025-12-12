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
  const [loadError, setLoadError] = useState<string | null>(null);
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Load game scripts
  useEffect(() => {
    if (scriptsLoaded) return;

    const loadScripts = async () => {
      try {
        console.log('[GameCanvas] Starting to load game scripts...');
        
        // Load stats.js
        console.log('[GameCanvas] Loading stats.js...');
        await loadScript('/game/stats.js');
        console.log('[GameCanvas] stats.js loaded');
        
        // Load common.js
        console.log('[GameCanvas] Loading common.js...');
        await loadScript('/game/common.js');
        console.log('[GameCanvas] common.js loaded');
        
        // Wait a bit for scripts to initialize
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Verify scripts are loaded
        if (!window.Game || !window.Dom || !window.Util) {
          console.error('[GameCanvas] Scripts loaded but Game/Dom/Util not available:', {
            Game: !!window.Game,
            Dom: !!window.Dom,
            Util: !!window.Util
          });
          throw new Error('Game scripts did not initialize properly');
        }
        console.log('[GameCanvas] Game, Dom, Util are available');
        
        // Load game wrapper
        console.log('[GameCanvas] Loading game-wrapper.js...');
        await loadScript('/game/game-wrapper.js');
        console.log('[GameCanvas] game-wrapper.js loaded');
        
        // Wait for wrapper to load
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verify gameInstance is available
        if (!window.gameInstance) {
          console.error('[GameCanvas] game-wrapper.js loaded but gameInstance not available');
          throw new Error('gameInstance not created');
        }
        console.log('[GameCanvas] gameInstance is available');
        
        setScriptsLoaded(true);
        setLoadError(null);
        console.log('[GameCanvas] All scripts loaded successfully');
      } catch (error) {
        console.error('[GameCanvas] Failed to load game scripts:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setLoadError(errorMessage);
        // Don't set scriptsLoaded to true on error, so user can see the issue
      }
    };

    loadScripts();
  }, [scriptsLoaded]);

  // Initialize game when scripts are loaded
  useEffect(() => {
    if (!scriptsLoaded || !canvasRef.current) return;
    
    // Check if already initialized (both React state and window.gameState)
    if (gameInitialized || (window.gameState && window.gameState.isInitialized)) {
      console.log('[GameCanvas] Game already initialized, skipping');
      return;
    }

    const canvas = canvasRef.current;
    
    if (window.gameInstance) {
      try {
        console.log('[GameCanvas] Initializing game with canvas...');
        // Double-check before calling init
        if (window.gameState && window.gameState.isInitialized) {
          console.log('[GameCanvas] Game state already initialized');
          setGameInitialized(true);
          return;
        }
        
        window.gameInstance.init(canvas);
        console.log('[GameCanvas] Game init called, waiting for images to load...');
        
        // Wait a bit for images to load and game to initialize
        const checkInitialized = setInterval(() => {
          if (window.gameState && window.gameState.isInitialized) {
            console.log('[GameCanvas] Game initialized successfully');
            setGameInitialized(true);
            clearInterval(checkInitialized);
          }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkInitialized);
          if (!gameInitialized && (!window.gameState || !window.gameState.isInitialized)) {
            console.error('[GameCanvas] Game initialization timeout - images may not have loaded');
          }
        }, 5000);
      } catch (error) {
        console.error('[GameCanvas] Failed to initialize game:', error);
      }
    } else {
      console.error('[GameCanvas] gameInstance not available when trying to initialize');
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
          <div className="text-center text-white text-xl font-mono space-y-4">
            {loadError ? (
              <>
                <div className="text-red-400">❌ Error loading game</div>
                <div className="text-sm text-gray-400">{loadError}</div>
                <div className="text-sm text-gray-400 mt-4">
                  Please refresh the page or check the browser console for details.
                </div>
              </>
            ) : !scriptsLoaded ? (
              'Loading game scripts...'
            ) : (
              'Initializing game...'
            )}
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
      console.log(`[loadScript] ${src} already loaded, skipping`);
      resolve();
      return;
    }

    console.log(`[loadScript] Loading ${src}...`);
    const script = document.createElement('script');
    script.src = src;
    script.type = 'text/javascript';
    script.async = false; // Load scripts sequentially
    script.defer = false;
    
    // Add timeout to prevent hanging
    const timeout = setTimeout(() => {
      console.error(`[loadScript] Timeout loading ${src} after 30 seconds`);
      script.remove();
      reject(new Error(`Timeout loading ${src} after 30 seconds`));
    }, 30000);
    
    script.onload = () => {
      clearTimeout(timeout);
      console.log(`[loadScript] ${src} loaded successfully`);
      resolve();
    };
    script.onerror = (error) => {
      clearTimeout(timeout);
      console.error(`[loadScript] Script onerror event for ${src}:`, error);
      script.remove();
      // Try to get more info about the error
      fetch(src, { method: 'HEAD', cache: 'no-cache' })
        .then(response => {
          console.error(`[loadScript] ${src} HTTP status: ${response.status} ${response.statusText}`);
          console.error(`[loadScript] ${src} Content-Type: ${response.headers.get('content-type')}`);
          reject(new Error(`Failed to load ${src}: HTTP ${response.status} ${response.statusText}`));
        })
        .catch(fetchError => {
          console.error(`[loadScript] ${src} fetch error:`, fetchError);
          reject(new Error(`Failed to load ${src}: ${fetchError.message || 'Network error'}`));
        });
    };
    document.head.appendChild(script); // Use head instead of body for better compatibility
  });
}
