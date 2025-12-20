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
        marker: { size: 24, opacity: 50, composite: 'source-over' }, // Simulating marker with low opacity
        eraser: { size: 20, opacity: 100, composite: 'destination-out' }
    }
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
    },
    settingsPanel: document.getElementById('tool-settings')
};

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
        console.error("Error saving canvas state:", e);
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
// Initialize canvas size
resizeCanvas();

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
    
    // For single dot
    draw(e); 
}

function draw(e) {
    if (!state.isDrawing) return;
    e.preventDefault(); // Prevent scrolling on touch

    const { x, y } = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(state.lastX, state.lastY);
    ctx.lineTo(x, y);
    
    // Apply styles
    const toolConfig = state.tools[state.currentTool];
    
    // If we are modifying settings globally, use those instead of presets?
    // Plan suggests tools have specific behaviors. Let's use the global state for thickness/opacity 
    // but allow tools to have base characteristics or just use the global state as the "active" config.
    // For simplicity and "Direct Manipulation", let's say the sliders control the CURRENT tool's properties.
    
    ctx.lineWidth = state.thickness;
    ctx.globalCompositeOperation = state.currentTool === 'eraser' ? 'destination-out' : 'source-over';
    
    if (state.currentTool === 'marker') {
        // Marker effect: usually translucent and stacks.
        // But standard canvas doesn't "stack" opacity well in one stroke unless we use multiple paths.
        // For simple implementation: just set global alpha.
        // If current tool is marker, we might want to force a lower opacity if user hasn't set it, 
        // but let's respect the slider.
        ctx.globalAlpha = state.opacity / 100;
        // Marker typically has square cap? Or sticking to round for smoothness.
        // ctx.lineCap = 'square'; 
    } else {
        ctx.globalAlpha = state.opacity / 100;
    }

    ctx.strokeStyle = state.color;
    ctx.stroke();
    
    state.lastX = x;
    state.lastY = y;
}

function stopDrawing() {
    state.isDrawing = false;
    ctx.beginPath(); // Reset path
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
        // If clicking active tool, toggle settings
        if (state.currentTool === toolId) {
            state.showSettings = !state.showSettings;
            toggleSettingsPanel();
            return;
        }

        // Switch tool
        state.currentTool = toolId;
        state.showSettings = false; // Hide settings when switching (or keep open? Plan says "active tool... opens")
        toggleSettingsPanel();
        updateToolUI();
        
        // Load tool defaults or keep current settings?
        // Let's load defaults to make tools feel distinct
        state.thickness = state.tools[toolId].size;
        state.opacity = state.tools[toolId].opacity;
        updateSlidersUI();
    });
});

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
            // Update icon fill
            const icon = btn.querySelector('.material-symbols-outlined');
            if (icon) icon.style.fontVariationSettings = "'FILL' 1";
            
            // Show indicator dot
            let dot = btn.querySelector('.bg-primary');
            if (!dot) {
                dot = document.createElement('div');
                dot.className = 'absolute -bottom-3 w-1 h-1 bg-primary rounded-full';
                btn.appendChild(dot);
            }
            
            // Set active color styles
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

// Sliders Logic (Custom Drag)
function setupSlider(sliderType) {
    const { container, fill, knob, value } = ui.sliders[sliderType];
    
    function update(clientX) {
        const rect = container.getBoundingClientRect();
        let percentage = (clientX - rect.left) / rect.width;
        percentage = Math.max(0, Math.min(1, percentage));
        
        // Update visual
        fill.style.width = `${percentage * 100}%`;
        knob.style.left = `${percentage * 100}%`;
        
        // Update state
        if (sliderType === 'thickness') {
            const min = 1, max = 50;
            const val = Math.round(min + percentage * (max - min));
            state.thickness = val;
            value.innerText = `${val}px`;
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
    
    // Touch support for sliders
    container.addEventListener('touchstart', (e) => {
        isDragging = true;
        update(e.touches[0].clientX);
    }, { passive: false });
    
    window.addEventListener('touchmove', (e) => {
        if (isDragging) {
            e.preventDefault(); // Prevent scroll
            update(e.touches[0].clientX);
        }
    }, { passive: false });
    
    window.addEventListener('touchend', () => isDragging = false);
}

setupSlider('thickness');
setupSlider('opacity');

function updateSlidersUI() {
    // Thickness
    const tMin = 1, tMax = 50;
    const tPercent = (state.thickness - tMin) / (tMax - tMin);
    ui.sliders.thickness.fill.style.width = `${tPercent * 100}%`;
    ui.sliders.thickness.knob.style.left = `${tPercent * 100}%`;
    ui.sliders.thickness.value.innerText = `${state.thickness}px`;
    
    // Opacity
    const oPercent = state.opacity / 100;
    ui.sliders.opacity.fill.style.width = `${oPercent * 100}%`;
    ui.sliders.opacity.knob.style.left = `${oPercent * 100}%`;
    ui.sliders.opacity.value.innerText = `${state.opacity}%`;
}


// Colors
ui.colors.btn.addEventListener('click', () => {
    ui.colors.popover.classList.toggle('hidden');
});

ui.colors.swatches.forEach(swatch => {
    swatch.addEventListener('click', (e) => {
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
    // Update gradient overlay slightly to reflect tone? Or just keep generic rainbow
    // ui.colors.popover.classList.add('hidden'); // Optional: close on select
}

// Clear / Delete
ui.actions.clear.addEventListener('click', () => {
    ui.actions.deleteModal.classList.remove('hidden');
});

ui.actions.deleteCancel.addEventListener('click', () => {
    ui.actions.deleteModal.classList.add('hidden');
});

ui.actions.deleteConfirm.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Use raw width/height
    ui.actions.deleteModal.classList.add('hidden');
});

// Export
ui.actions.export.addEventListener('click', () => {
    // Create a temporary link
    const link = document.createElement('a');
    link.download = 'artwork.png';
    // To handle transparency correctly or add white background:
    // User might want transparent or white. Default to transparent png from canvas.
    // If we want a white background:
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Fill white
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    // Draw original
    tempCtx.drawImage(canvas, 0, 0);
    
    link.href = tempCanvas.toDataURL();
    link.click();
});

// Initialization
// Start with tool settings hidden
ui.settingsPanel.classList.add('hidden');
updateToolUI();
updateSlidersUI();


