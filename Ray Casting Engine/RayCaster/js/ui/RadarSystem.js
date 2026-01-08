/**
 * RadarSystem - Circular radar-style minimap with enemy tracking and FOV cone
 * Optimized spatial queries for 60fps performance
 */

export class RadarSystem {
  constructor(canvasId, radius = 100, scale = 0.3) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error(`RadarSystem: Canvas with id "${canvasId}" not found`);
      return;
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.radius = radius;
    this.scale = scale; // World units per pixel (lower = more zoomed in)
    
    // Position in screen corner
    this.centerX = radius + 20;
    this.centerY = radius + 20;
    this.canvas.width = (radius + 20) * 2;
    this.canvas.height = (radius + 20) * 2;
    
    // Visual settings
    this.backgroundColor = 'rgba(0, 20, 0, 0.9)';
    this.gridColor = 'rgba(0, 255, 0, 0.2)';
    this.wallColor = '#0f0';
    this.enemyColor = '#f00';
    this.pickupColor = '#ff0';
    this.playerColor = '#0f0';
    
    // Scanning effect
    this.scanAngle = 0;
    this.scanSpeed = 0.02;
    
    // Performance optimization
    this.frameCount = 0;
    this.updateEveryNFrames = 1;
    
    // Visibility toggle
    this.isVisible = true;
    
