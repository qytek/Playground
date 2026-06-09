// ============ CONFIGURATION ============
// These are reassigned by the level manager when switching levels

// Canvas
const INTERNAL_W = 480;
const INTERNAL_H = 320;

// Current level config (overridden by level manager)
let TILE = 16;
let ROOM_TILES = 11;
let ROOM_PX = ROOM_TILES * TILE;
let MAP_ROOMS = 35;
let VISION_RADIUS = 7;

// Level 1 config (Backrooms)
const LEVEL1 = {
  TILE: 16,
  ROOM_TILES: 11,
  get ROOM_PX() { return this.ROOM_TILES * this.TILE; },
  MAP_ROOMS: 35,
  VISION_RADIUS: 7,
  DOOR_WIDTH: 3,
};

// Level 2 config (Parking Garage)
const LEVEL2 = {
  TILE: 16,
  ROOM_TILES: 21,
  get ROOM_PX() { return this.ROOM_TILES * this.TILE; },
  MAP_ROOMS: 5,
  VISION_RADIUS: 8,
  DOOR_WIDTH: 5,
};

// Level 4 config (Abandoned Office)
const LEVEL4 = {
  TILE: 16,
  ROOM_TILES: 15,
  get ROOM_PX() { return this.ROOM_TILES * this.TILE; },
  MAP_ROOMS: 7,
  VISION_RADIUS: 8,
  DOOR_WIDTH: 3,
};

// Level 3 config (Electrical Station)
const LEVEL3 = {
  TILE: 16,
  ROOM_TILES: 13,
  get ROOM_PX() { return this.ROOM_TILES * this.TILE; },
  MAP_ROOMS: 9,
  VISION_RADIUS: 7,
  DOOR_WIDTH: 3,
};

function applyLevelConfig(cfg) {
  TILE = cfg.TILE;
  ROOM_TILES = cfg.ROOM_TILES;
  ROOM_PX = cfg.ROOM_PX;
  MAP_ROOMS = cfg.MAP_ROOMS;
  VISION_RADIUS = cfg.VISION_RADIUS;
}
