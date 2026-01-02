import { WORLD_MAP } from './map.js';
import { player } from './player.js';
import { textures, initTextures, TEXTURE_SIZE } from './textures.js';
import { renderSprites, spawnSprite, updateSprites } from './sprite.js';

// Initialize procedural textures
initTextures();

// Spawn some dummy enemies for testing
spawnSprite(10.5, 10.5, 'enemy');
spawnSprite(7.5, 7.5, 'enemy');
spawnSprite(12.5, 5.5, 'enemy');

const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');
const minimapCanvas = document.getElementById('minimap');
const mCtx = minimapCanvas.getContext('2d');

const fpsCounter = document.getElementById('fps-counter');
const debugX = document.getElementById('debug-x');
const debugY = document.getElementById('debug-y');
const debugDir = document.getElementById('debug-dir');
const valAmmo = document.getElementById('val-ammo');
const valMaxAmmo = document.getElementById('val-max-ammo');
const ammoBar = document.getElementById('ammo-bar');

let lastTime = 0;
let isPointerLocked = false;
let lastShotTime = 0;
const shootCooldown = 100; // milliseconds between shots

    // Input handling
    const keys = {};
    window.addEventListener('keydown', (e) => { 
        keys[e.code] = true; 
    });
    window.addEventListener('keyup', (e) => { keys[e.code] = false; });

    // Mobile Controls
    const dpad = document.getElementById('dpad');
    const btnShoot = document.getElementById('btn-shoot');

    if (dpad) {
        const handleDpad = (e) => {
            e.preventDefault();
            const touch = e.targetTouches[0];
            if (!touch) {
                keys['KeyW'] = false; keys['KeyS'] = false;
                keys['KeyA'] = false; keys['KeyD'] = false;
                return;
            }

            const rect = dpad.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const dx = touch.clientX - centerX;
            const dy = touch.clientY - centerY;
            
            // Simple threshold logic
            const threshold = 10;
            
            keys['KeyW'] = dy < -threshold;
            keys['KeyS'] = dy > threshold;
            keys['KeyA'] = dx < -threshold; // Strafe Left
            keys['KeyD'] = dx > threshold; // Strafe Right
            
            // Optional: Rotate with D-Pad X axis instead of strafe?
            // For now, let's keep WASD logic (Strafe on A/D)
            // If user wants to rotate, we might need a separate area or use A/D for rotate on mobile.
            // Let's swap A/D to Rotate for mobile to make it playable
            keys['ArrowLeft'] = dx < -threshold;
            keys['ArrowRight'] = dx > threshold;
            keys['KeyA'] = false; 
            keys['KeyD'] = false;
        };

        dpad.addEventListener('touchstart', handleDpad);
        dpad.addEventListener('touchmove', handleDpad);
        dpad.addEventListener('touchend', (e) => {
            e.preventDefault();
            keys['KeyW'] = false; keys['KeyS'] = false;
            keys['ArrowLeft'] = false; keys['ArrowRight'] = false;
        });
    }

    if (btnShoot) {
        btnShoot.addEventListener('touchstart', (e) => {
            e.preventDefault();
            shoot();
        });
    }

    // Pointer Lock for Mouse Look (Left Click)
    canvas.addEventListener('click', (e) => {
        // Only lock on left click, not right click
        if (e.button === 0 && !isPointerLocked) {
            canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
            if (canvas.requestPointerLock) {
                canvas.requestPointerLock();
            }
        }
    });

    // Right Mouse Button for Shooting
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault(); // Prevent context menu
    });
    
    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 2) { // Right mouse button
            e.preventDefault();
            shoot();
        }
    });

    // Handle pointer lock change
    const pointerLockChange = () => {
        isPointerLocked = document.pointerLockElement === canvas || 
                         document.mozPointerLockElement === canvas || 
                         document.webkitPointerLockElement === canvas;
    };

    document.addEventListener('pointerlockchange', pointerLockChange);
    document.addEventListener('mozpointerlockchange', pointerLockChange);
    document.addEventListener('webkitpointerlockchange', pointerLockChange);

    // Mouse Look
    let mouseSensitivity = 0.002;
    document.addEventListener('mousemove', (e) => {
        if (!isPointerLocked) return;
        
        const movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
        const rotSpeed = -movementX * mouseSensitivity;
        
        if (rotSpeed !== 0) {
            const oldDirX = player.dirX;
            player.dirX = player.dirX * Math.cos(rotSpeed) - player.dirY * Math.sin(rotSpeed);
            player.dirY = oldDirX * Math.sin(rotSpeed) + player.dirY * Math.cos(rotSpeed);
            
            const oldPlaneX = player.planeX;
            player.planeX = player.planeX * Math.cos(rotSpeed) - player.planeY * Math.sin(rotSpeed);
            player.planeY = oldPlaneX * Math.sin(rotSpeed) + player.planeY * Math.cos(rotSpeed);
        }
    });

    // Shooting
    function shoot() {
        const now = Date.now();
        // Rate limiting - prevent spam shooting
        if (now - lastShotTime < shootCooldown) {
            return;
        }
        
        // Check ammo
        if (player.ammo <= 0) {
            return; // Can't shoot without ammo
        }
        
        lastShotTime = now;
        
        // Decrement ammo
        player.ammo--;
        updateAmmoUI();
        
        // Spawn projectile slightly in front of player
        const spawnDist = 0.5;
        const pX = player.x + player.dirX * spawnDist;
        const pY = player.y + player.dirY * spawnDist;
        
        spawnSprite(pX, pY, 'projectile', player.dirX, player.dirY, 8.0); // 8.0 speed
        
        // Visual kickback (optional)
        // const weaponEl = document.querySelector('.weapon-sprite'); // If we had one
    }

    // Update Ammo UI
    function updateAmmoUI() {
        if (valAmmo) valAmmo.innerText = player.ammo;
        if (valMaxAmmo) valMaxAmmo.innerText = player.maxAmmo;
        
        if (ammoBar) {
            const blocks = ammoBar.querySelectorAll('.ammo-block');
            const ammoPerBlock = player.maxAmmo / blocks.length;
            
            blocks.forEach((block, index) => {
                const threshold = (index + 1) * ammoPerBlock;
                if (player.ammo >= threshold) {
                    block.className = 'ammo-block h-4 w-2 bg-primary shadow-[0_0_5px_rgba(19,236,19,0.8)] rounded-sm';
                } else {
                    block.className = 'ammo-block h-4 w-2 bg-[#1a2e1a] border border-[#2a4e2a] rounded-sm';
                }
            });
        }
    }

    // Initialize Ammo UI
    updateAmmoUI();

