// Configuration
const MAX_CAPACITY = 7;
const stack = [];

// DOM Elements
const stackContainer = document.getElementById('stack-container');
const pushInput = document.getElementById('push-input');
const pushBtn = document.getElementById('push-btn');
const popBtn = document.getElementById('pop-btn');
const peekBtn = document.getElementById('peek-btn');
const clearBtn = document.getElementById('clear-btn');
const seedBtn = document.getElementById('seed-btn');
const emptyMessage = document.getElementById('empty-message');
const stackSizeDisplay = document.getElementById('stack-size');
const topItemDisplay = document.getElementById('top-item');
const messageBox = document.getElementById('message-box');

// Helper: Log message
function log(msg, type = 'info') {
  messageBox.textContent = msg;
  messageBox.className = 'text-sm leading-snug transition-colors';
  
  if (type === 'error') {
    messageBox.classList.add('text-red-500', 'font-medium');
  } else if (type === 'success') {
    messageBox.classList.add('text-green-600', 'font-medium');
  } else {
    messageBox.classList.add('text-slate-600');
  }
}

// Helper: Update Stats
function updateStats() {
  stackSizeDisplay.textContent = stack.length;
  if (stack.length > 0) {
    topItemDisplay.textContent = stack[stack.length - 1];
    emptyMessage.style.display = 'none';
  } else {
    topItemDisplay.textContent = '-';
    emptyMessage.style.display = 'block';
  }
}

// Helper: Create Stack Item Element
function createStackItem(value) {
  const div = document.createElement('div');
  div.className = 'stack-item bg-primary text-white item-push';
  div.textContent = value;
  return div;
}

// Operation: Push
async function push() {
  const value = pushInput.value.trim();
  
  if (!value) {
    log('Please enter a value to push.', 'error');
    pushInput.focus();
    return;
  }

  if (stack.length >= MAX_CAPACITY) {
    log('Stack Overflow! Cannot push to a full stack.', 'error');
    stackContainer.classList.add('stack-full');
    setTimeout(() => stackContainer.classList.remove('stack-full'), 300);
    return;
  }

  // Disable controls during animation
  toggleControls(false);

  stack.push(value);
  const item = createStackItem(value);
  stackContainer.appendChild(item);
  
  log(`Pushed "${value}" onto the stack.`, 'success');
  pushInput.value = '';
  pushInput.focus();
  updateStats();

  // Re-enable after animation
  setTimeout(() => toggleControls(true), 600);
}

// Operation: Pop
function pop() {
  if (stack.length === 0) {
    log('Stack Underflow! The stack is empty.', 'error');
    return;
  }

  toggleControls(false);
  
  const value = stack.pop();
  const item = stackContainer.lastElementChild; // Last element in DOM is visually top in flex-col-reverse
  
  // Exclude empty message div if it somehow gets selected (it shouldn't if hidden)
  // Actually, emptyMessage is absolute positioned, so lastElementChild might be the item.
  // But wait, emptyMessage is a child of stackContainer.
  // We need to be careful. emptyMessage is `pointer-events-none` but still a child.
  // Let's rely on stack array index to find the node.
  // The stack items are appended after emptyMessage? 
  // In HTML: <div id="empty-message">...</div> is inside.
  // So stackContainer.children includes it.
  
  // Safe way: get all .stack-item
  const items = stackContainer.querySelectorAll('.stack-item');
  const targetItem = items[items.length - 1];

  if (targetItem) {
    targetItem.classList.remove('item-push');
    targetItem.classList.add('item-pop');
    
    log(`Popped "${value}" from the stack.`, 'info');

    setTimeout(() => {
      targetItem.remove();
      updateStats();
      toggleControls(true);
    }, 400); // Match animation duration
  } else {
      // Should not happen if logic is correct
      toggleControls(true);
  }
}

// Operation: Peek
function peek() {
  if (stack.length === 0) {
    log('Stack is empty. Nothing to peek.', 'error');
    return;
  }

  const items = stackContainer.querySelectorAll('.stack-item');
  const targetItem = items[items.length - 1];
  const value = stack[stack.length - 1];

  if (targetItem) {
    targetItem.classList.add('item-peek');
    log(`Top element is "${value}".`, 'success');

    // Remove class after animation to allow re-peeking
    setTimeout(() => {
      targetItem.classList.remove('item-peek');
    }, 1000);
  }
}

// Operation: Clear
function clear() {
  if (stack.length === 0) {
    log('Stack is already empty.', 'info');
    return;
  }

  toggleControls(false);
  log('Clearing stack...', 'info');

  const items = stackContainer.querySelectorAll('.stack-item');
  
  // Animate all out
  items.forEach((item, index) => {
    setTimeout(() => {
      item.classList.add('item-pop');
      setTimeout(() => item.remove(), 400);
    }, index * 100); // Staggered removal
  });

  setTimeout(() => {
    stack.length = 0;
    updateStats();
    log('Stack cleared.', 'success');
    toggleControls(true);
  }, items.length * 100 + 400);
}

// Helper: Toggle buttons
function toggleControls(enable) {
  pushBtn.disabled = !enable;
  popBtn.disabled = !enable;
  peekBtn.disabled = !enable;
  clearBtn.disabled = !enable;
  seedBtn.disabled = !enable;
  
  if (enable) {
    pushBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    popBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  } else {
    pushBtn.classList.add('opacity-50', 'cursor-not-allowed');
    popBtn.classList.add('opacity-50', 'cursor-not-allowed');
  }
}

// Event Listeners
pushBtn.addEventListener('click', push);
popBtn.addEventListener('click', pop);
peekBtn.addEventListener('click', peek);
clearBtn.addEventListener('click', clear);
seedBtn.addEventListener('click', seedStack);

// Allow Enter key in input
pushInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    push();
  }
});

// Init
updateStats();

function seedStack() {
  toggleControls(false);
  stack.length = 0;
  stackContainer.innerHTML = '';
  stackContainer.appendChild(emptyMessage);
  emptyMessage.style.display = 'block';

  const sample = ['X', 'Y', 'Z', 'W'].slice(0, MAX_CAPACITY);
  sample.forEach((value) => {
    stack.push(value);
    stackContainer.appendChild(createStackItem(value));
  });

  updateStats();
  log('Seeded stack with demo values.', 'success');
  toggleControls(true);
}




