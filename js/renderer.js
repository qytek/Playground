// ============ RENDERER ============

// Backrooms color palette
const C_FLOOR = '#b8973e';
const C_FLOOR_DARK = '#9a7d32';
const C_WALL = '#d4b860';
const C_WALL_DARK = '#a89040';
const C_WALL_TRIM = '#8b7030';
const C_CARPET_WET = '#7a6028';
const C_LIGHT_ON = '#fffaee';
const C_LIGHT_OFF = '#3a3020';
const C_DOORWAY = '#5a4a28';
const C_EXIT_GLOW = '#aaddff';

// Parking garage color palette
const C_CONCRETE = '#999';
const C_CONCRETE_DARK = '#777';
const C_CONCRETE_WALL = '#666';
const C_CONCRETE_WALL_DARK = '#444';
const C_PARKING_LINE = '#ddd';
const C_ELEVATOR_DOOR = '#556';
const C_ELEVATOR_GLOW = '#88ccff';

// === SPRITE SHEET ===
let spriteSheet = null;
let spriteFW = 0, spriteFH = 0;
const SPRITE_COLS = 3;
const SPRITE_ROWS = 3;
const SPRITE_DRAW_SIZE = 24;

(function preloadSprite() {
  spriteSheet = new Image();
  spriteSheet.onload = () => {
    spriteFW = spriteSheet.width / SPRITE_COLS;
    spriteFH = spriteSheet.height / SPRITE_ROWS;
  };
  spriteSheet.src = 'img/banana/walk.png';
})();

// Almond water bottle
let almondBottleImg = null;
(function preloadAlmondBottle() {
  almondBottleImg = new Image();
  almondBottleImg.src = 'img/almond_bottle.png';
})();

// Debug mode — toggle with Y key
let debugMode = false;

const C_PLAYER = '#dde';
const C_ENTITY = '#111';
const C_ENTITY_EYE = '#f44';

// Car colors for parking garage
const CAR_COLORS = ['#e74c3c', '#3498db', '#f1c40f', '#2ecc71', '#e67e22', '#ecf0f1', '#1abc9c', '#9b59b6', '#2c3e50'];

