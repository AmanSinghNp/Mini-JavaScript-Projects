// Configuration
const NODE_RADIUS = 20;
const VERTICAL_SPACING = 60;

// Data Structure
class Node {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.x = 0;
        this.y = 0;
    }
}

class BST {
    constructor() {
        this.root = null;
    }

    insert(value) {
        const newNode = new Node(value);
        if (!this.root) {
            this.root = newNode;
            return { path: [], success: true };
        }

        let current = this.root;
        const path = [];

        while (true) {
            path.push(current);
            if (value === current.value) return { path, success: false }; // No duplicates

            if (value < current.value) {
                if (!current.left) {
                    current.left = newNode;
                    return { path, success: true };
                }
                current = current.left;
            } else {
                if (!current.right) {
                    current.right = newNode;
                    return { path, success: true };
                }
                current = current.right;
            }
        }
    }

    search(value) {
        let current = this.root;
        const path = [];
        
        while(current) {
            path.push(current);
            if(value === current.value) return { path, found: true };
            if(value < current.value) current = current.left;
            else current = current.right;
        }
        return { path, found: false };
    }
}

const bst = new BST();

// DOM
const container = document.getElementById('tree-container');
const svg = document.getElementById('tree-svg');
const insertInput = document.getElementById('insert-input');
const searchInput = document.getElementById('search-input');
const insertBtn = document.getElementById('insert-btn');
const searchBtn = document.getElementById('search-btn');
const clearBtn = document.getElementById('clear-btn');
const seedBtn = document.getElementById('seed-btn');
const messageBox = document.getElementById('message-box');

// Helper: Log
function log(msg, type = 'info') {
    messageBox.textContent = msg;
    messageBox.className = 'text-sm leading-snug transition-colors';
    if (type === 'error') messageBox.classList.add('text-red-500', 'font-medium');
    else if (type === 'success') messageBox.classList.add('text-green-600', 'font-medium');
    else messageBox.classList.add('text-slate-600');
}

// Tree Layout Logic
function updatePositions() {
    if(!bst.root) return;
    
    // Width of container
    const width = container.clientWidth;
    // Initial call
    positionNode(bst.root, width / 2, 40, width / 4);
}

function positionNode(node, x, y, offset) {
    if (!node) return;
    node.x = x;
    node.y = y;
    positionNode(node.left, x - offset, y + VERTICAL_SPACING, offset / 1.8);
    positionNode(node.right, x + offset, y + VERTICAL_SPACING, offset / 1.8);
}

function drawTree() {
    container.innerHTML = '';
    svg.innerHTML = '';
    if (!bst.root) return;
    
    drawNodeRecursive(bst.root);
}

function drawNodeRecursive(node) {
    if (!node) return;

    // Draw lines to children
    if (node.left) drawLine(node, node.left);
    if (node.right) drawLine(node, node.right);

    // Draw Node
    const el = document.createElement('div');
    el.className = 'node';
    el.textContent = node.value;
    el.id = `node-${node.value}`;
    el.style.left = `${node.x - NODE_RADIUS}px`;
    el.style.top = `${node.y - NODE_RADIUS}px`;
    container.appendChild(el);

    drawNodeRecursive(node.left);
    drawNodeRecursive(node.right);
}

function drawLine(parent, child) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', parent.x);
    line.setAttribute('y1', parent.y);
    line.setAttribute('x2', child.x);
    line.setAttribute('y2', child.y);
    line.id = `line-${parent.value}-${child.value}`;
    svg.appendChild(line);
}

// Op: Insert
async function insert() {
    const value = parseInt(insertInput.value);
    if (isNaN(value)) {
        log('Enter a number.', 'error');
        return;
    }

    toggleControls(false);

    // 1. Logic Insert
    const result = bst.insert(value);

    if (!result.success && result.path.length === 0 && bst.root.value === value) {
        log(`Value ${value} already exists.`, 'error');
        toggleControls(true);
        return;
    }
    
    // 2. Re-calculate positions because tree shape changed
    updatePositions();
    
    // 3. Draw existing tree static
    drawTree();
    
    // 4. Animate Traversal
    for (const node of result.path) {
        const el = document.getElementById(`node-${node.value}`);
        el.classList.add('node-highlight');
        await new Promise(r => setTimeout(r, 500));
        el.classList.remove('node-highlight');
    }

    if (!result.success) {
        log(`Value ${value} already exists.`, 'error');
    } else {
        // 5. Animate new node appearing
        // It's already drawn by drawTree, but let's re-add class for popIn
        const newEl = document.getElementById(`node-${value}`);
        if(newEl) {
            newEl.classList.remove('node-enter');
            void newEl.offsetWidth; // trigger reflow
            newEl.classList.add('node-enter');
        }
        log(`Inserted ${value}.`, 'success');
    }

    insertInput.value = '';
    insertInput.focus();
    toggleControls(true);
}

// Op: Search
async function search() {
    const value = parseInt(searchInput.value);
    if (isNaN(value)) {
        log('Enter a number to search.', 'error');
        return;
    }

    toggleControls(false);
    const result = bst.search(value);

    // Animate
    for (const node of result.path) {
        const el = document.getElementById(`node-${node.value}`);
        el.classList.add('node-highlight');
        await new Promise(r => setTimeout(r, 500));
        el.classList.remove('node-highlight');
    }

    if (result.found) {
        const el = document.getElementById(`node-${value}`);
        el.classList.add('node-found');
        log(`Found ${value}!`, 'success');
        setTimeout(() => el.classList.remove('node-found'), 2000);
    } else {
        log(`${value} not found in tree.`, 'error');
    }

    toggleControls(true);
    searchInput.value = '';
}

// Op: Clear
function clear() {
    bst.root = null;
    container.innerHTML = '';
    svg.innerHTML = '';
    log('Tree cleared.', 'info');
}

function toggleControls(enable) {
    const btns = [insertBtn, searchBtn, clearBtn, seedBtn];
    btns.forEach(b => b.disabled = !enable);
}

window.addEventListener('resize', () => {
    updatePositions();
    drawTree();
});

insertBtn.addEventListener('click', insert);
searchBtn.addEventListener('click', search);
clearBtn.addEventListener('click', clear);
seedBtn.addEventListener('click', seedTree);

// Init
updatePositions();

function seedTree() {
    toggleControls(false);
    bst.root = null;
    const sample = [20, 10, 30, 5, 15, 25, 35];
    sample.forEach(v => bst.insert(v));
    updatePositions();
    drawTree();
    log('Seeded BST with demo values.', 'success');
    toggleControls(true);
}