    // Zoom level (higher = more zoomed out, shows more of map)
    this.zoomLevel = 1.5; // Default: show more of the map
    this.minZoom = 0.5;
    this.maxZoom = 3.0;
  }
  
  /**
   * Convert world coordinates to radar screen coordinates
   * FIXED MAP VIEW: Map is drawn at fixed positions, player moves on map
   */
  worldToRadar(worldX, worldY, worldMap) {
    // Calculate scale to fit entire map in radar
    const mapWidth = worldMap.length;
    const mapHeight = worldMap[0].length;
    const scaleX = (this.radius * 2 - 20) / mapWidth;
    const scaleY = (this.radius * 2 - 20) / mapHeight;
    const scale = Math.min(scaleX, scaleY);
    
    // Center the map in the radar
    const offsetX = (this.radius * 2 - mapWidth * scale) / 2;
    const offsetY = (this.radius * 2 - mapHeight * scale) / 2;
    
    return {
      x: offsetX + worldX * scale,
      y: offsetY + worldY * scale,
      scale: scale
    };
  }
  
  /**
   * Check if a point is within the radar circle
   */
  isInRadarRange(screenX, screenY) {
    const dist = Math.sqrt(screenX ** 2 + screenY ** 2);
    return dist < this.radius;
  }
  
  /**
   * Draw concentric range rings
   */
  drawRangeRings() {
    this.ctx.strokeStyle = this.gridColor;
    this.ctx.lineWidth = 1;
    
    // Draw 3 range rings
    for (let i = 1; i <= 3; i++) {
      const ringRadius = (this.radius / 3) * i;
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, ringRadius, 0, Math.PI * 2);
      this.ctx.stroke();
    }
    
    // Draw cardinal direction lines
    this.ctx.strokeStyle = this.gridColor;
    this.ctx.lineWidth = 1;
    
    // North (up)
    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX, this.centerY - this.radius);
    this.ctx.lineTo(this.centerX, this.centerY);
    this.ctx.stroke();
    
    // East (right)
    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX + this.radius, this.centerY);
    this.ctx.lineTo(this.centerX, this.centerY);
    this.ctx.stroke();
  }
  
  /**
   * Draw walls - fixed position map
   */
  drawWalls(player, worldMap) {
    const mapWidth = worldMap.length;
    const mapHeight = worldMap[0].length;
    
    // Calculate scale to fit map
    const scaleX = (this.radius * 2 - 20) / mapWidth;
    const scaleY = (this.radius * 2 - 20) / mapHeight;
    const scale = Math.min(scaleX, scaleY);
    
    const offsetX = 10 + (this.radius * 2 - 20 - mapWidth * scale) / 2;
    const offsetY = 10 + (this.radius * 2 - 20 - mapHeight * scale) / 2;
    
    this.ctx.fillStyle = this.wallColor;
    
    const cellSize = Math.max(2, scale - 1);
    
    for (let x = 0; x < mapWidth; x++) {
      for (let y = 0; y < mapHeight; y++) {
        if (worldMap[x] && worldMap[x][y] > 0) {
          this.ctx.fillRect(
            offsetX + x * scale,
            offsetY + y * scale,
            cellSize,
            cellSize
          );
        }
      }
    }
    
    // Store for player drawing
    this.mapScale = scale;
    this.mapOffsetX = offsetX;
    this.mapOffsetY = offsetY;
  }
  
  /**
   * Draw entities (enemies, pickups) on fixed map
   */
  drawEntities(player, entities) {
    if (!this.mapScale) return; // Wait for first wall draw
    
    entities.forEach(entity => {
      // Skip projectiles
      if (entity.type === 'projectile') return;
      
      // Calculate entity position on fixed map
      const screenX = this.mapOffsetX + entity.x * this.mapScale;
      const screenY = this.mapOffsetY + entity.y * this.mapScale;
      
      // Draw entity based on type
      this.ctx.save();
      this.ctx.translate(screenX, screenY);
      
      if (entity.type === 'enemy') {
        // Pulsing red dot
        const pulse = 0.8 + Math.sin(Date.now() * 0.005) * 0.2;
        this.ctx.fillStyle = this.enemyColor;
        this.ctx.globalAlpha = pulse;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 3, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (entity.type === 'pickup') {
        this.ctx.fillStyle = this.pickupColor;
        this.ctx.globalAlpha = 1.0;
        this.ctx.fillRect(-2, -2, 4, 4);
      }
      
      this.ctx.restore();
    });
  }
  
  /**
   * Draw field-of-view cone
   * STATIC: Cone rotates to show player facing direction
   */
  drawFOVCone(player) {
    this.ctx.save();
    this.ctx.translate(this.centerX, this.centerY);
    
    // Get player facing angle for static map
    const playerAngle = Math.atan2(player.dirY, player.dirX);
    this.ctx.rotate(playerAngle);
    
    // Calculate FOV from player plane
    const fovAngle = 2 * Math.atan2(
      Math.sqrt(player.planeX ** 2 + player.planeY ** 2),
      1.0
    );
    
    const coneLength = this.radius * 0.8;
    
    // Draw cone
    this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
    this.ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
    this.ctx.lineWidth = 2;
    
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(
      coneLength * Math.cos(-fovAngle / 2),
      coneLength * Math.sin(-fovAngle / 2)
    );
    this.ctx.lineTo(
      coneLength * Math.cos(fovAngle / 2),
      coneLength * Math.sin(fovAngle / 2)
    );
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
    
    this.ctx.restore();
  }
  
  /**
   * Draw scanner sweep effect
   */
  drawScannerSweep() {
    this.ctx.save();
    this.ctx.translate(this.centerX, this.centerY);
    this.ctx.rotate(this.scanAngle);
    
    // Gradient sweep from center outward
    const gradient = this.ctx.createLinearGradient(0, 0, this.radius, 0);
    gradient.addColorStop(0, 'rgba(0, 255, 0, 0.6)');
    gradient.addColorStop(0.3, 'rgba(0, 255, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.arc(0, 0, this.radius, -0.05, 0.05);
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.restore();
  }
  
  /**
   * Draw player indicator at actual position on fixed map
   */
  drawPlayer(player) {
    if (!this.mapScale) return; // Wait for first wall draw
    
    // Calculate player position on fixed map
    const playerScreenX = this.mapOffsetX + player.x * this.mapScale;
    const playerScreenY = this.mapOffsetY + player.y * this.mapScale;
    
    this.ctx.save();
    this.ctx.translate(playerScreenX, playerScreenY);
    
    // Rotate arrow to show player facing direction
    const playerAngle = Math.atan2(player.dirY, player.dirX);
    this.ctx.rotate(playerAngle);
    
    // Player dot (slightly larger for visibility)
    this.ctx.fillStyle = this.playerColor;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 4, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Direction indicator (arrow pointing in facing direction)
    this.ctx.strokeStyle = this.playerColor;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(10, 0);
    this.ctx.stroke();
    
    // Arrow head
    this.ctx.beginPath();
    this.ctx.moveTo(10, 0);
    this.ctx.lineTo(6, -3);
    this.ctx.lineTo(6, 3);
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.restore();
  }
  
  /**
   * Draw radar border
   */
  drawRadarBorder() {
    this.ctx.strokeStyle = '#0f0';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // Outer glow
    this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius + 2, 0, Math.PI * 2);
    this.ctx.stroke();
  }
  
  /**
   * Main render method
   */
  render(player, worldMap, entities) {
    if (!this.isVisible) return;
    
    this.frameCount++;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Background
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw fixed map walls
    this.drawWalls(player, worldMap);
    
    // Draw entities on fixed map
    this.drawEntities(player, entities);
    
    // Player indicator at actual position
    this.drawPlayer(player);
    
    // Draw border
    this.ctx.strokeStyle = '#0f0';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(2, 2, this.canvas.width - 4, this.canvas.height - 4);
  }
  
  /**
   * Toggle visibility
   */
  toggleVisibility() {
    this.isVisible = !this.isVisible;
    if (this.canvas) {
      this.canvas.style.display = this.isVisible ? 'block' : 'none';
    }
  }
  
  /**
   * Zoom in
   */
  zoomIn() {
    this.zoomLevel = Math.min(this.maxZoom, this.zoomLevel + 0.1);
  }
  
  /**
   * Zoom out
   */
  zoomOut() {
    this.zoomLevel = Math.max(this.minZoom, this.zoomLevel - 0.1);
  }
  
  /**
   * Reset zoom
   */
  resetZoom() {
    this.zoomLevel = 1.0;
  }
}



