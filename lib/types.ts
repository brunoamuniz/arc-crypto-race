export type GameStats = {
  distance: number;
  maxSpeed: number;
  elapsedTime: number; // seconds
  crashes?: number;
  currentSpeed: number;
  position: number;
};

export type GameState = {
  isRunning: boolean;
  isPaused: boolean;
  isFinished: boolean;
  startTime: number | null;
  endTime: number | null;
};

export type LeaderboardEntry = {
  address: string;
  score: number;
  time: number;
  distance: number;
  maxSpeed: number;
  timestamp: number;
};

// Window type augmentation for game state
declare global {
  interface Window {
    Game?: any;
    Dom?: any;
    Util?: any;
    Render?: any;
    SPRITES?: any;
    COLORS?: any;
    BACKGROUND?: any;
    gameState?: {
      position: number;
      speed: number;
      maxSpeed: number;
      crashes: number;
      totalGameTime: number;
      totalDistance: number;  // Cumulative distance (never wraps)
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

// Required for TypeScript to treat this as a module with global augmentation
export {};
