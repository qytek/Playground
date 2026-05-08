// ============ MAIN ENTRY POINT ============

// Canvas setup
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = INTERNAL_W;
canvas.height = INTERNAL_H;

function resize() {
  const scale = Math.min(
    window.innerWidth / INTERNAL_W,
    window.innerHeight / INTERNAL_H
  );
  canvas.style.width = Math.floor(INTERNAL_W * scale) + 'px';
  canvas.style.height = Math.floor(INTERNAL_H * scale) + 'px';
}
window.addEventListener('resize', resize);
resize();

// ============ GAME LOOP ============
let lastTime = 0;

function update(dt) {
  if (gameState !== 'playing') return;

  // Toggle debug mode with Y key
  if (keys['KeyY']) {
    keys['KeyY'] = false;
    debugMode = !debugMode;
  }

  // Debug: skip to next level with N key
  if (keys['KeyN']) {
    keys['KeyN'] = false;
    if (currentLevel === 1) {
      onExitReached();
    } else if (currentLevel === 2) {
      endGame('win');
    }
    return;
  }

  frameCount++;
  updatePlayer(dt);
  updateEntity(dt);
  updateMessage(dt);

  // Screen shake decay
  if (screenShake > 0) {
    screenShake = Math.max(0, screenShake - dt * 2);
  }

  // Heartbeat when entity is close
  if (entity) {
    heartbeatTimer += dt;
    const edist = dist(player, entity);
    if (edist < TILE * 8 && heartbeatTimer > 1.0) {
      heartbeatTimer = 0;
      playHeartbeat();
      if (edist < TILE * 4) screenShake = Math.min(1, screenShake + 0.3);
    }
  }

  // Sanity death
  if (player.sanity <= 0) {
    endGame('dead');
  }

  // Update shift key state
  if (keys['ShiftLeft'] || keys['ShiftRight']) keys['Shift'] = true;
  else keys['Shift'] = false;
}

function gameLoop(timestamp) {
  let dt = (timestamp - lastTime) / 1000;
  if (dt <= 0) dt = 0.016;
  if (dt > 0.1) dt = 0.1;
  lastTime = timestamp;

  update(dt);
  render();
  drawHUD();

  requestAnimationFrame(gameLoop);
}

// ============ INITIALIZATION ============
document.getElementById('start-btn').addEventListener('click', () => {
  startGame();
});

// Initial render
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, INTERNAL_W, INTERNAL_H);

// Start loop
requestAnimationFrame(gameLoop);

console.log('🏚️  Backrooms - 后室');
console.log('   WASD: 移动 | SHIFT: 奔跑 | E: 交互 | Y: 调试 | N: 跳关');
console.log('   注意身后的声音...');
