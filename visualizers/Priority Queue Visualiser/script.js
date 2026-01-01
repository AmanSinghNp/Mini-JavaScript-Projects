const pqContainer = document.getElementById('pq-container');
const itemInput = document.getElementById('item-input');
const priorityInput = document.getElementById('priority-input');
const enqueueBtn = document.getElementById('enqueue-btn');
const dequeueBtn = document.getElementById('dequeue-btn');
const clearBtn = document.getElementById('clear-btn');
const messageBox = document.getElementById('message-box');
const emptyMsg = document.getElementById('empty-msg');

let pq = []; // Array of {item, priority}

function log(msg, type = 'info') {
    messageBox.textContent = msg;
    messageBox.className = 'text-sm leading-snug transition-colors';
    if (type === 'error') messageBox.classList.add('text-red-500', 'font-medium');
    else if (type === 'success') messageBox.classList.add('text-green-600', 'font-medium');
    else messageBox.classList.add('text-slate-600');
}

function render() {
    pqContainer.innerHTML = '';
    if (pq.length === 0) {
        pqContainer.appendChild(emptyMsg);
        emptyMsg.style.display = 'block';
    } else {
        emptyMsg.style.display = 'none';
        pq.forEach((obj, index) => {
            const el = document.createElement('div');
            el.className = 'pq-item';
            el.innerHTML = `
                <div class="font-bold text-slate-700">${obj.item}</div>
                <div class="text-xs font-medium px-2 py-1 rounded bg-orange-100 text-orange-700">P: ${obj.priority}</div>
            `;
            // Add staggered animation
            el.style.animationDelay = `${index * 50}ms`;
            pqContainer.appendChild(el);
        });
    }
}

function enqueue() {
    const item = itemInput.value.trim();
    const priority = parseInt(priorityInput.value);

    if (!item || isNaN(priority)) {
        log('Enter valid item and priority number.', 'error');
        return;
    }

    const newObj = { item, priority };
    
    // Insert Logic (Sorted)
    let added = false;
    for (let i = 0; i < pq.length; i++) {
        if (priority < pq[i].priority) {
            pq.splice(i, 0, newObj);
            added = true;
            break;
        }
    }
    if (!added) pq.push(newObj);

    render();
    log(`Enqueued "${item}" with priority ${priority}.`, 'success');
    
    itemInput.value = '';
    priorityInput.value = '';
    itemInput.focus();
}

async function dequeue() {
    if (pq.length === 0) {
        log('Queue is empty.', 'error');
        return;
    }

    const first = pqContainer.firstElementChild;
    if(first) {
        first.style.transform = 'translateX(50px) opacity(0)';
        first.style.opacity = '0';
        await new Promise(r => setTimeout(r, 300));
    }

    const removed = pq.shift();
    render();
    log(`Dequeued "${removed.item}" (Priority ${removed.priority}).`, 'success');
}

function clear() {
    pq = [];
    render();
    log('Priority Queue cleared.');
}

enqueueBtn.addEventListener('click', enqueue);
dequeueBtn.addEventListener('click', dequeue);
clearBtn.addEventListener('click', clear);

// Init
render();