function resize() {
    // Make sure the canvas buffer matches the display size for crisp rendering
    // or use a smaller internal resolution for retro feel
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    minimapCanvas.width = minimapCanvas.clientWidth;
    minimapCanvas.height = minimapCanvas.clientHeight;
}
window.addEventListener('resize', resize);
resize();

function update(dt) {
    // Normalize speed for frame rate (assuming target 60 FPS)
    const timeScale = dt * 60;
    const moveSpeed = (keys['ShiftLeft'] ? player.moveSpeed * 1.8 : player.moveSpeed) * timeScale;
    const rotSpeed = player.rotSpeed * timeScale;

    // Rotation
    // Use Left/Right Arrow keys or Q/E for rotation
    let rot = 0;
    if (keys['ArrowLeft'] || keys['KeyQ']) rot = rotSpeed;
    if (keys['ArrowRight'] || keys['KeyE']) rot = -rotSpeed;

    if (rot !== 0) {
        // Rotate direction
        const oldDirX = player.dirX;
        player.dirX = player.dirX * Math.cos(rot) - player.dirY * Math.sin(rot);
        player.dirY = oldDirX * Math.sin(rot) + player.dirY * Math.cos(rot);
        
        // Rotate camera plane
        const oldPlaneX = player.planeX;
        player.planeX = player.planeX * Math.cos(rot) - player.planeY * Math.sin(rot);
        player.planeY = oldPlaneX * Math.sin(rot) + player.planeY * Math.cos(rot);
    }

    // Movement
    let moveStep = 0;
    if (keys['KeyW'] || keys['ArrowUp']) moveStep = moveSpeed;
    if (keys['KeyS'] || keys['ArrowDown']) moveStep = -moveSpeed;

    if (moveStep !== 0) {
        const newX = player.x + player.dirX * moveStep;
        const newY = player.y + player.dirY * moveStep;

        // Collision detection (check X and Y independently for sliding)
        // Check X
        if (WORLD_MAP[Math.floor(newX)][Math.floor(player.y)] === 0) {
            player.x = newX;
        }
        // Check Y
        if (WORLD_MAP[Math.floor(player.x)][Math.floor(newY)] === 0) {
            player.y = newY;
        }
    }

    // Strafe (A/D)
    let strafeStep = 0;
    if (keys['KeyA']) strafeStep = -moveSpeed;
    if (keys['KeyD']) strafeStep = moveSpeed;

    if (strafeStep !== 0) {
        // Strafe direction is perpendicular to direction (rotate 90 deg)
        // Dir vector (x, y) -> Perpendicular (y, -x) for correct visual orientation
        const strafeDirX = player.dirY;
        const strafeDirY = -player.dirX;

        const newX = player.x + strafeDirX * strafeStep;
        const newY = player.y + strafeDirY * strafeStep;

        if (WORLD_MAP[Math.floor(newX)][Math.floor(player.y)] === 0) {
            player.x = newX;
        }
        if (WORLD_MAP[Math.floor(player.x)][Math.floor(newY)] === 0) {
            player.y = newY;
        }
    }

    // Update Debug UI
    if (debugX) debugX.innerText = player.x.toFixed(2);
    if (debugY) debugY.innerText = player.y.toFixed(2);
    if (debugDir) {
        const angleDeg = Math.atan2(player.dirY, player.dirX) * 180 / Math.PI;
        debugDir.innerText = ((angleDeg + 360) % 360).toFixed(0) + '°';
    }
}

