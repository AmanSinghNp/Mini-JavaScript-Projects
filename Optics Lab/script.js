const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 40;
const COLS = 20;
const ROWS = 15;

// Enums
const TYPES = {
    EMPTY: 0,
    WALL: 1,
    MIRROR_L: 2, // / Mirror (Reflects Up<->Right, Down<->Left)
    MIRROR_R: 3, // \ Mirror (Reflects Up<->Left, Down<->Right)
    SOURCE: 4,
    TARGET: 5
};

// Game State
let grid = [];
let laserSource = { x: 2, y: 8, dir: { x: 1, y: 0 } };
let target = { x: 17, y: 4, hit: false };
let selectedTool = 'mirror_l'; // Default tool

// Initialize Grid
function initGrid() {
    grid = new Array(COLS).fill(0).map(() => new Array(ROWS).fill(0));
    
    // Add some walls
    for(let y=3; y<12; y++) grid[10][y] = TYPES.WALL;
    
    // Set Target
    grid[target.x][target.y] = TYPES.TARGET;
}

// Mouse Interaction
let mouseX = 0;
let mouseY = 0;

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener('mousedown', (e) => {
    const x = Math.floor(mouseX / GRID_SIZE);
    const y = Math.floor(mouseY / GRID_SIZE);

    if (x >= 0 && x < COLS && y >= 0 && y < ROWS) {
        handleGridClick(x, y);
    }
});

function handleGridClick(x, y) {
    if (grid[x][y] === TYPES.WALL || grid[x][y] === TYPES.SOURCE || grid[x][y] === TYPES.TARGET) return;

    if (selectedTool === 'delete') {
        grid[x][y] = TYPES.EMPTY;
    } else if (selectedTool === 'mirror_l') {
        grid[x][y] = (grid[x][y] === TYPES.MIRROR_L) ? TYPES.MIRROR_R : TYPES.MIRROR_L;
    }
}

// Tool Selection
document.querySelectorAll('.tool').forEach(tool => {
    tool.addEventListener('click', () => {
        document.querySelectorAll('.tool').forEach(t => t.classList.remove('active'));
        tool.classList.add('active');
        selectedTool = tool.dataset.type;
    });
});

document.getElementById('resetBtn').addEventListener('click', () => {
    initGrid();
});

// Main Loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    // Check win condition is handled in castLaser
}

function draw() {
    // Background
    ctx.fillStyle = '#0f1115';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();
    drawElements();
    drawSource();
    castLaser();
    
    // Hover effect
    const hx = Math.floor(mouseX / GRID_SIZE);
    const hy = Math.floor(mouseY / GRID_SIZE);
    if (hx >= 0 && hx < COLS && hy >= 0 && hy < ROWS) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect(hx * GRID_SIZE, hy * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    }
}

function drawGrid() {
    ctx.strokeStyle = '#1e222b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }
    for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();
}

function drawElements() {
    for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < ROWS; y++) {
            const type = grid[x][y];
            const px = x * GRID_SIZE;
            const py = y * GRID_SIZE;

            if (type === TYPES.WALL) {
                ctx.fillStyle = '#444';
                ctx.fillRect(px + 2, py + 2, GRID_SIZE - 4, GRID_SIZE - 4);
                ctx.shadowBlur = 0;
            } else if (type === TYPES.MIRROR_L) {
                drawMirror(px, py, '/');
            } else if (type === TYPES.MIRROR_R) {
                drawMirror(px, py, '\\');
            } else if (type === TYPES.TARGET) {
                ctx.fillStyle = target.hit ? '#00ff00' : '#ff0055';
                ctx.beginPath();
                ctx.arc(px + GRID_SIZE/2, py + GRID_SIZE/2, 10, 0, Math.PI*2);
                ctx.fill();
                // Glow
                ctx.shadowColor = target.hit ? '#00ff00' : '#ff0055';
                ctx.shadowBlur = target.hit ? 20 : 5;
                ctx.strokeStyle = '#fff';
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        }
    }
}

