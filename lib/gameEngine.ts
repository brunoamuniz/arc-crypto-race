import type { GameStats } from './types';

export interface GameEngineInstance {
  start: () => void;
  stop: () => void;
  reset: () => void;
  getStats: () => GameStats;
  isRunning: () => boolean;
}

declare global {
  interface Window {
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
    Game?: any;
    Dom?: any;
    Util?: any;
  }
}

/**
 * Initialize the game engine with a canvas element
 */
export async function initializeGameEngine(
  canvas: HTMLCanvasElement,
  onStatsUpdate?: (stats: GameStats) => void
): Promise<GameEngineInstance> {
  // Load scripts if not already loaded
  if (!window.Game) {
    await loadScript('/game/stats.js');
    await loadScript('/game/common.js');
    // Wait for scripts to initialize
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  if (!window.Game || !window.Dom || !window.Util) {
    throw new Error('Failed to load game scripts');
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Set canvas size
  canvas.width = 1024;
  canvas.height = 768;

  // Initialize game state
  let isRunning = false;
  let gameLoopId: number | null = null;
  let statsUpdateInterval: NodeJS.Timeout | null = null;
  
  // Game variables (will be set by game code)
  const gameState: Window['gameState'] = {
    position: 0,
    speed: 0,
    maxSpeed: 0,
    crashes: 0,
    totalGameTime: 0,
    playerX: 0,
    trackLength: 0,
    segmentLength: 200,
    isInitialized: false,
    isRunning: false,
  };

  // Expose game state to window for game code to update
  window.gameState = gameState;

  // Create game instance
  const instance: GameEngineInstance = {
    start: () => {
      if (isRunning) return;
      isRunning = true;
      
      // Start stats polling
      if (onStatsUpdate) {
        statsUpdateInterval = setInterval(() => {
          const stats: GameStats = {
            distance: gameState.position,
            maxSpeed: gameState.maxSpeed,
            elapsedTime: gameState.totalGameTime,
            crashes: gameState.crashes,
            currentSpeed: gameState.speed,
            position: gameState.position,
          };
          onStatsUpdate(stats);
        }, 100); // Update every 100ms
      }
    },

    stop: () => {
      isRunning = false;
      if (statsUpdateInterval) {
        clearInterval(statsUpdateInterval);
        statsUpdateInterval = null;
      }
    },

    reset: () => {
      instance.stop();
      // Reset game state
      gameState.position = 0;
      gameState.speed = 0;
      gameState.maxSpeed = 0;
      gameState.crashes = 0;
      gameState.totalGameTime = 0;
      gameState.playerX = 0;
    },

    getStats: (): GameStats => {
      return {
        distance: gameState.position,
        maxSpeed: gameState.maxSpeed,
        elapsedTime: gameState.totalGameTime,
        crashes: gameState.crashes,
        currentSpeed: gameState.speed,
        position: gameState.position,
      };
    },

    isRunning: () => isRunning,
  };

  // Initialize the actual game
  initializeGameCode(canvas, ctx, gameState);

  return instance;
}

/**
 * Load a script dynamically
 */
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

/**
 * Initialize the game code (extracted from game.html)
 */
function initializeGameCode(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  gameState: NonNullable<Window['gameState']>
) {
  // This will be called after scripts are loaded
  // We need to extract and adapt the game initialization code
  // For now, we'll create a wrapper that will be populated by the game code
  
  // The game code from game.html will need to be adapted to:
  // 1. Use the provided canvas
  // 2. Update gameState object instead of using global variables
  // 3. Expose start/stop/reset functions
  
  // This is a placeholder - the actual game code will be loaded via scripts
  // and we'll hook into it
}

