const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Set canvas/screen size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Configuration
let score = 0;
let isGameOver = false;
const wordList = [
    'hello', 'world', 'code', 'javascript', 'falling', 'rain', 'typing', 'game',
    'computer', 'keyboard', 'screen', 'pixel', 'animation', 'browser', 'logic',
    'syntax', 'variable', 'function', 'object', 'array', 'loop', 'condition',
    'event', 'listener', 'canvas', 'context', 'visual', 'design', 'style',
    'create', 'destroy', 'update', 'render', 'frame', 'time', 'speed', 'score',
    'stream', 'input', 'output', 'system', 'network', 'server', 'client'
];

// Game State
let activeWords = [];
let lastSpawnTime = 0;
let spawnInterval = 1000;

class Word {
    constructor() {
        this.text = wordList[Math.floor(Math.random() * wordList.length)];
        this.x = Math.random() * (canvas.width - 150) + 50; 
        this.y = -40;
        this.speed = Math.random() * 2 + 1;
        this.color = '#fff';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.font = "bold 24px 'Roboto Mono'";
        ctx.fillText(this.text, this.x, this.y);
    }

    update() {
        this.y += this.speed;
        // Check if word hits bottom
        if (this.y > canvas.height) {
            return false; // Off screen
        }
        return true;
    }
}

function animate(timeStamp) {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (timeStamp - lastSpawnTime > spawnInterval) {
        activeWords.push(new Word());
        lastSpawnTime = timeStamp;
    }

    // Filter out words that went off screen
    activeWords = activeWords.filter(word => {
        const isActive = word.update();
        if (isActive) {
            word.draw();
        }
        return isActive;
    });

    requestAnimationFrame(animate);
}

// Event Listeners
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Start loop
requestAnimationFrame(animate);