// ============ BACKROOMS ROOM DRAWING ============
function drawBackroomsRoom(rx, ry, offsetX, offsetY) {
  const sx = rx * ROOM_PX;
  const sy = ry * ROOM_PX;
  for (let ty = 0; ty < ROOM_TILES; ty++) {
    for (let tx = 0; tx < ROOM_TILES; tx++) {
      const wx = sx + tx * TILE;
      const wy = sy + ty * TILE;
      const sx2 = wx - offsetX;
      const sy2 = wy - offsetY;

      if (sx2 < -TILE || sx2 > INTERNAL_W + TILE || sy2 < -TILE || sy2 > INTERNAL_H + TILE) continue;

      const tiles = generateRoomTiles(rx, ry);
      const tile = tiles[ty][tx];

      if (tile === 1) {
        const isEdge = (tx === 0 || tx === ROOM_TILES - 1 || ty === 0 || ty === ROOM_TILES - 1);
        ctx.fillStyle = isEdge ? C_WALL_DARK : C_WALL;
        ctx.fillRect(Math.floor(sx2), Math.floor(sy2), TILE, TILE);

        if (ty === ROOM_TILES - 1 || (ty > 0 && tiles[ty+1] && tiles[ty+1][tx] === 0)) {
          ctx.fillStyle = C_WALL_TRIM;
          ctx.fillRect(Math.floor(sx2), Math.floor(sy2) + TILE - 3, TILE, 3);
        }

        if ((tx + ty) % 3 === 0 && tile === 1) {
          ctx.fillStyle = 'rgba(0,0,0,0.08)';
          ctx.fillRect(Math.floor(sx2), Math.floor(sy2), TILE, 1);
        }

      } else if (tile === 2) {
        ctx.fillStyle = C_DOORWAY;
        ctx.fillRect(Math.floor(sx2), Math.floor(sy2), TILE, TILE);

      } else if (tile === 3) {
        const rtype = roomTypes[rkey(rx, ry)] || 'normal';
        const lightOn = (rtype !== 'dark');
        ctx.fillStyle = C_FLOOR;
        ctx.fillRect(Math.floor(sx2), Math.floor(sy2), TILE, TILE);
        if (lightOn) {
          ctx.fillStyle = 'rgba(255,250,238,0.15)';
          ctx.fillRect(Math.floor(sx2 + 3), Math.floor(sy2 + 3), TILE - 6, TILE - 6);
        }

      } else if (tile === 4) {
        ctx.fillStyle = C_FLOOR;
        ctx.fillRect(Math.floor(sx2), Math.floor(sy2), TILE, TILE);
        const pulse = 0.5 + 0.5 * Math.sin(frameCount * 0.05);
        ctx.fillStyle = `rgba(150,220,255,${0.3 + pulse * 0.4})`;
        ctx.fillRect(Math.floor(sx2 + 1), Math.floor(sy2 + 1), TILE - 2, TILE - 2);
        for (let i = 0; i < 3; i++) {
          const px = sx2 + TILE/2 + Math.sin(frameCount * 0.04 + i) * TILE/2;
          const py = sy2 + TILE/2 + Math.cos(frameCount * 0.04 + i) * TILE/2;
          ctx.fillStyle = `rgba(200,240,255,${0.5 + pulse * 0.3})`;
          ctx.fillRect(Math.floor(px), Math.floor(py), 2, 2);
        }

      } else if (tile === 5) {
        ctx.fillStyle = C_FLOOR;
        ctx.fillRect(Math.floor(sx2), Math.floor(sy2), TILE, TILE);
        if (almondBottleImg && almondBottleImg.complete) {
          ctx.drawImage(almondBottleImg, Math.floor(sx2 + 3), Math.floor(sy2 + 1), 10, 12);
        }
        const pulse2 = 0.5 + 0.5 * Math.sin(frameCount * 0.04);
        ctx.fillStyle = `rgba(150,200,240,${0.15 + pulse2 * 0.1})`;
        ctx.fillRect(Math.floor(sx2 + 3), Math.floor(sy2 + 1), 10, 12);

      } else {
        const v = hash(rx * 100 + tx, ry * 100 + ty) % 100;
        const shade = v < 15 ? C_FLOOR_DARK : v < 18 ? C_CARPET_WET : C_FLOOR;
        ctx.fillStyle = shade;
        ctx.fillRect(Math.floor(sx2), Math.floor(sy2), TILE, TILE);

        if (tx % 2 === 0 || ty % 2 === 0) {
          ctx.fillStyle = 'rgba(0,0,0,0.04)';
          if (tx % 2 === 0) ctx.fillRect(Math.floor(sx2), Math.floor(sy2), 1, TILE);
          if (ty % 2 === 0) ctx.fillRect(Math.floor(sx2), Math.floor(sy2), TILE, 1);
        }
      }
    }
  }
}

