// ============ PLAYER ============
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

function updatePlayer(dt) {
  if (gameState !== 'playing') return;

  const p = player;
  const running = keys['Shift'] && p.stamina > 0;
  const spd = running ? p.speed * 1.7 : p.speed;

  // Input direction
  let mx = 0, my = 0;
  if (keys['KeyW'] || keys['ArrowUp']) my -= 1;
  if (keys['KeyS'] || keys['ArrowDown']) my += 1;
  if (keys['KeyA'] || keys['ArrowLeft']) mx -= 1;
  if (keys['KeyD'] || keys['ArrowRight']) mx += 1;

  if (mx !== 0 || my !== 0) {
    const len = Math.sqrt(mx * mx + my * my);
    mx /= len; my /= len;
    p.facing = Math.atan2(my, mx);
  }

  // Apply movement with collision
  const nx = p.x + mx * spd * dt * 60;
  const ny = p.y + my * spd * dt * 60;

  const ph = 6; // half hitbox
  if (!isSolid(nx, p.y - ph) && !isSolid(nx, p.y + ph) && !isSolid(nx - ph, p.y) && !isSolid(nx + ph, p.y)) {
    p.x = nx;
  }
  if (!isSolid(p.x, ny - ph) && !isSolid(p.x, ny + ph) && !isSolid(p.x - ph, ny) && !isSolid(p.x + ph, ny)) {
    p.y = ny;
  }

  // Stamina
  if (running && (mx !== 0 || my !== 0)) {
    p.stamina = Math.max(0, p.stamina - 15 * dt);
  } else {
    p.stamina = Math.min(100, p.stamina + 8 * dt);
  }

  // Footstep sounds
  if (mx !== 0 || my !== 0) {
    p.footstepAccum += spd * dt * 60;
    const interval = running ? 4 : 8;
    if (p.footstepAccum >= interval) {
      p.footstepAccum -= interval;
      playFootstep();
    }

    // Sprite animation
    p.animTimer += spd * dt * 60;
    const animInterval = 3;
    if (p.animTimer >= animInterval) {
      p.animTimer -= animInterval;
      p.animFrame = (p.animFrame + 1) % 9;
    }
  } else {
    p.footstepAccum = 0;
    p.animFrame = 0;
    p.animTimer = 0;
  }

  // Check current room
  const { rx, ry } = worldToRoom(p.x, p.y);
  const rk = getRoomKey(rx, ry);
  const rtype = roomTypes[rk] || 'normal';

  // Sanity drain in dark rooms
  if (rtype === 'dark') {
    p.sanity = Math.max(0, p.sanity - 5 * dt);
  }

  // Sanity drain when entity is very close
  if (entity) {
    const edist = dist(p, entity);
    if (edist < TILE * 5) {
      p.sanity = Math.max(0, p.sanity - 8 * dt);
    } else if (edist < TILE * 10) {
      p.sanity = Math.max(0, p.sanity - 2 * dt);
    }
  }

  // Pick up items on contact (detect by tile type, verify via roomItems)
  const playerTile = getTile(p.x, p.y);
  const isItemTile = playerTile === 5 || playerTile === 7 || playerTile === 8;
  if (isItemTile) {
    const { rx: prx2, ry: pry2 } = worldToRoom(p.x, p.y);
    const itemKey = rkey(prx2, pry2);
    const item = roomItems[itemKey];
    if (item && !item.picked) {
      if (item.type === 'almond_water') {
        item.picked = true;
        delete visitedRooms[itemKey];
        p.sanity = Math.min(100, p.sanity + 30);
        showMessage('你喝下了杏仁水，恢复了 30 点理智', 2.5);
        playFootstep();
      } else if (item.type === 'flashlight') {
        item.picked = true;
        delete visitedRooms[itemKey];
        p.hasFlashlight = true;
        showMessage('你捡起了一个手电筒！', 2.5);
      }
    }
  }

  // Check exit tile
  const tile = getTile(p.x, p.y);
  if (tile === 4) {
    onExitReached();
    return; // prevent collision check against newly placed entity
  }

  // Check entity collision
  if (entity) {
    const edist2 = dist(p, entity);
    if (edist2 < TILE * 1.2) {
      endGame('dead');
    }
  }
}
