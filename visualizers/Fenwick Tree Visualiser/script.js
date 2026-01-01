// Configuration
const NODE_RADIUS = 20;
const LEVEL_HEIGHT = 60;

// State
let bit = [];
let arr = []; // Original array
let n = 0;
let nodePositions = [];

// DOM
const container = document.getElementById('tree-container');
const svg = document.getElementById('tree-svg');
const arrayContainer = document.getElementById('array-container');
const arrayInput = document.getElementById('array-input');
const buildBtn = document.getElementById('build-btn');
const queryIdx = document.getElementById('query-idx');
const queryBtn = document.getElementById('query-btn');
const updateIdx = document.getElementById('update-idx');
const updateVal = document.getElementById('update-val');
const updateBtn = document.getElementById('update-btn');
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
function buildBIT(input) {
    n = input.length;
    arr = [0, ...input]; // 1-based
    bit = new Array(n + 1).fill(0);
    
    // Naive build
    for (let i = 1; i <= n; i++) {
        updateBIT(i, arr[i]);
    }
    
    calculateLayout();
    drawTree();
    drawArray();
    log('Built Fenwick Tree.', 'success');
}

function updateBIT(idx, val) {
    let i = idx;
    while (i <= n) {
        bit[i] += val;
        i += i & (-i);
    }
}

// Visual Layout - Fenwick trees are conceptually trees based on LSB
// Parent of i is i - (i&-i). Children are i + (i&-i) etc.
function calculateLayout() {
    nodePositions = new Array(n + 1).fill(null);
    
    // Assign levels based on number of trailing zeros (conceptually height)
    // Actually, visualization is often easier if we place index i at x-coord i.
    // Y-coord based on bit depth or just implicit parent links.
    
    const width = container.clientWidth;
    const unitWidth = width / (n + 1);
    
    for (let i = 1; i <= n; i++) {
        // Height: number of trailing zeros determines how "high" up the tree it is covers
        // Or we can just use a flattened layout with directed edges.
        // Let's use a standard BIT tree visual:
        // i covers [i - (i&-i) + 1, i]
        
        const trailingZeros = Math.clz32(i & -i) - Math.clz32(i); // Approx logic? No.
        // i & -i gives power of 2. log2(i&-i) gives height.
        const height = Math.log2(i & -i);
        
        nodePositions[i] = {
            x: i * unitWidth,
            y: 300 - height * LEVEL_HEIGHT,
            val: bit[i],
            idx: i
        };
    }
}

function drawTree() {
    container.innerHTML = '';
    svg.innerHTML = '';
    
    // Draw Nodes
    for (let i = 1; i <= n; i++) {
        const pos = nodePositions[i];
        
        // Draw edge to parent: parent covers this node.
        // In query: we go i -> i - (i&-i).
        // In update: we go i -> i + (i&-i).
        // Visualizing the query path (downwards/leftwards) is common.
        // Let's draw edges i -> parent (i - (i&-i))
        const parentIdx = i - (i & -i);
        if (parentIdx > 0) {
            drawLine(nodePositions[i], nodePositions[parentIdx]);
        } else {
            // Root virtual link? No.
        }

        const el = document.createElement('div');
        el.className = 'node';
        el.innerHTML = `<span class="idx">${i}</span><span class="val">${bit[i]}</span>`;
        el.id = `node-${i}`;
        el.style.left = `${pos.x - NODE_RADIUS}px`;
        el.style.top = `${pos.y - NODE_RADIUS}px`;
        container.appendChild(el);
    }
}

function drawLine(p1, p2) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', p1.x);
    line.setAttribute('y1', p1.y);
    line.setAttribute('x2', p2.x);
    line.setAttribute('y2', p2.y);
    line.setAttribute('stroke-dasharray', '4');
    svg.appendChild(line);
}

function drawArray() {
    arrayContainer.innerHTML = '';
    for(let i = 1; i <= n; i++) {
        const div = document.createElement('div');
        div.className = 'arr-item';
        div.textContent = arr[i];
        div.id = `arr-${i}`;
        arrayContainer.appendChild(div);
    }
}

// Ops
async function query() {
    const idx = parseInt(queryIdx.value);
    if (isNaN(idx) || idx < 1 || idx > n) {
        log('Invalid index.', 'error');
        return;
    }
    
    resetHighlights();
    let sum = 0;
    let i = idx;
    
    while(i > 0) {
        sum += bit[i];
        
        const el = document.getElementById(`node-${i}`);
        if(el) {
            el.classList.add('node-active');
            await wait(500);
        }
        
        i -= i & (-i);
    }
    
    log(`Prefix Sum(1...${idx}) = ${sum}`, 'success');
}

async function update() {
    const idx = parseInt(updateIdx.value);
    const val = parseInt(updateVal.value);
    
    if (isNaN(idx) || isNaN(val) || idx < 1 || idx > n) {
        log('Invalid params.', 'error');
        return;
    }
    
    resetHighlights();
    
    // Update Array visual
    arr[idx] += val;
    const arrEl = document.getElementById(`arr-${idx}`);
    if(arrEl) arrEl.textContent = arr[idx];
    
    let i = idx;
    while(i <= n) {
        // Visual
        const el = document.getElementById(`node-${i}`);
        if(el) {
            el.classList.add('node-update');
            await wait(300);
            
            // Logic
            bit[i] += val;
            
            // UI Update
            el.querySelector('.val').textContent = bit[i];
            el.classList.remove('node-update');
        }
        
        i += i & (-i);
    }
    
    log(`Added ${val} to index ${idx}.`, 'success');
}

function resetHighlights() {
    document.querySelectorAll('.node').forEach(el => el.classList.remove('node-active', 'node-update'));
}

function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
}

buildBtn.addEventListener('click', () => {
    const input = arrayInput.value.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    if (input.length === 0) return;
    buildBIT(input);
});

queryBtn.addEventListener('click', query);
updateBtn.addEventListener('click', update);
window.addEventListener('resize', () => { calculateLayout(); drawTree(); });

// Default
arrayInput.value = "1, 2, 3, 4, 5, 6, 7, 8";
buildBIT([1, 2, 3, 4, 5, 6, 7, 8]);

