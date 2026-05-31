// ============ WORLD GENERATION DATA ============
// Room graph: which directions have open doors
const roomGraph = {};   // key: "rx,ry" -> { n,s,e,w: bool }
const roomTypes = {};   // key: "rx,ry" -> "normal"|"dark"|"flicker"|"exit"|"start"|"car"
const visitedRooms = {}; // key: "rx,ry" -> generated tiles cache
const roomItems = {};   // key: "rx,ry" -> { type: 'almond_water', picked: bool }

// ============ GENERIC MAZE GENERATION ============
// Uses the current global MAP_ROOMS value
// levelType: 'backrooms' | 'parking'
function generateMaze(levelType) {
  // Clear
  for (const k in roomGraph) delete roomGraph[k];
  for (const k in roomTypes) delete roomTypes[k];
  for (const k in visitedRooms) delete visitedRooms[k];
  for (const k in roomItems) delete roomItems[k];

  // Initialize all cells with all walls
  for (let x = 0; x < MAP_ROOMS; x++) {
    for (let y = 0; y < MAP_ROOMS; y++) {
      roomGraph[rkey(x, y)] = { n: false, s: false, e: false, w: false };
    }
  }

  // Recursive backtracker
  const stack = [];
  const visited = new Set();
  const startRx = Math.floor(MAP_ROOMS / 2);
  const startRy = Math.floor(MAP_ROOMS / 2);

  function visit(rx, ry) {
    visited.add(rkey(rx, ry));
    const dirs = shuffle(['n','s','e','w']);
    for (const dir of dirs) {
      let nx = rx, ny = ry, opp = '';
      if (dir === 'n') { ny--; opp = 's'; }
      else if (dir === 's') { ny++; opp = 'n'; }
      else if (dir === 'e') { nx++; opp = 'w'; }
      else if (dir === 'w') { nx--; opp = 'e'; }

      if (nx >= 0 && nx < MAP_ROOMS && ny >= 0 && ny < MAP_ROOMS && !visited.has(rkey(nx, ny))) {
        roomGraph[rkey(rx, ry)][dir] = true;
        roomGraph[rkey(nx, ny)][opp] = true;
        stack.push([nx, ny]);
        visit(nx, ny);
      }
    }
  }

  stack.push([startRx, startRy]);
  visit(startRx, startRy);

  // Add extra connections for loops
  for (let x = 0; x < MAP_ROOMS; x++) {
    for (let y = 0; y < MAP_ROOMS; y++) {
      if (rng(x, y) < 0.08) {
        const dirs = shuffle(['n','s','e','w']);
        for (const dir of dirs) {
          let nx = x, ny = y, opp = '';
          if (dir === 'n') { ny--; opp = 's'; }
          else if (dir === 's') { ny++; opp = 'n'; }
          else if (dir === 'e') { nx++; opp = 'w'; }
          else if (dir === 'w') { nx--; opp = 'e'; }
          if (nx >= 0 && nx < MAP_ROOMS && ny >= 0 && ny < MAP_ROOMS && !roomGraph[rkey(x,y)][dir]) {
            roomGraph[rkey(x,y)][dir] = true;
            roomGraph[rkey(nx,ny)][opp] = true;
            break;
          }
        }
      }
    }
  }

  // Assign room types
  for (let x = 0; x < MAP_ROOMS; x++) {
    for (let y = 0; y < MAP_ROOMS; y++) {
      const r = rng(x + 100, y + 100);
      if (levelType === 'parking') {
        roomTypes[rkey(x,y)] = 'normal';
      } else {
        if (r < 0.12) roomTypes[rkey(x,y)] = 'dark';
        else if (r < 0.20) roomTypes[rkey(x,y)] = 'flicker';
        else roomTypes[rkey(x,y)] = 'normal';
      }
    }
  }

  // Start room
  roomTypes[rkey(startRx, startRy)] = 'start';

  // Exit room placement
  let exitRx, exitRy;
  if (levelType === 'parking') {
    // Exit: far corner from start
    exitRx = startRx < MAP_ROOMS / 2 ? MAP_ROOMS - 1 : 0;
    exitRy = startRy < MAP_ROOMS / 2 ? MAP_ROOMS - 1 : 0;
  } else {
    // Exit room: random 5-12 rooms horizontally left or right of start
    const dir = rng(startRx, startRy) < 0.5 ? -1 : 1;
    const exitDist = 5 + Math.floor(rng(startRx, startRy + 999) * 8);
    exitRx = startRx + dir * exitDist;
    exitRy = startRy;
  }
  roomTypes[rkey(exitRx, exitRy)] = 'exit';

  // Place almond water in both levels
  for (let x = 0; x < MAP_ROOMS; x++) {
    for (let y = 0; y < MAP_ROOMS; y++) {
      const rk = rkey(x, y);
      if (roomTypes[rk] === 'start' || roomTypes[rk] === 'exit') continue;
      if (rng(x + 300, y + 300) < 0.20) {
        roomItems[rk] = { type: 'almond_water', picked: false };
      }
    }
  }

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

  return { startRx, startRy, exitRx, exitRy };
}

// generateRoomTiles is level-specific — defined in level1.js / level2.js
// This is a placeholder; it gets overridden by the level modules
function generateRoomTiles(rx, ry) {
  // Overridden by level modules
  return [];
}
