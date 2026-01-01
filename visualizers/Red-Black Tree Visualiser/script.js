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
        this.TNULL = new Node(0, BLACK); // Sentinel
        this.root = this.TNULL;
    }

    insert(key) {
        let node = new Node(key);
        node.parent = null;
        node.left = this.TNULL;
        node.right = this.TNULL;
        node.color = RED;

        let y = null;
        let x = this.root;

        while (x !== this.TNULL) {
            y = x;
            if (node.value < x.value) x = x.left;
            else x = x.right;
        }

        node.parent = y;
        if (y === null) this.root = node;
        else if (node.value < y.value) y.left = node;
        else y.right = node;

        if (node.parent === null) {
            node.color = BLACK;
            return;
        }

        if (node.parent.parent === null) return;

        this.fixInsert(node);
    }

    fixInsert(k) {
        let u;
        while (k.parent.color === RED) {
            if (k.parent === k.parent.parent.right) {
                u = k.parent.parent.left;
                if (u.color === RED) {
                    u.color = BLACK;
                    k.parent.color = BLACK;
                    k.parent.parent.color = RED;
                    k = k.parent.parent;
                } else {
                    if (k === k.parent.left) {
                        k = k.parent;
                        this.rightRotate(k);
                    }
                    k.parent.color = BLACK;
                    k.parent.parent.color = RED;
                    this.leftRotate(k.parent.parent);
                }
            } else {
                u = k.parent.parent.right;
                if (u.color === RED) {
                    u.color = BLACK;
                    k.parent.color = BLACK;
                    k.parent.parent.color = RED;
                    k = k.parent.parent;
                } else {
                    if (k === k.parent.right) {
                        k = k.parent;
                        this.leftRotate(k);
                    }
                    k.parent.color = BLACK;
                    k.parent.parent.color = RED;
                    this.rightRotate(k.parent.parent);
                }
            }
            if (k === this.root) break;
        }
        this.root.color = BLACK;
    }

    leftRotate(x) {
        let y = x.right;
        x.right = y.left;
        if (y.left !== this.TNULL) y.left.parent = x;
        y.parent = x.parent;
        if (x.parent === null) this.root = y;
        else if (x === x.parent.left) x.parent.left = y;
        else x.parent.right = y;
        y.left = x;
        x.parent = y;
    }

    rightRotate(x) {
        let y = x.left;
        x.left = y.right;
        if (y.right !== this.TNULL) y.right.parent = x;
        y.parent = x.parent;
        if (x.parent === null) this.root = y;
        else if (x === x.parent.right) x.parent.right = y;
        else x.parent.left = y;
        y.right = x;
        x.parent = y;
    }
}

const rbt = new RedBlackTree();

// DOM
const container = document.getElementById('tree-container');
const svg = document.getElementById('tree-svg');
const insertInput = document.getElementById('insert-input');
const insertBtn = document.getElementById('insert-btn');
const clearBtn = document.getElementById('clear-btn');
const seedBtn = document.getElementById('seed-btn');
const messageBox = document.getElementById('message-box');

function log(msg, type = 'info') {
    messageBox.textContent = msg;
    messageBox.className = 'text-sm leading-snug transition-colors';
    if (type === 'error') messageBox.classList.add('text-red-500', 'font-medium');
    else if (type === 'success') messageBox.classList.add('text-green-600', 'font-medium');
    else messageBox.classList.add('text-slate-600');
}

// Layout
function updatePositions() {
    if (rbt.root === rbt.TNULL) return;
    const width = container.clientWidth;
    positionNode(rbt.root, width / 2, 40, width / 4);
}

function positionNode(node, x, y, offset) {
    if (node === rbt.TNULL) return;
    node.x = x;
    node.y = y;
    positionNode(node.left, x - offset, y + VERTICAL_SPACING, offset / 1.8);
    positionNode(node.right, x + offset, y + VERTICAL_SPACING, offset / 1.8);
}

function drawTree() {
    container.innerHTML = '';
    svg.innerHTML = '';
    if (rbt.root === rbt.TNULL) return;
    drawNodeRecursive(rbt.root);
}

function drawNodeRecursive(node) {
    if (node === rbt.TNULL) return;
    if (node.left !== rbt.TNULL) drawLine(node, node.left);
    if (node.right !== rbt.TNULL) drawLine(node, node.right);

    const el = document.createElement('div');
    el.className = `node node-${node.color}`;
    el.textContent = node.value;
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
    svg.appendChild(line);
}

// Op: Insert
function insert() {
    const value = parseInt(insertInput.value);
    if (isNaN(value)) {
        log('Enter a number.', 'error');
        return;
    }

    rbt.insert(value);
    updatePositions();
    drawTree();
    log(`Inserted ${value}.`);
    insertInput.value = '';
    insertInput.focus();
}

function clear() {
    rbt.root = rbt.TNULL;
    container.innerHTML = '';
    svg.innerHTML = '';
    log('Tree cleared.');
}

function seed() {
    clear();
    const vals = [20, 15, 25, 10, 5, 1, 30];
    vals.forEach(v => rbt.insert(v));
    updatePositions();
    drawTree();
    log('Seeded demo tree.');
}

window.addEventListener('resize', () => {
    updatePositions();
    drawTree();
});

insertBtn.addEventListener('click', insert);
clearBtn.addEventListener('click', clear);
seedBtn.addEventListener('click', seed);

