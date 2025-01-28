const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 40;
const COLS = canvas.width / GRID_SIZE;
const ROWS = canvas.height / GRID_SIZE;

// Game State
let laserSource = { x: 2, y: 8, dir: { x: 1, y: 0 } }; // Starting position and direction
let target = { x: 18, y: 8 };
let walls = [
    { x: 10, y: 5, w: 1, h: 5 }, // A simple obstacle
];

// Main Game Loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    // Logic updates will go here
}

function draw() {
    // Clear Screen
    ctx.fillStyle = '#0a0c10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid
    drawGrid();

    // Draw Walls
    ctx.fillStyle = '#444';
    walls.forEach(wall => {
        ctx.fillRect(wall.x * GRID_SIZE, wall.y * GRID_SIZE, wall.w * GRID_SIZE, wall.h * GRID_SIZE);
    });

    // Draw Target
    drawTarget();

    // Draw Laser Source
    drawSource();

    // Cast Laser
    castLaser();
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

function drawSource() {
    const x = laserSource.x * GRID_SIZE + GRID_SIZE / 2;
    const y = laserSource.y * GRID_SIZE + GRID_SIZE / 2;
    
    ctx.fillStyle = '#00f0ff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00f0ff';
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Direction indicator
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + laserSource.dir.x * 20, y + laserSource.dir.y * 20);
    ctx.stroke();
}

function drawTarget() {
    const x = target.x * GRID_SIZE + GRID_SIZE / 2;
    const y = target.y * GRID_SIZE + GRID_SIZE / 2;

    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
}

function castLaser() {
    let x = laserSource.x * GRID_SIZE + GRID_SIZE / 2;
    let y = laserSource.y * GRID_SIZE + GRID_SIZE / 2;
    let dx = laserSource.dir.x;
    let dy = laserSource.dir.y;

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f0ff';
    
    ctx.beginPath();
    ctx.moveTo(x, y);

    // Simple ray casting: just go until we hit a wall or edge
    let currentX = x;
    let currentY = y;
    let steps = 0;
    const maxSteps = 1000;

    while (steps < maxSteps) {
        currentX += dx * 5;
        currentY += dy * 5;
        steps++;

        // Check bounds
        if (currentX < 0 || currentX > canvas.width || currentY < 0 || currentY > canvas.height) {
            break;
        }

        // Check walls (simple bounding box)
        let hitWall = false;
        for (let w of walls) {
            let wx = w.x * GRID_SIZE;
            let wy = w.y * GRID_SIZE;
            let ww = w.w * GRID_SIZE;
            let wh = w.h * GRID_SIZE;
            
            if (currentX > wx && currentX < wx + ww && currentY > wy && currentY < wy + wh) {
                hitWall = true;
                break;
            }
        }
        if (hitWall) break;
    }

    ctx.lineTo(currentX, currentY);
    ctx.stroke();
    ctx.shadowBlur = 0;
}

// Start
gameLoop();
