// Configuration
const MAX_NODES = 8;

// Data Structure: Node
class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

// Data Structure: LinkedList
class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  append(value) {
    const newNode = new Node(value);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode;
      this.tail = newNode;
    }
    this.size++;
    return newNode;
  }

  prepend(value) {
    const newNode = new Node(value);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head = newNode;
    }
    this.size++;
    return newNode;
  }

  // Returns { index, value } of removed node or null
  removeValue(value) {
    if (!this.head) return null;

    if (this.head.value === value) {
      this.head = this.head.next;
      this.size--;
      if (this.size === 0) this.tail = null;
      return { index: 0, value };
    }

    let current = this.head;
    let prev = null;
    let index = 0;

    while (current) {
      if (current.value === value) {
        prev.next = current.next;
        if (current === this.tail) {
          this.tail = prev;
        }
        this.size--;
        return { index, value };
      }
      prev = current;
      current = current.next;
      index++;
    }
    return null;
  }

  clear() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }
}

const list = new LinkedList();

// DOM Elements
const listContainer = document.getElementById('list-container');
const valueInput = document.getElementById('value-input');
const removeInput = document.getElementById('remove-input');
const appendBtn = document.getElementById('append-btn');
const prependBtn = document.getElementById('prepend-btn');
const removeBtn = document.getElementById('remove-btn');
const clearBtn = document.getElementById('clear-btn');
const listSizeDisplay = document.getElementById('list-size');
const headValueDisplay = document.getElementById('head-value');
const tailValueDisplay = document.getElementById('tail-value');
const messageBox = document.getElementById('message-box');
const emptyMessage = document.getElementById('empty-message');

// Helper: Log
function log(msg, type = 'info') {
  messageBox.textContent = msg;
  messageBox.className = 'text-sm leading-snug transition-colors';
  if (type === 'error') messageBox.classList.add('text-red-500', 'font-medium');
  else if (type === 'success') messageBox.classList.add('text-green-600', 'font-medium');
  else messageBox.classList.add('text-slate-600');
}

// Helper: Update Stats
function updateStats() {
  listSizeDisplay.textContent = list.size;
  headValueDisplay.textContent = list.head ? list.head.value : '-';
  tailValueDisplay.textContent = list.tail ? list.tail.value : '-';
  emptyMessage.style.display = list.size === 0 ? 'block' : 'none';
}

// Helper: Create Node DOM Element
function createNodeElement(value) {
  const wrapper = document.createElement('div');
  wrapper.className = 'node-wrapper';
  wrapper.id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; // unique ID

  const node = document.createElement('div');
  node.className = 'node node-enter';
  node.textContent = value;
  
  wrapper.appendChild(node);
  return wrapper;
}

// Helper: Create Arrow Element
function createArrowElement() {
    const arrow = document.createElement('div');
    arrow.className = 'arrow arrow-enter';
    return arrow;
}

// Op: Append
async function append() {
  const value = valueInput.value.trim();
  if (!value) {
    log('Enter a value.', 'error');
    valueInput.focus();
    return;
  }
  if (list.size >= MAX_NODES) {
    log('List is full (Max 8).', 'error');
    return;
  }

  toggleControls(false);
  list.append(value);
  
  // Visuals
  const nodeEl = createNodeElement(value);
  
  if (list.size > 1) {
      // Add arrow before node if not head
      const arrow = createArrowElement();
      nodeEl.prepend(arrow);
  }
  
  listContainer.appendChild(nodeEl);
  
  log(`Appended "${value}".`, 'success');
  valueInput.value = '';
  valueInput.focus();
  updateStats();
  
  setTimeout(() => toggleControls(true), 600);
}

