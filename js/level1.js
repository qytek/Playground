// ============ LEVEL 1: BACKROOMS ============
// Backrooms tile types: 0=floor, 1=wall, 2=doorway, 3=light, 4=exit, 5=almond_water

function generateBackroomsRoomTiles(rx, ry) {
  const key = rkey(rx, ry);
  if (visitedRooms[key]) return visitedRooms[key];

  const tiles = [];
  for (let y = 0; y < ROOM_TILES; y++) {
    tiles[y] = [];
    for (let x = 0; x < ROOM_TILES; x++) {
      tiles[y][x] = 0; // floor
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

  // Doorways based on room graph (3-tile wide)
  const mid = Math.floor(ROOM_TILES / 2);
  const graph = roomGraph[key] || { n: false, s: false, e: false, w: false };

  if (graph.n) { tiles[0][mid] = 2; tiles[0][mid-1] = 2; tiles[0][mid+1] = 2; }
  if (graph.s) { tiles[ROOM_TILES-1][mid] = 2; tiles[ROOM_TILES-1][mid-1] = 2; tiles[ROOM_TILES-1][mid+1] = 2; }
  if (graph.w) { tiles[mid][0] = 2; tiles[mid-1][0] = 2; tiles[mid+1][0] = 2; }
  if (graph.e) { tiles[mid][ROOM_TILES-1] = 2; tiles[mid-1][ROOM_TILES-1] = 2; tiles[mid+1][ROOM_TILES-1] = 2; }

  // Light fixtures
  const rtype = roomTypes[key] || 'normal';
  if (rtype !== 'dark') {
    for (let ly = 2; ly < ROOM_TILES - 2; ly += 4) {
      for (let lx = 2; lx < ROOM_TILES - 2; lx += 4) {
        if (tiles[ly][lx] === 0) tiles[ly][lx] = 3;
      }
    }
  }

  // Exit marker at center
  if (rtype === 'exit') {
    tiles[mid][mid] = 4;
  }

  // Almond water item
  if (roomItems[key] && !roomItems[key].picked) {
    tiles[mid][mid - 1] = 5;
  }

  visitedRooms[key] = tiles;
  return tiles;
}
