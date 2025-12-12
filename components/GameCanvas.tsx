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
  const [retryCount, setRetryCount] = useState(0);
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
        setRetryCount(0);
        console.log('[GameCanvas] All scripts loaded successfully');
      } catch (error) {
        console.error('[GameCanvas] Failed to load game scripts:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setLoadError(errorMessage);
        
        // Auto-retry with exponential backoff (max 3 retries)
        if (retryCount < 3) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
          console.log(`[GameCanvas] Retrying in ${delay}ms (attempt ${retryCount + 1}/3)...`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            setScriptsLoaded(false); // Reset to trigger retry
          }, delay);
        }
      }
    };

    loadScripts();
  }, [scriptsLoaded, retryCount]);

  // Initialize game when scripts are loaded
  useEffect(() => {
    if (!scriptsLoaded || !canvasRef.current) return;
    
    // Check if already initialized (both React state and window.gameState)
    if (gameInitialized || (window.gameState && window.gameState.isInitialized)) {
      console.log('[GameCanvas] Game already initialized, skipping');
      return;
    }

    const canvas = canvasRef.current;
    
    // Cleanup any existing intervals/timeouts
    if (initCheckIntervalRef.current) {
      clearInterval(initCheckIntervalRef.current);
      initCheckIntervalRef.current = null;
    }
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
      initTimeoutRef.current = null;
    }
    
    if (window.gameInstance) {
      try {
        console.log('[GameCanvas] Initializing game with canvas...');
        // Double-check before calling init
        if (window.gameState && window.gameState.isInitialized) {
          console.log('[GameCanvas] Game state already initialized');
          setGameInitialized(true);
          return;
        }
        
        // Ensure canvas is ready
        if (!canvas.getContext) {
          console.error('[GameCanvas] Canvas not ready');
          return;
        }
        
        window.gameInstance.init(canvas);
        console.log('[GameCanvas] Game init called, waiting for images to load...');
        
        let checkCount = 0;
        const maxChecks = 100; // 10 seconds total (100 * 100ms)
        
        // Wait for images to load and game to initialize
        initCheckIntervalRef.current = setInterval(() => {
          checkCount++;
          
          if (window.gameState && window.gameState.isInitialized) {
            console.log('[GameCanvas] Game initialized successfully');
            setGameInitialized(true);
            setLoadError(null);
            if (initCheckIntervalRef.current) {
              clearInterval(initCheckIntervalRef.current);
              initCheckIntervalRef.current = null;
            }
            if (initTimeoutRef.current) {
              clearTimeout(initTimeoutRef.current);
              initTimeoutRef.current = null;
            }
          } else if (checkCount >= maxChecks) {
            console.error('[GameCanvas] Game initialization timeout after 10 seconds');
            setLoadError('Game initialization timeout. Please refresh the page.');
            if (initCheckIntervalRef.current) {
              clearInterval(initCheckIntervalRef.current);
              initCheckIntervalRef.current = null;
            }
          }
        }, 100);
        
        // Safety timeout after 10 seconds
        initTimeoutRef.current = setTimeout(() => {
          if (initCheckIntervalRef.current) {
            clearInterval(initCheckIntervalRef.current);
            initCheckIntervalRef.current = null;
          }
          if (!gameInitialized && (!window.gameState || !window.gameState.isInitialized)) {
            console.error('[GameCanvas] Game initialization timeout - images may not have loaded');
            setLoadError('Game initialization timeout. Try refreshing the page.');
          }
        }, 10000);
      } catch (error) {
        console.error('[GameCanvas] Failed to initialize game:', error);
        setLoadError(error instanceof Error ? error.message : 'Failed to initialize game');
      }
    } else {
      console.error('[GameCanvas] gameInstance not available when trying to initialize');
      setLoadError('Game instance not available. Please refresh the page.');
    }
    
    // Cleanup on unmount
    return () => {
      if (initCheckIntervalRef.current) {
        clearInterval(initCheckIntervalRef.current);
        initCheckIntervalRef.current = null;
      }
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
    };
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

    // Track previous values to detect anomalies
    let previousMaxSpeed = 0;
    let previousDistance = 0;
    let previousScore = 0;
    
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

      // Calculate current score for logging
      const currentScore = stats.distance * 10 + stats.maxSpeed * 2 - stats.elapsedTime * 5 - (stats.crashes ?? 0) * 100;
      
      // Detect score drops (more than 10% decrease)
      if (previousScore > 0 && currentScore < previousScore * 0.9) {
        console.warn('[GameCanvas] ⚠️ SCORE DROP DETECTED!', {
          previousScore: Math.floor(previousScore),
          currentScore: Math.floor(currentScore),
          drop: Math.floor(previousScore - currentScore),
          stats: {
            distance: stats.distance.toFixed(2),
            maxSpeed: stats.maxSpeed.toFixed(2),
            elapsedTime: stats.elapsedTime.toFixed(2),
            crashes: stats.crashes,
            previousMaxSpeed: previousMaxSpeed.toFixed(2),
            previousDistance: previousDistance.toFixed(2),
          },
          gameState: {
            position: window.gameState.position?.toFixed(2),
            speed: window.gameState.speed?.toFixed(2),
            maxSpeed: window.gameState.maxSpeed?.toFixed(2),
            totalGameTime: window.gameState.totalGameTime?.toFixed(2),
            crashes: window.gameState.crashes,
          }
        });
      }
      
      // Detect maxSpeed reset
      if (previousMaxSpeed > 0 && stats.maxSpeed < previousMaxSpeed * 0.5) {
        console.error('[GameCanvas] ❌ MAXSPEED RESET DETECTED!', {
          previousMaxSpeed: previousMaxSpeed.toFixed(2),
          currentMaxSpeed: stats.maxSpeed.toFixed(2),
          gameStateMaxSpeed: window.gameState.maxSpeed?.toFixed(2),
        });
      }
      
      // Detect distance reset
      if (previousDistance > 0 && stats.distance < previousDistance * 0.5) {
        console.error('[GameCanvas] ❌ DISTANCE RESET DETECTED!', {
          previousDistance: previousDistance.toFixed(2),
          currentDistance: stats.distance.toFixed(2),
          gameStatePosition: window.gameState.position?.toFixed(2),
        });
      }

      previousMaxSpeed = stats.maxSpeed;
      previousDistance = stats.distance;
      previousScore = currentScore;

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
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center bg-black" style={{ minHeight: '100vh', minWidth: '100vw', zIndex: 0 }}>
      {/* Audio element for game music */}
      <audio id="game-music" preload="auto">
        <source src="/game/assets/music/racer.ogg" type="audio/ogg" />
        <source src="/game/assets/music/racer.mp3" type="audio/mpeg" />
      </audio>

      <canvas
        ref={canvasRef}
        className="block relative"
        style={{ 
          imageRendering: 'pixelated',
          display: 'block',
          maxWidth: '100%',
          maxHeight: '100%',
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
          zIndex: 0,
          position: 'relative'
        }}
      />
      {(!scriptsLoaded || !gameInitialized) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="text-center text-white text-xl font-mono space-y-4 p-8">
            {loadError ? (
              <>
                <div className="text-red-400 text-2xl font-bold mb-4">❌ Error loading game</div>
                <div className="text-sm text-gray-300 mb-4">{loadError}</div>
                <div className="flex flex-col gap-3 items-center">
                  <button
                    onClick={() => {
                      setScriptsLoaded(false);
                      setGameInitialized(false);
                      setLoadError(null);
                      setRetryCount(0);
                      // Force reload scripts
                      if (typeof window !== 'undefined') {
                        const scripts = document.querySelectorAll('script[src^="/game/"]');
                        scripts.forEach(script => script.remove());
                        // Clear window objects
                        if (window.gameInstance) delete window.gameInstance;
                        if (window.gameState) delete window.gameState;
                        if (window.Game) delete window.Game;
                        if (window.Dom) delete window.Dom;
                        if (window.Util) delete window.Util;
                      }
                    }}
                    className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded transition-colors"
                  >
                    🔄 Retry Loading
                  </button>
                  <div className="text-xs text-gray-400 mt-2">
                    Or refresh the page (F5 or Ctrl+R)
                  </div>
                </div>
              </>
            ) : !scriptsLoaded ? (
              <>
                <div className="text-yellow-400 mb-2">Loading game scripts...</div>
                {retryCount > 0 && (
                  <div className="text-xs text-gray-400">Retry attempt {retryCount}/3</div>
                )}
              </>
            ) : (
              <>
                <div className="text-cyan-400 mb-2">Initializing game...</div>
                <div className="text-xs text-gray-400">Loading assets and setting up canvas</div>
              </>
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
