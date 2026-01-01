// Configuration
const NODE_RADIUS = 20;
const VERTICAL_SPACING = 60;

// Data Structure
class Node {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.height = 1;
        this.x = 0;
        this.y = 0;
    }
}

class AVLTree {
    constructor() {
        this.root = null;
    }

    getHeight(node) {
        return node ? node.height : 0;
    }

    getBalance(node) {
        return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
    }

    rightRotate(y) {
        const x = y.left;
        const T2 = x.right;

        // Rotation
        x.right = y;
        y.left = T2;

        // Update heights
        y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;
        x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;

        return x; // New root
    }

    leftRotate(x) {
        const y = x.right;
        const T2 = y.left;

        // Rotation
        y.left = x;
        x.right = T2;

        // Update heights
        x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;
        y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;

        return y; // New root
    }

    insert(value) {
        let insertedNode = null;
        const insertRecursive = (node, value) => {
            if (!node) {
                insertedNode = new Node(value);
                return insertedNode;
            }

            if (value < node.value) {
                node.left = insertRecursive(node.left, value);
            } else if (value > node.value) {
                node.right = insertRecursive(node.right, value);
            } else {
                return node; // No duplicates
            }

            node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));

            const balance = this.getBalance(node);

            // Left Left Case
            if (balance > 1 && value < node.left.value) {
                return this.rightRotate(node);
            }

            // Right Right Case
            if (balance < -1 && value > node.right.value) {
                return this.leftRotate(node);
            }

            // Left Right Case
            if (balance > 1 && value > node.left.value) {
                node.left = this.leftRotate(node.left);
                return this.rightRotate(node);
            }

            // Right Left Case
            if (balance < -1 && value < node.right.value) {
                node.right = this.rightRotate(node.right);
                return this.leftRotate(node);
            }

            return node;
        };

        this.root = insertRecursive(this.root, value);
        return { success: !!insertedNode, insertedNode };
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

const avl = new AVLTree();

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
    if(!avl.root) return;
    const width = container.clientWidth;
    positionNode(avl.root, width / 2, 40, width / 4);
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
    if (!avl.root) return;
    drawNodeRecursive(avl.root);
}

function drawNodeRecursive(node) {
    if (!node) return;
    if (node.left) drawLine(node, node.left);
    if (node.right) drawLine(node, node.right);

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
    
    // In AVL we just update the whole structure at once for simplicity in visualization 
    // because animating the rotation step-by-step requires complex state management.
    // We will highlight the inserted node.
    
    const result = avl.insert(value);

    if (!result.success) {
        log(`Value ${value} already exists.`, 'error');
    } else {
        updatePositions();
        drawTree();
        
        const newEl = document.getElementById(`node-${value}`);
        if(newEl) {
            newEl.classList.add('node-enter');
        }
        log(`Inserted ${value}. Balanced.`, 'success');
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
    const result = avl.search(value);

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
        log(`${value} not found.`, 'error');
    }

    toggleControls(true);
    searchInput.value = '';
}

function clear() {
    avl.root = null;
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

updatePositions();

function seedTree() {
    toggleControls(false);
    avl.root = null;
    const sample = [10, 20, 30, 40, 50, 25];
    sample.forEach(v => avl.insert(v));
    updatePositions();
    drawTree();
    log('Seeded AVL Tree.', 'success');
    toggleControls(true);
}
