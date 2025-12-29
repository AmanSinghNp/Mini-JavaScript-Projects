// Configuration
const MAX_SIZE = 15;
const NODE_RADIUS = 20;
const VERTICAL_SPACING = 60;

// Data Structure: MinHeap
class MinHeap {
    constructor() {
        this.heap = [];
    }

    getParentIndex(i) { return Math.floor((i - 1) / 2); }
    getLeftChildIndex(i) { return 2 * i + 1; }
    getRightChildIndex(i) { return 2 * i + 2; }

    async insert(value) {
        if (this.heap.length >= MAX_SIZE) return false;
        
        this.heap.push(value);
        await this.bubbleUp(this.heap.length - 1);
        return true;
    }

    async extractMin() {
        if (this.heap.length === 0) return null;
        
        const min = this.heap[0];
        
        if (this.heap.length === 1) {
            this.heap.pop();
            return min;
        }

        // Move last to root
        this.heap[0] = this.heap.pop();
        await this.sinkDown(0);
        
        return min;
    }

    async bubbleUp(index) {
        // We will animate this externally, but for logic structure:
        // logic is split to allow animation steps
    }

    async sinkDown(index) {
        // Same here, split for animation
    }
}

const heap = new MinHeap();

// DOM
const treeContainer = document.getElementById('tree-container');
const arrayContainer = document.getElementById('array-container');
const svg = document.getElementById('tree-svg');
const insertInput = document.getElementById('insert-input');
const insertBtn = document.getElementById('insert-btn');
const extractBtn = document.getElementById('extract-btn');
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

// Draw Logic
function draw() {
    drawTree();
    drawArray();
}

function drawArray() {
    arrayContainer.innerHTML = '';
    heap.heap.forEach((val, i) => {
        const div = document.createElement('div');
        div.className = 'array-item';
        div.id = `arr-${i}`;
        div.textContent = val;
        
        const idx = document.createElement('span');
        idx.className = 'array-index';
        idx.textContent = i;
        div.appendChild(idx);
        
        arrayContainer.appendChild(div);
    });
}

function drawTree() {
    treeContainer.innerHTML = '';
    svg.innerHTML = '';
    
    if (heap.heap.length === 0) return;

    // Calculate Positions
    const positions = {}; // index -> {x, y}
    const width = treeContainer.clientWidth;
    
    // Root
    positions[0] = { x: width / 2, y: 40, offset: width / 4 };
    
    // BFS to position
    for(let i=0; i<heap.heap.length; i++) {
        const pos = positions[i];
        if(!pos) continue; // Should always exist for valid heap
        
        const leftIdx = 2 * i + 1;
        const rightIdx = 2 * i + 2;
        
        if(leftIdx < heap.heap.length) {
            positions[leftIdx] = { 
                x: pos.x - pos.offset, 
                y: pos.y + VERTICAL_SPACING, 
                offset: pos.offset / 2 
            };
        }
        if(rightIdx < heap.heap.length) {
            positions[rightIdx] = { 
                x: pos.x + pos.offset, 
                y: pos.y + VERTICAL_SPACING, 
                offset: pos.offset / 2 
            };
        }
    }

    // Draw Lines First
    for(let i=0; i<heap.heap.length; i++) {
        const leftIdx = 2 * i + 1;
        const rightIdx = 2 * i + 2;
        const parentPos = positions[i];

        if(leftIdx < heap.heap.length) drawLine(parentPos, positions[leftIdx]);
        if(rightIdx < heap.heap.length) drawLine(parentPos, positions[rightIdx]);
    }

    // Draw Nodes
    for(let i=0; i<heap.heap.length; i++) {
        const pos = positions[i];
        const el = document.createElement('div');
        el.className = 'node';
        el.id = `node-${i}`; // ID based on index
        el.textContent = heap.heap[i];
        el.style.left = `${pos.x - NODE_RADIUS}px`;
        el.style.top = `${pos.y - NODE_RADIUS}px`;
        treeContainer.appendChild(el);
    }
}

function drawLine(p1, p2) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', p1.x);
    line.setAttribute('y1', p1.y);
    line.setAttribute('x2', p2.x);
    line.setAttribute('y2', p2.y);
    svg.appendChild(line);
}

// Helpers for Animation
const getTreeEl = (i) => document.getElementById(`node-${i}`);
const getArrEl = (i) => document.getElementById(`arr-${i}`);

async function highlight(i, colorClass='node-highlight') {
    const t = getTreeEl(i);
    const a = getArrEl(i);
    if(t) t.classList.add(colorClass);
    if(a) a.classList.add('bg-orange-100', 'border-orange-500'); // basic highlight for array
    
    await new Promise(r => setTimeout(r, 500));
    
    if(t) t.classList.remove(colorClass);
    if(a) a.classList.remove('bg-orange-100', 'border-orange-500');
}

