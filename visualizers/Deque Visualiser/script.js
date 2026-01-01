const dequeContainer = document.getElementById('deque-container');
const valueInput = document.getElementById('value-input');
const pushFrontBtn = document.getElementById('push-front-btn');
const pushRearBtn = document.getElementById('push-rear-btn');
const popFrontBtn = document.getElementById('pop-front-btn');
const popRearBtn = document.getElementById('pop-rear-btn');
const clearBtn = document.getElementById('clear-btn');
const sizeDisplay = document.getElementById('deque-size');
const messageBox = document.getElementById('message-box');
const emptyMsg = document.getElementById('empty-msg');

let deque = [];

function log(msg, type = 'info') {
    messageBox.textContent = msg;
    messageBox.className = 'text-sm leading-snug transition-colors';
    if (type === 'error') messageBox.classList.add('text-red-500', 'font-medium');
    else if (type === 'success') messageBox.classList.add('text-green-600', 'font-medium');
    else messageBox.classList.add('text-slate-600');
}

function render() {
    dequeContainer.innerHTML = '';
    if (deque.length === 0) {
        dequeContainer.appendChild(emptyMsg);
        emptyMsg.style.display = 'block';
    } else {
        emptyMsg.style.display = 'none';
        deque.forEach(val => {
            const el = document.createElement('div');
            el.className = 'deque-item';
            el.textContent = val;
            dequeContainer.appendChild(el);
        });
    }
    sizeDisplay.textContent = deque.length;
}

function pushFront() {
    const val = valueInput.value || 'F';
    if(deque.length >= 8) {
        log('Deque full (visual limit).', 'error');
        return;
    }
    deque.unshift(val);
    render();
    
    // Animate
    const first = dequeContainer.firstElementChild;
    if(first) first.classList.add('enter-front');
    
    log(`Pushed Front: ${val}`, 'success');
    valueInput.value = '';
    valueInput.focus();
}

function pushRear() {
    const val = valueInput.value || 'R';
    if(deque.length >= 8) {
        log('Deque full (visual limit).', 'error');
        return;
    }
    deque.push(val);
    render();
    
    // Animate
    const last = dequeContainer.lastElementChild;
    if(last) last.classList.add('enter-rear');
    
    log(`Pushed Rear: ${val}`, 'success');
    valueInput.value = '';
    valueInput.focus();
}

async function popFront() {
    if(deque.length === 0) {
        log('Deque empty.', 'error');
        return;
    }
    
    const first = dequeContainer.firstElementChild;
    first.style.transform = 'translateY(-20px) opacity(0)';
    first.style.opacity = '0';
    
    await new Promise(r => setTimeout(r, 200));
    
    const val = deque.shift();
    render();
    log(`Popped Front: ${val}`, 'success');
}

async function popRear() {
    if(deque.length === 0) {
        log('Deque empty.', 'error');
        return;
    }
    
    const last = dequeContainer.lastElementChild;
    last.style.transform = 'translateY(20px)';
    last.style.opacity = '0';
    
    await new Promise(r => setTimeout(r, 200));
    
    const val = deque.pop();
    render();
    log(`Popped Rear: ${val}`, 'success');
}

function clear() {
    deque = [];
    render();
    log('Deque cleared.');
}

pushFrontBtn.addEventListener('click', pushFront);
pushRearBtn.addEventListener('click', pushRear);
popFrontBtn.addEventListener('click', popFront);
popRearBtn.addEventListener('click', popRear);
clearBtn.addEventListener('click', clear);

// Init
render();

