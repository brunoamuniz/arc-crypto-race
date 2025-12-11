# ARC CRYPTO RACE - Integration Guide

## ✅ Completed

1. **Project Structure**
   - ✅ Organized Next.js app structure
   - ✅ Created `lib/types.ts` with shared types
   - ✅ Created `lib/scoring.ts` with scoring system
   - ✅ Created `lib/wallet.ts` with wallet configuration

2. **Components**
   - ✅ `WalletConnectButton.tsx` - Wallet connection component
   - ✅ `HUDScore.tsx` - HUD overlay with score, timer, speed, distance
   - ✅ `PreGameOverlay.tsx` - Pre-game screen with instructions
   - ✅ `EndGameOverlay.tsx` - End-game screen with final stats
   - ✅ `GameCanvas.tsx` - Game canvas wrapper (needs game integration)
   - ✅ `WagmiProvider.tsx` - Wagmi provider for wallet connection

3. **Pages**
   - ✅ `app/game/page.tsx` - Game page with state management
   - ✅ Updated `app/layout.tsx` with WagmiProvider
   - ✅ Updated `components/hero-section.tsx` with links

4. **Assets**
   - ✅ Copied game assets (images, sprites, music) to `public/`
   - ✅ Copied `common.js` and `stats.js` to `public/`

## 🔧 Remaining Work

### 1. Game Integration

The game code from `v4.final.html` needs to be integrated. Options:

**Option A: Create a game wrapper module**
- Extract game code from `v4.final.html` (lines 91-685)
- Create `public/game-wrapper.js` that:
  - Loads `common.js` and `stats.js`
  - Initializes the game with a canvas element
  - Exposes an API: `start()`, `stop()`, `reset()`, `getStats()`
  - Updates `window.gameStats` object with current game state

**Option B: Use iframe (simpler but less integrated)**
- Create `public/game.html` with the game code
- Load it in an iframe in `GameCanvas.tsx`
- Use postMessage for communication

**Recommended: Option A**

### 2. Update GameCanvas.tsx

The `GameCanvas.tsx` component needs to:
1. Load the game wrapper script
2. Initialize the game with the canvas element
3. Poll for stats updates
4. Handle game start/stop/reset

### 3. Update Leaderboard

Update `app/leaderboard/page.tsx` to:
- Show mock data for now
- Display top 3 with special styling
- Show wallet addresses (truncated)
- Show scores, times, distances

### 4. Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

## 📝 Next Steps

1. **Create game wrapper** (`public/game-wrapper.js`):
   - Extract game initialization code
   - Expose API for React components
   - Update `window.gameStats` with current state

2. **Update GameCanvas.tsx**:
   - Load game wrapper
   - Initialize game on mount
   - Poll for stats
   - Handle game lifecycle

3. **Test integration**:
   - Test wallet connection
   - Test game start/stop
   - Test scoring system
   - Test timer countdown

4. **Polish UI**:
   - Ensure pixel-art styling is consistent
   - Test on different screen sizes
   - Add loading states

## 🎮 Game Stats API

The game should expose:
```javascript
window.gameStats = {
  position: number,    // Distance traveled
  speed: number,       // Current speed
  maxSpeed: number,    // Maximum speed reached
  crashes: number,     // Number of crashes
  elapsedTime: number  // Time elapsed
};

window.gameInstance = {
  start: () => void,
  stop: () => void,
  reset: () => void
};
```

## 📦 Dependencies

Already installed:
- `wagmi` - Wallet connection
- `viem` - Ethereum utilities
- `@tanstack/react-query` - React Query for Wagmi

## 🚀 Running the Project

```bash
cd arc-crypto-race
npm install
npm run dev
```

Visit:
- `/` - Landing page
- `/game` - Game page
- `/leaderboard` - Leaderboard page

