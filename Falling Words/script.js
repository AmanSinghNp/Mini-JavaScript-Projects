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
let particles = [];
let lastSpawnTime = 0;
let spawnInterval = 1000;
let currentTarget = null; 

class Word {
    constructor() {
        this.text = wordList[Math.floor(Math.random() * wordList.length)];
        this.x = Math.random() * (canvas.width - 150) + 50; 
        this.y = -40;
        this.speed = Math.random() * 2 + 1;
        this.color = '#fff';
        this.typed = 0;
    }

    draw() {
        ctx.font = "bold 24px 'Roboto Mono'";
        
        const typedPart = this.text.substring(0, this.typed);
        const untypedPart = this.text.substring(this.typed);
        const typedWidth = ctx.measureText(typedPart).width;
        
        ctx.fillStyle = '#00ff88';
        ctx.fillText(typedPart, this.x, this.y);
        
        ctx.fillStyle = this.color;
        ctx.fillText(untypedPart, this.x + typedWidth, this.y);
        
        if (this === currentTarget) {
            ctx.strokeStyle = '#ff0055';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x - 5, this.y - 25, ctx.measureText(this.text).width + 10, 35);
        }
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height) return false;
        return true;
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 2; // Size
        const speed = Math.random() * 4 + 2; 
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1.0;
        this.decay = Math.random() * 0.03 + 0.02;
        this.color = color;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        return this.life > 0;
    }

    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

function createExplosion(x, y, color = '#00ff88') {
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function animate(timeStamp) {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (timeStamp - lastSpawnTime > spawnInterval) {
        activeWords.push(new Word());
        lastSpawnTime = timeStamp;
    }

    // Update particles
    particles = particles.filter(p => {
        const alive = p.update();
        if (alive) p.draw();
        return alive;
    });

    // Update words
    activeWords = activeWords.filter(word => {
        const isActive = word.update();
        if (!isActive) {
            gameOver();
            return false; 
        }
        word.draw();
        return true;
    });

    if (!isGameOver) requestAnimationFrame(animate);
}

function gameOver() {
    isGameOver = true;
    document.getElementById('game-over').classList.remove('hidden');
    document.getElementById('final-score').innerText = score;
    currentTarget = null;
}

window.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    
    const key = e.key.toLowerCase();
    
    if (currentTarget) {
        const nextChar = currentTarget.text[currentTarget.typed];
        if (key === nextChar) {
            currentTarget.typed++;
            if (currentTarget.typed === currentTarget.text.length) {
                wordCompleted(currentTarget);
            }
        }
    } else {
        const potentialTargets = activeWords
            .filter(w => w.text.startsWith(key))
            .sort((a, b) => b.y - a.y);
            
        if (potentialTargets.length > 0) {
            currentTarget = potentialTargets[0];
            currentTarget.typed = 1;
            if (currentTarget.typed === currentTarget.text.length) {
                wordCompleted(currentTarget);
            }
        }
    }
});

function wordCompleted(word) {
    score += 10;
    document.getElementById('score').innerText = `Score: ${score}`;
    
    // Explosion center
    const textWidth = ctx.measureText(word.text).width;
    createExplosion(word.x + textWidth / 2, word.y);

    activeWords = activeWords.filter(w => w !== word);
    currentTarget = null;
    
    if (score % 50 === 0) spawnInterval = Math.max(500, spawnInterval - 50);
}

document.getElementById('restart-btn').addEventListener('click', () => {
    isGameOver = false;
    score = 0;
    activeWords = [];
    particles = [];
    currentTarget = null;
    spawnInterval = 1000;
    lastSpawnTime = 0;
    document.getElementById('score').innerText = 'Score: 0';
    document.getElementById('game-over').classList.add('hidden');
    requestAnimationFrame(animate);
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

requestAnimationFrame(animate);
