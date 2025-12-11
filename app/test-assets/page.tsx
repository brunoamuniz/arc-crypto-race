"use client";

import { useEffect, useState } from 'react';

export default function TestAssetsPage() {
  const [results, setResults] = useState<Array<{ path: string; status: 'loading' | 'success' | 'error' }>>([]);

  const assetsToTest = [
    '/game/stats.js',
    '/game/common.js',
    '/game/common.css',
    '/game/assets/images/background.png',
    '/game/assets/images/sprites.png',
    '/game/assets/music/racer.mp3',
    '/game/assets/music/racer.ogg',
  ];

  useEffect(() => {
    const testAssets = async () => {
      const results: Array<{ path: string; status: 'loading' | 'success' | 'error' }> = [];

      for (const asset of assetsToTest) {
        results.push({ path: asset, status: 'loading' });
        setResults([...results]);

        try {
          const response = await fetch(asset, { method: 'HEAD' });
          if (response.ok) {
            const index = results.length - 1;
            results[index] = { path: asset, status: 'success' };
          } else {
            const index = results.length - 1;
            results[index] = { path: asset, status: 'error' };
          }
        } catch (error) {
          const index = results.length - 1;
          results[index] = { path: asset, status: 'error' };
        }

        setResults([...results]);
      }
    };

    testAssets();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Asset Loading Test</h1>
      
      <div className="space-y-2">
        {results.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded border-2 ${
              result.status === 'loading'
                ? 'border-yellow-400 bg-yellow-400/10'
                : result.status === 'success'
                ? 'border-green-400 bg-green-400/10'
                : 'border-red-400 bg-red-400/10'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm">{result.path}</span>
              <span
                className={`px-2 py-1 rounded text-xs font-bold ${
                  result.status === 'loading'
                    ? 'bg-yellow-400 text-black'
                    : result.status === 'success'
                    ? 'bg-green-400 text-black'
                    : 'bg-red-400 text-black'
                }`}
              >
                {result.status.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Test Image Loading</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-2">Background:</p>
            <img
              src="/game/assets/images/background.png"
              alt="Background"
              className="border-2 border-white"
              onLoad={() => console.log('Background loaded')}
              onError={() => console.error('Background failed to load')}
            />
          </div>
          <div>
            <p className="mb-2">Sprites:</p>
            <img
              src="/game/assets/images/sprites.png"
              alt="Sprites"
              className="border-2 border-white"
              onLoad={() => console.log('Sprites loaded')}
              onError={() => console.error('Sprites failed to load')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