function render() {
    // 1. Draw Floor and Ceiling
    // Ceiling
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height / 2);
    // Floor
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

    // 2. Ray Casting
    const zBuffer = new Array(canvas.width).fill(0); // For sprite occlusion

    for (let x = 0; x < canvas.width; x++) {
        // Calculate ray position and direction
        const cameraX = 2 * x / canvas.width - 1; // x-coordinate in camera space
        const rayDirX = player.dirX + player.planeX * cameraX;
        const rayDirY = player.dirY + player.planeY * cameraX;

        // Which box of the map we're in
        let mapX = Math.floor(player.x);
        let mapY = Math.floor(player.y);

        // Length of ray from current position to next x or y-side
        let sideDistX;
        let sideDistY;

        // Length of ray from one x or y-side to next x or y-side
        // Avoid division by zero
        const deltaDistX = (rayDirX === 0) ? 1e30 : Math.abs(1 / rayDirX);
        const deltaDistY = (rayDirY === 0) ? 1e30 : Math.abs(1 / rayDirY);

        let perpWallDist;

        // What direction to step in x or y-direction (either +1 or -1)
        let stepX;
        let stepY;

        let hit = 0; // Was there a wall hit?
        let side; // Was a NS or a EW wall hit?

        // Calculate step and initial sideDist
        if (rayDirX < 0) {
            stepX = -1;
            sideDistX = (player.x - mapX) * deltaDistX;
        } else {
            stepX = 1;
            sideDistX = (mapX + 1.0 - player.x) * deltaDistX;
        }
        if (rayDirY < 0) {
            stepY = -1;
            sideDistY = (player.y - mapY) * deltaDistY;
        } else {
            stepY = 1;
            sideDistY = (mapY + 1.0 - player.y) * deltaDistY;
        }

        // Perform DDA
        while (hit === 0) {
            // Jump to next map square, OR in x-direction, OR in y-direction
            if (sideDistX < sideDistY) {
                sideDistX += deltaDistX;
                mapX += stepX;
                side = 0;
            } else {
                sideDistY += deltaDistY;
                mapY += stepY;
                side = 1;
            }
            // Check if ray has hit a wall
            if (WORLD_MAP[mapX] && WORLD_MAP[mapX][mapY] > 0) {
                hit = 1;
            }
        }

        // Calculate distance projected on camera direction (Euclidean distance will give fisheye effect!)
        if (side === 0) {
            perpWallDist = (sideDistX - deltaDistX);
        } else {
            perpWallDist = (sideDistY - deltaDistY);
        }

        // Store in Z-Buffer
        zBuffer[x] = perpWallDist;

        // Calculate height of line to draw on screen
        const lineHeight = Math.floor(canvas.height / perpWallDist);

        // Calculate lowest and highest pixel to fill in current stripe
        let drawStart = -lineHeight / 2 + canvas.height / 2;
        if (drawStart < 0) drawStart = 0;
        let drawEnd = lineHeight / 2 + canvas.height / 2;
        if (drawEnd >= canvas.height) drawEnd = canvas.height - 1;

        // Texture Mapping
        const texNum = WORLD_MAP[mapX][mapY] || 1; // Default to 1 if undefined
        let wallX; // Where exactly the wall was hit
        if (side === 0) {
            wallX = player.y + perpWallDist * rayDirY;
        } else {
            wallX = player.x + perpWallDist * rayDirX;
        }
        wallX -= Math.floor(wallX);

        // x coordinate on the texture
        let texX = Math.floor(wallX * TEXTURE_SIZE);
        if (side === 0 && rayDirX > 0) texX = TEXTURE_SIZE - texX - 1;
        if (side === 1 && rayDirY < 0) texX = TEXTURE_SIZE - texX - 1;

        // Draw texture strip
        const texture = textures.walls[texNum] || textures.walls[1];
        
        // Intensity based on distance (Darkness)
        const maxDist = 20.0;
        let intensity = 1.0 - (Math.min(perpWallDist, maxDist) / maxDist);
        if (side === 1) intensity *= 0.7; // Darker on y-sides

        if (texture) {
             // We can use drawImage to draw a slice of the texture
             // Source: (texX, 0, 1, TEXTURE_SIZE)
             // Dest: (x, drawStart, 1, lineHeight) - Note: lineHeight, not drawEnd-drawStart to handle clipping correctly?
             // Actually, for clipping we need to be careful. drawImage handles scaling.
             
             // Simplest approach: drawImage
             ctx.drawImage(
                 texture, 
                 texX, 0, 1, TEXTURE_SIZE, 
                 x, -lineHeight / 2 + canvas.height / 2, 1, lineHeight
             );
             
             // Apply shading overlay
             ctx.fillStyle = `rgba(0, 0, 0, ${1 - intensity})`;
             ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);
        } else {
             // Fallback to solid color
            let val = 255 * intensity;
            const color = `rgb(0, ${Math.floor(val)}, 0)`;
            ctx.fillStyle = color;
             ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);
        }
    }

    // 3. Render Sprites
    renderSprites(ctx, canvas, zBuffer);

    drawMinimap();
}

