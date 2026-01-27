// Configuration
let pointCount = 15;
let delayMs = 300;

// State
let points = [];
let hull = [];
let isRunning = false;

// DOM
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const generateBtn = document.getElementById('generate-btn');
const clearBtn = document.getElementById('clear-btn');
const startBtn = document.getElementById('start-btn');
const countInput = document.getElementById('count-input');
const speedInput = document.getElementById('speed-input');
const countValue = document.getElementById('count-value');
const speedValue = document.getElementById('speed-value');
const pointCountDisplay = document.getElementById('point-count');
const hullCountDisplay = document.getElementById('hull-count');
const messageBox = document.getElementById('message-box');

// Helpers
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function log(msg) {
    messageBox.textContent = msg;
}

function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    draw();
}

// Point operations
function generatePoints() {
    if (isRunning) return;
    points = [];
    hull = [];
    const padding = 40;
    
    for (let i = 0; i < pointCount; i++) {
        points.push({
            x: padding + Math.random() * (canvas.width - 2 * padding),
            y: padding + Math.random() * (canvas.height - 2 * padding)
        });
    }
    
    updateStats();
    draw();
    log(`Generated ${pointCount} random points.`);
}

function clearAll() {
    if (isRunning) return;
    points = [];
    hull = [];
    updateStats();
    draw();
    log('Cleared. Click on canvas to add points.');
}

function updateStats() {
    pointCountDisplay.textContent = points.length;
    hullCountDisplay.textContent = hull.length;
}

// Drawing
function draw(scanningIndices = [], pivotIndex = -1) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw hull edges
    if (hull.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 3;
        ctx.moveTo(hull[0].x, hull[0].y);
        for (let i = 1; i < hull.length; i++) {
            ctx.lineTo(hull[i].x, hull[i].y);
        }
        if (hull.length > 2) {
            ctx.lineTo(hull[0].x, hull[0].y);
        }
        ctx.stroke();
    }
    
    // Draw scanning lines
    if (scanningIndices.length >= 2) {
        ctx.beginPath();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        const p1 = points[scanningIndices[0]];
        const p2 = points[scanningIndices[1]];
        if (p1 && p2) {
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    // Draw points
    points.forEach((p, i) => {
        ctx.beginPath();
        
        if (i === pivotIndex) {
            ctx.fillStyle = '#ef4444'; // Pivot - red
            ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        } else if (scanningIndices.includes(i)) {
            ctx.fillStyle = '#f59e0b'; // Scanning - amber
            ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        } else if (hull.includes(p)) {
            ctx.fillStyle = '#22c55e'; // Hull - green
            ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        } else {
            ctx.fillStyle = '#3b82f6'; // Default - blue
            ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        }
        
        ctx.fill();
    });
}

// Graham Scan Algorithm
function cross(O, A, B) {
    return (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);
}

function polarAngle(pivot, point) {
    return Math.atan2(point.y - pivot.y, point.x - pivot.x);
}

async function grahamScan() {
    if (points.length < 3) {
        log('Need at least 3 points to form a hull.');
        return;
    }
    
    isRunning = true;
    toggleControls(false);
    hull = [];
    
    // Find pivot (lowest y, then leftmost x)
    let pivotIdx = 0;
    for (let i = 1; i < points.length; i++) {
        if (points[i].y > points[pivotIdx].y || 
            (points[i].y === points[pivotIdx].y && points[i].x < points[pivotIdx].x)) {
            pivotIdx = i;
        }
    }
    
    const pivot = points[pivotIdx];
    log('Found pivot point (lowest point).');
    draw([], pivotIdx);
    await delay(delayMs);
    
    // Sort by polar angle
    const sorted = points.slice().sort((a, b) => {
        if (a === pivot) return -1;
        if (b === pivot) return 1;
        const angleA = polarAngle(pivot, a);
        const angleB = polarAngle(pivot, b);
        if (angleA !== angleB) return angleA - angleB;
        // If same angle, closer point first
        const distA = (a.x - pivot.x) ** 2 + (a.y - pivot.y) ** 2;
        const distB = (b.x - pivot.x) ** 2 + (b.y - pivot.y) ** 2;
        return distA - distB;
    });
    
    // Update points array to sorted order for visualization
    points = sorted;
    log('Sorted points by polar angle.');
    draw([], 0);
    await delay(delayMs);
    
    // Build hull
    hull = [points[0], points[1]];
    draw();
    await delay(delayMs);
    
    for (let i = 2; i < points.length; i++) {
        if (!isRunning) return;
        
        log(`Processing point ${i + 1} of ${points.length}...`);
        
        // Check turn direction
        while (hull.length > 1 && cross(hull[hull.length - 2], hull[hull.length - 1], points[i]) <= 0) {
            if (!isRunning) return;
            
            // Highlight the three points being checked
            const idx1 = points.indexOf(hull[hull.length - 2]);
            const idx2 = points.indexOf(hull[hull.length - 1]);
            draw([idx1, idx2, i], 0);
            await delay(delayMs / 2);
            
            hull.pop(); // Remove point that makes clockwise turn
            draw();
            await delay(delayMs / 2);
        }
        
        hull.push(points[i]);
        draw([points.indexOf(hull[hull.length - 2]), i], 0);
        await delay(delayMs);
    }
    
    updateStats();
    draw();
    
    isRunning = false;
    toggleControls(true);
    log(`Convex hull found with ${hull.length} vertices!`);
}

function toggleControls(enable) {
    generateBtn.disabled = !enable;
    clearBtn.disabled = !enable;
    startBtn.disabled = !enable;
    countInput.disabled = !enable;
    
    [generateBtn, clearBtn, startBtn].forEach(btn => {
        if (enable) {
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            btn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    });
}

// Event Listeners
generateBtn.addEventListener('click', generatePoints);
clearBtn.addEventListener('click', clearAll);
startBtn.addEventListener('click', grahamScan);

countInput.addEventListener('input', (e) => {
    pointCount = parseInt(e.target.value, 10);
    countValue.textContent = pointCount;
});

speedInput.addEventListener('input', (e) => {
    delayMs = parseInt(e.target.value, 10);
    speedValue.textContent = delayMs;
});

canvas.addEventListener('click', (e) => {
    if (isRunning) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    points.push({ x, y });
    hull = []; // Reset hull when adding points
    updateStats();
    draw();
    log(`Added point at (${Math.round(x)}, ${Math.round(y)}). Total: ${points.length}`);
});

// Init
window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', () => {
    resizeCanvas();
    generatePoints();
});
