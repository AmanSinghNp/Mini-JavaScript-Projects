// Configuration
let N = 4;
let delayMs = 500;
let isRunning = false;
let shouldStop = false;

// DOM
const board = document.getElementById('board');
const nInput = document.getElementById('n-input');
const speedInput = document.getElementById('speed-input');
const solveBtn = document.getElementById('solve-btn');
const stopBtn = document.getElementById('stop-btn');
const messageBox = document.getElementById('message-box');

// Helper: Log
function log(msg, type = 'info') {
    messageBox.textContent = msg;
    messageBox.className = 'text-sm leading-snug transition-colors';
    if (type === 'error') messageBox.classList.add('text-red-500', 'font-medium');
    else if (type === 'success') messageBox.classList.add('text-green-600', 'font-medium');
    else messageBox.classList.add('text-slate-600');
}

// Logic
function createBoard() {
    board.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
    board.innerHTML = '';
    
    for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            // Chess pattern
            if ((r + c) % 2 === 1) cell.classList.add('cell-dark');
            else cell.classList.add('cell-light');
            
            cell.id = `cell-${r}-${c}`;
            board.appendChild(cell);
        }
    }
}

async function solveNQueens() {
    if (isRunning) return;
    N = parseInt(nInput.value);
    if (isNaN(N) || N < 4 || N > 8) {
        log('N must be between 4 and 8.', 'error');
        return;
    }

    createBoard();
    isRunning = true;
    shouldStop = false;
    toggleControls(false);
    log(`Solving for N=${N}...`);

    const boardState = new Array(N).fill(-1); // row -> col index of queen
    const success = await backtrack(boardState, 0);

    if (success) log('Solution Found!', 'success');
    else if (shouldStop) log('Stopped.', 'info');
    else log('No Solution Found.', 'error');

    isRunning = false;
    toggleControls(true);
}

async function backtrack(boardState, row) {
    if (shouldStop) return false;

    if (row === N) {
        return true;
    }

    for (let col = 0; col < N; col++) {
        if (shouldStop) return false;

        // Visual: Try placing
        const cell = document.getElementById(`cell-${row}-${col}`);
        const queen = document.createElement('div');
        queen.className = 'queen';
        queen.textContent = '♕';
        cell.appendChild(queen);
        
        await wait(delayMs);

        if (isValid(boardState, row, col)) {
            // Visual: Valid
            cell.classList.add('cell-safe');
            boardState[row] = col;
            
            if (await backtrack(boardState, row + 1)) return true;
            
            // Backtrack visual
            boardState[row] = -1;
            cell.classList.remove('cell-safe');
        } else {
            // Visual: Invalid
            cell.classList.add('cell-danger');
            await wait(delayMs / 2);
            cell.classList.remove('cell-danger');
        }

        // Remove queen (backtrack or move to next col)
        cell.removeChild(queen);
    }

    return false;
}

function isValid(boardState, row, col) {
    for (let i = 0; i < row; i++) {
        const prevCol = boardState[i];
        if (prevCol === col || Math.abs(prevCol - col) === Math.abs(i - row)) {
            return false;
        }
    }
    return true;
}

function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function toggleControls(enable) {
    solveBtn.disabled = !enable;
    nInput.disabled = !enable;
}

solveBtn.addEventListener('click', solveNQueens);
stopBtn.addEventListener('click', () => { shouldStop = true; });
speedInput.addEventListener('input', (e) => delayMs = parseInt(e.target.value));

// Init
createBoard();



