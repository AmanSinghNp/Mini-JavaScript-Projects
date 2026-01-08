// Configuration
const NODE_RADIUS = 22;
const VERTICAL_SPACING = 70;

// State
let arr = [];
let tree = [];
let n = 0;
let nodes = []; // Visual nodes mapping

// DOM
const container = document.getElementById('tree-container');
const svg = document.getElementById('tree-svg');
const arrayInput = document.getElementById('array-input');
const buildBtn = document.getElementById('build-btn');
const queryL = document.getElementById('query-l');
const queryR = document.getElementById('query-r');
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
function buildTree(a) {
    n = a.length;
    arr = a;
    tree = new Array(4 * n).fill(0);
    nodes = new Array(4 * n).fill(null);
    
    build(1, 0, n - 1);
    updateLayout();
    drawTree();
    log(`Built segment tree with sum logic.`, 'success');
}

function build(node, start, end) {
    if (start === end) {
        tree[node] = arr[start];
    } else {
        const mid = Math.floor((start + end) / 2);
        build(2 * node, start, mid);
        build(2 * node + 1, mid + 1, end);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }
}

// Visual layout
function updateLayout() {
    if (n === 0) return;
    // Simple full binary tree layout
    const depth = Math.ceil(Math.log2(n * 4)); // approx
    
    // We need recursive layout to center parents
    positionNode(1, 0, n - 1, container.clientWidth / 2, 40, container.clientWidth / 2);
}

function positionNode(node, start, end, x, y, width) {
    nodes[node] = { x, y, value: tree[node], range: `[${start},${end}]` };
    
    if (start !== end) {
        const mid = Math.floor((start + end) / 2);
        positionNode(2 * node, start, mid, x - width/4, y + VERTICAL_SPACING, width/2);
        positionNode(2 * node + 1, mid + 1, end, x + width/4, y + VERTICAL_SPACING, width/2);
    }
}

function drawTree() {
    container.innerHTML = '';
    svg.innerHTML = '';
    
    if (n === 0) return;
    
    // Draw edges
    drawEdgesRecursive(1, 0, n - 1);
    
    // Draw nodes
    for (let i = 1; i < nodes.length; i++) {
        if (nodes[i]) {
            const el = document.createElement('div');
            el.className = 'node';
            el.innerHTML = `<span class="val">${nodes[i].value}</span><span class="range">${nodes[i].range}</span>`;
            el.id = `node-${i}`;
            el.style.left = `${nodes[i].x - NODE_RADIUS}px`;
            el.style.top = `${nodes[i].y - NODE_RADIUS}px`;
            container.appendChild(el);
        }
    }
}

function drawEdgesRecursive(node, start, end) {
    if (start !== end) {
        const mid = Math.floor((start + end) / 2);
        drawLine(nodes[node], nodes[2 * node]);
        drawLine(nodes[node], nodes[2 * node + 1]);
        
        drawEdgesRecursive(2 * node, start, mid);
        drawEdgesRecursive(2 * node + 1, mid + 1, end);
    }
}

function drawLine(parent, child) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', parent.x);
    line.setAttribute('y1', parent.y);
    line.setAttribute('x2', child.x);
    line.setAttribute('y2', child.y);
    svg.appendChild(line);
}

// Ops
async function query() {
    const l = parseInt(queryL.value);
    const r = parseInt(queryR.value);
    
    if (isNaN(l) || isNaN(r) || l < 0 || r >= n || l > r) {
        log('Invalid range.', 'error');
        return;
    }
    
    resetHighlights();
    const sum = await queryRecursive(1, 0, n - 1, l, r);
    log(`Sum(${l}, ${r}) = ${sum}`, 'success');
}

async function queryRecursive(node, start, end, l, r) {
    const el = document.getElementById(`node-${node}`);
    
    if (r < start || end < l) {
        return 0;
    }
    
    if (l <= start && end <= r) {
        if (el) el.classList.add('node-selected');
        await wait(400);
        return tree[node];
    }
    
    if (el) el.classList.add('node-visit');
    await wait(200);
    
    const mid = Math.floor((start + end) / 2);
    const p1 = await queryRecursive(2 * node, start, mid, l, r);
    const p2 = await queryRecursive(2 * node + 1, mid + 1, end, l, r);
    
    if (el) el.classList.remove('node-visit');
    
    return p1 + p2;
}

async function update() {
    const idx = parseInt(updateIdx.value);
    const val = parseInt(updateVal.value);
    
    if (isNaN(idx) || isNaN(val) || idx < 0 || idx >= n) {
        log('Invalid update params.', 'error');
        return;
    }
    
    resetHighlights();
    await updateRecursive(1, 0, n - 1, idx, val);
    
    arr[idx] = val;
    log(`Updated index ${idx} to ${val}.`, 'success');
}

async function updateRecursive(node, start, end, idx, val) {
    const el = document.getElementById(`node-${node}`);
    if (el) el.classList.add('node-visit');
    await wait(200);
    
    if (start === end) {
        tree[node] = val;
        nodes[node].value = val;
        if(el) {
            el.querySelector('.val').textContent = val;
            el.classList.remove('node-visit');
            el.classList.add('node-updated');
        }
        await wait(400);
        return;
    }
    
    const mid = Math.floor((start + end) / 2);
    if (start <= idx && idx <= mid) {
        await updateRecursive(2 * node, start, mid, idx, val);
    } else {
        await updateRecursive(2 * node + 1, mid + 1, end, idx, val);
    }
    
    tree[node] = tree[2 * node] + tree[2 * node + 1];
    nodes[node].value = tree[node];
    if(el) {
        el.querySelector('.val').textContent = tree[node];
        el.classList.remove('node-visit');
        el.classList.add('node-updated');
        setTimeout(() => el.classList.remove('node-updated'), 500);
    }
}

function resetHighlights() {
    document.querySelectorAll('.node').forEach(el => {
        el.className = 'node';
    });
}

function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
}

buildBtn.addEventListener('click', () => {
    const input = arrayInput.value.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    if (input.length === 0) {
        log('Enter comma separated numbers.', 'error');
        return;
    }
    buildTree(input);
});

queryBtn.addEventListener('click', query);
updateBtn.addEventListener('click', update);
window.addEventListener('resize', () => { updateLayout(); drawTree(); });

// Default
arrayInput.value = "1, 3, 5, 7, 9, 11";
buildTree([1, 3, 5, 7, 9, 11]);



