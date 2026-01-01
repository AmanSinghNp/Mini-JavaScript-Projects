// Configuration
const NODE_RADIUS = 20;

// Data Structure
class Graph {
    constructor() {
        this.adjacencyList = new Map();
        this.nodes = []; // Array of objects {id, x, y}
    }

    addVertex(id, x, y) {
        if (!this.adjacencyList.has(id)) {
            this.adjacencyList.set(id, []);
            this.nodes.push({ id, x, y });
            return true;
        }
        return false;
    }

    addEdge(v, w) {
        if (this.adjacencyList.has(v) && this.adjacencyList.has(w)) {
            this.adjacencyList.get(v).push(w);
            this.adjacencyList.get(w).push(v); // Undirected
            return true;
        }
        return false;
    }

    getNeighbors(id) {
        return this.adjacencyList.get(id) || [];
    }
}

const graph = new Graph();

// DOM
const container = document.getElementById('graph-container');
const svg = document.getElementById('graph-svg');
const addVertexBtn = document.getElementById('add-vertex-btn');
const addEdgeBtn = document.getElementById('add-edge-btn');
const edgeSourceInput = document.getElementById('edge-source');
const edgeDestInput = document.getElementById('edge-dest');
const bfsBtn = document.getElementById('bfs-btn');
const dfsBtn = document.getElementById('dfs-btn');
const startNodeInput = document.getElementById('start-node');
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

// Drawing Logic
function drawGraph() {
    container.innerHTML = '';
    svg.innerHTML = '';

    // Draw Edges
    const drawnEdges = new Set();
    graph.nodes.forEach(node => {
        const neighbors = graph.getNeighbors(node.id);
        neighbors.forEach(neighborId => {
            const neighbor = graph.nodes.find(n => n.id === neighborId);
            const edgeKey = [node.id, neighborId].sort().join('-');
            
            if (!drawnEdges.has(edgeKey)) {
                drawLine(node, neighbor);
                drawnEdges.add(edgeKey);
            }
        });
    });

    // Draw Nodes
    graph.nodes.forEach(node => {
        const el = document.createElement('div');
        el.className = 'node';
        el.textContent = node.id;
        el.id = `node-${node.id}`;
        el.style.left = `${node.x}px`;
        el.style.top = `${node.y}px`;
        container.appendChild(el);
    });
}

function drawLine(n1, n2) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', n1.x);
    line.setAttribute('y1', n1.y);
    line.setAttribute('x2', n2.x);
    line.setAttribute('y2', n2.y);
    line.id = `edge-${[n1.id, n2.id].sort().join('-')}`;
    svg.appendChild(line);
}

// Operations
function addVertex() {
    const id = graph.nodes.length;
    // Random Position within container
    const width = container.clientWidth - 40;
    const height = container.clientHeight - 40;
    const x = Math.random() * width + 20;
    const y = Math.random() * height + 20;

    graph.addVertex(id, x, y);
    drawGraph();
    log(`Added Vertex ${id}.`, 'success');
}

function addEdge() {
    const u = parseInt(edgeSourceInput.value);
    const v = parseInt(edgeDestInput.value);

    if (isNaN(u) || isNaN(v)) {
        log('Enter valid node IDs.', 'error');
        return;
    }

    if (graph.addEdge(u, v)) {
        drawGraph();
        log(`Added Edge ${u}-${v}.`, 'success');
        edgeSourceInput.value = '';
        edgeDestInput.value = '';
    } else {
        log('Invalid nodes or edge already exists.', 'error');
    }
}

