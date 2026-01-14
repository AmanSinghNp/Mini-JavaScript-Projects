/**
 * Drawing App Logic
 * Handles canvas interaction, drawing engine, and UI state.
 */

const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');

// State
const state = {
    isDrawing: false,
    currentTool: 'brush', // pencil, brush, eraser, marker
    color: '#36e27b',
    thickness: 12,
    opacity: 100, // percentage
    lastX: 0,
    lastY: 0,
    showSettings: false,
    tools: {
        pencil: { size: 2, opacity: 100, composite: 'source-over' },
        brush: { size: 12, opacity: 100, composite: 'source-over' },
        marker: { size: 24, opacity: 50, composite: 'source-over' },
        eraser: { size: 20, opacity: 100, composite: 'destination-out' }
    },
    // Undo/Redo history
    history: [],
    historyIndex: -1,
    maxHistory: 50,
    // For smooth bezier curves
    points: []
};

// Elements
const ui = {
    tools: {
        pencil: document.getElementById('tool-pencil'),
        brush: document.getElementById('tool-brush'),
        eraser: document.getElementById('tool-eraser'),
        marker: document.getElementById('tool-marker'),
    },
    sliders: {
        thickness: {
            container: document.getElementById('thickness-slider'),
            fill: document.getElementById('thickness-fill'),
            knob: document.getElementById('thickness-knob'),
            value: document.getElementById('thickness-value'),
        },
        opacity: {
            container: document.getElementById('opacity-slider'),
            fill: document.getElementById('opacity-fill'),
            knob: document.getElementById('opacity-knob'),
            value: document.getElementById('opacity-value'),
        }
    },
    colors: {
        btn: document.getElementById('btn-color-picker'),
        popover: document.getElementById('color-popover'),
        display: document.getElementById('current-color-display'),
        swatches: document.querySelectorAll('.color-swatch'),
        system: document.getElementById('system-color-picker')
    },
    actions: {
        clear: document.getElementById('btn-clear'),
        export: document.getElementById('btn-export'),
        deleteModal: document.getElementById('delete-modal'),
        deleteConfirm: document.getElementById('btn-delete-confirm'),
        deleteCancel: document.getElementById('btn-delete-cancel'),
        undo: document.getElementById('btn-undo'),
        redo: document.getElementById('btn-redo'),
    },
    settingsPanel: document.getElementById('tool-settings')
};

// --- Custom Cursor ---
const cursorCanvas = document.createElement('canvas');
const cursorCtx = cursorCanvas.getContext('2d');
cursorCanvas.width = 100;
cursorCanvas.height = 100;

function updateCursor() {
    const size = Math.max(state.thickness, 4);
    const displaySize = Math.min(size, 50);
    
    cursorCtx.clearRect(0, 0, 100, 100);
    cursorCtx.beginPath();
    cursorCtx.arc(50, 50, displaySize / 2, 0, Math.PI * 2);
    cursorCtx.strokeStyle = state.currentTool === 'eraser' ? '#fff' : state.color;
    cursorCtx.lineWidth = 2;
    cursorCtx.stroke();
    
    // Add crosshair for precision
    cursorCtx.beginPath();
    cursorCtx.moveTo(50 - 3, 50);
    cursorCtx.lineTo(50 + 3, 50);
    cursorCtx.moveTo(50, 50 - 3);
    cursorCtx.lineTo(50, 50 + 3);
    cursorCtx.strokeStyle = 'rgba(255,255,255,0.5)';
    cursorCtx.lineWidth = 1;
    cursorCtx.stroke();
    
    canvas.style.cursor = `url(${cursorCanvas.toDataURL()}) 50 50, crosshair`;
}

// --- Canvas Management ---

