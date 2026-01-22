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
let currentTarget = null; // The word currently being typed

class Word {
    constructor() {
        this.text = wordList[Math.floor(Math.random() * wordList.length)];
        this.x = Math.random() * (canvas.width - 150) + 50; 
        this.y = -40;
        this.speed = Math.random() * 2 + 1;
        this.color = '#fff';
        this.typed = 0; // Number of characters correctly typed so far
    }

    draw() {
        ctx.font = "bold 24px 'Roboto Mono'";
        
        // Draw typed part in green, rest in white
        const typedPart = this.text.substring(0, this.typed);
        const untypedPart = this.text.substring(this.typed);
        
        // Measure to draw seamlessly
        const typedWidth = ctx.measureText(typedPart).width;
        
        ctx.fillStyle = '#00ff88';
        ctx.fillText(typedPart, this.x, this.y);
        
        ctx.fillStyle = this.color;
        ctx.fillText(untypedPart, this.x + typedWidth, this.y);
        
        // Highlight active target
        if (this === currentTarget) {
            ctx.strokeStyle = '#ff0055';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x - 5, this.y - 25, ctx.measureText(this.text).width + 10, 35);
        }
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

    // Filter and update
    activeWords = activeWords.filter(word => {
        const isActive = word.update();
        if (!isActive) {
            // Game Over if a word hits the bottom
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

// Typing Logic
window.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    
    const key = e.key.toLowerCase();
    
    // Ignore non-character keys (shift, ctrl, etc) if needed, 
    // but simplified check is fine for now.

    if (currentTarget) {
        const nextChar = currentTarget.text[currentTarget.typed];
        if (key === nextChar) {
            currentTarget.typed++;
            if (currentTarget.typed === currentTarget.text.length) {
                // Word Completed
                wordCompleted(currentTarget);
            }
        }
    } else {
        // Find new target
        // Prioritize words closest to bottom (largest y)
        const potentialTargets = activeWords
            .filter(w => w.text.startsWith(key))
            .sort((a, b) => b.y - a.y); // Descending y
            
        if (potentialTargets.length > 0) {
            currentTarget = potentialTargets[0];
            currentTarget.typed = 1;
            
            // Check if 1-letter word
            if (currentTarget.typed === currentTarget.text.length) {
                wordCompleted(currentTarget);
            }
        }
    }
});

function wordCompleted(word) {
    score += 10;
    document.getElementById('score').innerText = `Score: ${score}`;
    
    // Remove from array
    activeWords = activeWords.filter(w => w !== word);
    currentTarget = null;
    
    // Increase difficulty? (optional)
    if (score % 50 === 0) spawnInterval = Math.max(500, spawnInterval - 50);
}

// Restart
document.getElementById('restart-btn').addEventListener('click', () => {
    isGameOver = false;
    score = 0;
    activeWords = [];
    currentTarget = null;
    spawnInterval = 1000;
    lastSpawnTime = 0;
    document.getElementById('score').innerText = 'Score: 0';
    document.getElementById('game-over').classList.add('hidden');
    requestAnimationFrame(animate);
});

// Event Listeners
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Start loop
requestAnimationFrame(animate);