async function runBFS() {
    const startId = parseInt(startNodeInput.value);
    if (isNaN(startId) || !graph.adjacencyList.has(startId)) {
        log('Invalid Start Node.', 'error');
        return;
    }

    resetVisuals();
    toggleControls(false);
    log(`Running BFS starting from ${startId}...`);

    const queue = [startId];
    const visited = new Set();
    visited.add(startId);

    while (queue.length > 0) {
        const currentId = queue.shift();
        
        // Visual: Current Node
        const currEl = document.getElementById(`node-${currentId}`);
        if(currEl) currEl.classList.add('node-current');
        await wait(600);
        
        // Get Neighbors
        const neighbors = graph.getNeighbors(currentId);
        
        for (const neighborId of neighbors) {
            if (!visited.has(neighborId)) {
                visited.add(neighborId);
                queue.push(neighborId);
                
                // Visual: Edge Highlight
                const edgeId = `edge-${[currentId, neighborId].sort().join('-')}`;
                const edgeEl = document.getElementById(edgeId);
                if(edgeEl) edgeEl.classList.add('edge-highlight');
                
                // Visual: Neighbor Detect
                const neighborEl = document.getElementById(`node-${neighborId}`);
                if(neighborEl) neighborEl.classList.add('node-neighbor');
                
                await wait(400);
                if(neighborEl) neighborEl.classList.remove('node-neighbor');
            }
        }

        if(currEl) {
            currEl.classList.remove('node-current');
            currEl.classList.add('node-visited');
        }
    }

    toggleControls(true);
    log('BFS Complete!', 'success');
}

async function runDFS() {
    const startId = parseInt(startNodeInput.value);
    if (isNaN(startId) || !graph.adjacencyList.has(startId)) {
        log('Invalid Start Node.', 'error');
        return;
    }

    resetVisuals();
    toggleControls(false);
    log(`Running DFS starting from ${startId}...`);

    const stack = [startId];
    const visited = new Set();
    
    // We need to track visited for DFS slightly differently to show path correctly in standard recursive style, 
    // but for iterative stack:
    
    while(stack.length > 0) {
        const currentId = stack.pop();
        
        if(!visited.has(currentId)) {
            visited.add(currentId);
             
            // Visual: Current
            const currEl = document.getElementById(`node-${currentId}`);
            if(currEl) currEl.classList.add('node-current');
            await wait(600);

            const neighbors = graph.getNeighbors(currentId);
            // Push neighbors to stack
            // Reverse to visit in order (optional)
            for(let i = 0; i < neighbors.length; i++) {
                const neighborId = neighbors[i];
                if(!visited.has(neighborId)) {
                   stack.push(neighborId);
                   
                   // Highlight edge briefly? In DFS iterative, edge traversal is less obvious than BFS
                }
            }
            
            if(currEl) {
                currEl.classList.remove('node-current');
                currEl.classList.add('node-visited');
            }
        }
    }
    
    toggleControls(true);
    log('DFS Complete!', 'success');
}

function resetVisuals() {
    document.querySelectorAll('.node').forEach(el => {
        el.className = 'node';
    });
    document.querySelectorAll('line').forEach(el => {
        el.classList.remove('edge-highlight', 'edge-visited');
    });
}

function clearGraph() {
    graph.adjacencyList.clear();
    graph.nodes = [];
    drawGraph();
    log('Graph cleared.');
}

function seedGraph() {
    clearGraph();
    // Circular Layout
    const count = 6;
    const centerX = container.clientWidth / 2;
    const centerY = container.clientHeight / 2;
    const radius = 120;

    for (let i = 0; i < count; i++) {
        const angle = (i * 2 * Math.PI) / count;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        graph.addVertex(i, x, y);
    }

    // Edges
    graph.addEdge(0, 1);
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    graph.addEdge(3, 4);
    graph.addEdge(4, 5);
    graph.addEdge(5, 0);
    graph.addEdge(0, 3); // Cross
    graph.addEdge(1, 4); // Cross

    drawGraph();
    log('Seeded demo graph.', 'success');
}

// Utils
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function toggleControls(enable) {
    const btns = document.querySelectorAll('button');
    btns.forEach(b => b.disabled = !enable);
}

// Event Listeners
addVertexBtn.addEventListener('click', addVertex);
addEdgeBtn.addEventListener('click', addEdge);
bfsBtn.addEventListener('click', runBFS);
dfsBtn.addEventListener('click', runDFS);
clearBtn.addEventListener('click', clearGraph);
seedBtn.addEventListener('click', seedGraph);

// Init
window.addEventListener('resize', () => {
    // Ideally re-calc positions or just redraw
    drawGraph();
});

// Initial seed
setTimeout(seedGraph, 100);

