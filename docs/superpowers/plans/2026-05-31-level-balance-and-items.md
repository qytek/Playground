# Level Balance & Items Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Level 1 easier (shorter exit distance), add almond water + flashlight to Level 2, and dim Level 2 lighting so the flashlight matters.

**Architecture:** Four tasks touching 4 files. Tasks 1 and 2 are small/safe maze.js edits. Task 3 adds flashlight state to player. Task 4 is the most complex -- spotlight cone rendering + per-level lighting params in renderer.js. Order matters: Task 4 depends on Task 3 (needs `player.hasFlashlight`).

**Tech Stack:** Vanilla JS (ES6+), HTML5 Canvas

---

### Task 1: Level 1 shorter exit + Level 2 almond water

**Files:**
- Modify: `js/maze.js:98-100` (exit placement)
- Modify: `js/maze.js:105-116` (almond water placement)

- [ ] **Step 1: Change Level 1 exit distance from 17 to random 5-12**

In `js/maze.js`, replace lines 98-100:

```javascript
// OLD (lines 98-100):
    // Exit room: ~17 rooms horizontally left or right of start
    const dir = rng(startRx, startRy) < 0.5 ? -1 : 1;
    exitRx = startRx + dir * 17;
```

With:

```javascript
    // Exit room: random 5-12 rooms horizontally left or right of start
    const dir = rng(startRx, startRy) < 0.5 ? -1 : 1;
    const exitDist = 5 + Math.floor(rng(startRx, startRy + 999) * 8);
    exitRx = startRx + dir * exitDist;
```

- [ ] **Step 2: Remove the parking gate from almond water placement**

In `js/maze.js`, change line 106 from:

```javascript
  if (levelType !== 'parking') {
```

To:

```javascript
  // Place almond water in both levels
```

And remove the closing `}` brace on line 116. The body of the for-loop (lines 107-115) should execute unconditionally.

- [ ] **Step 3: Verify the changes**

Open `index.html` in a browser. Start a new game. Verify:
- Level 1 exit arrow (press Y for debug) points to a room 5-12 away
- Level 2 has almond water bottles visible on the floor (tile 5 rendering, blue-tinted)
- End the Level 1 game (press N to skip levels) to reach Level 2 quickly

- [ ] **Step 4: Commit**

```bash
git add js/maze.js
git commit -m "feat: shorter level 1 exit (5-12 rooms) + almond water in level 2"
```

---

### Task 2: Flashlight item placement and tile rendering

**Files:**
- Modify: `js/maze.js` (spawn logic)
- Modify: `js/level2.js:62-70` (render flashlight tile in exit room area, also handle tile 7)

- [ ] **Step 1: Add flashlight spawn placement in maze.js**

In `js/maze.js`, after the almond water placement loop (after the `if (levelType !== 'parking')` block that we just changed), add:

```javascript
  // Flashlight placement (parking garage only)
  if (levelType === 'parking') {
    // Pick a random room between start and exit (not in start or exit rooms)
    const midX = Math.floor((startRx + exitRx) / 2);
    const midY = Math.floor((startRy + exitRy) / 2);
    // Try rooms near the midpoint until we find a valid one
    for (let attempt = 0; attempt < 50; attempt++) {
      const fx = midX + Math.floor(rng(startRx + 800 + attempt, startRy) * 5) - 2;
      const fy = midY + Math.floor(rng(startRx + 900 + attempt, startRy) * 5) - 2;
      const fk = rkey(fx, fy);
      if (fx >= 0 && fx < MAP_ROOMS && fy >= 0 && fy < MAP_ROOMS &&
          roomTypes[fk] !== 'start' && roomTypes[fk] !== 'exit' && !roomItems[fk]) {
        roomItems[fk] = { type: 'flashlight', picked: false };
        break;
      }
    }
  }
```

- [ ] **Step 2: Render flashlight tile in level2.js**

In `js/level2.js`, add a case for tile 7 in the `generateParkingRoomTiles` function. After the elevator exit block (after line 70, the closing `}` of `if (rtype === 'exit')`), add:

```javascript
  // Flashlight item
  if (roomItems[key] && !roomItems[key].picked && roomItems[key].type === 'flashlight') {
    tiles[mid][mid - 1] = 7;
  }
```

Also, add the flashlight tile rendering in `js/renderer.js`. In the `drawParkingRoom` function, add a case for tile 7. Find the tile switch block (around lines 158-248 in renderer.js). After the tile 6 case (`} else if (tile === 6) {` block), add:

```javascript
      } else if (tile === 7) {
        // Flashlight item on ground
        ctx.fillStyle = C_CONCRETE;
        ctx.fillRect(Math.floor(sx2), Math.floor(sy2), TILE, TILE);
        // Draw a small flashlight shape
        const fx = Math.floor(sx2 + TILE/2);
        const fy = Math.floor(sy2 + TILE/2);
        // Body
        ctx.fillStyle = '#444';
        ctx.fillRect(fx - 2, fy - 3, 8, 5);
        // Head
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(fx + 6, fy - 2, 3, 3);
        // Glow
        const pulse = 0.5 + 0.5 * Math.sin(frameCount * 0.04);
        ctx.fillStyle = `rgba(255,215,0,${0.2 + pulse * 0.15})`;
        ctx.fillRect(fx + 5, fy - 3, 5, 5);
```

- [ ] **Step 3: Verify**

Open the game, use N to skip to Level 2, explore rooms. One room should have a small golden flashlight on the floor. Almond water bottles should also appear. Use Y for debug mode to help navigate.

- [ ] **Step 4: Commit**

```bash
git add js/maze.js js/level2.js js/renderer.js
git commit -m "feat: add flashlight item placement and tile rendering in level 2"
```

