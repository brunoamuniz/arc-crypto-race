import type { GameStats } from './types';

/**
 * Calculate score based on game statistics
 * Formula: distance * 10 + maxSpeed * 2 - elapsedTime * 5 - crashes * 100
 */
export function calculateScore(stats: GameStats): number {
  return Math.floor(
    stats.distance * 10 +
    stats.maxSpeed * 2 -
    stats.elapsedTime * 5 -
    (stats.crashes ?? 0) * 100
  );
}

/**
 * Format time in seconds to MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format time remaining (countdown) from total time
 */
export function formatTimeRemaining(remaining: number): string {
  return formatTime(Math.max(0, remaining));
}