// ============ PARKING GARAGE ROOM DRAWING ============
function drawParkingRoom(rx, ry, offsetX, offsetY) {
  const sx = rx * ROOM_PX;
  const sy = ry * ROOM_PX;
  const tiles = generateRoomTiles(rx, ry);
  const rtype = roomTypes[rkey(rx, ry)] || 'normal';

  for (let ty = 0; ty < ROOM_TILES; ty++) {
    for (let tx = 0; tx < ROOM_TILES; tx++) {
      const wx = sx + tx * TILE;
      const wy = sy + ty * TILE;
      const sx2 = wx - offsetX;
      const sy2 = wy - offsetY;

      if (sx2 < -TILE || sx2 > INTERNAL_W + TILE || sy2 < -TILE || sy2 > INTERNAL_H + TILE) continue;

      const tile = tiles[ty][tx];

      if (tile === 1) {
        // Concrete wall
        const isEdge = (tx === 0 || tx === ROOM_TILES - 1 || ty === 0 || ty === ROOM_TILES - 1);
        ctx.fillStyle = isEdge ? C_CONCRETE_WALL_DARK : C_CONCRETE_WALL;
        ctx.fillRect(Math.floor(sx2), Math.floor(sy2), TILE, TILE);
        // Subtle concrete texture
        if ((tx + ty * 3) % 5 === 0) {
          ctx.fillStyle = 'rgba(0,0,0,0.06)';
          ctx.fillRect(Math.floor(sx2), Math.floor(sy2), TILE, 1);
        }

      } else if (tile === 2) {
        // Wide doorway — dark opening
        ctx.fillStyle = '#222';
        ctx.fillRect(Math.floor(sx2), Math.floor(sy2), TILE, TILE);

      } else if (tile === 3) {
        // Fluorescent light panel
        ctx.fillStyle = C_CONCRETE;
        ctx.fillRect(Math.floor(sx2), Math.floor(sy2), TILE, TILE);
        const flicker = rtype === 'flicker'
          ? (Math.sin(frameCount * 0.3 + hash(rx, ry)) * 0.5 + 0.5) * (Math.sin(frameCount * 1.7 + hash(rx + 50, ry)) > 0.85 ? 0 : 1)
          : 1;
        ctx.fillStyle = `rgba(220,240,255,${0.25 * flicker})`;
        ctx.fillRect(Math.floor(sx2 + 1), Math.floor(sy2 + 1), TILE - 2, TILE - 2);
        // Light tube
        ctx.fillStyle = `rgba(255,255,255,${0.4 * flicker})`;
        ctx.fillRect(Math.floor(sx2 + 0), Math.floor(sy2 + TILE/2 - 1), TILE, 2);

      } else if (tile === 4) {
        // Elevator — metallic doors with glow
        // Floor underneath
        ctx.fillStyle = C_CONCRETE;
        ctx.fillRect(Math.floor(sx2), Math.floor(sy2), TILE, TILE);

        // Elevator doors (center-split sliding doors)
        const pulse = 0.5 + 0.5 * Math.sin(frameCount * 0.04);
        ctx.fillStyle = C_ELEVATOR_DOOR;
        ctx.fillRect(Math.floor(sx2 + 1), Math.floor(sy2 + 0), TILE/2 - 1, TILE);
        ctx.fillStyle = '#778';
        ctx.fillRect(Math.floor(sx2 + TILE/2 + 1), Math.floor(sy2 + 0), TILE/2 - 1, TILE);

        // Door gap glow
        ctx.fillStyle = `rgba(130,200,255,${0.4 + pulse * 0.3})`;
        ctx.fillRect(Math.floor(sx2 + TILE/2 - 0.5), Math.floor(sy2 + 0), 1, TILE);

        // Up arrow indicator
        ctx.fillStyle = `rgba(130,200,255,${0.6 + pulse * 0.3})`;
        ctx.fillRect(Math.floor(sx2 + TILE/2 - 2), Math.floor(sy2 + 2), 4, 1);
        ctx.fillRect(Math.floor(sx2 + TILE/2 - 1), Math.floor(sy2 + 1), 2, 2);

        // Particles around elevator
        for (let i = 0; i < 2; i++) {
          const px = sx2 + TILE/2 + Math.sin(frameCount * 0.03 + i) * TILE;
          const py = sy2 + TILE/2 + Math.cos(frameCount * 0.03 + i) * TILE;
          ctx.fillStyle = `rgba(150,220,255,${0.3 + pulse * 0.2})`;
          ctx.fillRect(Math.floor(px), Math.floor(py), 1, 1);
        }

      } else if (tile === 5) {
        // Parking space line marker
        ctx.fillStyle = C_CONCRETE;
        ctx.fillRect(Math.floor(sx2), Math.floor(sy2), TILE, TILE);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(Math.floor(sx2), Math.floor(sy2), TILE, TILE);
        // Dashed line
        if (ty % 2 === 0) {
          ctx.fillStyle = C_CONCRETE;
          ctx.fillRect(Math.floor(sx2 + 2), Math.floor(sy2), TILE - 4, TILE);
        }

      } else if (tile === 6) {
        // Car — drawn here as fallback, but main car rendering is per-car data
        ctx.fillStyle = C_CONCRETE;
        ctx.fillRect(Math.floor(sx2), Math.floor(sy2), TILE, TILE);

      } else if (tile === 7) {
        // Flashlight item on ground
        ctx.fillStyle = C_CONCRETE;
        ctx.fillRect(Math.floor(sx2), Math.floor(sy2), TILE, TILE);
        // Draw a small flashlight shape (shifted left to fit within tile)
        const fx = Math.floor(sx2 + TILE/2) - 2;
        const fy = Math.floor(sy2 + TILE/2);
        // Body
        ctx.fillStyle = '#444';
        ctx.fillRect(fx - 1, fy - 3, 7, 5);
        // Head
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(fx + 6, fy - 2, 3, 3);
        // Glow
        const pulse = 0.5 + 0.5 * Math.sin(frameCount * 0.04);
        ctx.fillStyle = `rgba(255,215,0,${0.2 + pulse * 0.15})`;
        ctx.fillRect(fx + 5, fy - 3, 5, 5);

      } else if (tile === 8) {
        // Almond water bottle on concrete
        ctx.fillStyle = C_CONCRETE;
        ctx.fillRect(Math.floor(sx2), Math.floor(sy2), TILE, TILE);
        if (almondBottleImg && almondBottleImg.complete && almondBottleImg.naturalWidth > 0) {
          ctx.drawImage(almondBottleImg, Math.floor(sx2 + 3), Math.floor(sy2 + 1), 10, 12);
        } else {
          // Fallback: blue bottle shape
          ctx.fillStyle = '#5599cc';
          ctx.fillRect(Math.floor(sx2 + 4), Math.floor(sy2 + 2), 6, 9);
          ctx.fillStyle = '#3377aa';
          ctx.fillRect(Math.floor(sx2 + 5), Math.floor(sy2 + 3), 4, 2);
        }
        const pulse2 = 0.5 + 0.5 * Math.sin(frameCount * 0.04);
        ctx.fillStyle = `rgba(150,200,240,${0.2 + pulse2 * 0.15})`;
        ctx.fillRect(Math.floor(sx2 + 3), Math.floor(sy2 + 1), 10, 12);

      } else {
        // Concrete floor with subtle variation
        const v = hash(rx * 100 + tx, ry * 100 + ty) % 100;
        const shade = v < 10 ? C_CONCRETE_DARK : v < 13 ? '#888' : C_CONCRETE;
        ctx.fillStyle = shade;
        ctx.fillRect(Math.floor(sx2), Math.floor(sy2), TILE, TILE);

        // Subtle expansion joints
        if (tx === 0 || ty === 0) {
          ctx.fillStyle = 'rgba(0,0,0,0.1)';
          if (tx === 0) ctx.fillRect(Math.floor(sx2), Math.floor(sy2), 1, TILE);
          if (ty === 0) ctx.fillRect(Math.floor(sx2), Math.floor(sy2), TILE, 1);
        }
      }
    }
  }

  // Draw cars for this room (if any)
  drawCarsInRoom(rx, ry, sx, sy, offsetX, offsetY);
}

