// Configuration
const TABLE_SIZE = 10;

// Data Structure
class HashTable {
    constructor(size) {
        this.size = size;
        this.buckets = new Array(size).fill(null).map(() => []);
    }

    hash(key) {
        return key % this.size;
    }

    put(key, value) {
        const index = this.hash(key);
        const bucket = this.buckets[index];
        const existing = bucket.find(item => item.key === key);
        
        if (existing) {
            existing.value = value;
            return { index, action: 'update' };
        } else {
            bucket.push({ key, value });
            return { index, action: 'insert' };
        }
    }

    get(key) {
        const index = this.hash(key);
        const bucket = this.buckets[index];
        const item = bucket.find(item => item.key === key);
        return { index, item, bucket };
    }

    remove(key) {
        const index = this.hash(key);
        const bucket = this.buckets[index];
        const itemIndex = bucket.findIndex(item => item.key === key);
        
        if (itemIndex !== -1) {
            bucket.splice(itemIndex, 1);
            return { index, success: true };
        }
        return { index, success: false };
    }
    
    clear() {
        this.buckets = new Array(this.size).fill(null).map(() => []);
    }
}

const hashTable = new HashTable(TABLE_SIZE);

// DOM
const tableContainer = document.getElementById('table-container');
const keyInput = document.getElementById('key-input');
const valueInput = document.getElementById('value-input');
const putBtn = document.getElementById('put-btn');
const getBtn = document.getElementById('get-btn');
const removeBtn = document.getElementById('remove-btn');
const clearBtn = document.getElementById('clear-btn');
const messageBox = document.getElementById('message-box');

// Helper: Log
function log(msg, type = 'info') {
    messageBox.textContent = msg;
    messageBox.className = 'text-sm leading-snug transition-colors';
    if (type === 'error') messageBox.classList.add('text-red-500', 'font-medium');
    else if (type === 'success') messageBox.classList.add('text-green-600', 'font-medium');
    else messageBox.classList.add('text-slate-600');
}

// Helper: Init UI
function initTableUI() {
    tableContainer.innerHTML = '';
    for(let i=0; i<TABLE_SIZE; i++) {
        const row = document.createElement('div');
        row.className = 'bucket-row';
        row.id = `bucket-${i}`;
        
        const idx = document.createElement('div');
        idx.className = 'bucket-index';
        idx.textContent = i;
        
        const chain = document.createElement('div');
        chain.className = 'chain-container';
        chain.id = `chain-${i}`;
        
        row.appendChild(idx);
        row.appendChild(chain);
        tableContainer.appendChild(row);
    }
}

// Helper: Render Chain
function renderChain(index) {
    const chainContainer = document.getElementById(`chain-${index}`);
    chainContainer.innerHTML = '';
    const bucket = hashTable.buckets[index];
    
    bucket.forEach((item, i) => {
        if(i > 0) {
            const arrow = document.createElement('span');
            arrow.className = 'material-symbols-outlined arrow-icon';
            arrow.textContent = 'arrow_right_alt';
            chainContainer.appendChild(arrow);
        }
        
        const div = document.createElement('div');
        div.className = 'chain-item';
        div.id = `item-${item.key}`;
        div.innerHTML = `<span class="key">${item.key}</span>:<span class="val">${item.value}</span>`;
        chainContainer.appendChild(div);
    });
}

// Operations
async function put() {
    const key = parseInt(keyInput.value);
    const value = valueInput.value.trim();

    if (isNaN(key) || !value) {
        log('Enter numeric Key and text Value.', 'error');
        return;
    }

    toggleControls(false);
    
    const result = hashTable.put(key, value);
    
    // Animate Bucket
    const row = document.getElementById(`bucket-${result.index}`);
    row.classList.add('bucket-highlight');
    
    await new Promise(r => setTimeout(r, 300));
    
    renderChain(result.index);
    
    if (result.action === 'insert') log(`Inserted Key ${key} at Index ${result.index}.`, 'success');
    else log(`Updated Key ${key} at Index ${result.index}.`, 'success');
    
    setTimeout(() => row.classList.remove('bucket-highlight'), 500);
    
    keyInput.value = '';
    valueInput.value = '';
    keyInput.focus();
    toggleControls(true);
}

async function get() {
    const key = parseInt(keyInput.value);
    if (isNaN(key)) {
        log('Enter Key to find.', 'error');
        return;
    }

    toggleControls(false);
    
    const { index, item } = hashTable.get(key);
    
    // Highlight Bucket
    const row = document.getElementById(`bucket-${index}`);
    row.classList.add('bucket-highlight');
    
    // Scroll to view
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    await new Promise(r => setTimeout(r, 600));
    row.classList.remove('bucket-highlight');

    if (item) {
        const el = document.getElementById(`item-${key}`);
        if(el) {
            el.classList.add('item-highlight');
            log(`Found: ${item.value} at Index ${index}.`, 'success');
            setTimeout(() => el.classList.remove('item-highlight'), 1000);
        }
    } else {
        log(`Key ${key} not found.`, 'error');
    }
    
    toggleControls(true);
}

async function remove() {
    const key = parseInt(keyInput.value);
    if (isNaN(key)) {
        log('Enter Key to remove.', 'error');
        return;
    }
    
    toggleControls(false);
    
    const result = hashTable.remove(key);
    
    if (result.success) {
        // Find element before removing (for visual, logic already done)
        // Actually logic is done, so we just re-render. 
        // Ideally we animate removal, but re-render is simpler for lists.
        const row = document.getElementById(`bucket-${result.index}`);
        row.classList.add('bucket-highlight');
        await new Promise(r => setTimeout(r, 300));
        
        renderChain(result.index);
        log(`Removed Key ${key}.`, 'success');
        
        setTimeout(() => row.classList.remove('bucket-highlight'), 300);
    } else {
         log(`Key ${key} not found.`, 'error');
    }
    
    toggleControls(true);
}

function clear() {
    hashTable.clear();
    initTableUI();
    log('Table cleared.', 'info');
}

function toggleControls(enable) {
    const btns = [putBtn, getBtn, removeBtn, clearBtn];
    btns.forEach(b => b.disabled = !enable);
}

// Listeners
putBtn.addEventListener('click', put);
getBtn.addEventListener('click', get);
removeBtn.addEventListener('click', remove);
clearBtn.addEventListener('click', clear);

// Init
initTableUI();