---

### Task 3: Flashlight pickup logic

**Files:**
- Modify: `js/player.js:97-107` (item pickup section)

- [ ] **Step 1: Add flashlight pickup detection**

In `js/player.js`, find the almond water pickup block (lines 97-107). Add flashlight pickup logic right after the almond water block. Add this code after line 107 (after the closing `}` of the almond water if-block):

```javascript
  // Pick up flashlight on contact (auto)
  const itemKey2 = rkey(prx2, pry2);
  const item2 = roomItems[itemKey2];
  if (item2 && !item2.picked && item2.type === 'flashlight') {
    item2.picked = true;
    delete visitedRooms[itemKey2];
    p.hasFlashlight = true;
    showMessage('你捡起了一个手电筒！', 2.5);
  }
```

- [ ] **Step 2: Initialize hasFlashlight in createPlayer**

In `js/player.js`, in the `createPlayer` function (lines 2-14), add `hasFlashlight: false` to the returned object:

```javascript
function createPlayer(wx, wy) {
  return {
    x: wx, y: wy,
    vx: 0, vy: 0,
    speed: 1.5,
    sanity: 100,
    stamina: 100,
    facing: 0,
    footstepAccum: 0,
    animFrame: 0,
    animTimer: 0,
    hasFlashlight: false,
  };
}
```

- [ ] **Step 3: Verify**

Open the game, skip to Level 2 (press N in Level 1). Walk over the flashlight tile. The message "你捡起了一个手电筒！" should appear. The flashlight should disappear from the floor.

- [ ] **Step 4: Commit**

```bash
git add js/player.js
git commit -m "feat: add flashlight pickup logic"
```

---

### Task 4: Spotlight rendering + dimmer Level 2 lighting

**Files:**
- Modify: `js/renderer.js:320-377` (lighting function)

- [ ] **Step 1: Make Level 2 ambient lighting dimmer**

In `js/renderer.js`, find the `drawLighting` function (line 320). Modify the radial gradient parameters to be tighter for Level 2. Change lines 326-329 from:

```javascript
  const gradient = ctx.createRadialGradient(px, py, lightRadius * 0.2, px, py, lightRadius);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.45, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.75, 'rgba(0,0,0,0.55)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.90)');
```

To:

```javascript
  // Tighter fog on level 2
  const innerStop = currentLevel === 2 ? 0.15 : 0.2;
  const midStop = currentLevel === 2 ? 0.3 : 0.45;
  const outerStop = currentLevel === 2 ? 0.55 : 0.75;
  const outerAlpha = currentLevel === 2 ? 0.92 : 0.90;
  const gradient = ctx.createRadialGradient(px, py, lightRadius * innerStop, px, py, lightRadius);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(midStop, 'rgba(0,0,0,0)');
  gradient.addColorStop(outerStop, `rgba(0,0,0,0.65)`);
  gradient.addColorStop(1, `rgba(0,0,0,${outerAlpha})`);
```

- [ ] **Step 2: Reduce Level 2 ambient room lights**

In the `drawLighting` function, find the room light overlay section (lines 336-357). Change the ambient light alpha for Level 2. Modify line 346:

```javascript
      let alpha = currentLevel === 2 ? 0.04 : 0.08;
```

Change to:

```javascript
      let alpha = currentLevel === 2 ? 0.02 : 0.08;
```

- [ ] **Step 3: Add flashlight spotlight rendering**

At the end of the `drawLighting` function (before the closing `}` on line 377), add the flashlight spotlight code:

```javascript
  // Flashlight spotlight (Level 2)
  if (currentLevel === 2 && player && player.hasFlashlight) {
    const fx = px;
    const fy = py;
    const angle = player.facing;
    const coneLength = TILE * 6;  // 6 tile range
    const coneHalfAngle = Math.PI / 6;  // 30 degrees (60 degree cone)
    const steps = 12;

    ctx.save();
    // Draw cone as a series of translucent triangles
    for (let i = 0; i < steps; i++) {
      const t0 = i / steps;
      const t1 = (i + 1) / steps;
      const a0 = angle - coneHalfAngle + t0 * coneHalfAngle * 2;
      const a1 = angle - coneHalfAngle + t1 * coneHalfAngle * 2;
      const r0 = coneLength * (0.3 + 0.7 * t0);
      const r1 = coneLength * (0.3 + 0.7 * t1);

      const alpha = 0.12 - (t0 + t1) / 2 * 0.06;  // brighter near player, fades out

      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx + Math.cos(a0) * r0, fy + Math.sin(a0) * r0);
      ctx.lineTo(fx + Math.cos(a1) * r1, fy + Math.sin(a1) * r1);
      ctx.closePath();
      ctx.fillStyle = `rgba(255,240,200,${alpha})`;
      ctx.fill();
    }

    // Hot spot at center
    const hotGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, TILE * 2);
    hotGrad.addColorStop(0, 'rgba(255,250,220,0.15)');
    hotGrad.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = hotGrad;
    ctx.fillRect(fx - TILE * 2, fy - TILE * 2, TILE * 4, TILE * 4);

    ctx.restore();
  }
```

- [ ] **Step 4: Verify in browser**

Open the game. Level 1 lighting should be unchanged. Skip to Level 2 (press N). Before picking up the flashlight, the level should be noticeably darker (only ~3 tiles visible). Find and pick up the flashlight. A warm cone of light should project in the player's facing direction. Turn with WASD to see the cone rotate. The effect should look like a flashlight beam cutting through darkness.

- [ ] **Step 5: Commit**

```bash
git add js/renderer.js
git commit -m "feat: add flashlight spotlight and dimmer level 2 lighting"
```