// ============ CAR RENDERING ============
function drawCarsInRoom(rx, ry, roomSX, roomSY, offsetX, offsetY) {
  const rk = rkey(rx, ry);
  const cars = carData[rk];
  if (!cars) return;

  const rtype = roomTypes[rk] || 'normal';

  for (const car of cars) {
    const cx = roomSX + car.tx * TILE;
    const cy = roomSY + car.ty * TILE;
    const sx2 = cx - offsetX;
    const sy2 = cy - offsetY;

    if (sx2 < -TILE * 5 || sx2 > INTERNAL_W + TILE * 5 || sy2 < -TILE * 5 || sy2 > INTERNAL_H + TILE * 5) continue;

    // Car body
    const cw = car.w * TILE;
    const ch = car.h * TILE;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(Math.floor(sx2 + 2), Math.floor(sy2 + 2), cw, ch);

    // Car body
    ctx.fillStyle = car.color;
    ctx.fillRect(Math.floor(sx2), Math.floor(sy2), cw, ch);

    // Darker shade for sides (3D-ish)
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(Math.floor(sx2), Math.floor(sy2 + ch - 4), cw, 4);

    // Windshield
    ctx.fillStyle = 'rgba(150,200,240,0.6)';
    ctx.fillRect(Math.floor(sx2 + 2), Math.floor(sy2 + 2), cw - 4, 4);

    // Rear window
    ctx.fillStyle = 'rgba(150,200,240,0.4)';
    ctx.fillRect(Math.floor(sx2 + 2), Math.floor(sy2 + ch - 8), cw - 4, 3);

    // Wheels
    ctx.fillStyle = '#111';
    ctx.fillRect(Math.floor(sx2 - 1), Math.floor(sy2 + 2), 2, 4);
    ctx.fillRect(Math.floor(sx2 + cw - 1), Math.floor(sy2 + 2), 2, 4);
    ctx.fillRect(Math.floor(sx2 - 1), Math.floor(sy2 + ch - 6), 2, 4);
    ctx.fillRect(Math.floor(sx2 + cw - 1), Math.floor(sy2 + ch - 6), 2, 4);

    // Headlights (glow in dark settings)
    ctx.fillStyle = 'rgba(255,250,200,0.6)';
    ctx.fillRect(Math.floor(sx2), Math.floor(sy2 + 1), 2, 2);
    ctx.fillRect(Math.floor(sx2 + cw - 2), Math.floor(sy2 + ch - 3), 2, 2);
  }
}