function resizeCanvas() {
    const parent = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();
    
    // Save current content
    let tempCanvas;
    try {
        if (canvas.width > 0 && canvas.height > 0) {
            tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            tempCanvas.getContext('2d').drawImage(canvas, 0, 0);
        }
    } catch (e) {
        // Ignore errors
    }

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Restore content if exists
    if (tempCanvas) {
        ctx.drawImage(tempCanvas, 0, 0, canvas.width / dpr, canvas.height / dpr);
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- History (Undo/Redo) ---

function saveState() {
    // Remove any redo states
    if (state.historyIndex < state.history.length - 1) {
        state.history = state.history.slice(0, state.historyIndex + 1);
    }
    
    // Save current canvas state
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    state.history.push(imageData);
    
    // Limit history size
    if (state.history.length > state.maxHistory) {
        state.history.shift();
    } else {
        state.historyIndex++;
    }
    
    updateHistoryButtons();
}

function undo() {
    if (state.historyIndex > 0) {
        state.historyIndex--;
        const imageData = state.history[state.historyIndex];
        ctx.putImageData(imageData, 0, 0);
        updateHistoryButtons();
    } else if (state.historyIndex === 0) {
        // Clear canvas (before first stroke)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        state.historyIndex = -1;
        updateHistoryButtons();
    }
}

function redo() {
    if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        const imageData = state.history[state.historyIndex];
        ctx.putImageData(imageData, 0, 0);
        updateHistoryButtons();
    }
}

function updateHistoryButtons() {
    ui.actions.undo.disabled = state.historyIndex < 0;
    ui.actions.redo.disabled = state.historyIndex >= state.history.length - 1;
}

// --- Drawing Engine ---

function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

function startDrawing(e) {
    state.isDrawing = true;
    const { x, y } = getCoordinates(e);
    state.lastX = x;
    state.lastY = y;
    state.points = [{ x, y }];
    
    // Draw a single dot
    ctx.beginPath();
    ctx.arc(x, y, state.thickness / 2, 0, Math.PI * 2);
    ctx.fillStyle = state.color;
    ctx.globalAlpha = state.opacity / 100;
    ctx.globalCompositeOperation = state.currentTool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.fill();
}

function draw(e) {
    if (!state.isDrawing) return;
    e.preventDefault();

    const { x, y } = getCoordinates(e);
    state.points.push({ x, y });
    
    // Apply styles
    ctx.lineWidth = state.thickness;
    ctx.globalCompositeOperation = state.currentTool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.globalAlpha = state.opacity / 100;
    ctx.strokeStyle = state.color;
    
    // Smooth bezier curve drawing
    if (state.points.length >= 3) {
        const p1 = state.points[state.points.length - 3];
        const p2 = state.points[state.points.length - 2];
        const p3 = state.points[state.points.length - 1];
        
        const midX = (p2.x + p3.x) / 2;
        const midY = (p2.y + p3.y) / 2;
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(p2.x, p2.y, midX, midY);
        ctx.stroke();
    } else {
        // Fallback to straight line for first few points
        ctx.beginPath();
        ctx.moveTo(state.lastX, state.lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
    
    state.lastX = x;
    state.lastY = y;
}

function stopDrawing() {
    if (state.isDrawing) {
        state.isDrawing = false;
        ctx.beginPath();
        state.points = [];
        saveState(); // Save state for undo
    }
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('touchstart', startDrawing, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });
canvas.addEventListener('touchend', stopDrawing);

// --- UI Interaction ---

// Tool Switching
Object.keys(ui.tools).forEach(toolId => {
    ui.tools[toolId].addEventListener('click', () => {
        if (state.currentTool === toolId) {
            state.showSettings = !state.showSettings;
            toggleSettingsPanel();
            return;
        }

        state.currentTool = toolId;
        state.showSettings = false;
        toggleSettingsPanel();
        updateToolUI();
        
        state.thickness = state.tools[toolId].size;
        state.opacity = state.tools[toolId].opacity;
        updateSlidersUI();
        updateCursor();
    });
});

function selectTool(toolId) {
    if (ui.tools[toolId]) {
        state.currentTool = toolId;
        state.showSettings = false;
        toggleSettingsPanel();
        updateToolUI();
        state.thickness = state.tools[toolId].size;
        state.opacity = state.tools[toolId].opacity;
        updateSlidersUI();
        updateCursor();
    }
}

function toggleSettingsPanel() {
    if (state.showSettings) {
        ui.settingsPanel.classList.remove('hidden');
    } else {
        ui.settingsPanel.classList.add('hidden');
    }
}

function updateToolUI() {
    Object.keys(ui.tools).forEach(id => {
        const btn = ui.tools[id];
        if (id === state.currentTool) {
            btn.classList.add('tool-active');
            btn.classList.remove('hover:bg-white/5');
            const icon = btn.querySelector('.material-symbols-outlined');
            if (icon) icon.style.fontVariationSettings = "'FILL' 1";
            
            let dot = btn.querySelector('.bg-primary');
            if (!dot) {
                dot = document.createElement('div');
                dot.className = 'absolute -bottom-3 w-1 h-1 bg-primary rounded-full';
                btn.appendChild(dot);
            }
            
            btn.classList.add('bg-gradient-to-b', 'from-[#2a3830]', 'to-[#1e2923]');
            if (icon) icon.classList.add('text-primary');
            if (icon) icon.classList.remove('text-gray-400');
            
        } else {
            btn.classList.remove('tool-active', 'bg-gradient-to-b', 'from-[#2a3830]', 'to-[#1e2923]');
            btn.classList.add('hover:bg-white/5');
            const icon = btn.querySelector('.material-symbols-outlined');
            if (icon) {
                icon.style.fontVariationSettings = "'FILL' 0";
                icon.classList.remove('text-primary');
                icon.classList.add('text-gray-400');
            }
            const dot = btn.querySelector('.bg-primary');
            if (dot) dot.remove();
        }
    });
}

// Sliders Logic
function setupSlider(sliderType) {
    const { container, fill, knob, value } = ui.sliders[sliderType];
    
    function update(clientX) {
        const rect = container.getBoundingClientRect();
        let percentage = (clientX - rect.left) / rect.width;
        percentage = Math.max(0, Math.min(1, percentage));
        
        fill.style.width = `${percentage * 100}%`;
        knob.style.left = `${percentage * 100}%`;
        
        if (sliderType === 'thickness') {
            const min = 1, max = 50;
            const val = Math.round(min + percentage * (max - min));
            state.thickness = val;
            value.innerText = `${val}px`;
            updateCursor();
        } else if (sliderType === 'opacity') {
            const val = Math.round(percentage * 100);
            state.opacity = val;
            value.innerText = `${val}%`;
        }
    }

    let isDragging = false;

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        update(e.clientX);
    });
    
    window.addEventListener('mousemove', (e) => {
        if (isDragging) {
            e.preventDefault();
            update(e.clientX);
        }
    });
    
    window.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    container.addEventListener('touchstart', (e) => {
        isDragging = true;
        update(e.touches[0].clientX);
    }, { passive: false });
    
    window.addEventListener('touchmove', (e) => {
        if (isDragging) {
            e.preventDefault();
            update(e.touches[0].clientX);
        }
    }, { passive: false });
    
    window.addEventListener('touchend', () => isDragging = false);
}

setupSlider('thickness');
setupSlider('opacity');

function updateSlidersUI() {
    const tMin = 1, tMax = 50;
    const tPercent = (state.thickness - tMin) / (tMax - tMin);
    ui.sliders.thickness.fill.style.width = `${tPercent * 100}%`;
    ui.sliders.thickness.knob.style.left = `${tPercent * 100}%`;
    ui.sliders.thickness.value.innerText = `${state.thickness}px`;
    
    const oPercent = state.opacity / 100;
    ui.sliders.opacity.fill.style.width = `${oPercent * 100}%`;
    ui.sliders.opacity.knob.style.left = `${oPercent * 100}%`;
    ui.sliders.opacity.value.innerText = `${state.opacity}%`;
}


// Colors
ui.colors.btn.addEventListener('click', (e) => {
    e.stopPropagation();
    ui.colors.popover.classList.toggle('hidden');
});

ui.colors.swatches.forEach(swatch => {
    swatch.addEventListener('click', (e) => {
        e.stopPropagation();
        const color = e.target.dataset.color;
        setColor(color);
    });
});

ui.colors.system.addEventListener('input', (e) => {
    setColor(e.target.value);
});

function setColor(color) {
    state.color = color;
    ui.colors.display.style.backgroundColor = color;
    updateCursor();
}

// Close color popover when clicking outside
document.addEventListener('click', (e) => {
    if (!ui.colors.popover.classList.contains('hidden') && 
        !ui.colors.popover.contains(e.target) && 
        !ui.colors.btn.contains(e.target)) {
        ui.colors.popover.classList.add('hidden');
    }
});

// Clear / Delete
ui.actions.clear.addEventListener('click', () => {
    ui.actions.deleteModal.classList.remove('hidden');
});

ui.actions.deleteCancel.addEventListener('click', () => {
    ui.actions.deleteModal.classList.add('hidden');
});

ui.actions.deleteConfirm.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ui.actions.deleteModal.classList.add('hidden');
    // Reset history
    state.history = [];
    state.historyIndex = -1;
    updateHistoryButtons();
});

// Undo/Redo buttons
ui.actions.undo.addEventListener('click', undo);
ui.actions.redo.addEventListener('click', redo);

// Export
ui.actions.export.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'artwork.png';
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, 0);
    
    link.href = tempCanvas.toDataURL();
    link.click();
});

// --- Keyboard Shortcuts ---
document.addEventListener('keydown', (e) => {
    // Don't trigger shortcuts when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    // Tool shortcuts
    switch (e.key.toLowerCase()) {
        case 'b':
            selectTool('brush');
            break;
        case 'p':
            selectTool('pencil');
            break;
        case 'e':
            selectTool('eraser');
            break;
        case 'm':
            selectTool('marker');
            break;
        case 'escape':
            // Close all popovers
            ui.colors.popover.classList.add('hidden');
            ui.settingsPanel.classList.add('hidden');
            ui.actions.deleteModal.classList.add('hidden');
            state.showSettings = false;
            break;
    }
    
    // Undo/Redo shortcuts
    if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undo();
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
            e.preventDefault();
            redo();
        }
    }
});

// --- Initialization ---
ui.settingsPanel.classList.add('hidden');
updateToolUI();
updateSlidersUI();
updateCursor();
updateHistoryButtons();