function drawMinimap() {
    // Clear minimap
    mCtx.fillStyle = '#0a140a';
    mCtx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);

    // Scaling
    const gridSize = WORLD_MAP.length;
    const tileSize = minimapCanvas.width / gridSize;

    // Draw Map
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            if (WORLD_MAP[x][y] > 0) {
                mCtx.fillStyle = '#1a2e1a';
                mCtx.fillRect(x * tileSize, y * tileSize, tileSize - 1, tileSize - 1);
            }
        }
    }

    // Draw Player
    const pX = player.x * tileSize;
    const pY = player.y * tileSize;
    
    mCtx.fillStyle = '#13ec13';
    mCtx.beginPath();
    mCtx.arc(pX, pY, 3, 0, Math.PI * 2);
    mCtx.fill();

    // Draw Player Direction (View Cone or Line)
    mCtx.strokeStyle = '#13ec13';
    mCtx.beginPath();
    mCtx.moveTo(pX, pY);
    mCtx.lineTo(pX + player.dirX * 10, pY + player.dirY * 10);
    mCtx.stroke();
}

function gameLoop(time) {
    const dt = (time - lastTime) / 1000;
    lastTime = time;

    if (fpsCounter) fpsCounter.innerText = Math.round(1 / dt);

    updateSprites(dt);
    update(dt);
    render();
    
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

