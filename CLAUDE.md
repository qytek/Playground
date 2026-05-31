# Backrooms -- Pixel Horror Game

2D pixel-art Backrooms-style horror game. Explore procedurally generated mazes, avoid the entity, find the exit. Two levels: classic Backrooms (mono-yellow wallpaper) and Parking Garage.

## Tech Stack

- Vanilla JS (ES6+), HTML5 Canvas, CSS3
- Zero dependencies, no bundler, no TypeScript
- Scripts loaded via `<script>` tags in load order (see below)
- Web Audio API for sound

## Project Structure

| File | Role |
|------|------|
| `js/config.js` | Constants, internal resolution, level configs (LEVEL1/LEVEL2), `applyLevelConfig()` |
| `js/utils.js` | Shared helpers: `hash`, `rng`, `dist`, `lerp`, `clamp`, `rkey`, `worldToRoom`, `roomToWorld`, `getTile`, `isSolid`, `shuffle` |
| `js/input.js` | Keyboard + touch input, populates global `keys` object |
| `js/audio.js` | Web Audio API manager: drone, hum, footsteps, heartbeat, entity growls |
| `js/maze.js` | Procedural maze via recursive backtracker on `MAP_ROOMS x MAP_ROOMS` grid. Manages `roomGraph`, `roomTypes`, `visitedRooms`, `roomItems` |
| `js/player.js` | `createPlayer()`, `updatePlayer()` -- movement, AABB collision, sanity/stamina, auto-pickup almond water, exit/entity collision |
| `js/entity.js` | Entity AI: BFS pathfinding through `roomGraph`, line-of-sight checks, speed modulation when observed |
| `js/renderer.js` | Canvas rendering: tile-based rooms, two level renderers (Backrooms + Parking), cars, fog-of-war lighting, player/entity sprites, HUD, screen shake, VHS scanlines, chromatic aberration |
| `js/level1.js` | Backrooms room template generator (`generateBackroomsRoomTiles`): walls, doorways, floor, exit tiles, almond water items |
| `js/level2.js` | Parking Garage room template generator (`generateParkingRoomTiles`): concrete walls, wide doorways, fluorescent lights, elevator exit, parking lines, car placement |
| `js/level-manager.js` | Global state (`gameState`, `player`, `entity`, `currentLevel`), `startGame()`, `transitionToLevel()`, `endGame()` |
| `js/main.js` | Canvas setup, resize handler, game loop (`requestAnimationFrame` with dt cap), initialization |
| `index.html` | Entry point, UI markup (title screen, HUD, touch controls), script load order |
| `css/style.css` | Styling for UI overlay, touch controls, HUD bars |

**Load order is significant** (no module system): `config.js` -> `utils.js` -> `input.js` -> `audio.js` -> `maze.js` -> `player.js` -> `entity.js` -> `renderer.js` -> `level1.js` -> `level2.js` -> `level-manager.js` -> `main.js`

## Architecture

**Game loop:** `requestAnimationFrame` with delta-time capped to [0.016, 0.1] seconds. Movement normalized via `dt * 60` multiplier.

**Global state:** All modules communicate through globals:
- `gameState`: `'title'` | `'playing'` | `'win'` | `'dead'` | `'levelComplete'`
- `player`, `entity` -- plain objects from `createPlayer()` / `createEntity()`
- `currentLevel`: `1` or `2`
- `keys` -- keyboard state map populated by `input.js`
- Tile/size globals: `TILE`, `ROOM_TILES`, `ROOM_PX`, `MAP_ROOMS`, `VISION_RADIUS` -- reassigned per level by `applyLevelConfig()`
- `generateRoomTiles` -- function pointer swapped per level (`generateBackroomsRoomTiles` or `generateParkingRoomTiles`)

**Level system:** `transitionToLevel()` calls `applyLevelConfig()` to swap tile/size globals, reassigns `generateRoomTiles`, runs `generateMaze()` to rebuild the world, places player/entity at new positions.

**Renderer:** Single canvas at 480x320 internal resolution. Camera follows player. Rooms drawn sorted by Y for depth. Fog of war via radial gradient centered on player. Room lights applied as ambient overlays. Low-sanity effects: red vignette, chromatic aberration.

**Tile convention:** `1` = wall, `2` = doorway, `3` = light/ceiling, `4` = exit, `5` = item/line, `6` = car (level 2 only), `0`/other = floor

## How to Run

Open `index.html` directly in a browser. No build step, no dev server required. For a local server: `npx serve .`

## Key Systems

**Maze generation (`js/maze.js`):** Recursive backtracker on a grid of rooms. Each room has 4 possible door directions. Special room types: `start`, `exit`, `dark`, `flicker`, `car` (level 2). Room tiles generated on first visit and cached in `visitedRooms`.

**Player (`js/player.js`):** Free-form pixel movement with AABB collision against wall tiles and cars. Sanity drains in dark rooms and near the entity. Stamina depletes while sprinting, regenerates while idle. Auto-picks up almond water on contact (+30 sanity). Die on entity contact or sanity reaching 0.

**Entity AI (`js/entity.js`):** BFS pathfinding through `roomGraph` to player's room. Moves slowly when player has line-of-sight, full speed otherwise. Emits growl sounds when close. Heartbeat audio and screen shake at close range.

**Audio (`js/audio.js`):** Web Audio API with `AudioContext`. Procedural noise for ambient drone and fluorescent hum. One-shot samples for footsteps (pitch-randomized), heartbeat, entity growls, death, exit jingle.

**Fog of war (`js/renderer.js`):** `drawLighting()` creates a radial gradient mask centered on the player. Unvisited rooms render dark. Room lights add warm ambient glow. Flicker rooms use per-frame sine waves for light instability.

**Touch controls:** D-pad (4 directional buttons) + run button. Visible/hidden via CSS media queries. Maps to the same `keys` object as keyboard input.

## Conventions

- `const` for constant bindings, `let` for mutable state
- Chinese strings for in-game UI messages
- File header comments: `// ============ NAME ============`
- Functions hoisted for cross-file calls (no modules)
- Delta-time normalized: multiply by `dt * 60` for 60fps-equivalent movement
- Object pooling not used; entities/player are plain objects replaced on level transition

## Future Directions

- Add a lightweight bundler (esbuild) for minification and ES module support
- Optional TypeScript migration, one file at a time
- New level ideas: Poolrooms, Pipe Dreams
- Mobile layout polish
- LocalStorage save system (player position, visited rooms, inventory)