// ============ GENERIC ROOM DRAWING DISPATCH ============
function drawFloorPattern(rx, ry, offsetX, offsetY) {
  if (currentLevel === 1) {
    drawBackroomsRoom(rx, ry, offsetX, offsetY);
  } else if (currentLevel === 2) {
    drawParkingRoom(rx, ry, offsetX, offsetY);
  }
}

// ============ LIGHTING ============
function drawLighting(offsetX, offsetY) {
  const p = player;
  const px = p.x - offsetX;
  const py = p.y - offsetY;
  const lightRadius = TILE * VISION_RADIUS;

  // Tighter fog on level 2
  if (currentLevel === 2) {
    // Full-screen dark fog first (very dim without flashlight)
    if (frameCount % 60 === 0) console.log('[lighting] fog radius:', (lightRadius * 0.5).toFixed(0), 'cone length:', (TILE * VISION_RADIUS * 2).toFixed(0));
    const fogGrad = ctx.createRadialGradient(px, py, 0, px, py, lightRadius * 0.5);
    fogGrad.addColorStop(0, 'rgba(0,0,0,0.85)');
    fogGrad.addColorStop(0.25, 'rgba(0,0,0,0.9)');
    fogGrad.addColorStop(0.5, 'rgba(0,0,0,0.95)');
    fogGrad.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, 0, INTERNAL_W, INTERNAL_H);

    // Smooth cone light on top (only with flashlight) — redraw lighter fog inside cone
    if (player && player.hasFlashlight) {
      const angle = player.facing;
      const coneLength = TILE * VISION_RADIUS * 2;
      const halfAngle = Math.PI / 5;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(
        px + Math.cos(angle - halfAngle) * coneLength,
        py + Math.sin(angle - halfAngle) * coneLength
      );
      ctx.lineTo(
        px + Math.cos(angle + halfAngle) * coneLength,
        py + Math.sin(angle + halfAngle) * coneLength
      );
      ctx.closePath();
      ctx.clip();

      // Replace dark fog with much lighter values — cone punches through darkness
      const coneGrad = ctx.createRadialGradient(px, py, 0, px, py, coneLength);
      coneGrad.addColorStop(0, 'rgba(0,0,0,0.02)');
      coneGrad.addColorStop(0.3, 'rgba(0,0,0,0.04)');
      coneGrad.addColorStop(0.5, 'rgba(0,0,0,0.12)');
      coneGrad.addColorStop(0.7, 'rgba(0,0,0,0.25)');
      coneGrad.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = coneGrad;
      ctx.fillRect(0, 0, INTERNAL_W, INTERNAL_H);

      // Warm tint near player
      const warmGrad = ctx.createRadialGradient(px, py, 0, px, py, TILE * 4);
      warmGrad.addColorStop(0, 'rgba(255,250,220,0.06)');
      warmGrad.addColorStop(0.4, 'rgba(255,240,200,0.03)');
      warmGrad.addColorStop(1, 'rgba(255,240,200,0)');
      ctx.fillStyle = warmGrad;
      ctx.fillRect(0, 0, INTERNAL_W, INTERNAL_H);

      ctx.restore();
    }
  } else {
    // Level 1: normal circular fog of war
    const gradient = ctx.createRadialGradient(px, py, lightRadius * 0.2, px, py, lightRadius);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.45, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.75, 'rgba(0,0,0,0.55)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.90)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, INTERNAL_W, INTERNAL_H);
  }

  // Room lights
  const { rx: prx, ry: pry } = worldToRoom(p.x, p.y);
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const rx = prx + dx, ry = pry + dy;
      if (rx < 0 || rx >= MAP_ROOMS || ry < 0 || ry >= MAP_ROOMS) continue;
      const rtype = roomTypes[rkey(rx, ry)] || 'normal';
      if (rtype === 'dark') continue;

      const roomWX = rx * ROOM_PX - offsetX;
      const roomWY = ry * ROOM_PX - offsetY;

      let alpha = currentLevel === 2 ? 0.02 : 0.08;
      if (rtype === 'flicker') {
        const flicker = Math.sin(frameCount * 0.3 + hash(rx, ry)) * 0.5 + 0.5;
        const spike = Math.sin(frameCount * 1.7 + hash(rx + 50, ry)) > 0.85 ? 0 : 1;
        alpha = alpha * flicker * spike;
      }

      if (alpha > 0.01) {
        ctx.fillStyle = `rgba(255,248,220,${alpha})`;
        ctx.fillRect(Math.floor(roomWX + TILE), Math.floor(roomWY + TILE), ROOM_PX - TILE * 2, ROOM_PX - TILE * 2);
      }
    }
  }

  // Exit room glow
  if (mazeData) {
    const exitWX = mazeData.exitRx * ROOM_PX - offsetX;
    const exitWY = mazeData.exitRy * ROOM_PX - offsetY;
    const exitDist = dist(
      { x: mazeData.exitRx * ROOM_PX + ROOM_PX/2, y: mazeData.exitRy * ROOM_PX + ROOM_PX/2 },
      { x: p.x, y: p.y }
    );
    if (exitDist < TILE * 20) {
      const pulse = 0.5 + 0.5 * Math.sin(frameCount * 0.03);
      const glowColor = currentLevel === 2
        ? `rgba(130,200,255,${0.06 + pulse * 0.04})`
        : `rgba(150,200,240,${0.06 + pulse * 0.04})`;
      ctx.fillStyle = glowColor;
      ctx.fillRect(Math.floor(exitWX), Math.floor(exitWY), ROOM_PX, ROOM_PX);
    }
  }

}

