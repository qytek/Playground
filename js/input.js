// ============ INPUT HANDLING ============
const keys = {};

// Keyboard
window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'KeyW' || e.code === 'KeyS' || e.code === 'KeyA' || e.code === 'KeyD' ||
      e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'ArrowLeft' || e.code === 'ArrowRight' ||
      e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
    e.preventDefault();
  }
});
window.addEventListener('keyup', e => {
  keys[e.code] = false;
});

// Touch device detection
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
if (isTouchDevice) {
  document.body.classList.add('touch-device');
}

// Touch D-pad
(function setupTouchControls() {
  // Map touch identifier -> { key, btn }
  const activeTouches = new Map();

  function handleTouchStart(e) {
    const btn = e.target.closest('.touch-btn');
    if (!btn) return;
    e.preventDefault();
    const key = btn.dataset.key;
    keys[key] = true;
    btn.classList.add('active');
    for (const touch of e.changedTouches) {
      activeTouches.set(touch.identifier, { key, btn });
    }
  }

  function releaseTouch(identifier) {
    const info = activeTouches.get(identifier);
    if (!info) return false;
    // Check if another finger is still pressing the same button
    let stillHeld = false;
    for (const [id, other] of activeTouches) {
      if (id !== identifier && other.key === info.key) {
        stillHeld = true;
        break;
      }
    }
    if (!stillHeld) {
      keys[info.key] = false;
      info.btn.classList.remove('active');
    }
    activeTouches.delete(identifier);
    return true;
  }

  function handleTouchEnd(e) {
    for (const touch of e.changedTouches) {
      releaseTouch(touch.identifier);
    }
  }

  function handleTouchCancel(e) {
    for (const touch of e.changedTouches) {
      releaseTouch(touch.identifier);
    }
  }

  const controls = document.getElementById('touch-controls');
  controls.addEventListener('touchstart', handleTouchStart, { passive: false });
  controls.addEventListener('touchend', handleTouchEnd, { passive: false });
  controls.addEventListener('touchcancel', handleTouchCancel, { passive: false });
})();
