// Configuration
const MIN_VAL = 5;
const MAX_VAL = 100;
let arraySize = 20;
let delayMs = 120;

// State
let array = [];
let isSorting = false;
let currentAlgo = 'bubble';

// DOM
const container = document.getElementById('array-container');
const generateBtn = document.getElementById('generate-btn');
const startBtn = document.getElementById('start-btn');
const compCountDisplay = document.getElementById('comp-count');
const swapCountDisplay = document.getElementById('swap-count');
const messageBox = document.getElementById('message-box');
const sizeInput = document.getElementById('size-input');
const speedInput = document.getElementById('speed-input');
const sizeValue = document.getElementById('size-value');
const speedValue = document.getElementById('speed-value');

// Algo Buttons
const algoBtns = {
    bubble: document.getElementById('bubble-btn'),
    selection: document.getElementById('selection-btn'),
    insertion: document.getElementById('insertion-btn')
};

// Helper: Log
function log(msg) {
    messageBox.textContent = msg;
}

// Helper: Delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Generate Array
function generateArray() {
    if(isSorting) return;
    array = [];
    container.innerHTML = '';
    
    for (let i = 0; i < arraySize; i++) {
        const val = Math.floor(Math.random() * (MAX_VAL - MIN_VAL + 1)) + MIN_VAL;
        array.push(val);
        
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${val}%`;
        bar.style.width = `${100/arraySize}%`; // fluid width
        container.appendChild(bar);
    }
    
    resetStats();
    log(`Generated new array of ${arraySize} items.`);
}

function resetStats() {
    compCountDisplay.textContent = '0';
    swapCountDisplay.textContent = '0';
    // Clear colors
    const bars = document.querySelectorAll('.bar');
    bars.forEach(b => b.className = 'bar');
}

// Visual Operations
async function updateStats(comp, swap) {
    if(comp !== undefined) compCountDisplay.textContent = parseInt(compCountDisplay.textContent) + comp;
    if(swap !== undefined) swapCountDisplay.textContent = parseInt(swapCountDisplay.textContent) + swap;
}

async function setColor(indices, colorClass) {
    const bars = document.querySelectorAll('.bar');
    indices.forEach(i => {
        if(bars[i]) {
            bars[i].className = 'bar'; // reset
            if(colorClass) bars[i].classList.add(colorClass);
        }
    });
}

async function swapBars(i, j) {
    const bars = document.querySelectorAll('.bar');
    const h1 = bars[i].style.height;
    const h2 = bars[j].style.height;
    
    bars[i].style.height = h2;
    bars[j].style.height = h1;
}

// Algorithms
async function bubbleSort() {
    const len = array.length;
    for (let i = 0; i < len; i++) {
        for (let j = 0; j < len - i - 1; j++) {
            if(!isSorting) return;

            // Compare
            await setColor([j, j+1], 'bar-compare');
            await updateStats(1, 0);
            await delay(delayMs);

            if (array[j] > array[j + 1]) {
                // Swap Logic
                let temp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = temp;

                // Swap Visual
                await setColor([j, j+1], 'bar-swap');
                await swapBars(j, j+1);
                await updateStats(0, 1);
                await delay(delayMs);
            }
            
            // Reset color
            await setColor([j, j+1], null);
        }
        // Mark sorted
        await setColor([len - i - 1], 'bar-sorted');
    }
}

async function selectionSort() {
    const len = array.length;
    for (let i = 0; i < len; i++) {
        let minIdx = i;
        await setColor([i], 'bar-compare'); // current position
        
        for (let j = i + 1; j < len; j++) {
            if(!isSorting) return;

            await setColor([j, minIdx], 'bar-compare');
            await updateStats(1, 0);
            await delay(delayMs/2);

            if (array[j] < array[minIdx]) {
                await setColor([minIdx], null); // unmark old min
                minIdx = j;
                await setColor([minIdx], 'bar-swap'); // new min
            } else {
                await setColor([j], null);
            }
        }

        if (minIdx !== i) {
            let temp = array[i];
            array[i] = array[minIdx];
            array[minIdx] = temp;
            
            await swapBars(i, minIdx);
            await updateStats(0, 1);
        }
        
        await setColor([i], 'bar-sorted');
        await setColor([minIdx], null); // reset min visual if it wasn't swapped to sorted pos
    }
}

async function insertionSort() {
    const len = array.length;
    for (let i = 1; i < len; i++) {
        let key = array[i];
        let j = i - 1;
        
        await setColor([i], 'bar-compare'); // Key
        await delay(delayMs);

        while (j >= 0 && array[j] > key) {
            if(!isSorting) return;
            
            await updateStats(1, 0);
            await setColor([j, j+1], 'bar-swap');
            
            array[j + 1] = array[j];
            
            // Visual shift (swap height effectively)
            // But usually insertion sort overwrites. For visual, we can just simulate swap.
            const bars = document.querySelectorAll('.bar');
            bars[j+1].style.height = bars[j].style.height;
            
            await delay(delayMs);
            await setColor([j, j+1], null);
            
            j = j - 1;
        }
        
        array[j + 1] = key;
        const bars = document.querySelectorAll('.bar');
        bars[j+1].style.height = `${key}%`;
        
        await updateStats(0, 1); // treating insertion as a move/swap
        
        // Mark sorted up to i
        for(let k=0; k<=i; k++) await setColor([k], 'bar-sorted');
    }
}

// Controller
async function startSort() {
    if(isSorting) return;
    isSorting = true;
    toggleControls(false);
    log(`Running ${currentAlgo === 'bubble' ? 'Bubble' : currentAlgo === 'selection' ? 'Selection' : 'Insertion'} Sort...`);

    if(currentAlgo === 'bubble') await bubbleSort();
    else if(currentAlgo === 'selection') await selectionSort();
    else if(currentAlgo === 'insertion') await insertionSort();

    isSorting = false;
    toggleControls(true);
    log('Sorting Complete!');
}

function toggleControls(enable) {
    generateBtn.disabled = !enable;
    startBtn.disabled = !enable;
    
    // Algo btns
    Object.values(algoBtns).forEach(b => {
        b.disabled = !enable;
        b.style.opacity = enable ? '1' : '0.5';
    });
    
    if(enable) {
        generateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        startBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        generateBtn.classList.add('opacity-50', 'cursor-not-allowed');
        startBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

// Event Listeners
generateBtn.addEventListener('click', generateArray);
startBtn.addEventListener('click', startSort);

// Algo Selection
Object.keys(algoBtns).forEach(algo => {
    algoBtns[algo].addEventListener('click', () => {
        if(isSorting) return;
        currentAlgo = algo;
        // Update UI
        Object.values(algoBtns).forEach(b => b.classList.remove('active'));
        algoBtns[algo].classList.add('active');
    });
});

// Controls: size & speed
sizeInput.addEventListener('input', (e) => {
    if(isSorting) return;
    arraySize = parseInt(e.target.value, 10);
    sizeValue.textContent = arraySize;
    generateArray();
});

speedInput.addEventListener('input', (e) => {
    delayMs = parseInt(e.target.value, 10);
    speedValue.textContent = delayMs;
});

// Init
generateArray();


