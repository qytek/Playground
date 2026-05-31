# Level Balance & Items -- Design Spec

**Date:** 2026-05-31
**Status:** approved

## Goal

Make Level 1 easier by shortening the maze, and add items to Level 2 (almond water + flashlight) with dimmer lighting to make the flashlight essential.

## Change 1 -- Level 1: Shorter Maze

**Current:** Exit placed 17 rooms away from start in a random horizontal direction (`maze.js:98-100`).

**Change:** Pick a random direction (left/right) and a random distance in [5, 12]. Replace the hardcoded `17` with `5 + Math.floor(rng(startRx, startRy + 999) * 8)`.

**File:** `js/maze.js`

## Change 2 -- Level 2: Almond Water

**Current:** Item placement is gated by `if (levelType !== 'parking')` at `maze.js:106`, so Level 2 gets zero items.

**Change:** Remove the gate so almond water spawns in Level 2 rooms with the same 20% chance as Level 1.

**File:** `js/maze.js`

## Change 3 -- Level 2: Flashlight Item

**New item type:** `flashlight`. One guaranteed spawn per Level 2 run, placed in a random room between start and exit (not in start or exit rooms).

**Pickup behavior:** When the player walks over the flashlight tile, set `player.hasFlashlight = true`. The flashlight persists for the rest of the level.

**Visual on ground:** A flashlight sprite rendered as a small rectangle with a yellow/gold tint. Use a tinted rectangle if no sprite asset exists.

**Spotlight rendering:** When the player has the flashlight, draw a cone of light in the player's facing direction:
- ~60 degree arc
- ~6 tile range (96px at TILE=16)
- Warm yellow tint (`rgba(255, 240, 200, alpha)`)
- Rendered after the normal fog-of-war pass, so it punches through the darkness
- Drawn as a triangle/wedge from the player position, or approximated with multiple radial gradient slices

**Files:** `js/maze.js` (spawn placement), `js/player.js` (pickup + state), `js/renderer.js` (spotlight rendering), `js/level2.js` (flashlight tile type)

## Change 4 -- Level 2: Dimmer Lighting

**Change:** Make Level 2 ambient lighting significantly darker so the flashlight is necessary:
- Reduce/tighten the radial gradient around the player (smaller inner clear radius, faster falloff)
- Reduce or remove the ambient room light overlays
- The net effect: without the flashlight, the player sees only ~3 tiles around them instead of the current ~7

**File:** `js/renderer.js` (lighting parameters, gated on `currentLevel === 2`)

## Tile Convention Update

Level 2 gets a new tile type:
- `7` = flashlight item (on ground)

## Non-Goals

- No new sprite assets (use colored rectangles if needed)
- No changes to Level 1 lighting or items
- No changes to entity behavior
- No audio changes

## Acceptance Criteria

- Level 1 exit is 5-12 rooms from start (varies per run)
- Level 2 has almond water items (~20% of rooms)
- Level 2 has exactly one flashlight, placed between start and exit
- Picking up flashlight sets `player.hasFlashlight = true`
- Flashlight renders a cone-shaped light in the player's facing direction
- Level 2 is noticeably darker than Level 1 without the flashlight
- All existing functionality (entity, sanity, win/lose) unchanged
