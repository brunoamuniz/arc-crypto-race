# 📁 Project Structure - ARC CRYPTO RACE

## Overview

This project is organized into clear sections for frontend, game engine, and backend.

```
arc-crypto-race/
├── app/                    # Next.js App Router (Frontend)
│   ├── game/              # Game page
│   ├── leaderboard/       # Leaderboard page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
│
├── components/            # React Components
│   ├── ui/               # shadcn/ui components
│   ├── GameCanvas.tsx    # Game canvas wrapper
│   ├── HUDScore.tsx      # HUD overlay
│   ├── PreGameOverlay.tsx
│   ├── EndGameOverlay.tsx
│   └── WalletConnectButton.tsx
│
├── lib/                   # Utilities & Helpers
│   ├── types.ts          # TypeScript types
│   ├── scoring.ts        # Scoring system
│   ├── wallet.ts         # Wallet configuration
│   └── utils.ts          # General utilities
│
├── game/                  # Game Engine
│   ├── game.html         # Original game HTML (reference)
│   ├── common.js        # Game engine core
│   ├── common.css       # Game styles
│   ├── stats.js         # FPS counter
│   └── assets/          # Game assets
│       ├── images/      # Sprites, backgrounds
│       └── music/       # Game music
│
├── backend/              # Backend API (Future)
│   ├── api/             # API routes
│   └── lib/             # Backend utilities
│
├── public/               # Static Assets (Next.js)
│   ├── images/          # Landing page images
│   └── ...              # Other static files
│
└── styles/               # Global Styles
    └── globals.css
```

## Directory Descriptions

### `/app` - Frontend (Next.js)
- **Purpose**: Next.js App Router pages and layouts
- **Files**: React Server/Client Components
- **Routes**:
  - `/` - Landing page
  - `/game` - Game page
  - `/leaderboard` - Leaderboard page

### `/components` - React Components
- **Purpose**: Reusable UI components
- **Structure**:
  - `ui/` - shadcn/ui base components
  - Game-specific components (HUD, Overlays, Canvas)
  - Wallet and provider components

### `/lib` - Utilities
- **Purpose**: Shared logic and utilities
- **Files**:
  - `types.ts` - TypeScript type definitions
  - `scoring.ts` - Score calculation logic
  - `wallet.ts` - Wagmi wallet configuration
  - `utils.ts` - General helper functions

### `/game` - Game Engine
- **Purpose**: Racing game engine code
- **Files**:
  - `game.html` - Original game HTML (reference only)
  - `common.js` - Core game engine (DOM, rendering, game loop)
  - `common.css` - Game-specific styles
  - `stats.js` - FPS counter utility
- **Assets**: All game assets (sprites, images, music)

### `/backend` - Backend API
- **Purpose**: Future backend implementation
- **Planned**:
  - API routes for leaderboard
  - Smart contract integration
  - User authentication
  - Score validation

### `/public` - Static Assets
- **Purpose**: Next.js public directory
- **Contains**: Landing page images, icons, etc.
- **Note**: Game assets are in `/game/assets/`, not here

## Asset Paths

### Game Assets
- Images: `/game/assets/images/`
- Sprites: `/game/assets/sprites/`
- Music: `/game/assets/music/`
- Background: `/game/assets/images/background/`

### Public Assets
- Landing images: `/images/`
- Icons: `/icon.svg`, `/apple-icon.png`, etc.

## File References

### Game Engine References
- `common.js` loads images from: `/game/assets/images/`
- `common.css` references: `/game/assets/images/mute.png`
- `game.html` loads scripts from: `/game/stats.js`, `/game/common.js`
- `game.html` loads music from: `/game/assets/music/`

### Next.js References
- Components import from: `@/components/`, `@/lib/`
- Public assets: `/images/`, `/icon.svg`, etc.
- Game assets: `/game/assets/...`

## Development Workflow

1. **Frontend Development**: Work in `/app` and `/components`
2. **Game Engine**: Modify files in `/game/`
3. **Utilities**: Add shared logic in `/lib/`
4. **Backend**: Future work in `/backend/`

## Build Output

- Next.js builds to `.next/`
- Static assets served from `/public/`
- Game assets served from `/game/assets/` (via Next.js public serving)

