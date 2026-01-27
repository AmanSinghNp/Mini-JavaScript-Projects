// Configuration
let arraySize = 15;
let delayMs = 500;

// State
let array = [];
let isSearching = false;

// DOM
const arrayContainer = document.getElementById('array-container');
const generateBtn = document.getElementById('generate-btn');
const searchBtn = document.getElementById('search-btn');
const randomTargetBtn = document.getElementById('random-target-btn');
const targetInput = document.getElementById('target-input');
const sizeInput = document.getElementById('size-input');
const speedInput = document.getElementById('speed-input');
const sizeValue = document.getElementById('size-value');
const speedValue = document.getElementById('speed-value');
const compCount = document.getElementById('comp-count');
const maxSteps = document.getElementById('max-steps');
const rangeDisplay = document.getElementById('range-display');
const messageBox = document.getElementById('message-box');
const stepLog = document.getElementById('step-log');
const leftLabel = document.getElementById('left-label');
const midLabel = document.getElementById('mid-label');
const rightLabel = document.getElementById('right-label');

// Helpers
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function log(msg) {
    messageBox.textContent = msg;
}

function addStep(text, type = 'normal') {
    const entry = document.createElement('div');
    entry.className = type === 'found' ? 'text-green-400' : 
                     type === 'not-found' ? 'text-red-400' : 
                     type === 'compare' ? 'text-yellow-400' : 'text-slate-300';
    entry.textContent = `> ${text}`;
    stepLog.appendChild(entry);
    stepLog.scrollTop = stepLog.scrollHeight;
}

function clearLog() {
    stepLog.innerHTML = '<div class="text-slate-500">// Starting binary search...</div>';
}

// Generate sorted array
function generateArray() {
    if (isSearching) return;
    
    array = [];
    const used = new Set();
    
    // Generate unique random values
    while (array.length < arraySize) {
        const val = Math.floor(Math.random() * 99) + 1;
        if (!used.has(val)) {
            used.add(val);
            array.push(val);
        }
    }
    
    // Sort ascending
    array.sort((a, b) => a - b);
    
    render();
    resetStats();
    log(`Generated sorted array of ${arraySize} elements.`);
}

function resetStats() {
    compCount.textContent = '0';
    maxSteps.textContent = Math.ceil(Math.log2(arraySize));
    rangeDisplay.textContent = `[0, ${arraySize - 1}]`;
    stepLog.innerHTML = '<div class="text-slate-500">// Steps will appear here...</div>';
    hidePointers();
}

function hidePointers() {
    leftLabel.classList.add('hidden');
    midLabel.classList.add('hidden');
    rightLabel.classList.add('hidden');
}

function showPointers() {
    leftLabel.classList.remove('hidden');
    midLabel.classList.remove('hidden');
    rightLabel.classList.remove('hidden');
}

// Rendering
function render(left = -1, right = -1, mid = -1, foundIdx = -1, eliminated = []) {
    arrayContainer.innerHTML = '';
    
    array.forEach((val, idx) => {
        const el = document.createElement('div');
        el.className = 'array-element';
        
        // Apply states
        if (idx === foundIdx) {
            el.classList.add('element-found');
        } else if (eliminated.includes(idx)) {
            el.classList.add('element-eliminated');
        } else if (idx === mid) {
            el.classList.add('element-mid');
        } else if (idx === left) {
            el.classList.add('element-left');
        } else if (idx === right) {
            el.classList.add('element-right');
        }
        
        // Index label
        const idxLabel = document.createElement('div');
        idxLabel.className = 'text-[10px] text-slate-400 mb-1';
        idxLabel.textContent = idx;
        
        // Value
        const valLabel = document.createElement('div');
        valLabel.className = 'font-bold text-lg';
        valLabel.textContent = val;
        
        el.appendChild(idxLabel);
        el.appendChild(valLabel);
        
        arrayContainer.appendChild(el);
    });
}

// Binary Search Algorithm
async function binarySearch(target) {
    isSearching = true;
    toggleControls(false);
    clearLog();
    showPointers();
    
    let left = 0;
    let right = array.length - 1;
    let comparisons = 0;
    const eliminated = [];
    
    addStep(`Searching for target: ${target}`);
    addStep(`Array range: [${left}, ${right}]`);
    
    while (left <= right) {
        if (!isSearching) return;
        
        const mid = Math.floor((left + right) / 2);
        comparisons++;
        compCount.textContent = comparisons;
        rangeDisplay.textContent = `[${left}, ${right}]`;
        
        // Show current state
        render(left, right, mid, -1, eliminated);
        addStep(`Step ${comparisons}: left=${left}, mid=${mid}, right=${right}`);
        addStep(`Comparing arr[${mid}]=${array[mid]} with target=${target}`, 'compare');
        
        await delay(delayMs);
        
        if (array[mid] === target) {
            // Found!
            render(left, right, mid, mid, eliminated);
            addStep(`FOUND! arr[${mid}] = ${target}`, 'found');
            log(`Found ${target} at index ${mid} in ${comparisons} comparisons!`);
            hidePointers();
            
            isSearching = false;
            toggleControls(true);
            return mid;
        } else if (array[mid] < target) {
            // Eliminate left half
            addStep(`${array[mid]} < ${target}, eliminating left half [${left}, ${mid}]`);
            for (let i = left; i <= mid; i++) {
                eliminated.push(i);
            }
            left = mid + 1;
        } else {
            // Eliminate right half
            addStep(`${array[mid]} > ${target}, eliminating right half [${mid}, ${right}]`);
            for (let i = mid; i <= right; i++) {
                eliminated.push(i);
            }
            right = mid - 1;
        }
        
        render(left, right, -1, -1, eliminated);
        await delay(delayMs / 2);
    }
    
    // Not found
    render(-1, -1, -1, -1, eliminated);
    addStep(`NOT FOUND! Target ${target} is not in the array.`, 'not-found');
    log(`${target} not found after ${comparisons} comparisons.`);
    hidePointers();
    
    isSearching = false;
    toggleControls(true);
    return -1;
}

function startSearch() {
    const target = parseInt(targetInput.value, 10);
    
    if (isNaN(target)) {
        log('Please enter a valid target number.');
        return;
    }
    
    binarySearch(target);
}

function setRandomTarget() {
    if (array.length === 0) return;
    
    // 80% chance to pick from array, 20% chance for random not-in-array
    if (Math.random() < 0.8) {
        const idx = Math.floor(Math.random() * array.length);
        targetInput.value = array[idx];
    } else {
        // Pick a value not in array
        let val;
        do {
            val = Math.floor(Math.random() * 99) + 1;
        } while (array.includes(val));
        targetInput.value = val;
    }
}

function toggleControls(enable) {
    generateBtn.disabled = !enable;
    searchBtn.disabled = !enable;
    targetInput.disabled = !enable;
    sizeInput.disabled = !enable;
    randomTargetBtn.disabled = !enable;
    
    [generateBtn, searchBtn, randomTargetBtn].forEach(btn => {
        if (enable) {
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            btn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    });
}

// Event Listeners
generateBtn.addEventListener('click', generateArray);
searchBtn.addEventListener('click', startSearch);
randomTargetBtn.addEventListener('click', setRandomTarget);

targetInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') startSearch();
});

sizeInput.addEventListener('input', (e) => {
    if (isSearching) return;
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
