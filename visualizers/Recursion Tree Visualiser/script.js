// Configuration
const NODE_RADIUS = 22;
const VERTICAL_SPACING = 60;

// State
let root = null;
let nodeCount = 0;

// DOM
const container = document.getElementById('tree-container');
const svg = document.getElementById('tree-svg');
const inputN = document.getElementById('input-n');
const runBtn = document.getElementById('run-btn');
const clearBtn = document.getElementById('clear-btn');
const messageBox = document.getElementById('message-box');

// Helper: Log
function log(msg) {
    messageBox.textContent = msg;
}

// Tree Node
class TreeNode {
    constructor(id, label, x, y) {
        this.id = id;
        this.label = label;
        this.x = x;
        this.y = y;
        this.children = [];
        this.value = null; // Return value
    }
}

// Logic: Fibonacci
async function runFib() {
    const n = parseInt(inputN.value);
    if (isNaN(n) || n < 0 || n > 10) {
        log('Please enter n between 0 and 10.');
        return;
    }

    clear();
    toggleControls(false);
    log(`Calculating Fib(${n})...`);

    // Initial positioning is tricky for recursion tree because width varies.
    // We'll use a dynamic layout strategy or pre-calculate.
    // Pre-calculating tree structure then assigning positions is better.
    
    // 1. Build Virtual Tree to calculate widths
    const virtualRoot = buildVirtualFib(n);
    
    // 2. Assign Coordinates
    assignCoordinates(virtualRoot, container.clientWidth / 2, 40, container.clientWidth / 2.5);
    
    // 3. Animate Execution
    await executeFib(n, null, container.clientWidth / 2, 40, container.clientWidth / 2.5);
    
    toggleControls(true);
    log(`Fib(${n}) = ${virtualRoot.returnValue}`);
}

function buildVirtualFib(n) {
    const node = { n, children: [], width: 0, returnValue: 0 };
    if (n <= 1) {
        node.returnValue = n;
        node.width = 40;
    } else {
        const left = buildVirtualFib(n - 1);
        const right = buildVirtualFib(n - 2);
        node.children = [left, right];
        node.returnValue = left.returnValue + right.returnValue;
        node.width = left.width + right.width + 20;
    }
    return node;
}

// Recursive Animation
// We need to pass layout info down
async function executeFib(n, parentNode, x, y, offset) {
    // Create Node (Active State)
    const nodeId = `node-${nodeCount++}`;
    const nodeEl = createNodeEl(nodeId, `fib(${n})`, x, y);
    nodeEl.classList.add('node-active');
    
    if (parentNode) {
        drawLine(parentNode, { x, y, id: nodeId });
    }
    
    await wait(600);
    
    let result = 0;
    if (n <= 1) {
        result = n;
    } else {
        nodeEl.classList.remove('node-active');
        nodeEl.classList.add('node-pending'); // Waiting for children
        
        // Left (n-1)
        // Adjust offset logic: simple binary tree logic often overlaps for fib tree.
        // We'll stick to a simpler offset reduction.
        const leftResult = await executeFib(n - 1, { x, y, id: nodeId }, x - offset/2, y + VERTICAL_SPACING, offset/1.6);
        
        // Right (n-2)
        const rightResult = await executeFib(n - 2, { x, y, id: nodeId }, x + offset/2, y + VERTICAL_SPACING, offset/1.6);
        
        result = leftResult + rightResult;
        
        nodeEl.classList.remove('node-pending');
        nodeEl.classList.add('node-active');
        await wait(300);
    }
    
    // Return
    nodeEl.classList.remove('node-active');
    nodeEl.classList.add('node-returned');
    nodeEl.textContent = result;
    nodeEl.title = `fib(${n})`;
    
    await wait(300);
    return result;
}

// Placeholder for better layout logic
function assignCoordinates(node, x, y, width) {
    // Simple placeholder if we were pre-drawing
}

function createNodeEl(id, text, x, y) {
    const el = document.createElement('div');
    el.className = 'node';
    el.id = id;
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    container.appendChild(el);
    return el;
}

function drawLine(p1, p2) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', p1.x);
    line.setAttribute('y1', p1.y);
    line.setAttribute('x2', p2.x);
    line.setAttribute('y2', p2.y);
    svg.appendChild(line);
}

function clear() {
    container.innerHTML = '';
    svg.innerHTML = '';
    nodeCount = 0;
    log('Ready.');
}

function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function toggleControls(enable) {
    runBtn.disabled = !enable;
    clearBtn.disabled = !enable;
}

// Listeners
runBtn.addEventListener('click', runFib);
clearBtn.addEventListener('click', clear);