// ============ ENTITY & PLAYER DRAWING ============
function drawEntity(offsetX, offsetY) {
  if (!entity) return;
  const e = entity;
  if (!e.visible && dist(e, player) > TILE * 4) return;

  const sx = Math.floor(e.x - offsetX);
  const sy = Math.floor(e.y - offsetY);

  if (currentLevel === 2) {
    // Level 2: tooth-covered creature, gray body, two pairs of white eyes
    const pulse = 0.5 + 0.5 * Math.sin(frameCount * 0.06);

    // Body (tall, gray)
    ctx.fillStyle = '#777';
    ctx.fillRect(sx - 4, sy - 12, 8, 16);

    // Head
    ctx.fillStyle = '#888';
    ctx.fillRect(sx - 3, sy - 14, 6, 5);

    // Teeth rows on body
    ctx.fillStyle = '#ddd';
    for (let row = 0; row < 3; row++) {
      const ry = sy - 10 + row * 6;
      for (let t = -2; t <= 2; t++) {
        ctx.fillRect(sx + t * 2 - 0.5, ry, 1.5, 2.5);
      }
    }

    // Teeth on head
    for (let t = -1; t <= 1; t++) {
      ctx.fillStyle = '#ddd';
      ctx.fillRect(sx + t * 2 - 0.5, sy - 13, 1.5, 2);
    }

    // Two pairs of glowing white eyes
    ctx.fillStyle = `rgba(255,255,255,${0.7 + pulse * 0.3})`;
    // Upper pair
    ctx.fillRect(sx - 2, sy - 12, 1.5, 1.5);
    ctx.fillRect(sx + 1, sy - 12, 1.5, 1.5);
    // Lower pair
    ctx.fillRect(sx - 2, sy - 9, 1.5, 1.5);
    ctx.fillRect(sx + 1, sy - 9, 1.5, 1.5);

    // Eye glow
    ctx.fillStyle = `rgba(255,255,255,${0.15 + pulse * 0.1})`;
    ctx.fillRect(sx - 3, sy - 13, 7, 3);

    // Shadow aura when not visible
    if (!e.visible && dist(e, player) < TILE * 7) {
      ctx.fillStyle = 'rgba(200,200,200,0.08)';
      ctx.fillRect(sx - 7, sy - 16, 14, 22);
    }
  } else {
    // Level 1: dark shadow figure with red eyes
    ctx.fillStyle = C_ENTITY;
    ctx.fillRect(sx - 3, sy - 10, 6, 14);
    ctx.fillRect(sx - 2, sy - 12, 4, 4);

    const pulse = 0.6 + 0.4 * Math.sin(frameCount * 0.08);
    ctx.fillStyle = `rgba(255,40,40,${pulse})`;
    ctx.fillRect(sx - 1, sy - 10, 1, 1);
    ctx.fillRect(sx + 1, sy - 10, 1, 1);

    if (!e.visible && dist(e, player) < TILE * 7) {
      ctx.fillStyle = 'rgba(255,0,0,0.08)';
      ctx.fillRect(sx - 6, sy - 14, 12, 20);
    }
  }
}

