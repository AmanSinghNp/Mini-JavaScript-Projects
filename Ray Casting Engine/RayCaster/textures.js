export const TEXTURE_SIZE = 64;

export const textures = {
    walls: [],
    floor: null,
    ceiling: null
};

// Helper to create a new canvas texture
function createTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = TEXTURE_SIZE;
    canvas.height = TEXTURE_SIZE;
    return { canvas, ctx: canvas.getContext('2d') };
}

// 0: Empty (unused)
// 1: Brick Wall
function generateBrickTexture() {
    const { canvas, ctx } = createTexture();
    
    // Background (mortar)
    ctx.fillStyle = '#1a1a1a'; // Dark grey
    ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

    // Bricks
    ctx.fillStyle = '#A52A2A'; // Brown
    // Row 1
    ctx.fillRect(1, 1, 30, 14);
    ctx.fillRect(33, 1, 30, 14);
    // Row 2 (offset)
    ctx.fillRect(1, 17, 14, 14);
    ctx.fillRect(17, 17, 30, 14);
    ctx.fillRect(49, 17, 14, 14);
    // Row 3
    ctx.fillRect(1, 33, 30, 14);
    ctx.fillRect(33, 33, 30, 14);
    // Row 4 (offset)
    ctx.fillRect(1, 49, 14, 14);
    ctx.fillRect(17, 49, 30, 14);
    ctx.fillRect(49, 49, 14, 14);

    // Add some noise/grit
    addNoise(ctx);

    return canvas;
}

// 2: Stone Wall (Blueish)
function generateStoneTexture() {
    const { canvas, ctx } = createTexture();
    
    ctx.fillStyle = '#2F4F4F'; // Dark Slate Gray
    ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

    // Random stone blocks
    ctx.fillStyle = '#708090'; // Slate Gray
    for(let i=0; i<8; i++) {
        const x = Math.random() * TEXTURE_SIZE;
        const y = Math.random() * TEXTURE_SIZE;
        const w = 10 + Math.random() * 20;
        const h = 10 + Math.random() * 20;
        ctx.fillRect(x, y, w, h);
    }
    
    addNoise(ctx);
    return canvas;
}

function addNoise(ctx) {
    const imageData = ctx.getImageData(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 20;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i+1] = Math.max(0, Math.min(255, data[i+1] + noise));
        data[i+2] = Math.max(0, Math.min(255, data[i+2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);
}

export function initTextures() {
    textures.walls[0] = null; // Empty
    textures.walls[1] = generateBrickTexture();
    textures.walls[2] = generateStoneTexture(); // We can map other map IDs to this
    
    // Sprites
    textures.sprites = {};
    textures.sprites['enemy'] = generateEnemyTexture();
    textures.sprites['projectile'] = generateProjectileTexture();

    console.log("Textures generated");
}

function generateEnemyTexture() {
    const { canvas, ctx } = createTexture();
    // Simple face
    ctx.fillStyle = 'transparent';
    ctx.clearRect(0,0,TEXTURE_SIZE, TEXTURE_SIZE);
    
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, Math.PI*2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(20, 24, 6, 0, Math.PI*2);
    ctx.arc(44, 24, 6, 0, Math.PI*2);
    ctx.fill();
    
    // Mouth
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(20, 48);
    ctx.lineTo(44, 48);
    ctx.stroke();

    return canvas;
}

function generateProjectileTexture() {
    const { canvas, ctx } = createTexture();
    ctx.fillStyle = 'transparent';
    ctx.clearRect(0,0,TEXTURE_SIZE, TEXTURE_SIZE);
    
    // Glowing center
    const grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 30);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.5, '#0f0'); // Green laser
    grad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI*2);
    ctx.fill();
    
    return canvas;
}

