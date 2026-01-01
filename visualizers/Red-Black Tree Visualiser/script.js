// Configuration
const NODE_RADIUS = 20;
const VERTICAL_SPACING = 60;
const RED = 'red';
const BLACK = 'black';

// Data Structure
class Node {
    constructor(value, color = RED) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.parent = null;
        this.color = color;
        this.x = 0;
        this.y = 0;
    }
}

class RedBlackTree {
    constructor() {
        this.root = null; // Sentinel TNULL conceptually, but null for simplicity in JS visual
    }

    rotateLeft(x) {
        const y = x.right;
        x.right = y.left;
        if (y.left) y.left.parent = x;
        y.parent = x.parent;
        if (!x.parent) this.root = y;
        else if (x === x.parent.left) x.parent.left = y;
        else x.parent.right = y;
        y.left = x;
        x.parent = y;
    }

    rotateRight(y) {
        const x = y.left;
        y.left = x.right;
        if (x.right) x.right.parent = y;
        x.parent = y.parent;
        if (!y.parent) this.root = x;
        else if (y === y.parent.left) y.parent.left = x;
        else y.parent.right = x;
        x.right = y;
        y.parent = x;
    }

    insert(value) {
        let node = new Node(value);
        let y = null;
        let x = this.root;

        while (x) {
            y = x;
            if (node.value < x.value) x = x.left;
            else if (node.value > x.value) x = x.right;
            else return { success: false }; // No duplicates
        }

        node.parent = y;
        if (!y) this.root = node;
        else if (node.value < y.value) y.left = node;
        else y.right = node;

        if (node.parent == null) {
            node.color = BLACK;
            return { success: true, node };
        }

        if (node.parent.parent == null) {
            return { success: true, node };
        }

        this.fixInsert(node);
        return { success: true, node };
    }

    fixInsert(k) {
        let u;
        while (k.parent && k.parent.color === RED) {
            if (k.parent === k.parent.parent.right) {
                u = k.parent.parent.left;
                if (u && u.color === RED) {
                    u.color = BLACK;
                    k.parent.color = BLACK;
                    k.parent.parent.color = RED;
                    k = k.parent.parent;
                } else {
                    if (k === k.parent.left) {
                        k = k.parent;
                        this.rotateRight(k);
                    }
                    k.parent.color = BLACK;
                    k.parent.parent.color = RED;
                    this.rotateLeft(k.parent.parent);
                }
            } else {
                u = k.parent.parent.right;
                if (u && u.color === RED) {
                    u.color = BLACK;
                    k.parent.color = BLACK;
                    k.parent.parent.color = RED;
                    k = k.parent.parent;
                } else {
                    if (k === k.parent.right) {
                        k = k.parent;
                        this.rotateLeft(k);
                    }
                    k.parent.color = BLACK;
                    k.parent.parent.color = RED;
                    this.rotateRight(k.parent.parent);
                }
            }
            if (k == this.root) break;
        }
        this.root.color = BLACK;
    }

    search(value) {
        let current = this.root;
        const path = [];
        while (current) {
            path.push(current);
            if (value === current.value) return { path, found: true };
            if (value < current.value) current = current.left;
            else current = current.right;
        }
        return { path, found: false };
    }
}

const rbt = new RedBlackTree();

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

// Tree Layout
function updatePositions() {
    if (!rbt.root) return;
    const width = container.clientWidth;
    positionNode(rbt.root, width / 2, 40, width / 4);
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
    if (!rbt.root) return;
    drawNodeRecursive(rbt.root);
}

function drawNodeRecursive(node) {
    if (!node) return;
    if (node.left) drawLine(node, node.left);
    if (node.right) drawLine(node, node.right);

    const el = document.createElement('div');
    el.className = `node node-${node.color}`;
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
    const result = rbt.insert(value);

    if (!result.success) {
        log(`Value ${value} already exists.`, 'error');
    } else {
        updatePositions();
        drawTree();
        
        const newEl = document.getElementById(`node-${value}`);
        if(newEl) newEl.classList.add('node-enter');
        log(`Inserted ${value}. Properties fixed.`, 'success');
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
    const result = rbt.search(value);

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
    rbt.root = null;
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

function seedTree() {
    toggleControls(false);
    rbt.root = null;
    // Seed with values that trigger rotations/color flips
    const sample = [10, 20, 30, 15, 25, 5, 1];
    sample.forEach(v => rbt.insert(v));
    updatePositions();
    drawTree();
    log('Seeded Red-Black Tree.', 'success');
    toggleControls(true);
}
