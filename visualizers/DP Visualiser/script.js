// State
let items = [
    { w: 1, v: 1 },
    { w: 3, v: 4 },
    { w: 4, v: 5 },
    { w: 5, v: 7 }
];
let capacity = 7;
let isRunning = false;

// DOM
const itemsList = document.getElementById('items-list');
const wInput = document.getElementById('w-input');
const vInput = document.getElementById('v-input');
const addItemBtn = document.getElementById('add-item-btn');
const capacityInput = document.getElementById('capacity-input');
const runBtn = document.getElementById('run-btn');
const tableContainer = document.getElementById('table-container');
const messageBox = document.getElementById('message-box');

// Helper: Log
function log(msg) {
    messageBox.textContent = msg;
}

// Render Items
function renderItems() {
    itemsList.innerHTML = '';
    items.forEach((item, idx) => {
        const tag = document.createElement('div');
        tag.className = 'item-tag';
        tag.innerHTML = `<span>w:${item.w}, v:${item.v}</span>`;
        const del = document.createElement('span');
        del.className = 'del-btn';
        del.innerHTML = '&times;';
        del.onclick = () => {
            if(isRunning) return;
            items.splice(idx, 1);
            renderItems();
        };
        tag.appendChild(del);
        itemsList.appendChild(tag);
    });
}

function createTable() {
    tableContainer.innerHTML = '';
    const table = document.createElement('table');
    table.className = 'dp-table';
    
    // Header Row (Weights 0..W)
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.appendChild(document.createElement('th')); // Empty corner
    for (let w = 0; w <= capacity; w++) {
        const th = document.createElement('th');
        th.textContent = w;
        headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Body
    const tbody = document.createElement('tbody');
    // Row 0 (No items)
    const zeroRow = document.createElement('tr');
    const zeroTh = document.createElement('th');
    zeroTh.textContent = '0';
    zeroRow.appendChild(zeroTh);
    for (let w = 0; w <= capacity; w++) {
        const td = document.createElement('td');
        td.id = `cell-0-${w}`;
        td.textContent = '0';
        zeroRow.appendChild(td);
    }
    tbody.appendChild(zeroRow);

    // Item Rows
    items.forEach((item, i) => {
        const row = document.createElement('tr');
        const th = document.createElement('th');
        th.innerHTML = `Item ${i+1}<br><span class="text-xs font-normal">w:${item.w}, v:${item.v}</span>`;
        row.appendChild(th);
        
        for (let w = 0; w <= capacity; w++) {
            const td = document.createElement('td');
            td.id = `cell-${i+1}-${w}`;
            row.appendChild(td);
        }
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    tableContainer.appendChild(table);
}

async function runDP() {
    if (isRunning) return;
    capacity = parseInt(capacityInput.value);
    if(isNaN(capacity) || capacity < 1) return;
    
    isRunning = true;
    runBtn.disabled = true;
    createTable();
    
    // DP Logic
    const n = items.length;
    // dp[i][w]
    const dp = Array(n + 1).fill(0).map(() => Array(capacity + 1).fill(0));
    
    for (let i = 1; i <= n; i++) {
        const item = items[i-1];
        const wt = item.w;
        const val = item.v;
        
        for (let w = 0; w <= capacity; w++) {
            const cell = document.getElementById(`cell-${i}-${w}`);
            
            // Highlight current calculation
            cell.classList.add('highlight-current');
            
            if (wt <= w) {
                // Determine max
                const valWithout = dp[i-1][w];
                const valWith = val + dp[i-1][w-wt];
                
                // Highlight dependencies
                const cellPrev = document.getElementById(`cell-${i-1}-${w}`);
                const cellPrevRem = document.getElementById(`cell-${i-1}-${w-wt}`);
                if(cellPrev) cellPrev.classList.add('highlight-dependency');
                if(cellPrevRem) cellPrevRem.classList.add('highlight-dependency');
                
                await wait(300);
                
                dp[i][w] = Math.max(valWithout, valWith);
                log(`Max(Exclude: ${valWithout}, Include: ${val} + ${dp[i-1][w-wt]}) = ${dp[i][w]}`);
                
                if(cellPrev) cellPrev.classList.remove('highlight-dependency');
                if(cellPrevRem) cellPrevRem.classList.remove('highlight-dependency');
            } else {
                const valWithout = dp[i-1][w];
                const cellPrev = document.getElementById(`cell-${i-1}-${w}`);
                if(cellPrev) cellPrev.classList.add('highlight-dependency');
                
                await wait(200);
                
                dp[i][w] = valWithout;
                log(`Capacity < Weight (${w} < ${wt}). Copy from above: ${valWithout}`);
                
                if(cellPrev) cellPrev.classList.remove('highlight-dependency');
            }
            
            cell.textContent = dp[i][w];
            cell.classList.remove('highlight-current');
            cell.classList.add('cell-filled');
        }
    }
    
    log(`Max Value: ${dp[n][capacity]}`);
    document.getElementById(`cell-${n}-${capacity}`).classList.add('highlight-final');
    isRunning = false;
    runBtn.disabled = false;
}

function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
}

addItemBtn.addEventListener('click', () => {
    const w = parseInt(wInput.value);
    const v = parseInt(vInput.value);
    if(w && v) {
        items.push({w, v});
        renderItems();
        wInput.value = '';
        vInput.value = '';
    }
});

runBtn.addEventListener('click', runDP);

// Init
renderItems();



