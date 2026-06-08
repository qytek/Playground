// ============ LEVEL MANAGER ============
let currentLevel = 1;
let gameState = 'title'; // title, playing, win, dead, levelComplete
let player, entity, camera;
let mazeData;
let frameCount = 0;
let footstepTimer = 0;
let heartbeatTimer = 0;
let entityGrowlTimer = 0;
let messageText = '';
let messageTimer = 0;
let screenShake = 0;

function onExitReached() {
  if (currentLevel === 1) {
    // Transition to level 2
    transitionToLevel(2);
  } else if (currentLevel === 2) {
    // Transition to level 3
    transitionToLevel(3);
  } else if (currentLevel === 3) {
    // Win the game!
    endGame('win');
  }
}

function transitionToLevel(level) {
  gameState = 'levelComplete';
  stopAudioNode('drone');
  stopAudioNode('hum');
  stopAudioNode('electricalHum');

  if (level === 2) {
    playExitSound();
    applyLevelConfig(LEVEL2);
    currentLevel = 2;
    generateRoomTiles = generateParkingRoomTiles;
    mazeData = generateMaze('parking');
    placeCarsInGarage();
    console.log('[level-manager] Level 2 ready. roomItems:', Object.keys(roomItems).length, 'keys:', Object.keys(roomItems).join(', '));

    // Place player at start room
    const startWX = mazeData.startRx * ROOM_PX + ROOM_PX / 2;
    const startWY = mazeData.startRy * ROOM_PX + ROOM_PX / 2;
    player = createPlayer(startWX, startWY);
    player.hasFlashlight = true; // default flashlight on Level 2

    // Place entity - ensure it's not in the start room
    let midRx = Math.floor((mazeData.startRx + mazeData.exitRx) / 2) + 1;
    let midRy = Math.floor((mazeData.startRy + mazeData.exitRy) / 2);
    if (midRx === mazeData.startRx && midRy === mazeData.startRy) {
      midRx += (mazeData.exitRx > mazeData.startRx ? 1 : -1);
    }
    const entityWX = midRx * ROOM_PX + ROOM_PX / 2;
    const entityWY = midRy * ROOM_PX + ROOM_PX / 2;
    entity = createEntity(entityWX, entityWY);

    gameState = 'playing';
    frameCount = 0;
    screenShake = 0;
    messageTimer = 0;

    document.body.classList.add('playing');
    document.getElementById('title-overlay').style.display = 'none';
    document.getElementById('message-center').classList.remove('visible');

    createDrone();
    createHum();

    showMessage('你穿过出口，来到了一个陌生的停车场...', 4);

  } else if (level === 3) {
    playExitSound();
    applyLevelConfig(LEVEL3);
    currentLevel = 3;
    generateRoomTiles = generateElectricalRoomTiles;
    mazeData = generateMaze('electrical');
    placeMachinesInStation();
    console.log('[level-manager] Level 3 ready. roomItems:', Object.keys(roomItems).length);

    // Place player at start room
    const startWX = mazeData.startRx * ROOM_PX + ROOM_PX / 2;
    const startWY = mazeData.startRy * ROOM_PX + ROOM_PX / 2;
    player = createPlayer(startWX, startWY);
    player.hasFlashlight = true; // keep flashlight from L2

    // Place entity away from start
    let midRx = Math.floor((mazeData.startRx + mazeData.exitRx) / 2) + 1;
    let midRy = Math.floor((mazeData.startRy + mazeData.exitRy) / 2);
    if (midRx === mazeData.startRx && midRy === mazeData.startRy) {
      midRx += (mazeData.exitRx > mazeData.startRx ? 1 : -1);
    }
    const entityWX = midRx * ROOM_PX + ROOM_PX / 2;
    const entityWY = midRy * ROOM_PX + ROOM_PX / 2;
    entity = createEntity(entityWX, entityWY);

    gameState = 'playing';
    frameCount = 0;
    screenShake = 0;
    messageTimer = 0;

    document.body.classList.add('playing');
    document.getElementById('title-overlay').style.display = 'none';
    document.getElementById('message-center').classList.remove('visible');

    createDrone();
    createElectricalHum();

    showMessage('电梯门打开，你走进了一个炽热的发电站...', 4);
  }
}

function startGame() {
  initAudio();
  applyLevelConfig(LEVEL1);
  currentLevel = 1;
  generateRoomTiles = generateBackroomsRoomTiles;
  mazeData = generateMaze('backrooms');

  // Place player in start room
  const startWX = mazeData.startRx * ROOM_PX + ROOM_PX / 2;
  const startWY = mazeData.startRy * ROOM_PX + ROOM_PX / 2;
  player = createPlayer(startWX, startWY);

  // Place entity between start and exit
  const midRx = Math.floor((mazeData.startRx + mazeData.exitRx) / 2) + 2;
  const midRy = Math.floor((mazeData.startRy + mazeData.exitRy) / 2) + 2;
  const entityWX = midRx * ROOM_PX + ROOM_PX / 2;
  const entityWY = midRy * ROOM_PX + ROOM_PX / 2;
  entity = createEntity(entityWX, entityWY);

  gameState = 'playing';
  frameCount = 0;
  screenShake = 0;
  messageTimer = 0;

  document.body.classList.add('playing');
  document.getElementById('title-overlay').style.display = 'none';
  document.getElementById('message-center').classList.remove('visible');

  createDrone();
  createHum();

  showMessage('你从现实中 noclipped 进入了后室...', 4);
}

function endGame(reason) {
  gameState = reason;
  stopAudioNode('drone');
  stopAudioNode('hum');
  stopAudioNode('electricalHum');
  document.body.classList.remove('playing');

  const overlay = document.getElementById('title-overlay');
  overlay.style.display = 'flex';

  if (reason === 'win') {
    playExitSound();
    overlay.querySelector('h1').textContent = '你逃出来了';
    overlay.querySelector('h1').style.color = '#aaddff';
    overlay.querySelector('.subtitle').textContent = '但后室永远不会消失...';
    overlay.querySelector('.btn').textContent = '再次进入';
    overlay.querySelector('.hint').textContent = '';
    showMessage('你找到了电梯，逃出了后室！', 5);
  } else {
    playDeathSound();
    overlay.querySelector('h1').textContent = '你被吞噬了';
    overlay.querySelector('h1').style.color = '#c0392b';
    overlay.querySelector('.subtitle').textContent = '后室又多了一个迷失的灵魂';
    overlay.querySelector('.btn').textContent = '重新开始';
    overlay.querySelector('.hint').textContent = '';
    showMessage('有什么东西抓住了你...', 4);
  }

  const btn = overlay.querySelector('.btn');
  btn.onclick = () => {
    overlay.querySelector('h1').textContent = 'BACKROOMS';
    overlay.querySelector('h1').style.color = '#c8a84e';
    overlay.querySelector('.subtitle').textContent = '后 室';
    overlay.querySelector('.btn').textContent = '进 入';
    overlay.querySelector('.hint').textContent = 'WASD 移动 · SHIFT 奔跑 · 寻找出口';
    stopAudioNode('drone');
    stopAudioNode('hum');
    stopAudioNode('electricalHum');
    startGame();
  };
}