function drawMirror(x, y, type) {
    ctx.strokeStyle = '#aaddff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    if (type === '/') {
        ctx.moveTo(x + GRID_SIZE - 5, y + 5);
        ctx.lineTo(x + 5, y + GRID_SIZE - 5);
    } else {
        ctx.moveTo(x + 5, y + 5);
        ctx.lineTo(x + GRID_SIZE - 5, y + GRID_SIZE - 5);
    }
    ctx.stroke();
    
    // Backing
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (type === '/') {
        ctx.moveTo(x + GRID_SIZE - 2, y + 8);
        ctx.lineTo(x + 8, y + GRID_SIZE - 2);
    } else {
        ctx.moveTo(x + 2, y + 8);
        ctx.lineTo(x + GRID_SIZE - 8, y + GRID_SIZE - 2);
    }
    ctx.stroke();
}

function drawSource() {
    const x = laserSource.x * GRID_SIZE + GRID_SIZE / 2;
    const y = laserSource.y * GRID_SIZE + GRID_SIZE / 2;
    
    ctx.fillStyle = '#00f0ff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00f0ff';
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function castLaser() {
    let x = laserSource.x * GRID_SIZE + GRID_SIZE / 2;
    let y = laserSource.y * GRID_SIZE + GRID_SIZE / 2;
    // Normalized direction
    let dx = laserSource.dir.x;
    let dy = laserSource.dir.y;

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f0ff';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(x, y);

    let currentX = x;
    let currentY = y;
    let dist = 0;
    const MAX_DIST = 2000;
    target.hit = false;

    // Small step raymarching
    const STEP = 5; 

    while (dist < MAX_DIST) {
        currentX += dx * STEP;
        currentY += dy * STEP;
        dist += STEP;

        // Check bounds
        if (currentX < 0 || currentX > canvas.width || currentY < 0 || currentY > canvas.height) {
            break;
        }

        // Grid coordinates
        let gx = Math.floor(currentX / GRID_SIZE);
        let gy = Math.floor(currentY / GRID_SIZE);

        if (gx >= 0 && gx < COLS && gy >= 0 && gy < ROWS) {
            const cell = grid[gx][gy];
            
            // Check interaction with center of cell (approximation)
            // We want to hit the mirror effectively.
            // Simplified: if we enter a cell with a mirror, reflect immediately from center.
            // A better way is to snap to grid center when hitting a mirror.
            
            // let cx = gx * GRID_SIZE + GRID_SIZE/2;
            // let cy = gy * GRID_SIZE + GRID_SIZE/2;
            
            // But doing continuous ray casting, we might miss the exact center.
            // Let's check distance to center.
            
            let cx = gx * GRID_SIZE + GRID_SIZE/2;
            let cy = gy * GRID_SIZE + GRID_SIZE/2;
            
            if (Math.abs(currentX - cx) < STEP && Math.abs(currentY - cy) < STEP) {
                // We are roughly at center
                if (cell === TYPES.WALL) {
                    // Hit wall, stop
                    ctx.lineTo(cx, cy);
                    break;
                } else if (cell === TYPES.TARGET) {
                    target.hit = true;
                    document.getElementById('status').innerText = "TARGET ACQUIRED!";
                    document.getElementById('status').style.color = "#00ff00";
                    ctx.lineTo(cx, cy);
                    break; // Absorb
                } else if (cell === TYPES.MIRROR_L) {
                    // / Mirror: (1,0) -> (0,-1) | (-1,0) -> (0,1) | (0,1) -> (-1,0) | (0,-1) -> (1,0)
                    // Swap x/y and negate both?
                    // R: (x,y) -> (-y, -x)
                    let temp = dx;
                    dx = -dy;
                    dy = -temp;
                    ctx.lineTo(cx, cy); // Draw to pivot
                    currentX = cx; // Snap
                    currentY = cy;
                } else if (cell === TYPES.MIRROR_R) {
                    // \ Mirror: (1,0) -> (0,1) | (-1,0) -> (0,-1) | (0,1) -> (1,0) | (0,-1) -> (-1,0)
                    // R: (x,y) -> (y, x)
                    let temp = dx;
                    dx = dy;
                    dy = temp;
                    ctx.lineTo(cx, cy);
                    currentX = cx;
                    currentY = cy;
                }
            }
        }
    }

    ctx.lineTo(currentX, currentY);
    ctx.stroke();
    ctx.shadowBlur = 0;
}

initGrid(); gameLoop();
