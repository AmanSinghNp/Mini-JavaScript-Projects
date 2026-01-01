// Configuration
const DEGREE = 3; // Max children. Max keys = DEGREE - 1
const NODE_WIDTH_UNIT = 30; // Width per key
const VERTICAL_SPACING = 80;

// Data Structure
class BTreeNode {
    constructor(leaf = true) {
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
        this.t = t; // Minimum degree? Let's use simplified order concept
        // Order m: max m children, max m-1 keys.
        // Ceiling(m/2) min children.
        this.root = new BTreeNode(true);
    }

    insert(k) {
        const root = this.root;
        if (root.keys.length === (2 * this.t) - 1) { // Full
            const s = new BTreeNode(false);
            this.root = s;
            s.children.push(root);
            this.splitChild(s, 0);
            this.insertNonFull(s, k);
        } else {
            this.insertNonFull(root, k);
        }
    }

    insertNonFull(x, k) {
        let i = x.keys.length - 1;
        if (x.leaf) {
            while (i >= 0 && k < x.keys[i]) {
                i--;
            }
            x.keys.splice(i + 1, 0, k);
        } else {
            while (i >= 0 && k < x.keys[i]) {
                i--;
            }
            i++;
            if (x.children[i].keys.length === (2 * this.t) - 1) {
                this.splitChild(x, i);
                if (k > x.keys[i]) {
                    i++;
                }
            }
            this.insertNonFull(x.children[i], k);
        }
    }

    splitChild(x, i) {
        const t = this.t;
        const y = x.children[i];
        const z = new BTreeNode(y.leaf);
        
        // z gets last t-1 keys of y
        z.keys = y.keys.splice(t); // remove last t-1
        
        // y keeps first t-1 keys. Middle key moves up.
        // The key at index t-1 in original y is the middle one.
        // splice removed from index t to end. 
        // So y now has t keys. The last one is the median.
        const median = y.keys.pop();

        if (!y.leaf) {
            z.children = y.children.splice(t);
        }

        x.children.splice(i + 1, 0, z);
        x.keys.splice(i, 0, median);
    }

    search(k, x = this.root) {
        let i = 0;
        while (i < x.keys.length && k > x.keys[i]) {
            i++;
        }
        if (i < x.keys.length && k === x.keys[i]) {
            return { node: x, index: i, found: true };
        }
        if (x.leaf) {
            return { found: false };
        }
        return this.search(k, x.children[i]);
    }
    
    // Simplification for visualisation: t=2 (2-3-4 tree like max 3 keys) or similar
    // We configured DEGREE=3 earlier, which means max 2 keys.
    // So t should be... roughly 1.5? 
    // Let's adjust logic for specific max keys.
    // If we want max 2 keys per node:
    // InsertNonFull logic above assumes t is parameter for (2t-1) max keys.
    // If t=2, max keys = 3. 
    // For max 2 keys, we need a slight adjustment or just set t=1.5 (logic might break).
    // Let's stick to standard CLRS definition: Min degree t.
    // Max keys = 2t - 1.
    // t=2 -> max 3 keys.
}

// Visual uses t=2 (Max 3 keys)
const btree = new BTree(2); 

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

// Layout
function updatePositions() {
    if (!btree.root) return;
    
    // Calculate widths recursively
    calculateTreeWidth(btree.root);
    
    // Center root
    const containerWidth = container.clientWidth;
    assignCoordinates(btree.root, containerWidth / 2, 40);
}

function calculateTreeWidth(node) {
    // Width is determined by children width or own keys width
    const keysWidth = node.keys.length * NODE_WIDTH_UNIT + 20; // + padding
    
    if (node.leaf) {
        node.width = keysWidth;
        return node.width;
    }
    
    let childrenWidth = 0;
    node.children.forEach(child => {
        childrenWidth += calculateTreeWidth(child) + 10; // + gap
    });
    
    node.width = Math.max(keysWidth, childrenWidth);
    return node.width;
}

function assignCoordinates(node, x, y) {
    node.x = x;
    node.y = y;
    
    if (!node.leaf) {
        let currentX = x - node.width / 2;
        node.children.forEach(child => {
            const childX = currentX + child.width / 2;
            assignCoordinates(child, childX, y + VERTICAL_SPACING);
            currentX += child.width + 10;
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
    // Draw lines to children
    if (!node.leaf) {
        node.children.forEach(child => {
            drawLine(node, child);
            drawNodeRecursive(child);
        });
    }

    // Draw Node (Container of keys)
    const el = document.createElement('div');
    el.className = 'node-container';
    el.style.left = `${node.x}px`;
    el.style.top = `${node.y}px`;
    
    // Create individual key blocks
    node.keys.forEach((key, index) => {
        const kDiv = document.createElement('div');
        kDiv.className = 'key-box';
        kDiv.textContent = key;
        kDiv.id = `key-${key}`;
        el.appendChild(kDiv);
    });
    
    container.appendChild(el);
}

function drawLine(parent, child) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', parent.x);
    line.setAttribute('y1', parent.y + 15); // Bottom of parent approx
    line.setAttribute('x2', child.x);
    line.setAttribute('y2', child.y - 15); // Top of child approx
    svg.appendChild(line);
}

// Operations
async function insert() {
    const value = parseInt(insertInput.value);
    if (isNaN(value)) {
        log('Enter a number.', 'error');
        return;
    }

    // Simplistic visual update: re-render all
    btree.insert(value);
    
    updatePositions();
    drawTree();
    log(`Inserted ${value}.`, 'success');
    
    // Highlight
    const el = document.getElementById(`key-${value}`);
    if(el) {
        el.style.backgroundColor = '#fef08a';
        setTimeout(() => el.style.backgroundColor = 'white', 1000);
    }

    insertInput.value = '';
    insertInput.focus();
}

async function search() {
    const value = parseInt(searchInput.value);
    if (isNaN(value)) {
        log('Enter a number.', 'error');
        return;
    }

    const result = btree.search(value);
    if (result.found) {
        log(`Found ${value}!`, 'success');
        const el = document.getElementById(`key-${value}`);
        if(el) {
            el.classList.add('highlight');
            setTimeout(() => el.classList.remove('highlight'), 2000);
        }
    } else {
        log(`${value} not found.`, 'error');
    }
}

function clear() {
    btree.root = new BTreeNode(true);
    container.innerHTML = '';
    svg.innerHTML = '';
    log('Tree cleared.');
}

function seed() {
    clear();
    const vals = [10, 20, 5, 6, 12, 30, 7, 17];
    vals.forEach(v => btree.insert(v));
    updatePositions();
    drawTree();
    log('Seeded demo tree.');
}

// Event Listeners
insertBtn.addEventListener('click', insert);
searchBtn.addEventListener('click', search);
clearBtn.addEventListener('click', clear);
seedBtn.addEventListener('click', seed);
window.addEventListener('resize', () => { updatePositions(); drawTree(); });

// Init
updatePositions();
drawTree();
