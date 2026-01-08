// Configuration
const GRID_ROWS = 25;
const GRID_COLS = 50;

// State
let grid = []; // 2D array of Node objects
let isMousePressed = false;
let isRunning = false;
let currentAlgo = 'dijkstra';
let startNodePos = { r: 10, c: 10 };
let endNodePos = { r: 10, c: 40 };
let draggingNode = null; // 'start' or 'end'

// DOM
const gridContainer = document.getElementById('grid-container');
const runBtn = document.getElementById('run-btn');
const clearPathBtn = document.getElementById('clear-path-btn');
const clearWallsBtn = document.getElementById('clear-walls-btn');
const dijkstraBtn = document.getElementById('dijkstra-btn');
const astarBtn = document.getElementById('astar-btn');
const messageBox = document.getElementById('message-box');

// Helper: Log
function log(msg) {
    messageBox.textContent = msg;
}

// Init Grid
function createGrid() {
    gridContainer.style.gridTemplateColumns = `repeat(${GRID_COLS}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${GRID_ROWS}, 1fr)`;
    gridContainer.innerHTML = '';
    grid = [];

    for (let r = 0; r < GRID_ROWS; r++) {
        const row = [];
        for (let c = 0; c < GRID_COLS; c++) {
            const node = {
                r, c,
                isWall: false,
                isStart: (r === startNodePos.r && c === startNodePos.c),
                isEnd: (r === endNodePos.r && c === endNodePos.c),
                distance: Infinity,
                previousNode: null,
                totalDistance: Infinity, // f-score for A*
                heuristic: 0 // h-score for A*
            };
            row.push(node);

            // DOM Element
            const el = document.createElement('div');
            el.className = 'node';
            el.id = `node-${r}-${c}`;
            
            if (node.isStart) el.classList.add('node-start');
            if (node.isEnd) el.classList.add('node-end');

            // Event Listeners
            el.addEventListener('mousedown', (e) => handleMouseDown(r, c));
            el.addEventListener('mouseenter', (e) => handleMouseEnter(r, c));
            el.addEventListener('mouseup', () => handleMouseUp());
            
            gridContainer.appendChild(el);
        }
        grid.push(row);
    }
}

// Interaction Handlers
function handleMouseDown(r, c) {
    if(isRunning) return;
    
    if (r === startNodePos.r && c === startNodePos.c) {
        draggingNode = 'start';
    } else if (r === endNodePos.r && c === endNodePos.c) {
        draggingNode = 'end';
    } else {
        toggleWall(r, c);
    }
    isMousePressed = true;
}

function handleMouseEnter(r, c) {
    if (!isMousePressed || isRunning) return;

    if (draggingNode === 'start') {
        moveStartNode(r, c);
    } else if (draggingNode === 'end') {
        moveEndNode(r, c);
    } else {
        toggleWall(r, c);
    }
}

function handleMouseUp() {
    isMousePressed = false;
    draggingNode = null;
}

function toggleWall(r, c) {
    const node = grid[r][c];
    if (node.isStart || node.isEnd) return; // Don't overwrite start/end

    node.isWall = !node.isWall;
    const el = document.getElementById(`node-${r}-${c}`);
    if (node.isWall) el.classList.add('node-wall');
    else el.classList.remove('node-wall');
}

function moveStartNode(r, c) {
    if (grid[r][c].isEnd || grid[r][c].isWall) return; // Basic collision
    
    // Clear old
    const oldNode = grid[startNodePos.r][startNodePos.c];
    oldNode.isStart = false;
    document.getElementById(`node-${startNodePos.r}-${startNodePos.c}`).classList.remove('node-start');

    // Set new
    startNodePos = { r, c };
    const newNode = grid[r][c];
    newNode.isStart = true;
    document.getElementById(`node-${r}-${c}`).classList.add('node-start');
}

function moveEndNode(r, c) {
    if (grid[r][c].isStart || grid[r][c].isWall) return;
    
    const oldNode = grid[endNodePos.r][endNodePos.c];
    oldNode.isEnd = false;
    document.getElementById(`node-${endNodePos.r}-${endNodePos.c}`).classList.remove('node-end');

    endNodePos = { r, c };
    const newNode = grid[r][c];
    newNode.isEnd = true;
    document.getElementById(`node-${r}-${c}`).classList.add('node-end');
}

// Algorithms
function resetPathData() {
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            const node = grid[r][c];
            node.distance = Infinity;
            node.totalDistance = Infinity;
            node.previousNode = null;
            
            // Visuals
            const el = document.getElementById(`node-${r}-${c}`);
            el.classList.remove('node-visited', 'node-path');
        }
    }
}

async function runVisualiser() {
    if (isRunning) return;
    isRunning = true;
    toggleControls(false);
    resetPathData(); // clear previous run

    const startNode = grid[startNodePos.r][startNodePos.c];
    const endNode = grid[endNodePos.r][endNodePos.c];

    let visitedNodesInOrder = [];
    let success = false;

    log(`Running ${currentAlgo === 'dijkstra' ? 'Dijkstra' : 'A*'}...`);

    if (currentAlgo === 'dijkstra') {
        visitedNodesInOrder = dijkstra(startNode, endNode);
    } else {
        visitedNodesInOrder = astar(startNode, endNode);
    }

    // Animate Visited
    for (let i = 0; i < visitedNodesInOrder.length; i++) {
        const node = visitedNodesInOrder[i];
        if (node === endNode) {
            success = true;
            break;
        }
        if (!node.isStart) {
            document.getElementById(`node-${node.r}-${node.c}`).classList.add('node-visited');
        }
        if (i % 5 === 0) await wait(10); // Speed up
    }

    if (success) {
        log('Path Found! Reconstructing...');
        await animatePath(endNode);
    } else {
        log('No Path Found.');
    }

    isRunning = false;
    toggleControls(true);
}

