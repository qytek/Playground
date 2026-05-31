# CLAUDE.md Cleanup -- Design Spec

**Date:** 2026-05-31
**Status:** approved

## Goal

Replace the current CLAUDE.md (a stale Phaser/TypeScript rewrite plan) with a document that accurately describes the existing vanilla JS codebase, plus a short "Future Directions" section for incremental improvements.

## Current State

- CLAUDE.md is untracked, never committed
- Content describes a full rewrite to Vite + TypeScript + Phaser that is no longer planned
- Uses non-ASCII characters (em-dashes, curly quotes) throughout
- Verbose with step-by-step commit plan meant for a human, not AI context

## Target State

CLAUDE.md structured in 8 sections:

### 1. Project Overview
One-paragraph summary: 2D pixel-art Backrooms horror game, two levels (Backrooms + Parking Garage), core loop of maze exploration, entity avoidance, exit finding.

### 2. Tech Stack
Vanilla JS (ES5+), HTML5 Canvas, CSS3. Zero dependencies, no bundler, no TypeScript. Scripts loaded via `<script>` tags in `index.html`.

### 3. Project Structure
Table of all source files with role and load order:
- `js/config.js` -- constants, level configs, `applyLevelConfig()`
- `js/utils.js` -- shared helpers (`dist`, `rkey`, `isSolid`, tile lookups)
- `js/input.js` -- keyboard + touch input, `keys` map
- `js/audio.js` -- Web Audio API manager
- `js/maze.js` -- procedural maze (recursive backtracker), room graph
- `js/player.js` -- `createPlayer()`, `updatePlayer()`
- `js/entity.js` -- entity AI, `createEntity()`, `updateEntity()`
- `js/renderer.js` -- canvas rendering, fog of war, screen shake
- `js/level1.js` -- Backrooms room templates (mono-yellow wallpaper)
- `js/level2.js` -- Parking Garage room templates (cars, concrete)
- `js/level-manager.js` -- global state, `startGame()`, `transitionToLevel()`, `endGame()`
- `js/main.js` -- game loop, init, boot

Also `css/style.css`, `img/` assets, `index.html`.

### 4. Architecture
- **Game loop:** `requestAnimationFrame` with delta-time capping (0.016--0.1s)
- **Global state:** `gameState` ('title'|'playing'|'win'|'dead'|'levelComplete'), `player`, `entity`, `camera`, `currentLevel`
- **Module pattern:** Plain JS files with global variables. Dependency order managed by script tag order.
- **Level system:** `applyLevelConfig()` swaps TILE/ROOM_TILES/MAP_ROOMS/VISION_RADIUS, then `generateMaze()` rebuilds the world.
- **Rendering:** Single canvas, fog-of-war via distance check from player, screen shake via `ctx.translate()` offset.

### 5. How to Run
Open `index.html` directly in a browser, or `npx serve .` for a local dev server. No build step.

### 6. Key Systems
- **Maze:** Recursive backtracker on a `MAP_ROOMS x MAP_ROOMS` grid. Rooms have 4 doors. Special room types: start, exit, dark, flicker, car.
- **Player:** Free-form pixel movement, AABB collision against solid tiles, sanity/stamina bars, auto-pickup almond water on contact.
- **Entity:** Pathfinds toward player room-by-room, growls when close, drains sanity on proximity.
- **Renderer:** Raycasting-based tile visibility, fog of war (unvisited rooms dark), screen shake on entity proximity.
- **Audio:** Web Audio API with procedural noise generation for drone/hum, one-shot samples for footsteps/heartbeat.
- **Touch controls:** D-pad + run button, visible only on touch devices.

### 7. Conventions
- `const`-heavy, `let` for mutable state
- Chinese strings for in-game UI messages
- File header comment blocks (`// ============ NAME ============`)
- Globals for shared state, function hoisting for cross-file calls
- Delta-time multiplier `dt * 60` to normalize movement to 60fps

### 8. Future Directions
Incremental improvements (not rewrites):
- Add a lightweight bundler (e.g., esbuild) for minification and ES module support
- Optional TypeScript migration, one file at a time
- New level ideas (Poolrooms, Pipe Dreams)
- Mobile layout polish
- LocalStorage save system

## Non-Goals

- Reformatting or refactoring the JS source files
- Adding new features as part of this change
- Committing anything beyond CLAUDE.md and the design doc

## Acceptance Criteria

- CLAUDE.md accurately reflects the current vanilla JS codebase
- No stale Phaser/TypeScript rewrite content
- Uses straight ASCII quotes and hyphens
- Concise -- under 150 lines total
- Committed to the repository
