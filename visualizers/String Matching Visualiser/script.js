// DOM
const textInput = document.getElementById('text-input');
const patternInput = document.getElementById('pattern-input');
const runBtn = document.getElementById('run-btn');
const textContainer = document.getElementById('text-container');
const patternContainer = document.getElementById('pattern-container');
const lpsContainer = document.getElementById('lps-container');
const messageBox = document.getElementById('message-box');

let isRunning = false;

// Helper: Log
function log(msg) {
    messageBox.textContent = msg;
}

// Logic
async function runKMP() {
    if (isRunning) return;
    const text = textInput.value;
    const pattern = patternInput.value;
    if (!text || !pattern) {
        log('Enter text and pattern.');
        return;
    }

    isRunning = true;
    runBtn.disabled = true;
    
    // Init Visuals
    renderStrings(text, pattern);
    
    // Step 1: LPS
    log('Building LPS Array...');
    const lps = computeLPSArray(pattern);
    renderLPS(pattern, lps);
    await wait(1000);

    // Step 2: Search
    log('Searching...');
    let i = 0; // index for text
    let j = 0; // index for pattern
    
    while (i < text.length) {
        // Highlight current comparison
        highlight(i, j, 'active');
        alignPattern(i - j);
        await wait(500);

        if (pattern[j] === text[i]) {
            highlight(i, j, 'match');
            i++;
            j++;
            log(`Match at T[${i-1}] == P[${j-1}].`);
        } 
        
        if (j === pattern.length) {
            log(`Found pattern at index ${i - j}!`);
            highlightRange(i - j, i - 1, 'found');
            j = lps[j - 1];
            await wait(1500);
            clearHighlights();
        } else if (i < text.length && pattern[j] !== text[i]) {
            highlight(i, j, 'mismatch');
            log(`Mismatch at T[${i}] != P[${j}].`);
            await wait(500);
            
            if (j !== 0) {
                j = lps[j - 1];
                log(`Skipping using LPS. New j = ${j}.`);
            } else {
                i++;
            }
            clearHighlights();
        }
    }
    
    log('Search Complete.');
    isRunning = false;
    runBtn.disabled = false;
}

function computeLPSArray(pat) {
    const M = pat.length;
    const lps = new Array(M).fill(0);
    let len = 0;
    let i = 1;
    while (i < M) {
        if (pat[i] === pat[len]) {
            len++;
            lps[i] = len;
            i++;
        } else {
            if (len !== 0) {
                len = lps[len - 1];
            } else {
                lps[i] = 0;
                i++;
            }
        }
    }
    return lps;
}

// Visuals
function renderStrings(text, pattern) {
    textContainer.innerHTML = '';
    for (let i = 0; i < text.length; i++) {
        const div = document.createElement('div');
        div.className = 'char-box';
        div.textContent = text[i];
        div.id = `t-${i}`;
        textContainer.appendChild(div);
    }

    patternContainer.innerHTML = '';
    for (let i = 0; i < pattern.length; i++) {
        const div = document.createElement('div');
        div.className = 'char-box pat-box';
        div.textContent = pattern[i];
        div.id = `p-${i}`;
        patternContainer.appendChild(div);
    }
}

function renderLPS(pattern, lps) {
    lpsContainer.innerHTML = '<span class="text-xs font-bold w-full mb-1">LPS Table:</span>';
    for(let i=0; i<pattern.length; i++) {
        const div = document.createElement('div');
        div.className = 'lps-item';
        div.innerHTML = `<span class="text-xs text-slate-400">${pattern[i]}</span><span class="font-bold">${lps[i]}</span>`;
        lpsContainer.appendChild(div);
    }
}

function highlight(i, j, type) {
    // Clear old single highlights
    document.querySelectorAll('.char-box').forEach(el => {
        if(!el.classList.contains('found')) el.className = 'char-box' + (el.id.startsWith('p') ? ' pat-box' : '');
    });

    const tEl = document.getElementById(`t-${i}`);
    const pEl = document.getElementById(`p-${j}`);
    
    if (tEl) tEl.classList.add(type);
    if (pEl) pEl.classList.add(type);
}

function highlightRange(start, end, type) {
    for(let k=start; k<=end; k++) {
        const el = document.getElementById(`t-${k}`);
        if(el) el.classList.add(type);
    }
}

function clearHighlights() {
    document.querySelectorAll('.char-box').forEach(el => {
        if(!el.classList.contains('found')) el.className = 'char-box' + (el.id.startsWith('p') ? ' pat-box' : '');
    });
}

function alignPattern(offsetIndex) {
    // We assume fixed width of 40px + 4px gap = 44px
    const px = offsetIndex * 44;
    patternContainer.style.transform = `translateX(${px}px)`;
}

function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
}

runBtn.addEventListener('click', runKMP);