function dijkstra(startNode, endNode) {
    const visitedNodesInOrder = [];
    startNode.distance = 0;
    const unvisitedNodes = getAllNodes(); // Naive implementation for grid

    while (unvisitedNodes.length) {
        sortNodesByDistance(unvisitedNodes);
        const closestNode = unvisitedNodes.shift();

        if (closestNode.isWall) continue;
        if (closestNode.distance === Infinity) return visitedNodesInOrder; // Trapped

        closestNode.isVisited = true;
        visitedNodesInOrder.push(closestNode);

        if (closestNode === endNode) return visitedNodesInOrder;

        updateUnvisitedNeighbors(closestNode, grid);
    }
    return visitedNodesInOrder;
}

function astar(startNode, endNode) {
    const visitedNodesInOrder = [];
    startNode.distance = 0; // g-score
    startNode.totalDistance = 0; // f-score
    
    // Open set
    const openSet = [startNode];
    
    while(openSet.length > 0) {
        // Get node with lowest f-score
        openSet.sort((a,b) => a.totalDistance - b.totalDistance);
        const closestNode = openSet.shift();
        
        if (closestNode.isWall) continue; // Should effectively not be in set, but safe guard
        
        visitedNodesInOrder.push(closestNode);
        
        if (closestNode === endNode) return visitedNodesInOrder;
        
        const neighbors = getNeighbors(closestNode, grid);
        for(const neighbor of neighbors) {
            if(neighbor.isWall) continue;
            
            // Check if already visited? A* usually tracks closed set.
            // Simplified: if neighbor in visitedNodesInOrder, skip
            if(visitedNodesInOrder.includes(neighbor)) continue;

            const tempG = closestNode.distance + 1;
            
            if(tempG < neighbor.distance) {
                neighbor.previousNode = closestNode;
                neighbor.distance = tempG;
                // Manhattan distance
                const h = Math.abs(neighbor.r - endNode.r) + Math.abs(neighbor.c - endNode.c);
                neighbor.totalDistance = tempG + h;
                
                if(!openSet.includes(neighbor)) openSet.push(neighbor);
            }
        }
    }
    return visitedNodesInOrder;
}


function getAllNodes() {
    const nodes = [];
    for (const row of grid) {
        for (const node of row) {
            nodes.push(node);
        }
    }
    return nodes;
}

function sortNodesByDistance(unvisitedNodes) {
    unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
}

function updateUnvisitedNeighbors(node, grid) {
    const unvisitedNeighbors = getNeighbors(node, grid).filter(n => !n.isVisited);
    for (const neighbor of unvisitedNeighbors) {
        neighbor.distance = node.distance + 1;
        neighbor.previousNode = node;
    }
}

function getNeighbors(node, grid) {
    const neighbors = [];
    const {r, c} = node;
    if (r > 0) neighbors.push(grid[r - 1][c]);
    if (r < GRID_ROWS - 1) neighbors.push(grid[r + 1][c]);
    if (c > 0) neighbors.push(grid[r][c - 1]);
    if (c < GRID_COLS - 1) neighbors.push(grid[r][c + 1]);
    return neighbors;
}


async function animatePath(endNode) {
    let currentNode = endNode;
    const path = [];
    while (currentNode !== null) {
        path.unshift(currentNode);
        currentNode = currentNode.previousNode;
    }

    for (const node of path) {
        if (!node.isStart && !node.isEnd) {
            document.getElementById(`node-${node.r}-${node.c}`).classList.add('node-path');
            await wait(30);
        }
    }
}

// Utils
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function toggleControls(enable) {
    runBtn.disabled = !enable;
    clearPathBtn.disabled = !enable;
    clearWallsBtn.disabled = !enable;
    runBtn.style.opacity = enable ? '1' : '0.5';
}

// Event Listeners
runBtn.addEventListener('click', runVisualiser);

clearPathBtn.addEventListener('click', () => {
    if(isRunning) return;
    resetPathData();
    log('Path cleared.');
});

clearWallsBtn.addEventListener('click', () => {
    if(isRunning) return;
    resetPathData();
    for(let r=0; r<GRID_ROWS; r++) {
        for(let c=0; c<GRID_COLS; c++) {
            grid[r][c].isWall = false;
            document.getElementById(`node-${r}-${c}`).classList.remove('node-wall');
        }
    }
    log('Walls cleared.');
});

dijkstraBtn.addEventListener('click', () => {
    currentAlgo = 'dijkstra';
    dijkstraBtn.classList.add('active');
    astarBtn.classList.remove('active');
});

astarBtn.addEventListener('click', () => {
    currentAlgo = 'astar';
    astarBtn.classList.add('active');
    dijkstraBtn.classList.remove('active');
});

// Init
createGrid();



