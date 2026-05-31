// ============ LEVEL 2: PARKING GARAGE ============
// Parking garage tile types: 0=concrete floor, 1=concrete wall, 2=wide doorway, 3=fluorescent light, 4=elevator, 5=parking line, 6=car cell, 7=flashlight, 8=almond_water

const carData = {}; // key: "rx,ry" -> [{ tx, ty, w, h, color }]

function generateParkingRoomTiles(rx, ry) {
  const key = rkey(rx, ry);
  if (visitedRooms[key]) return visitedRooms[key];

  const tiles = [];
  for (let y = 0; y < ROOM_TILES; y++) {
    tiles[y] = [];
    for (let x = 0; x < ROOM_TILES; x++) {
      tiles[y][x] = 0; // concrete floor
    }
  }

  // Walls around the perimeter
  for (let x = 0; x < ROOM_TILES; x++) {
    tiles[0][x] = 1;
    tiles[ROOM_TILES - 1][x] = 1;
  }
  for (let y = 0; y < ROOM_TILES; y++) {
    tiles[y][0] = 1;
    tiles[y][ROOM_TILES - 1] = 1;
  }

  // Wide doorways (5 tiles wide) based on room graph
  const mid = Math.floor(ROOM_TILES / 2);
  const graph = roomGraph[key] || { n: false, s: false, e: false, w: false };

  if (graph.n) {
    for (let i = -2; i <= 2; i++) { tiles[0][mid + i] = 2; }
  }
  if (graph.s) {
    for (let i = -2; i <= 2; i++) { tiles[ROOM_TILES - 1][mid + i] = 2; }
  }
  if (graph.w) {
    for (let i = -2; i <= 2; i++) { tiles[mid + i][0] = 2; }
  }
  if (graph.e) {
    for (let i = -2; i <= 2; i++) { tiles[mid + i][ROOM_TILES - 1] = 2; }
  }

  // Fluorescent lights in grid pattern
  const rtype = roomTypes[key] || 'normal';
  for (let ly = 3; ly < ROOM_TILES - 2; ly += 5) {
    for (let lx = 3; lx < ROOM_TILES - 2; lx += 5) {
      if (tiles[ly][lx] === 0) tiles[ly][lx] = 3;
    }
  }

  // Parking space lines — vertical dashed lines dividing parking bays
  if (rtype === 'normal' || rtype === 'car') {
    for (let lx = 6; lx < ROOM_TILES - 2; lx += 6) {
      for (let ly = 2; ly < ROOM_TILES - 1; ly++) {
        if (tiles[ly][lx] === 0) tiles[ly][lx] = 5;
      }
    }
  }

  // Elevator at center of exit room
  if (rtype === 'exit') {
    // 3x3 elevator area at center
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        tiles[mid + dy][mid + dx] = 4;
      }
    }
  }

  // Items in top-left corner (safe from cars: y<5 never overlaps any car config)
  if (roomItems[key] && !roomItems[key].picked) {
    if (roomItems[key].type === 'flashlight') {
      tiles[2][2] = 7;
      console.log('[level2.js] Flashlight tile set at room:', key);
    } else if (roomItems[key].type === 'almond_water') {
      tiles[2][2] = 8;
      console.log('[level2.js] Almond water tile set at room:', key);
    }
  }

  visitedRooms[key] = tiles;
  return tiles;
}

// Place cars in parking garage rooms
function placeCarsInGarage() {
  for (const k in carData) delete carData[k];

  for (let x = 0; x < MAP_ROOMS; x++) {
    for (let y = 0; y < MAP_ROOMS; y++) {
      const rk = rkey(x, y);
      const rtype = roomTypes[rk];
      if (rtype === 'start' || rtype === 'exit') continue;

      // ~90% chance of having cars
      if (rng(x + 500, y + 500) < 0.90) {
        const numCars = rng(x + 600, y + 600) < 0.4 ? 2 : 1;
        const cars = [];

        for (let c = 0; c < numCars; c++) {
          const color = CAR_COLORS[Math.floor(rng(x + 700 + c, y + 700 + c) * CAR_COLORS.length)];
          // Car dimensions: ~4 tiles wide, 7 tiles long
          const carW = 4;
          const carH = 7;

          if (numCars === 2) {
            if (c === 0) {
              cars.push({ tx: 3, ty: 5, w: carW, h: carH, color });
            } else {
              cars.push({ tx: ROOM_TILES - 7, ty: 5, w: carW, h: carH, color });
            }
          } else {
            // Single car centered
            cars.push({ tx: Math.floor(ROOM_TILES / 2) - 2, ty: Math.floor(ROOM_TILES / 2) - 3, w: carW, h: carH, color });
          }
        }
        carData[rk] = cars;
      }
    }
  }
}
