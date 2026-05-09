// ============ UTILITY FUNCTIONS ============
function hash(x, y) {
  let h = ((x * 374761393) ^ (y * 668265263)) + 1274126177;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

function rng(x, y) {
  let h = hash(x, y);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) & 0x7fffffff) / 0x7fffffff;
}

function lerp(a, b, t) { return a + (b - a) * t; }
function dist(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function rkey(rx, ry) { return rx + ',' + ry; }
function getRoomKey(rx, ry) { return rkey(rx, ry); }

function worldToRoom(wx, wy) {
  return {
    rx: Math.floor(wx / ROOM_PX),
    ry: Math.floor(wy / ROOM_PX),
    tx: Math.floor((wx % ROOM_PX + ROOM_PX) % ROOM_PX / TILE),
    ty: Math.floor((wy % ROOM_PX + ROOM_PX) % ROOM_PX / TILE)
  };
}

function roomToWorld(rx, ry) {
  return { x: rx * ROOM_PX, y: ry * ROOM_PX };
}

function getTile(wx, wy) {
  const { rx, ry, tx, ty } = worldToRoom(wx, wy);
  if (rx < 0 || rx >= MAP_ROOMS || ry < 0 || ry >= MAP_ROOMS) return 1;
  const tiles = generateRoomTiles(rx, ry);
  if (ty < 0 || ty >= ROOM_TILES || tx < 0 || tx >= ROOM_TILES) return 1;
  return tiles[ty][tx];
}

function isSolid(wx, wy) {
  const t = getTile(wx, wy);
  if (t === 1) return true; // wall

  // Check car collision (Level 2 parking garage)
  const { rx, ry, tx, ty } = worldToRoom(wx, wy);
  const cars = carData[rkey(rx, ry)];
  if (cars) {
    for (const car of cars) {
      if (tx >= car.tx && tx < car.tx + car.w && ty >= car.ty && ty < car.ty + car.h) {
        return true;
      }
    }
  }

  return false;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
