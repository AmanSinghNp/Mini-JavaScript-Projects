/**
 * Raycaster - Core raycasting rendering engine
 * Extracted from main.js render() function
 */

import { Config } from '../core/Config.js';

export class Raycaster {
  /**
   * Create a raycaster renderer
   * @param {HTMLCanvasElement} canvas - The canvas to render to
   * @param {Object} textures - Texture manager with walls array
   */
  constructor(canvas, textures) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.textures = textures;
    
    // Z-buffer for sprite occlusion
    this.zBuffer = [];
    
    // Rendering constants from config
    this.maxRenderDistance = Config.Visuals.maxRenderDistance;
    this.ySideDarkening = Config.Visuals.ySideDarkening;
    this.textureSize = Config.Visuals.textureSize;
  }

  /**
   * Render a frame of the 3D world
   * @param {Object} player - Player state with position and direction
   * @param {number[][]} worldMap - 2D array of wall values
   * @returns {number[]} Z-buffer for sprite occlusion
   */
  render(player, worldMap) {
    const { canvas, ctx } = this;
    const width = canvas.width;
    const height = canvas.height;

    // 1. Draw Floor and Ceiling
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, width, height / 2);
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, height / 2, width, height / 2);

    // 2. Reset Z-buffer
    this.zBuffer = new Array(width).fill(0);

    // 3. Ray Casting loop
    for (let x = 0; x < width; x++) {
      // Calculate ray position and direction
      const cameraX = 2 * x / width - 1; // x-coordinate in camera space
      const rayDirX = player.dirX + player.planeX * cameraX;
      const rayDirY = player.dirY + player.planeY * cameraX;

      // Which box of the map we're in
      let mapX = Math.floor(player.x);
      let mapY = Math.floor(player.y);

      // Length of ray from one x or y-side to next x or y-side
      const deltaDistX = (rayDirX === 0) ? 1e30 : Math.abs(1 / rayDirX);
      const deltaDistY = (rayDirY === 0) ? 1e30 : Math.abs(1 / rayDirY);

      let sideDistX, sideDistY;
      let stepX, stepY;
      let side; // 0 = NS wall, 1 = EW wall

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

      // Perform DDA (Digital Differential Analysis)
      let hit = 0;
      while (hit === 0) {
        if (sideDistX < sideDistY) {
          sideDistX += deltaDistX;
          mapX += stepX;
          side = 0;
        } else {
          sideDistY += deltaDistY;
          mapY += stepY;
          side = 1;
        }
        
        if (worldMap[mapX] && worldMap[mapX][mapY] > 0) {
          hit = 1;
        }
      }

      // Calculate perpendicular wall distance (avoids fisheye)
      const perpWallDist = (side === 0)
        ? (sideDistX - deltaDistX)
        : (sideDistY - deltaDistY);

      // Store in Z-Buffer
      this.zBuffer[x] = perpWallDist;

      // Calculate wall strip height and position
      const lineHeight = Math.floor(height / perpWallDist);
      let drawStart = -lineHeight / 2 + height / 2;
      if (drawStart < 0) drawStart = 0;
      let drawEnd = lineHeight / 2 + height / 2;
      if (drawEnd >= height) drawEnd = height - 1;

      // Texture mapping
      const texNum = worldMap[mapX][mapY] || 1;
      let wallX = (side === 0)
        ? player.y + perpWallDist * rayDirY
        : player.x + perpWallDist * rayDirX;
      wallX -= Math.floor(wallX);

      // Calculate texture X coordinate
      let texX = Math.floor(wallX * this.textureSize);
      if (side === 0 && rayDirX > 0) texX = this.textureSize - texX - 1;
      if (side === 1 && rayDirY < 0) texX = this.textureSize - texX - 1;

      // Calculate lighting intensity based on distance
      let intensity = 1.0 - (Math.min(perpWallDist, this.maxRenderDistance) / this.maxRenderDistance);
      if (side === 1) intensity *= this.ySideDarkening;

      // Draw wall strip
      const texture = this.textures.walls[texNum] || this.textures.walls[1];
      
      if (texture) {
        // Draw texture slice
        ctx.drawImage(
          texture,
          texX, 0, 1, this.textureSize,
          x, -lineHeight / 2 + height / 2, 1, lineHeight
        );
        
        // Apply shading overlay
        ctx.fillStyle = `rgba(0, 0, 0, ${1 - intensity})`;
        ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);
      } else {
        // Fallback to solid color
        const val = 255 * intensity;
        ctx.fillStyle = `rgb(0, ${Math.floor(val)}, 0)`;
        ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);
      }
    }

    return this.zBuffer;
  }

  /**
   * Get the current Z-buffer (for sprite rendering)
   * @returns {number[]}
   */
  getZBuffer() {
    return this.zBuffer;
  }

  /**
   * Handle canvas resize
   */
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }
}

export default Raycaster;
