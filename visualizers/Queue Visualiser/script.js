// Configuration
const MAX_CAPACITY = 7;
const queue = [];

// DOM Elements
const queueContainer = document.getElementById('queue-container');
const enqueueInput = document.getElementById('enqueue-input');
const enqueueBtn = document.getElementById('enqueue-btn');
const dequeueBtn = document.getElementById('dequeue-btn');
const peekBtn = document.getElementById('peek-btn');
const clearBtn = document.getElementById('clear-btn');
const seedBtn = document.getElementById('seed-btn');
const emptyMessage = document.getElementById('empty-message');
const queueSizeDisplay = document.getElementById('queue-size');
const frontItemDisplay = document.getElementById('front-item');
const rearItemDisplay = document.getElementById('rear-item');
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
  queueSizeDisplay.textContent = queue.length;
  if (queue.length > 0) {
    frontItemDisplay.textContent = queue[0];
    rearItemDisplay.textContent = queue[queue.length - 1];
    emptyMessage.style.display = 'none';
  } else {
    frontItemDisplay.textContent = '-';
    rearItemDisplay.textContent = '-';
    emptyMessage.style.display = 'block';
  }
}

// Helper: Create Queue Item Element
function createQueueItem(value) {
  const div = document.createElement('div');
  div.className = 'queue-item bg-primary text-white item-enqueue';
  div.textContent = value;
  return div;
}

// Operation: Enqueue
async function enqueue() {
  const value = enqueueInput.value.trim();
  
  if (!value) {
    log('Please enter a value to enqueue.', 'error');
    enqueueInput.focus();
    return;
  }

  if (queue.length >= MAX_CAPACITY) {
    log('Queue Overflow! Cannot enqueue to a full queue.', 'error');
    queueContainer.classList.add('queue-full');
    setTimeout(() => queueContainer.classList.remove('queue-full'), 300);
    return;
  }

  // Disable controls during animation
  toggleControls(false);

  queue.push(value);
  const item = createQueueItem(value);
  queueContainer.appendChild(item);
  
  log(`Enqueued "${value}" to the rear.`, 'success');
  enqueueInput.value = '';
  enqueueInput.focus();
  updateStats();

  // Re-enable after animation
  setTimeout(() => toggleControls(true), 600);
}

// Operation: Dequeue
function dequeue() {
  if (queue.length === 0) {
    log('Queue Underflow! The queue is empty.', 'error');
    return;
  }

  toggleControls(false);
  
  const value = queue.shift();
  // Get all items to identify the first one correctly
  const items = queueContainer.querySelectorAll('.queue-item');
  const targetItem = items[0]; // First item (FIFO)

  if (targetItem) {
    targetItem.classList.remove('item-enqueue');
    targetItem.classList.add('item-dequeue');
    
    log(`Dequeued "${value}" from the front.`, 'info');

    setTimeout(() => {
      targetItem.remove();
      updateStats();
      toggleControls(true);
    }, 400); // Match animation duration
  } else {
      toggleControls(true);
  }
}

// Operation: Peek
function peek() {
  if (queue.length === 0) {
    log('Queue is empty. Nothing to peek.', 'error');
    return;
  }

  const items = queueContainer.querySelectorAll('.queue-item');
  const targetItem = items[0]; // Front item
  const value = queue[0];

  if (targetItem) {
    targetItem.classList.add('item-peek');
    log(`Front element is "${value}".`, 'success');

    // Remove class after animation to allow re-peeking
    setTimeout(() => {
      targetItem.classList.remove('item-peek');
    }, 1000);
  }
}

// Operation: Clear
function clear() {
  if (queue.length === 0) {
    log('Queue is already empty.', 'info');
    return;
  }

  toggleControls(false);
  log('Clearing queue...', 'info');

  const items = queueContainer.querySelectorAll('.queue-item');
  
  // Animate all out
  items.forEach((item, index) => {
    setTimeout(() => {
      item.classList.add('item-dequeue');
      setTimeout(() => item.remove(), 400);
    }, index * 100); // Staggered removal
  });

  setTimeout(() => {
    queue.length = 0;
    updateStats();
    log('Queue cleared.', 'success');
    toggleControls(true);
  }, items.length * 100 + 400);
}

// Helper: Toggle buttons
function toggleControls(enable) {
  enqueueBtn.disabled = !enable;
  dequeueBtn.disabled = !enable;
  peekBtn.disabled = !enable;
  clearBtn.disabled = !enable;
  seedBtn.disabled = !enable;
  
  if (enable) {
    enqueueBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    dequeueBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  } else {
    enqueueBtn.classList.add('opacity-50', 'cursor-not-allowed');
    dequeueBtn.classList.add('opacity-50', 'cursor-not-allowed');
  }
}

// Event Listeners
enqueueBtn.addEventListener('click', enqueue);
dequeueBtn.addEventListener('click', dequeue);
peekBtn.addEventListener('click', peek);
clearBtn.addEventListener('click', clear);
seedBtn.addEventListener('click', seedQueue);

// Allow Enter key in input
enqueueInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    enqueue();
  }
});

// Init
updateStats();

// Seed demo data
function seedQueue() {
  toggleControls(false);
  queue.length = 0;
  queueContainer.innerHTML = '';
  queueContainer.appendChild(emptyMessage);
  emptyMessage.style.display = 'block';

  const sample = ['A', 'B', 'C'];
  sample.forEach((value) => {
    queue.push(value);
    queueContainer.appendChild(createQueueItem(value));
  });

  updateStats();
  log('Seeded queue with demo values (A, B, C).', 'success');
  toggleControls(true);
}