async function swapVisual(i, j) {
    const t1 = getTreeEl(i);
    const t2 = getTreeEl(j);
    const a1 = getArrEl(i);
    const a2 = getArrEl(j);
    
    // Add swap class
    if(t1) t1.classList.add('node-swap');
    if(t2) t2.classList.add('node-swap');
    
    // Logically swap content for redraw
    // But we are animating step-by-step logic, so actual data hasn't swapped yet?
    // No, we will swap data then redraw. But to show movement?
    // Simpler: Just swap text content + color flash, then proper redraw later.
    
    // Swap content
    const tempVal = heap.heap[i];
    heap.heap[i] = heap.heap[j];
    heap.heap[j] = tempVal;
    
    // Wait
    await new Promise(r => setTimeout(r, 600));
    
    // Redraw entire tree to reflect new positions/structure
    draw();
}


// Op: Insert
async function insert() {
    const value = parseInt(insertInput.value);
    if (isNaN(value)) {
        log('Enter a number.', 'error');
        return;
    }

    if (heap.heap.length >= MAX_SIZE) {
        log('Heap is full.', 'error');
        return;
    }

    toggleControls(false);

    // 1. Add to end
    heap.heap.push(value);
    draw();
    
    // Animate insertion
    const lastIdx = heap.heap.length - 1;
    const newEl = getTreeEl(lastIdx);
    if(newEl) newEl.classList.add('node-enter');
    
    log(`Inserted ${value} at end.`, 'info');
    await new Promise(r => setTimeout(r, 500));

    // 2. Bubble Up
    let current = lastIdx;
    while (current > 0) {
        const parent = heap.getParentIndex(current);
        
        // Highlight comparison
        await highlight(current);
        await highlight(parent);
        
        if (heap.heap[current] < heap.heap[parent]) {
            log(`Child ${heap.heap[current]} < Parent ${heap.heap[parent]}. Swapping...`, 'info');
            // Swap logic is handled inside swapVisual to keep data synced with visual
            // We need to revert the manual swap we did in swapVisual? 
            // Actually, better: separate logic and visual.
            // Let's do: modify data, redraw.
            
            // Revert my logic above, let's keep data modification here.
            // Swap Data
            const temp = heap.heap[current];
            heap.heap[current] = heap.heap[parent];
            heap.heap[parent] = temp;
            
            // Draw immediately
            draw();
            
            // Flash swap
            const t1 = getTreeEl(current);
            const t2 = getTreeEl(parent);
            if(t1) t1.classList.add('node-swap');
            if(t2) t2.classList.add('node-swap');
            
            await new Promise(r => setTimeout(r, 600));
            
            current = parent;
        } else {
            log('Heap property satisfied.', 'success');
            break;
        }
    }
    
    draw(); // Final clean draw
    insertInput.value = '';
    insertInput.focus();
    toggleControls(true);
}

// Op: Extract Min
async function extractMin() {
    if (heap.heap.length === 0) {
        log('Heap is empty.', 'error');
        return;
    }

    toggleControls(false);
    const min = heap.heap[0];
    log(`Extracting Min: ${min}`, 'info');

    // Highlight root
    await highlight(0, 'node-swap');

    // 1. Swap last to root
    const last = heap.heap.pop();
    
    if (heap.heap.length > 0) {
        heap.heap[0] = last;
        draw();
        log(`Moved last element ${last} to root.`, 'info');
        await new Promise(r => setTimeout(r, 500));

        // 2. Sink Down
        let current = 0;
        while (true) {
            let smallest = current;
            const left = heap.getLeftChildIndex(current);
            const right = heap.getRightChildIndex(current);
            
            if (left < heap.heap.length && heap.heap[left] < heap.heap[smallest]) {
                smallest = left;
            }
            if (right < heap.heap.length && heap.heap[right] < heap.heap[smallest]) {
                smallest = right;
            }
            
            if (smallest !== current) {
                // Highlight
                await highlight(current);
                await highlight(smallest);
                
                log(`Parent ${heap.heap[current]} > Child ${heap.heap[smallest]}. Swapping...`, 'info');
                
                // Swap
                const temp = heap.heap[current];
                heap.heap[current] = heap.heap[smallest];
                heap.heap[smallest] = temp;
                
                draw();
                // Flash
                const t1 = getTreeEl(current);
                const t2 = getTreeEl(smallest);
                if(t1) t1.classList.add('node-swap');
                if(t2) t2.classList.add('node-swap');
                
                await new Promise(r => setTimeout(r, 600));
                
                current = smallest;
            } else {
                log('Heap property restored.', 'success');
                break;
            }
        }
    } else {
        draw();
        log('Heap empty.', 'success');
    }

    toggleControls(true);
}

function clear() {
    heap.heap = [];
    draw();
    log('Heap cleared.', 'info');
}

function toggleControls(enable) {
    const btns = [insertBtn, extractBtn, clearBtn, seedBtn];
    btns.forEach(b => b.disabled = !enable);
}

window.addEventListener('resize', draw);
insertBtn.addEventListener('click', insert);
extractBtn.addEventListener('click', extractMin);
clearBtn.addEventListener('click', clear);
seedBtn.addEventListener('click', seedHeap);

// Init
draw();

function seedHeap() {
    toggleControls(false);
    const sample = [15, 7, 22, 3, 9, 18, 30].slice(0, MAX_SIZE);
    heap.heap = [...sample];
    draw();
    log('Seeded heap with demo values.', 'success');
    toggleControls(true);
}


