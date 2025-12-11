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

