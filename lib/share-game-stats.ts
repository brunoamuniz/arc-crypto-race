/**
 * Generate and share game stats image
 */

import type { GameStats } from './types';
import { calculateScore, formatTime } from './scoring';

/**
 * Generate an image with game stats for sharing
 */
export async function generateStatsImage(stats: GameStats): Promise<string> {
  const finalScore = calculateScore(stats);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Set canvas size (Twitter recommended: 1200x675)
  canvas.width = 1200;
  canvas.height = 675;

  // Background gradient (dark with neon accents)
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#000000');
  gradient.addColorStop(0.5, '#0a0a0a');
  gradient.addColorStop(1, '#000000');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add border effect
  ctx.strokeStyle = '#fbbf24'; // yellow-400
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

  // Title
  ctx.fillStyle = '#fbbf24'; // yellow-400
  ctx.font = 'bold 72px "Courier New", Courier, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  // Add glow effect to title
  ctx.shadowColor = '#fbbf24';
  ctx.shadowBlur = 20;
  ctx.fillText('RACE FINISHED!', canvas.width / 2, 60);
  ctx.shadowBlur = 0;

  // Final Score (large, prominent)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 120px "Courier New", Courier, monospace';
  ctx.fillText('FINAL SCORE', canvas.width / 2, 180);
  
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 140px "Courier New", Courier, monospace';
  ctx.fillText(finalScore.toLocaleString(), canvas.width / 2, 280);

  // Stats grid (2x2 layout) - adjusted spacing to avoid overlap
  const statsY = 440;
  const statsRow2Y = 520;
  const statsSpacing = 500;
  const statsStartX = (canvas.width - statsSpacing) / 2;

  // Time (top left)
  ctx.fillStyle = '#22d3ee'; // cyan-400
  ctx.font = 'bold 32px "Courier New", Courier, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('TIME', statsStartX, statsY);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px "Courier New", Courier, monospace';
  ctx.fillText(formatTime(stats.elapsedTime), statsStartX, statsY + 50);

  // Distance (top right)
  ctx.fillStyle = '#4ade80'; // green-400
  ctx.font = 'bold 32px "Courier New", Courier, monospace';
  ctx.fillText('DISTANCE', statsStartX + statsSpacing, statsY);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px "Courier New", Courier, monospace';
  ctx.fillText(`${Math.round(stats.distance)} m`, statsStartX + statsSpacing, statsY + 50);

  // Max Speed (bottom left)
  ctx.fillStyle = '#a78bfa'; // purple-400
  ctx.font = 'bold 32px "Courier New", Courier, monospace';
  ctx.fillText('MAX SPEED', statsStartX, statsRow2Y);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px "Courier New", Courier, monospace';
  ctx.fillText(`${Math.round(stats.maxSpeed)} mph`, statsStartX, statsRow2Y + 50);

  // Crashes (bottom right)
  ctx.fillStyle = '#f87171'; // red-400
  ctx.font = 'bold 32px "Courier New", Courier, monospace';
  ctx.fillText('CRASHES', statsStartX + statsSpacing, statsRow2Y);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px "Courier New", Courier, monospace';
  ctx.fillText(`${stats.crashes || 0}`, statsStartX + statsSpacing, statsRow2Y + 50);

  // Footer text - moved further down to avoid overlap with stats
  ctx.textAlign = 'center';
  ctx.fillStyle = '#60a5fa'; // blue-400
  ctx.font = 'bold 28px "Courier New", Courier, monospace';
  ctx.fillText('ARC CRYPTO RACE', canvas.width / 2, canvas.height - 35);
  ctx.fillStyle = '#9ca3af'; // gray-400
  ctx.font = '24px "Courier New", Courier, monospace';
  ctx.fillText('arccryptorace.xyz', canvas.width / 2, canvas.height - 5);

  // Convert to data URL
  return canvas.toDataURL('image/png');
}

/**
 * Share game stats on Twitter/X
 */
export async function shareOnTwitter(stats: GameStats, imageDataUrl?: string): Promise<void> {
  const finalScore = calculateScore(stats);
  
  // Create share text
  const shareText = `Just finished a race on ARC CRYPTO RACE! 🏎️💨\n\nFinal Score: ${finalScore.toLocaleString()}\nDistance: ${Math.round(stats.distance)}m | Max Speed: ${Math.round(stats.maxSpeed)}mph\n\n#ARC #DeFi #Web3 #ARCTestnet`;
  const shareUrl = encodeURIComponent('https://arccryptorace.xyz');
  const text = encodeURIComponent(shareText);

  // Try Web Share API first (works on mobile and some browsers)
  if (navigator.share && imageDataUrl) {
    try {
      // Convert data URL to blob
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'race-stats.png', { type: 'image/png' });

      await navigator.share({
        title: 'ARC CRYPTO RACE - Race Results',
        text: shareText.replace(/\n/g, ' '),
        url: 'https://arccryptorace.xyz',
        files: [file],
      });
      return;
    } catch (error) {
      // If share fails or user cancels, fall through to Twitter URL
      console.log('Web Share API not available or cancelled, using Twitter URL');
    }
  }

  // Fallback: Open Twitter with text (user can attach image manually)
  const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`;
  window.open(twitterUrl, '_blank', 'width=550,height=420');
}

/**
 * Download the stats image
 */
export function downloadStatsImage(imageDataUrl: string, filename: string = 'race-stats.png'): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = imageDataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
