import { player } from './player.js';
import { textures, TEXTURE_SIZE } from './textures.js';

export const sprites = [];

export function spawnSprite(x, y, type) {
    sprites.push({ x, y, type });
}

export function removeSprite(sprite) {
    const index = sprites.indexOf(sprite);
    if (index > -1) {
        sprites.splice(index, 1);
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

