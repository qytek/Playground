// ============ AUDIO ENGINE ============
let audioCtx = null;
let masterGain = null;
let audioNodes = {};

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.3;
  masterGain.connect(audioCtx.destination);
}

function createDrone() {
  if (!audioCtx) return;
  stopAudioNode('drone');
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc.type = 'sawtooth';
  osc.frequency.value = 58;

  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  lfo.frequency.value = 0.15;
  lfoGain.gain.value = 3;
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  filter.type = 'lowpass';
  filter.frequency.value = 200;
  filter.Q.value = 3;

  gain.gain.value = 0.12;

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);

  osc.start();
  lfo.start();
  audioNodes.drone = { osc, gain, filter, lfo, lfoGain };
}

function createHum() {
  if (!audioCtx) return;
  stopAudioNode('hum');
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.value = 120;
  gain.gain.value = 0.04;

  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  lfo.frequency.value = 59.7;
  lfoGain.gain.value = 0.5;
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start();
  lfo.start();
  audioNodes.hum = { osc, gain, lfo, lfoGain };
}

function playFootstep() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = 40 + Math.random() * 30;
  gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.1);
}

function playHeartbeat() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 55;
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 100;
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.2);
}

function playEntityGrowl() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(80, audioCtx.currentTime);
  osc.frequency.linearRampToValueAtTime(30, audioCtx.currentTime + 0.6);
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.7);
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 250;
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.8);
}

function playExitSound() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 1.5);
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 1.5);
  gain.connect(masterGain);
  osc.connect(gain);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 2);
}

function playDeathSound() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(150, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(20, audioCtx.currentTime + 1.0);
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(500, audioCtx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + 1.0);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 1.3);
}

function stopAudioNode(name) {
  if (audioNodes[name]) {
    try {
      for (const n of Object.values(audioNodes[name])) {
        if (n && typeof n.stop === 'function') n.stop();
      }
    } catch(e) {}
    delete audioNodes[name];
  }
}
