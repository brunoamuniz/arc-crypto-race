"use client";

import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface PreGameOverlayProps {
  onStart: () => void;
}

export function PreGameOverlay({ onStart }: PreGameOverlayProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="text-center space-y-6 p-8 border-4 border-yellow-400 bg-black/80 rounded-lg max-w-2xl">
        <h1 className="text-5xl font-bold text-yellow-400 neon-glow mb-4">
          ARC CRYPTO RACE
        </h1>
        
        <div className="space-y-4 text-left text-white/90 mb-8">
          <div className="bg-black/50 p-4 rounded border border-cyan-400/50">
            <h3 className="text-xl font-bold text-cyan-400 mb-3">Controls</h3>
            <ul className="space-y-2 font-mono text-sm">
              <li>↑ / W - Accelerate</li>
              <li>↓ / S - Brake</li>
              <li>← / A - Turn Left</li>
              <li>→ / D - Turn Right</li>
            </ul>
          </div>
          
          <div className="bg-black/50 p-4 rounded border border-purple-400/50">
            <h3 className="text-xl font-bold text-purple-400 mb-3">Rules</h3>
            <ul className="space-y-2 font-mono text-sm">
              <li>• Race for 5 minutes</li>
              <li>• Score points by distance and speed</li>
              <li>• Avoid crashes!</li>
              <li>• Top 3 players win daily prizes</li>
            </ul>
          </div>
        </div>

        <Button
          onClick={onStart}
          size="lg"
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-xl px-8 py-6 hover:from-yellow-300 hover:to-orange-400"
        >
          <Play className="mr-2 h-6 w-6" />
          START RACE
        </Button>
      </div>
    </div>
  );
}

