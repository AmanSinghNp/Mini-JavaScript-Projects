// LRU Cache Implementation with Doubly Linked List + HashMap

class Node {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}

class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
        
        // Dummy head and tail
        this.head = new Node(null, null);
        this.tail = new Node(null, null);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    _remove(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    _addToFront(node) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
    }

    get(key) {
        if (!this.map.has(key)) {
            return { found: false, value: null };
        }
        
        const node = this.map.get(key);
        // Move to front (most recently used)
        this._remove(node);
        this._addToFront(node);
        
        return { found: true, value: node.value };
    }

    put(key, value) {
        let evicted = null;
        
        if (this.map.has(key)) {
            // Update existing
            const node = this.map.get(key);
            node.value = value;
            this._remove(node);
            this._addToFront(node);
        } else {
            // Add new
            if (this.map.size >= this.capacity) {
                // Evict LRU (tail.prev)
                const lru = this.tail.prev;
                evicted = { key: lru.key, value: lru.value };
                this._remove(lru);
                this.map.delete(lru.key);
            }
            
            const newNode = new Node(key, value);
            this._addToFront(newNode);
            this.map.set(key, newNode);
        }
        
        return evicted;
    }

    clear() {
        this.map.clear();
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    getList() {
        const result = [];
        let current = this.head.next;
        while (current !== this.tail) {
            result.push({ key: current.key, value: current.value });
            current = current.next;
        }
        return result;
    }

    getMapEntries() {
        return Array.from(this.map.keys());
    }

    size() {
        return this.map.size;
    }
}

// State
let capacity = 4;
let cache = new LRUCache(capacity);
let hits = 0;
let misses = 0;
let evictions = 0;

// DOM
const keyInput = document.getElementById('key-input');
const valueInput = document.getElementById('value-input');
const putBtn = document.getElementById('put-btn');
const getBtn = document.getElementById('get-btn');
const clearBtn = document.getElementById('clear-btn');
const capacityInput = document.getElementById('capacity-input');
const capacityValue = document.getElementById('capacity-value');
const sizeDisplay = document.getElementById('size-display');
const capDisplay = document.getElementById('cap-display');
const hitsDisplay = document.getElementById('hits-display');
const missesDisplay = document.getElementById('misses-display');
const evictionsDisplay = document.getElementById('evictions-display');
const listContainer = document.getElementById('list-container');
const mapContainer = document.getElementById('map-container');
const logContainer = document.getElementById('log-container');
const messageBox = document.getElementById('message-box');

// Helpers
function log(msg) {
    messageBox.textContent = msg;
}

