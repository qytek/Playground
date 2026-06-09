// ============ LEVEL 4: ABANDONED OFFICE ============
// Office tile types: 0=gray carpet, 1=white wall, 2=doorway, 3=ceiling light, 4=elevator exit, 5=cubicle partition, 6=office furniture, 7=flashlight, 8=almond water (water cooler)

const furnitureData = {}; // key: "rx,ry" -> [{ tx, ty, w, h, type }]

function generateOfficeRoomTiles(rx, ry) {
  const key = rkey(rx, ry);
  if (visitedRooms[key]) return visitedRooms[key];

  const tiles = [];
  for (let y = 0; y < ROOM_TILES; y++) {
    tiles[y] = [];
    for (let x = 0; x < ROOM_TILES; x++) {
      tiles[y][x] = 0; // gray carpet
    }
  }

  // White office walls around the perimeter
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

  // Fluorescent ceiling lights in grid
  const rtype = roomTypes[key] || 'normal';
  if (rtype !== 'dark') {
    for (let ly = 2; ly < ROOM_TILES - 2; ly += 4) {
      for (let lx = 2; lx < ROOM_TILES - 2; lx += 4) {
        if (tiles[ly][lx] === 0) tiles[ly][lx] = 3;
      }
    }
  }

  // Cubicle partitions — interior walls forming office cubicles
  if (rtype === 'normal' || rtype === 'cubicle') {
    // Horizontal partition rows (skip doorway areas near mid)
    for (let row = 4; row < ROOM_TILES - 4; row += 5) {
      for (let x = 2; x < ROOM_TILES - 2; x++) {
        if (tiles[row][x] === 0) tiles[row][x] = 5;
      }
      // Leave 3-tile gaps for walking (same width as doorways)
      for (let g = -1; g <= 1; g++) {
        if (mid + g >= 2 && mid + g < ROOM_TILES - 2 && tiles[row][mid + g] === 5) tiles[row][mid + g] = 0;
      }
    }

    // Vertical partition columns in cubicle rooms
    if (rtype === 'cubicle') {
      for (let col = 5; col < ROOM_TILES - 4; col += 5) {
        for (let y = 5; y < ROOM_TILES - 4; y++) {
          if (tiles[y][col] === 0) tiles[y][col] = 5;
        }
      }
    }
  }

  // Windows on outer walls (window room type)
  if (rtype === 'window') {
    // Place window tiles on walls that don't have doorways
    for (let x = 2; x < ROOM_TILES - 2; x += 3) {
      if (tiles[0][x] === 1) tiles[0][x] = 9;
      if (tiles[ROOM_TILES - 1][x] === 1) tiles[ROOM_TILES - 1][x] = 9;
    }
    for (let y = 2; y < ROOM_TILES - 2; y += 3) {
      if (tiles[y][0] === 1) tiles[y][0] = 9;
      if (tiles[y][ROOM_TILES - 1] === 1) tiles[y][ROOM_TILES - 1] = 9;
    }
  }

  // Exit elevator (3x3) at center of exit room
  if (rtype === 'exit') {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        tiles[mid + dy][mid + dx] = 4;
      }
    }
  }

  // Items in safe corner (top-left)
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

// Place office furniture in rooms
function placeOfficeFurniture() {
  for (const k in furnitureData) delete furnitureData[k];

  for (let x = 0; x < MAP_ROOMS; x++) {
    for (let y = 0; y < MAP_ROOMS; y++) {
      const rk = rkey(x, y);
      const rtype = roomTypes[rk];
      if (rtype === 'start' || rtype === 'exit') continue;

      // Skip furniture in window rooms (keep them open)
      if (rtype === 'window') continue;

      // Higher furniture density in cubicle rooms
      const density = rtype === 'cubicle' ? 0.95 : rtype === 'breakroom' ? 0.4 : 0.75;
      if (rng(x + 500, y + 500) >= density) continue;

      const numPieces = rng(x + 600, y + 600) < 0.4 ? 2 : 1;
      const furniture = [];

      for (let c = 0; c < numPieces; c++) {
        // Desk: 3 wide, 1 tall. Cabinet: 1 wide, 2 tall.
        const isDesk = rng(x + 700 + c, y + 700 + c) < 0.7;
        const fw = isDesk ? 3 : 1;
        const fh = isDesk ? 1 : 2;

        const mid = Math.floor(ROOM_TILES / 2);
        if (numPieces === 2) {
          // Two pieces: place left and right of the mid corridor, away from doorway path
          if (c === 0) {
            const ftx = Math.max(2, mid - 4 - fw);
            furniture.push({ tx: ftx, ty: 5, w: fw, h: fh, type: isDesk ? 'desk' : 'cabinet' });
          } else {
            const ftx = Math.min(ROOM_TILES - 2 - fw, mid + 3);
            furniture.push({ tx: ftx, ty: 5, w: fw, h: fh, type: isDesk ? 'desk' : 'cabinet' });
          }
        } else {
          // Single furniture offset from center to keep door-to-door path clear
          const side = rng(x + 750, y + 750) < 0.5 ? -1 : 1;
          const ftx = mid + side * 3 - Math.floor(fw / 2);
          const fty = mid - Math.floor(fh / 2) + (rng(x + 800, y + 800) < 0.5 ? -2 : 2);
          furniture.push({ tx: ftx, ty: fty, w: fw, h: fh, type: isDesk ? 'desk' : 'cabinet' });
        }
      }
      furnitureData[rk] = furniture;
    }
  }
}
