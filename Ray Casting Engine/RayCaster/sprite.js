import { player } from './player.js';
import { textures, TEXTURE_SIZE } from './textures.js';
import { WORLD_MAP } from './map.js';

export const sprites = [];

export function spawnSprite(x, y, type, dirX = 0, dirY = 0, speed = 0) {
    sprites.push({ x, y, type, dirX, dirY, speed });
}

export function removeSprite(sprite) {
    const index = sprites.indexOf(sprite);
    if (index > -1) {
        sprites.splice(index, 1);
    }
}

export function updateSprites(dt) {
    for (let i = sprites.length - 1; i >= 0; i--) {
        const sprite = sprites[i];

        // Projectile Logic
        if (sprite.type === 'projectile') {
            const moveStep = sprite.speed * dt;
            const newX = sprite.x + sprite.dirX * moveStep;
            const newY = sprite.y + sprite.dirY * moveStep;

            // Check Wall Collision (with bounds checking)
            const mapX = Math.floor(newX);
            const mapY = Math.floor(newY);
            if (mapX >= 0 && mapX < WORLD_MAP.length && 
                mapY >= 0 && mapY < WORLD_MAP[0].length &&
                WORLD_MAP[mapX][mapY] > 0) {
                // Hit wall
                removeSprite(sprite);
                continue;
            }

            // Check Enemy Collision
            let hitEnemy = false;
            for (let j = sprites.length - 1; j >= 0; j--) {
                const other = sprites[j];
                if (other.type === 'enemy') {
                    const dist = Math.sqrt((other.x - newX) ** 2 + (other.y - newY) ** 2);
                    if (dist < 0.5) { // Hitbox size
                        removeSprite(other); // Kill enemy
                        removeSprite(sprite); // Destroy bullet
                        hitEnemy = true;
                        break;
                    }
                }
            }

            if (!hitEnemy) {
                sprite.x = newX;
                sprite.y = newY;
                
                // Despawn if too far
                const distFromPlayer = Math.sqrt((sprite.x - player.x)**2 + (sprite.y - player.y)**2);
                if (distFromPlayer > 30) removeSprite(sprite);
            }
        }
    }
}

export function renderSprites(ctx, canvas, zBuffer) {
    // 1. Calculate distance to each sprite
    sprites.forEach(sprite => {
        sprite.distance = ((player.x - sprite.x) ** 2 + (player.y - sprite.y) ** 2);
    });

    // 2. Sort sprites by distance (far to near)
    sprites.sort((a, b) => b.distance - a.distance);

    // 3. Project and Render
    for (const sprite of sprites) {
        // Translate sprite position to relative to camera
        const spriteX = sprite.x - player.x;
        const spriteY = sprite.y - player.y;

        // Transform sprite with the inverse camera matrix
        // [ planeX   dirX ] -1                                       [ dirY      -dirX ]
        // [               ]       =  1/(planeX*dirY-dirX*planeY) *   [                 ]
        // [ planeY   dirY ]                                          [ -planeY  planeX ]

        const invDet = 1.0 / (player.planeX * player.dirY - player.dirX * player.planeY);

        const transformX = invDet * (player.dirY * spriteX - player.dirX * spriteY);
        const transformY = invDet * (-player.planeY * spriteX + player.planeX * spriteY); // Depth inside screen

        const spriteScreenX = Math.floor((canvas.width / 2) * (1 + transformX / transformY));

        // Calculate height of the sprite on screen
        // using 'transformY' instead of the real distance prevents fisheye
        const spriteHeight = Math.abs(Math.floor(canvas.height / transformY));
        
        // Calculate lowest and highest pixel to fill in current stripe
        let drawStartY = -spriteHeight / 2 + canvas.height / 2;
        if (drawStartY < 0) drawStartY = 0;
        let drawEndY = spriteHeight / 2 + canvas.height / 2;
        if (drawEndY >= canvas.height) drawEndY = canvas.height - 1;

        // Calculate width of the sprite
        const spriteWidth = Math.abs(Math.floor(canvas.height / transformY));
        let drawStartX = -spriteWidth / 2 + spriteScreenX;
        let drawEndX = spriteWidth / 2 + spriteScreenX;
        
        // Loop through every vertical stripe of the sprite on screen
        // Optimization: check boundaries before loop
        let startX = Math.floor(drawStartX);
        let endX = Math.floor(drawEndX);
        
        if (startX < 0) startX = 0;
        if (endX >= canvas.width) endX = canvas.width;

        const texture = textures.sprites[sprite.type];
        if (!texture) continue;

        for (let stripe = startX; stripe < endX; stripe++) {
            const texX = Math.floor((stripe - (-spriteWidth / 2 + spriteScreenX)) * TEXTURE_SIZE / spriteWidth);
            
            // Conditions for drawing:
            // 1. It's in front of camera plane so you don't see things behind you
            // 2. It's on the screen (checked by loop bounds)
            // 3. It's not occluded by a wall (ZBuffer check)
            if (transformY > 0 && stripe > 0 && stripe < canvas.width && transformY < zBuffer[stripe]) {
                 ctx.drawImage(
                    texture,
                    texX, 0, 1, TEXTURE_SIZE,
                    stripe, drawStartY, 1, drawEndY - drawStartY
                 );
            }
        }
    }
}
