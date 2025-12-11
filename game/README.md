# Game Engine

This directory contains the racing game engine code.

## Files

- `game.html` - Original game HTML (reference)
- `common.js` - Game engine core (DOM helpers, utilities, rendering)
- `common.css` - Game styles
- `stats.js` - FPS counter utility
- `assets/` - Game assets (images, sprites, music)

## Integration

The game engine is integrated into the Next.js app via:
- `components/GameCanvas.tsx` - React wrapper component
- `lib/gameEngine.ts` - Game engine wrapper (to be created)

## Assets Path

Assets are located at `/game/assets/` and should be referenced as:
- Images: `/game/assets/images/`
- Music: `/game/assets/music/`
- Sprites: `/game/assets/sprites/`