function addLogEntry(text, type = 'normal') {
    const entry = document.createElement('div');
    entry.className = type === 'hit' ? 'text-green-400' : 
                     type === 'miss' ? 'text-red-400' : 
                     type === 'evict' ? 'text-amber-400' : 'text-slate-300';
    entry.textContent = `> ${text}`;
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

function updateStats() {
    sizeDisplay.textContent = cache.size();
    capDisplay.textContent = capacity;
    hitsDisplay.textContent = hits;
    missesDisplay.textContent = misses;
    evictionsDisplay.textContent = evictions;
}

function render(highlightKey = null, highlightType = null) {
    const list = cache.getList();
    
    // Render linked list
    if (list.length === 0) {
        listContainer.innerHTML = '<div class="text-slate-400 italic">Cache is empty</div>';
    } else {
        listContainer.innerHTML = '';
        
        list.forEach((item, index) => {
            // Node
            const node = document.createElement('div');
            node.className = 'cache-node';
            
            if (item.key === highlightKey) {
                if (highlightType === 'hit') node.classList.add('node-hit');
                else if (highlightType === 'miss') node.classList.add('node-miss');
                else if (highlightType === 'evict') node.classList.add('node-evict');
                else if (highlightType === 'new') node.classList.add('node-new');
            }
            
            node.innerHTML = `
                <div class="text-xs text-slate-400 mb-1">Key</div>
                <div class="font-bold text-lg">${item.key}</div>
                <div class="text-xs text-slate-400 mt-2">Value</div>
                <div class="font-mono text-sm">${item.value}</div>
            `;
            listContainer.appendChild(node);
            
            // Arrow (except after last)
            if (index < list.length - 1) {
                const arrow = document.createElement('div');
                arrow.className = 'text-slate-400';
                arrow.innerHTML = '<span class="material-symbols-outlined">arrow_forward</span>';
                listContainer.appendChild(arrow);
            }
        });
    }
    
    // Render hash map
    const keys = cache.getMapEntries();
    if (keys.length === 0) {
        mapContainer.innerHTML = '<div class="text-slate-400 italic text-sm">No entries</div>';
    } else {
        mapContainer.innerHTML = '';
        keys.forEach(key => {
            const entry = document.createElement('div');
            entry.className = 'map-entry';
            if (key === highlightKey) {
                entry.classList.add('ring-2', 'ring-blue-400');
            }
            entry.textContent = key;
            mapContainer.appendChild(entry);
        });
    }
    
    updateStats();
}

// Operations
function handlePut() {
    const key = keyInput.value.trim();
    const value = valueInput.value.trim();
    
    if (!key) {
        log('Please enter a key.');
        return;
    }
    
    if (!value) {
        log('Please enter a value.');
        return;
    }
    
    const evicted = cache.put(key, value);
    
    if (evicted) {
        evictions++;
        addLogEntry(`PUT(${key}, ${value}) - Evicted key "${evicted.key}"`, 'evict');
        log(`Added (${key}: ${value}). Evicted "${evicted.key}" (LRU).`);
        
        // Show eviction animation
        render(evicted.key, 'evict');
        setTimeout(() => render(key, 'new'), 300);
    } else {
        addLogEntry(`PUT(${key}, ${value})`, 'normal');
        log(`Added (${key}: ${value}) to cache.`);
        render(key, 'new');
    }
    
    keyInput.value = '';
    valueInput.value = '';
    keyInput.focus();
}

function handleGet() {
    const key = keyInput.value.trim();
    
    if (!key) {
        log('Please enter a key to search.');
        return;
    }
    
    const result = cache.get(key);
    
    if (result.found) {
        hits++;
        addLogEntry(`GET(${key}) → "${result.value}" [HIT]`, 'hit');
        log(`Cache HIT! Key "${key}" = "${result.value}". Moved to front.`);
        render(key, 'hit');
    } else {
        misses++;
        addLogEntry(`GET(${key}) → undefined [MISS]`, 'miss');
        log(`Cache MISS! Key "${key}" not found.`);
        render(key, 'miss');
    }
    
    keyInput.value = '';
    keyInput.focus();
}

function handleClear() {
    cache.clear();
    hits = 0;
    misses = 0;
    evictions = 0;
    
    // Clear log except first entry
    logContainer.innerHTML = '<div class="text-slate-500">// Cache cleared. Operations will appear here...</div>';
    
    render();
    log('Cache cleared.');
}

function handleCapacityChange(e) {
    const newCapacity = parseInt(e.target.value, 10);
    if (newCapacity !== capacity) {
        capacity = newCapacity;
        capacityValue.textContent = capacity;
        cache = new LRUCache(capacity);
        hits = 0;
        misses = 0;
        evictions = 0;
        render();
        log(`Capacity changed to ${capacity}. Cache reset.`);
    }
}

// Event Listeners
putBtn.addEventListener('click', handlePut);
getBtn.addEventListener('click', handleGet);
clearBtn.addEventListener('click', handleClear);
capacityInput.addEventListener('input', handleCapacityChange);

keyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (valueInput.value.trim()) {
            handlePut();
        } else {
            valueInput.focus();
        }
    }
});

valueInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handlePut();
    }
});

// Init
render();