function drawPlayer(offsetX, offsetY) {
  const p = player;
  const sx = Math.floor(p.x - offsetX);
  const sy = Math.floor(p.y - offsetY);
  const size = SPRITE_DRAW_SIZE;
  const half = size / 2;

  if (spriteSheet && spriteSheet.complete && spriteFW > 0) {
    const col = p.animFrame % SPRITE_COLS;
    const row = Math.floor(p.animFrame / SPRITE_COLS);

    ctx.save();
    if (Math.cos(p.facing) < -0.1) {
      ctx.translate(sx, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(spriteSheet,
        col * spriteFW, row * spriteFH, spriteFW, spriteFH,
        -half, sy - half, size, size);
    } else {
      ctx.drawImage(spriteSheet,
        col * spriteFW, row * spriteFH, spriteFW, spriteFH,
        sx - half, sy - half, size, size);
    }
    ctx.restore();
  } else {
    ctx.fillStyle = '#ffe';
    ctx.fillRect(sx - 3, sy - 4, 6, 8);
    ctx.fillStyle = '#222';
    const ex = Math.cos(p.facing) * 1.5;
    ctx.fillRect(Math.floor(sx + ex - 0.5), Math.floor(sy - 4.5), 1, 1);
  }
}

// ============ HUD ============
function drawHUD() {
  if (gameState !== 'playing' || !player) return;
  document.getElementById('sanity-fill').style.width = player.sanity + '%';
  document.getElementById('stamina-fill').style.width = player.stamina + '%';

  const sanityFill = document.getElementById('sanity-fill');
  if (player.sanity < 30) {
    sanityFill.style.background = '#c0392b';
    sanityFill.style.boxShadow = '0 0 8px #c0392b';
  } else if (player.sanity < 60) {
    sanityFill.style.background = '#d35400';
    sanityFill.style.boxShadow = '0 0 6px #d35400';
  } else {
    sanityFill.style.background = '#6b4fa0';
    sanityFill.style.boxShadow = '0 0 6px #6b4fa0';
  }

  const hint = document.getElementById('hint-text');
  const { rx, ry } = worldToRoom(player.x, player.y);
  const rtype = roomTypes[rkey(rx, ry)] || 'normal';
  if (rtype === 'exit') {
    hint.textContent = currentLevel === 2 ? '你看到了电梯的灯光...' : '你感受到了出口的气息...';
    hint.style.color = '#aad';
  } else if (entity && dist(player, entity) < TILE * 6) {
    hint.textContent = '有什么东西在附近...';
    hint.style.color = '#a33';
  } else if (rtype === 'dark') {
    hint.textContent = '这里太暗了...';
    hint.style.color = '#666';
  } else {
    const itemHere = roomItems[rkey(rx, ry)];
    if (itemHere && !itemHere.picked) {
      hint.textContent = '地上有一瓶杏仁水';
      hint.style.color = '#7ec8f8';
    } else {
      hint.textContent = '';
    }
  }
}

function showMessage(msg, duration = 3) {
  messageText = msg;
  messageTimer = duration;
  const el = document.getElementById('message-center');
  el.textContent = msg;
  el.classList.add('visible');
}

function updateMessage(dt) {
  if (messageTimer > 0) {
    messageTimer -= dt;
    if (messageTimer <= 0) {
      document.getElementById('message-center').classList.remove('visible');
    }
  }
}

// ============ MAIN RENDER FUNCTION ============
function render() {
  ctx.clearRect(0, 0, INTERNAL_W, INTERNAL_H);

  if (gameState === 'title') return;

  let shakeX = 0, shakeY = 0;
  if (screenShake > 0) {
    shakeX = (Math.random() - 0.5) * screenShake * 8;
    shakeY = (Math.random() - 0.5) * screenShake * 8;
  }

  const cx = player.x - INTERNAL_W / 2 + shakeX;
  const cy = player.y - INTERNAL_H / 2 + shakeY;
  const offsetX = cx;
  const offsetY = cy;

  const { rx: prx, ry: pry } = worldToRoom(player.x, player.y);
  const roomRange = currentLevel === 2 ? 2 : 3;
  const roomsToDraw = [];

  for (let dx = -roomRange; dx <= roomRange; dx++) {
    for (let dy = -roomRange; dy <= roomRange; dy++) {
      const rx = prx + dx, ry = pry + dy;
      if (rx >= 0 && rx < MAP_ROOMS && ry >= 0 && ry < MAP_ROOMS) {
        roomsToDraw.push([rx, ry]);
      }
    }
  }

  roomsToDraw.sort((a, b) => a[1] - b[1]);

  for (const [rx, ry] of roomsToDraw) {
    drawFloorPattern(rx, ry, offsetX, offsetY);
  }

  drawEntity(offsetX, offsetY);
  drawPlayer(offsetX, offsetY);
  drawLighting(offsetX, offsetY);

  // Debug arrow to exit
  if (debugMode && mazeData) {
    const exitWX = mazeData.exitRx * ROOM_PX + ROOM_PX / 2;
    const exitWY = mazeData.exitRy * ROOM_PX + ROOM_PX / 2;
    const dx = exitWX - player.x;
    const dy = exitWY - player.y;
    const distToExit = Math.sqrt(dx * dx + dy * dy);
    if (distToExit > 0) {
      const angle = Math.atan2(dy, dx);
      const px = INTERNAL_W / 2;
      const py = INTERNAL_H / 2;
      const arrowLen = 40;
      const arrowX = px + Math.cos(angle) * arrowLen;
      const arrowY = py + Math.sin(angle) * arrowLen;

      ctx.strokeStyle = 'rgba(100,255,100,0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(arrowX, arrowY);
      ctx.stroke();

      const headLen = 10;
      const a1 = angle + Math.PI * 0.75;
      const a2 = angle - Math.PI * 0.75;
      ctx.fillStyle = 'rgba(100,255,100,0.7)';
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(arrowX + Math.cos(a1) * headLen, arrowY + Math.sin(a1) * headLen);
      ctx.lineTo(arrowX + Math.cos(a2) * headLen, arrowY + Math.sin(a2) * headLen);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(100,255,100,0.7)';
      ctx.font = '10px monospace';
      ctx.fillText(Math.floor(distToExit / ROOM_PX) + ' rooms', px + 14, py - 6);
    }
  }

  // Sanity vignette
  if (player.sanity < 40) {
    const alpha = (40 - player.sanity) / 40 * 0.5;
    const gradient = ctx.createRadialGradient(INTERNAL_W/2, INTERNAL_H/2, INTERNAL_W * 0.4,
                                               INTERNAL_W/2, INTERNAL_H/2, INTERNAL_W * 0.75);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, `rgba(30,0,0,${alpha})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, INTERNAL_W, INTERNAL_H);
  }

  // VHS scanlines
  ctx.fillStyle = 'rgba(0,0,0,0.04)';
  for (let y = 0; y < INTERNAL_H; y += 3) {
    ctx.fillRect(0, y, INTERNAL_W, 1);
  }

  // Chromatic aberration at low sanity
  if (player.sanity < 20) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(255,0,0,${0.02 + (20-player.sanity)/20 * 0.05})`;
    ctx.fillRect(1, 0, INTERNAL_W, INTERNAL_H);
    ctx.fillStyle = `rgba(0,0,255,${0.02 + (20-player.sanity)/20 * 0.05})`;
    ctx.fillRect(-1, 0, INTERNAL_W, INTERNAL_H);
    ctx.globalCompositeOperation = 'source-over';
  }
}
