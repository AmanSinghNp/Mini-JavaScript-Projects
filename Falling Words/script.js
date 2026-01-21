const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Set canvas/screen size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Configuration
let score = 0;
let isGameOver = false;

// Event Listeners
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

console.log("Falling Words Game Initialized");
