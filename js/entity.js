// ============ ENTITY AI ============
function createEntity(wx, wy) {
  return {
    x: wx, y: wy,
    speed: 0.6,
    targetRx: 0, targetRy: 0,
    path: [],
    pathTimer: 0,
    visible: false,
  };
}

function findPath(fromRx, fromRy, toRx, toRy) {
  const start = rkey(fromRx, fromRy);
  const goal = rkey(toRx, toRy);
  if (start === goal) return [];

  const queue = [[fromRx, fromRy]];
  const cameFrom = {};
  const visited = new Set();
  visited.add(start);

  while (queue.length > 0) {
    const [rx, ry] = queue.shift();
    const cur = rkey(rx, ry);
    if (cur === goal) break;

    const g = roomGraph[cur] || { n: false, s: false, e: false, w: false };
    const dirs = [];
    if (g.n) dirs.push([rx, ry - 1, 'n']);
    if (g.s) dirs.push([rx, ry + 1, 's']);
    if (g.e) dirs.push([rx + 1, ry, 'e']);
    if (g.w) dirs.push([rx - 1, ry, 'w']);

    for (const [nx, ny, _] of dirs) {
      const nk = rkey(nx, ny);
      if (!visited.has(nk) && nx >= 0 && nx < MAP_ROOMS && ny >= 0 && ny < MAP_ROOMS) {
        visited.add(nk);
        cameFrom[nk] = cur;
        queue.push([nx, ny]);
      }
    }
  }

  const path = [];
  let cur = goal;
  while (cur !== start && cameFrom[cur]) {
    const [rx, ry] = cur.split(',').map(Number);
    path.unshift({ rx, ry });
    cur = cameFrom[cur];
  }
  return path;
}

function updateEntity(dt) {
  if (gameState !== 'playing') return;
  if (!entity || !player) return;

  const e = entity;
  const p = player;

  const { rx: prx, ry: pry } = worldToRoom(p.x, p.y);
  const { rx: erx, ry: ery } = worldToRoom(e.x, e.y);

  const edist = dist(e, p);
  e.visible = edist < TILE * VISION_RADIUS;

  // Line of sight check
  let hasLOS = false;
  if (e.visible) {
    hasLOS = true;
    const steps = Math.ceil(edist / (TILE / 2));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const cx = e.x + (p.x - e.x) * t;
      const cy = e.y + (p.y - e.y) * t;
      if (isSolid(cx, cy)) {
        hasLOS = false;
        break;
      }
    }
  }

  // Update path periodically
  e.pathTimer += dt;
  if (e.pathTimer > 1.5 || (e.path.length === 0 && e.pathTimer > 0.3)) {
    e.pathTimer = 0;
    e.path = findPath(erx, ery, prx, pry);
  }

  const observed = hasLOS;
  const spd = observed ? e.speed * 0.25 : e.speed;

  let targetX, targetY;
  if (e.path.length > 0) {
    const next = e.path[0];
    const rw = roomToWorld(next.rx, next.ry);
    targetX = rw.x + ROOM_PX / 2;
    targetY = rw.y + ROOM_PX / 2;

    if (erx === next.rx && ery === next.ry) {
      e.path.shift();
    }
  } else {
    targetX = p.x;
    targetY = p.y;
  }

  const dx = targetX - e.x;
  const dy = targetY - e.y;
  const d = Math.sqrt(dx * dx + dy * dy);
  if (d > 0.5) {
    const mx = dx / d, my = dy / d;
    const nx = e.x + mx * spd * dt * 60;
    const ny = e.y + my * spd * dt * 60;

    if (!isSolid(nx, e.y)) e.x = nx;
    if (!isSolid(e.x, ny)) e.y = ny;
  }

  // Growl sounds when close
  entityGrowlTimer += dt;
  if (edist < TILE * 8 && entityGrowlTimer > 4 + Math.random() * 3) {
    entityGrowlTimer = 0;
    playEntityGrowl();
  }
}
