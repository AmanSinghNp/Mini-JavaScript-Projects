import { WORLD_MAP } from './map.js';
import { player } from './player.js';

const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');
const minimapCanvas = document.getElementById('minimap');
const mCtx = minimapCanvas.getContext('2d');

const fpsCounter = document.getElementById('fps-counter');
const debugX = document.getElementById('debug-x');
const debugY = document.getElementById('debug-y');
const debugDir = document.getElementById('debug-dir');

let lastTime = 0;

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

function resize() {
    // Make sure the canvas buffer matches the display size for crisp rendering
    // or use a smaller internal resolution for retro feel
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    minimapCanvas.width = minimapCanvas.clientWidth;
    minimapCanvas.height = minimapCanvas.clientHeight;
}
window.addEventListener('resize', resize);
resize();

function update(dt) {
    // Movement logic will go here
}

function render() {
    // Clear screen
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Raycasting logic will go here
}

function gameLoop(time) {
    const dt = (time - lastTime) / 1000;
    lastTime = time;

    if (fpsCounter) fpsCounter.innerText = Math.round(1 / dt);

    update(dt);
    render();
    
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

