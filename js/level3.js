// ============ LEVEL 3: ELECTRICAL STATION ============
// Electrical station tile types: 0=metal floor, 1=brick wall, 2=doorway, 3=fluorescent light, 4=elevator exit, 5=pipe/wire, 6=electrical machine, 7=flashlight, 8=almond_water

const machineData = {}; // key: "rx,ry" -> [{ tx, ty, w, h }]

function generateElectricalRoomTiles(rx, ry) {
  const key = rkey(rx, ry);
  if (visitedRooms[key]) return visitedRooms[key];

  const tiles = [];
  for (let y = 0; y < ROOM_TILES; y++) {
    tiles[y] = [];
    for (let x = 0; x < ROOM_TILES; x++) {
      tiles[y][x] = 0; // metal floor
    }
  }

  // Brick walls around the perimeter
  for (let x = 0; x < ROOM_TILES; x++) {
    tiles[0][x] = 1;
    tiles[ROOM_TILES - 1][x] = 1;
  }
  for (let y = 0; y < ROOM_TILES; y++) {
    tiles[y][0] = 1;
    tiles[y][ROOM_TILES - 1] = 1;
  }

  // Doorways (3-tile wide) based on room graph
  const mid = Math.floor(ROOM_TILES / 2);
  const graph = roomGraph[key] || { n: false, s: false, e: false, w: false };

  if (graph.n) { tiles[0][mid] = 2; tiles[0][mid-1] = 2; tiles[0][mid+1] = 2; }
  if (graph.s) { tiles[ROOM_TILES-1][mid] = 2; tiles[ROOM_TILES-1][mid-1] = 2; tiles[ROOM_TILES-1][mid+1] = 2; }
  if (graph.w) { tiles[mid][0] = 2; tiles[mid-1][0] = 2; tiles[mid+1][0] = 2; }
  if (graph.e) { tiles[mid][ROOM_TILES-1] = 2; tiles[mid-1][ROOM_TILES-1] = 2; tiles[mid+1][ROOM_TILES-1] = 2; }

  // Fluorescent lights in grid pattern (skip dark rooms)
  const rtype = roomTypes[key] || 'normal';
  if (rtype !== 'dark') {
    for (let ly = 2; ly < ROOM_TILES - 2; ly += 4) {
      for (let lx = 2; lx < ROOM_TILES - 2; lx += 4) {
        if (tiles[ly][lx] === 0) tiles[ly][lx] = 3;
      }
    }
  }

  // Pipes along walls (ceiling level, just inside walls) — decorative
  for (let x = 1; x < ROOM_TILES - 1; x++) {
    if (tiles[1][x] === 0) tiles[1][x] = 5;
  }
  // Vertical pipe runs on side walls
  for (let y = 2; y < ROOM_TILES - 2; y += 3) {
    if (tiles[y][1] === 0) tiles[y][1] = 5;
    if (tiles[y][ROOM_TILES - 2] === 0) tiles[y][ROOM_TILES - 2] = 5;
  }

  // Exit elevator (3x3) at center of exit room
  if (rtype === 'exit') {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        tiles[mid + dy][mid + dx] = 4;
      }
    }
  }

  // Items in safe corner (top-left, away from machine hitboxes)
  if (roomItems[key] && !roomItems[key].picked) {
    if (roomItems[key].type === 'flashlight') {
      tiles[2][2] = 7;
    } else if (roomItems[key].type === 'almond_water') {
      tiles[2][2] = 8;
    }
  }

  visitedRooms[key] = tiles;
  return tiles;
}

// Place electrical machines in station rooms
function placeMachinesInStation() {
  for (const k in machineData) delete machineData[k];

  for (let x = 0; x < MAP_ROOMS; x++) {
    for (let y = 0; y < MAP_ROOMS; y++) {
      const rk = rkey(x, y);
      const rtype = roomTypes[rk];
      if (rtype === 'start' || rtype === 'exit') continue;

      // ~70% chance of having machines in normal/machine rooms
      const chance = rtype === 'machine' ? 0.95 : 0.70;
      if (rng(x + 500, y + 500) < chance) {
        const numMachines = rng(x + 600, y + 600) < 0.35 ? 2 : 1;
        const machines = [];

        for (let c = 0; c < numMachines; c++) {
          // Machine dimensions: 2-3 tiles wide, 2-3 tiles tall
          const mw = rng(x + 700 + c, y + 700 + c) < 0.5 ? 2 : 3;
          const mh = rng(x + 800 + c, y + 800 + c) < 0.5 ? 2 : 3;

          if (numMachines === 2) {
            if (c === 0) {
              machines.push({ tx: 2, ty: 4, w: mw, h: mh });
            } else {
              machines.push({ tx: ROOM_TILES - 4 - mw, ty: 4, w: mw, h: mh });
            }
          } else {
            // Single machine off-center
            machines.push({ tx: Math.floor(ROOM_TILES / 2) - Math.floor(mw / 2), ty: Math.floor(ROOM_TILES / 2) - 1, w: mw, h: mh });
          }
        }
        machineData[rk] = machines;
      }
    }
  }
}
