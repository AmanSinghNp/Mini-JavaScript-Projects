// Configuration
const NODE_RADIUS = 20;
const VERTICAL_SPACING = 60;

// Data Structure
class TrieNode {
    constructor(char) {
        this.char = char;
        this.children = {}; // Map char -> TrieNode
        this.isEndOfWord = false;
        this.x = 0;
        this.y = 0;
        this.width = 0; // Subtree width
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode('root');
    }

    insert(word) {
        let node = this.root;
        for (const char of word) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode(char);
            }
            node = node.children[char];
        }
        node.isEndOfWord = true;
    }

    search(word) {
        let node = this.root;
        const path = [node];
        for (const char of word) {
            if (node.children[char]) {
                node = node.children[char];
                path.push(node);
            } else {
                return { path, found: false };
            }
        }
        return { path, found: node.isEndOfWord };
    }
}

const trie = new Trie();

// DOM
const container = document.getElementById('tree-container');
const svg = document.getElementById('tree-svg');
const wordInput = document.getElementById('word-input');
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

// Layout Logic
// Simple recursive width calculation and positioning
function updatePositions() {
    if (!trie.root) return;
    
    // Calculate subtree widths
    calculateWidth(trie.root);
    
    // Assign coords
    // Center root
    trie.root.x = container.clientWidth / 2;
    trie.root.y = 40;
    
    assignCoords(trie.root, container.clientWidth / 2, 40);
}

function calculateWidth(node) {
    const children = Object.values(node.children);
    if (children.length === 0) {
        node.width = 50; // Leaf width unit
        return 50;
    }
    
    let w = 0;
    children.forEach(c => w += calculateWidth(c));
    node.width = w;
    return w;
}

function assignCoords(node, x, y) {
    node.x = x;
    node.y = y;
    
    const children = Object.values(node.children);
    let startX = x - node.width / 2;
    
    children.forEach(child => {
        const childX = startX + child.width / 2;
        assignCoords(child, childX, y + VERTICAL_SPACING);
        startX += child.width;
    });
}

function drawTree() {
    container.innerHTML = '';
    svg.innerHTML = '';
    drawNodeRecursive(trie.root);
}

function drawNodeRecursive(node) {
    const children = Object.values(node.children);
    
    // Draw lines first
    children.forEach(child => {
        drawLine(node, child);
        drawNodeRecursive(child);
    });

    const el = document.createElement('div');
    el.className = 'node';
    if (node.isEndOfWord) el.classList.add('node-end');
    el.textContent = node.char === 'root' ? '*' : node.char;
    el.id = `node-${getId(node)}`; // Hacky ID generation
    // Store ID on node for easier retrieval
    if(!node._id) node._id = Math.random().toString(36).substr(2, 9);
    el.id = `node-${node._id}`;
    
    el.style.left = `${node.x - NODE_RADIUS}px`;
    el.style.top = `${node.y - NODE_RADIUS}px`;
    container.appendChild(el);
}

function getId(node) {
    return node._id || 'root';
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
async function insert() {
    const word = wordInput.value.toLowerCase().trim();
    if (!word || !/^[a-z]+$/.test(word)) {
        log('Enter valid letters (a-z).', 'error');
        return;
    }

    toggleControls(false);
    trie.insert(word);
    
    updatePositions();
    drawTree();
    
    log(`Inserted "${word}".`, 'success');
    wordInput.value = '';
    wordInput.focus();
    toggleControls(true);
}

// Op: Search
async function search() {
    const word = wordInput.value.toLowerCase().trim();
    if (!word) {
        log('Enter word to search.', 'error');
        return;
    }

    toggleControls(false);
    const result = trie.search(word);
    
    // Animate
    for (const node of result.path) {
        const el = document.getElementById(`node-${node._id}`);
        if(el) {
            el.classList.add('node-highlight');
            await wait(300);
            el.classList.remove('node-highlight');
        }
    }

    if (result.found) {
        log(`Found "${word}"!`, 'success');
    } else {
        log(`"${word}" not found.`, 'error');
    }

    toggleControls(true);
    wordInput.value = '';
}

function clear() {
    trie.root = new TrieNode('root');
    container.innerHTML = '';
    svg.innerHTML = '';
    log('Trie cleared.', 'info');
}

function seed() {
    clear();
    const words = ['cat', 'car', 'dog', 'do'];
    words.forEach(w => trie.insert(w));
    updatePositions();
    drawTree();
    log('Seeded demo words.', 'success');
}

function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function toggleControls(enable) {
    insertBtn.disabled = !enable;
    searchBtn.disabled = !enable;
    clearBtn.disabled = !enable;
    seedBtn.disabled = !enable;
}

window.addEventListener('resize', () => {
    updatePositions();
    drawTree();
});

insertBtn.addEventListener('click', insert);
searchBtn.addEventListener('click', search);
clearBtn.addEventListener('click', clear);
seedBtn.addEventListener('click', seed);

// Init
updatePositions();
drawTree();

