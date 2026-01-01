// Configuration
let T = 3; // Minimum degree
const VERTICAL_SPACING = 80;

class BTreeNode {
    constructor(t, leaf = true) {
        this.t = t;
        this.leaf = leaf;
        this.keys = [];
        this.children = [];
        this.x = 0;
        this.y = 0;
        this.width = 0;
    }
}

class BTree {
    constructor(t) {
        this.root = null;
        this.t = t;
    }

    insert(k) {
        if (this.root === null) {
            this.root = new BTreeNode(this.t, true);
            this.root.keys[0] = k;
        } else {
            if (this.root.keys.length === 2 * this.t - 1) {
                let s = new BTreeNode(this.t, false);
                s.children[0] = this.root;
                this.splitChild(s, 0, this.root);
                let i = 0;
                if (s.keys[0] < k) i++;
                this.insertNonFull(s.children[i], k);
                this.root = s;
            } else {
                this.insertNonFull(this.root, k);
            }
        }
    }

    insertNonFull(x, k) {
        let i = x.keys.length - 1;
        if (x.leaf) {
            while (i >= 0 && x.keys[i] > k) {
                x.keys[i + 1] = x.keys[i];
                i--;
            }
            x.keys[i + 1] = k;
        } else {
            while (i >= 0 && x.keys[i] > k) i--;
            i++;
            if (x.children[i].keys.length === 2 * this.t - 1) {
                this.splitChild(x, i, x.children[i]);
                if (x.keys[i] < k) i++;
            }
            this.insertNonFull(x.children[i], k);
        }
    }

    splitChild(x, i, y) {
        let z = new BTreeNode(y.t, y.leaf);
        // Move last t-1 keys of y to z
        for (let j = 0; j < this.t - 1; j++) z.keys[j] = y.keys[j + this.t];
        
        // Move last t children of y to z
        if (!y.leaf) {
            for (let j = 0; j < this.t; j++) z.children[j] = y.children[j + this.t];
        }

        y.keys.length = this.t - 1;
        y.children.length = y.leaf ? 0 : this.t;

        // Shift children of x
        for (let j = x.keys.length; j >= i + 1; j--) x.children[j + 1] = x.children[j];
        x.children[i + 1] = z;

        // Shift keys of x
        for (let j = x.keys.length - 1; j >= i; j--) x.keys[j + 1] = x.keys[j];
        x.keys[i] = y.keys[this.t - 1]; // Middle key moves up
        
        // Remove moved key from y (handled by length truncate essentially, but cleaner to pop if array logic strictly followed)
        // JS arrays adjust automatically with length set.
    }
}

let btree = new BTree(3);

// DOM
const container = document.getElementById('tree-container');
const svg = document.getElementById('tree-svg');
const insertInput = document.getElementById('insert-input');
const orderInput = document.getElementById('order-input');
const insertBtn = document.getElementById('insert-btn');
const clearBtn = document.getElementById('clear-btn');
const seedBtn = document.getElementById('seed-btn');
const messageBox = document.getElementById('message-box');

function log(msg) {
    messageBox.textContent = msg;
}

// Visuals
function updatePositions() {
    if (!btree.root) return;
    calculateWidths(btree.root);
    assignCoords(btree.root, container.clientWidth / 2, 40);
}

function calculateWidths(node) {
    if (node.leaf) {
        node.width = node.keys.length * 30 + 20; // Basic width based on keys
        return node.width;
    }
    let w = 0;
    node.children.forEach(c => w += calculateWidths(c));
    node.width = w + 20; // Gap
    return node.width;
}

function assignCoords(node, x, y) {
    node.x = x;
    node.y = y;
    if (!node.leaf) {
        let startX = x - node.width / 2;
        node.children.forEach(c => {
            let childX = startX + c.width / 2;
            assignCoords(c, childX, y + VERTICAL_SPACING);
            startX += c.width;
        });
    }
}

function drawTree() {
    container.innerHTML = '';
    svg.innerHTML = '';
    if (!btree.root) return;
    drawNodeRecursive(btree.root);
}

function drawNodeRecursive(node) {
    if (!node.leaf) {
        node.children.forEach(c => {
            drawLine(node, c);
            drawNodeRecursive(c);
        });
    }

    const el = document.createElement('div');
    el.className = 'node';
    el.style.left = `${node.x}px`;
    el.style.top = `${node.y}px`;
    
    // Transform keys to span
    el.innerHTML = node.keys.map(k => `<span class="key">${k}</span>`).join('');
    
    container.appendChild(el);
}

function drawLine(p, c) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', p.x);
    line.setAttribute('y1', p.y + 15); // Bottom of node roughly
    line.setAttribute('x2', c.x);
    line.setAttribute('y2', c.y - 15); // Top of node roughly
    svg.appendChild(line);
}

// Actions
function insert() {
    const val = parseInt(insertInput.value);
    if (isNaN(val)) return;
    btree.insert(val);
    updatePositions();
    drawTree();
    log(`Inserted ${val}`);
    insertInput.value = '';
    insertInput.focus();
}

function clear() {
    btree.root = null;
    drawTree();
    log('Cleared');
}

function seed() {
    clear();
    const arr = [10, 20, 5, 6, 12, 30, 7, 17];
    arr.forEach(x => btree.insert(x));
    updatePositions();
    drawTree();
    log('Seeded demo');
}

orderInput.addEventListener('change', (e) => {
    T = parseInt(e.target.value);
    btree = new BTree(T);
    clear();
    log(`Changed Order to ${T}`);
});

insertBtn.addEventListener('click', insert);
clearBtn.addEventListener('click', clear);
seedBtn.addEventListener('click', seed);