// Op: Prepend
async function prepend() {
    const value = valueInput.value.trim();
    if (!value) {
      log('Enter a value.', 'error');
      valueInput.focus();
      return;
    }
    if (list.size >= MAX_NODES) {
      log('List is full (Max 8).', 'error');
      return;
    }
  
    toggleControls(false);
    list.prepend(value);
    
    // Visuals
    const nodeEl = createNodeElement(value);
    
    // If list had elements, the old head needs an arrow pointing TO it from the new head?
    // Wait, visual logic: [New] -> [Old Head] -> ...
    // So the [Old Head] wrapper should now have an arrow prepended to IT?
    // Actually, simpler: The new node wrapper contains [Node] -> [Arrow] -> ...
    // My node-wrapper logic is `[Arrow] [Node]`. This works for appending.
    // For prepending: 
    // New Head: `[Node]` (No arrow on left)
    // Old Head: needs `[Arrow]` added to its left.

    // 1. Get current first element (Old Head Visual)
    const firstWrapper = listContainer.firstElementChild;
    
    // 2. Prepare new wrapper
    // Since it's head, it has no arrow on left
    // 3. If there was an old head, we must add an arrow to IT
    
    if (list.size > 1 && firstWrapper && firstWrapper.id !== 'empty-message') {
        const arrow = createArrowElement();
        firstWrapper.prepend(arrow);
    }
    
    listContainer.prepend(nodeEl);
    
    log(`Prepended "${value}".`, 'success');
    valueInput.value = '';
    valueInput.focus();
    updateStats();
    
    setTimeout(() => toggleControls(true), 600);
  }

// Op: Remove Value
async function remove() {
    const value = removeInput.value.trim();
    if (!value) {
        log('Enter value to remove.', 'error');
        removeInput.focus();
        return;
    }

    if (list.size === 0) {
        log('List is empty.', 'error');
        return;
    }

    toggleControls(false);

    // We need to find the index visually to animate
    // Visual Search
    const wrappers = Array.from(listContainer.children).filter(el => el.id !== 'empty-message');
    let foundIndex = -1;
    
    // Simple visual traversal
    for (let i = 0; i < wrappers.length; i++) {
        const nodeDiv = wrappers[i].querySelector('.node');
        
        // Highlight current being checked
        nodeDiv.classList.add('bg-yellow-100', 'border-yellow-500');
        
        await new Promise(r => setTimeout(r, 300)); // Delay for visual step
        
        if (nodeDiv.textContent === value) {
            foundIndex = i;
            nodeDiv.classList.remove('bg-yellow-100', 'border-yellow-500');
            nodeDiv.classList.add('bg-red-100', 'border-red-500'); // Found target
            break;
        }
        
        nodeDiv.classList.remove('bg-yellow-100', 'border-yellow-500');
    }

    if (foundIndex !== -1) {
        // Perform logical removal
        list.removeValue(value);
        
        // Visual Removal
        const targetWrapper = wrappers[foundIndex];
        targetWrapper.classList.add('node-remove');
        
        log(`Removed "${value}".`, 'success');
        
        setTimeout(() => {
            targetWrapper.remove();
            
            // Fix arrows
            // If we removed the Head, the new head (was index 1) shouldn't have an arrow
            if (foundIndex === 0 && list.size > 0) {
                const newHeadWrapper = listContainer.firstElementChild;
                const arrow = newHeadWrapper.querySelector('.arrow');
                if (arrow) arrow.remove();
            }
            
            updateStats();
            toggleControls(true);
        }, 500);

    } else {
        log(`Value "${value}" not found.`, 'error');
        toggleControls(true);
    }
    
    removeInput.value = '';
}

// Op: Clear
function clear() {
    if (list.size === 0) return;
    
    toggleControls(false);
    list.clear();
    
    const wrappers = Array.from(listContainer.children).filter(el => el.id !== 'empty-message');
    wrappers.forEach((el, i) => {
        setTimeout(() => {
            el.classList.add('node-remove');
            setTimeout(() => el.remove(), 400);
        }, i * 100);
    });
    
    setTimeout(() => {
        updateStats();
        log('List cleared.', 'success');
        toggleControls(true);
    }, wrappers.length * 100 + 400);
}

function toggleControls(enable) {
    const btns = [appendBtn, prependBtn, removeBtn, clearBtn];
    btns.forEach(b => {
        b.disabled = !enable;
        if(enable) b.classList.remove('opacity-50', 'cursor-not-allowed');
        else b.classList.add('opacity-50', 'cursor-not-allowed');
    });
}

// Listeners
appendBtn.addEventListener('click', append);
prependBtn.addEventListener('click', prepend);
removeBtn.addEventListener('click', remove);
clearBtn.addEventListener('click', clear);

valueInput.addEventListener('keypress', e => { if(e.key === 'Enter') append(); });
removeInput.addEventListener('keypress', e => { if(e.key === 'Enter') remove(); });

// Init
updateStats();

