// Configuration
const NODE_RADIUS = 20;
const VERTICAL_SPACING = 60;

// Data Structure
class DisjointSet {
    constructor(n) {
        this.parent = new Array(n).fill(0).map((_, i) => i);
        this.rank = new Array(n).fill(0);
        this.nodes = []; // For visual coords
    }

    find(i) {
        // Path compression
        if (this.parent[i] !== i) {
            this.parent[i] = this.find(this.parent[i]);
        }
        return this.parent[i];
    }

    union(i, j) {
        const rootI = this.find(i);
        const rootJ = this.find(j);

        if (rootI !== rootJ) {
            // Union by rank
            if (this.rank[rootI] < this.rank[rootJ]) {
                this.parent[rootI] = rootJ;
            } else if (this.rank[rootI] > this.rank[rootJ]) {
                this.parent[rootJ] = rootI;
            } else {
                this.parent[rootI] = rootJ;
                this.rank[rootJ]++;
            }
            return true;
        }
        return false;
    }
}

let dsu = null;
let size = 0;

// DOM
const container = document.getElementById('tree-container');
const svg = document.getElementById('tree-svg');
const makesetInput = document.getElementById('makeset-input');
const makesetBtn = document.getElementById('makeset-btn');
const unionA = document.getElementById('union-a');
const unionB = document.getElementById('union-b');
const unionBtn = document.getElementById('union-btn');
const findInput = document.getElementById('find-input');
const findBtn = document.getElementById('find-btn');
const messageBox = document.getElementById('message-box');

// Helper: Log
function log(msg, type = 'info') {
    messageBox.textContent = msg;
    messageBox.className = 'text-sm leading-snug transition-colors';
    if (type === 'error') messageBox.classList.add('text-red-500', 'font-medium');
    else if (type === 'success') messageBox.classList.add('text-green-600', 'font-medium');
    else messageBox.classList.add('text-slate-600');
}

// Layout Logic
// We need to group nodes by their root, then draw each tree
function updateLayout() {
    if (!dsu) return;

    // 1. Group by root
    const forests = {}; // rootId -> [nodeIds]
    for (let i = 0; i < size; i++) {
        // Find current root without path compression visual update yet (logic only)
        // Actually, dsu.parent[i] points to parent. We need to traverse to find root for grouping.
        // We can use helper find but standard find does path compression.
        // For visual grouping, let's just trace parents.
        let curr = i;
        while(dsu.parent[curr] !== curr) {
            curr = dsu.parent[curr];
        }
        const root = curr;
        
        if (!forests[root]) forests[root] = [];
        forests[root].push(i);
    }

    // 2. Assign positions
    // Divide width by number of trees
    const roots = Object.keys(forests);
    const sectionWidth = container.clientWidth / roots.length;
    
    roots.forEach((root, idx) => {
        const centerX = idx * sectionWidth + sectionWidth / 2;
        layoutTree(root, forests[root], centerX, 40);
    });
}

function layoutTree(rootId, nodeIds, x, y) {
    // Reconstruct hierarchical tree structure for this root from parent array
    // Map: parent -> [children]
    const adj = {}; 
    nodeIds.forEach(id => {
        if(!adj[id]) adj[id] = [];
        if (id != rootId) {
            const p = dsu.parent[id];
            if (!adj[p]) adj[p] = [];
            adj[p].push(id);
        }
    });

    // Recursive layout
    placeNode(rootId, x, y, sectionWidthForNode(nodeIds.length));
    
    function placeNode(id, nx, ny, width) {
        // Save coords
        if(!dsu.nodes[id]) dsu.nodes[id] = {};
        dsu.nodes[id].x = nx;
        dsu.nodes[id].y = ny;

        const children = adj[id] || [];
        if (children.length === 0) return;

        const slice = width / children.length;
        let startX = nx - width/2 + slice/2;
        
        children.forEach((child, i) => {
            placeNode(child, startX + i*slice, ny + VERTICAL_SPACING, slice);
        });
    }
}

function sectionWidthForNode(count) {
    return Math.max(100, count * 40);
}

function draw() {
    container.innerHTML = '';
    svg.innerHTML = '';
    if (!dsu) return;

    // Draw Edges
    for (let i = 0; i < size; i++) {
        if (dsu.parent[i] !== i) {
            const p = dsu.parent[i];
            drawLine(dsu.nodes[p], dsu.nodes[i]);
        }
    }

    // Draw Nodes
    for (let i = 0; i < size; i++) {
        const n = dsu.nodes[i];
        const el = document.createElement('div');
        el.className = 'node';
        el.textContent = i;
        el.id = `node-${i}`;
        el.style.left = `${n.x - NODE_RADIUS}px`;
        el.style.top = `${n.y - NODE_RADIUS}px`;
        container.appendChild(el);
    }
}

function drawLine(p, c) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', p.x);
    line.setAttribute('y1', p.y);
    line.setAttribute('x2', c.x);
    line.setAttribute('y2', c.y);
    svg.appendChild(line);
}

// Ops
function makeSet() {
    const n = parseInt(makesetInput.value);
    if (isNaN(n) || n < 1 || n > 20) {
        log('Enter N (1-20).', 'error');
        return;
    }
    size = n;
    dsu = new DisjointSet(n);
    updateLayout();
    draw();
    log(`Created ${n} disjoint sets.`, 'success');
}

function union() {
    const a = parseInt(unionA.value);
    const b = parseInt(unionB.value);
    
    if (isNaN(a) || isNaN(b) || a < 0 || b < 0 || a >= size || b >= size) {
        log('Invalid nodes.', 'error');
        return;
    }

    if (dsu.union(a, b)) {
        log(`Union(${a}, ${b}) successful.`);
        updateLayout();
        draw();
    } else {
        log(`${a} and ${b} are already in the same set.`, 'info');
    }
}

async function find() {
    const x = parseInt(findInput.value);
    if (isNaN(x) || x < 0 || x >= size) {
        log('Invalid node.', 'error');
        return;
    }

    const root = dsu.find(x);
    
    // Highlight node and root
    const el = document.getElementById(`node-${x}`);
    const rootEl = document.getElementById(`node-${root}`);
    
    el.classList.add('node-highlight');
    rootEl.classList.add('node-highlight');
    
    log(`Find(${x}) -> Root is ${root}. Path compressed.`);
    
    await new Promise(r => setTimeout(r, 1000));
    
    el.classList.remove('node-highlight');
    rootEl.classList.remove('node-highlight');
    
    // Redraw because path compression changed structure
    updateLayout();
    draw();
}

makesetBtn.addEventListener('click', makeSet);
unionBtn.addEventListener('click', union);
findBtn.addEventListener('click', find);
window.addEventListener('resize', () => {
    updateLayout();
    draw();
});

// Init
makesetInput.value = 10;
makeSet();

