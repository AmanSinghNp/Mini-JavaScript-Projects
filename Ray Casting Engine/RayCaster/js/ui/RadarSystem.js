/**
 * RadarSystem - Circular radar-style minimap with enemy tracking and FOV cone
 * Optimized spatial queries for 60fps performance
 */

export class RadarSystem {
  constructor(canvasId, radius = 80, scale = 0.5) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error(`RadarSystem: Canvas with id "${canvasId}" not found`);
      return;
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.radius = radius;
    this.scale = scale; // World units per pixel
    
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
    this.updateEveryNFrames = 1; // Update every frame for smooth animation
    
    // Visibility toggle
    this.isVisible = true;
    
    // Zoom level
    this.zoomLevel = 1.0;
    this.minZoom = 0.5;
    this.maxZoom = 2.0;
  }
  
  /**
   * Convert world coordinates to radar screen coordinates
   * Rotates relative to player facing direction
   */
  worldToRadar(worldX, worldY, player) {
    const dx = worldX - player.x;
    const dy = worldY - player.y;
    
    // Rotate relative to player facing direction
    const angle = Math.atan2(player.dirY, player.dirX);
    const rotatedX = dx * Math.cos(-angle) - dy * Math.sin(-angle);
    const rotatedY = dx * Math.sin(-angle) + dy * Math.cos(-angle);
    
    return {
      x: (rotatedX / this.scale) * this.zoomLevel,
      y: (rotatedY / this.scale) * this.zoomLevel
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
   * Draw walls with spatial culling
   */
  drawWalls(player, worldMap) {
    const viewRange = (this.radius / this.scale) * this.zoomLevel;
    
    // Only check cells within radar range
    const minX = Math.max(0, Math.floor(player.x - viewRange));
    const maxX = Math.min(worldMap.length - 1, Math.ceil(player.x + viewRange));
    const minY = Math.max(0, Math.floor(player.y - viewRange));
    const maxY = Math.min(worldMap[0].length - 1, Math.ceil(player.y + viewRange));
    
    this.ctx.fillStyle = this.wallColor;
    
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        if (worldMap[x] && worldMap[x][y] > 0) {
          const screenPos = this.worldToRadar(x + 0.5, y + 0.5, player);
          
          // Only draw if within radar circle
          if (this.isInRadarRange(screenPos.x, screenPos.y)) {
            this.ctx.fillRect(
              this.centerX + screenPos.x - 2,
              this.centerY + screenPos.y - 2,
              4, 4
            );
          }
        }
      }
    }
  }
  
  /**
   * Draw entities (enemies, pickups) with distance filtering
   */
  drawEntities(player, entities) {
    const viewRange = (this.radius / this.scale) * this.zoomLevel;
    
    entities.forEach(entity => {
      // Skip projectiles
      if (entity.type === 'projectile') return;
      
      const dx = entity.x - player.x;
      const dy = entity.y - player.y;
      const distance = Math.sqrt(dx ** 2 + dy ** 2);
      
      // Only show entities within range
      if (distance > viewRange) return;
      
      const screenPos = this.worldToRadar(entity.x, entity.y, player);
      
      // Only draw if within radar circle
      if (!this.isInRadarRange(screenPos.x, screenPos.y)) return;
      
      // Draw entity based on type
      this.ctx.save();
      this.ctx.translate(this.centerX + screenPos.x, this.centerY + screenPos.y);
      
      if (entity.type === 'enemy') {
        // Pulsing red dot
        const pulse = 0.8 + Math.sin(Date.now() * 0.005) * 0.2;
        this.ctx.fillStyle = this.enemyColor;
        this.ctx.globalAlpha = pulse;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Direction arrow (pointing toward player)
        const angle = Math.atan2(dy, dx);
        const playerAngle = Math.atan2(player.dirY, player.dirX);
        const relativeAngle = angle - playerAngle;
        
        this.ctx.rotate(relativeAngle);
        this.ctx.fillStyle = this.enemyColor;
        this.ctx.globalAlpha = pulse;
        this.ctx.fillRect(4, -2, 6, 4); // Arrow extending from dot
      } else if (entity.type === 'pickup') {
        this.ctx.fillStyle = this.pickupColor;
        this.ctx.globalAlpha = 1.0;
        this.ctx.fillRect(-3, -3, 6, 6);
      }
      
      this.ctx.restore();
    });
  }
  
  /**
   * Draw field-of-view cone
   */
  drawFOVCone(player) {
    this.ctx.save();
    this.ctx.translate(this.centerX, this.centerY);
    
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
   * Draw player indicator at center
   */
  drawPlayer() {
    this.ctx.save();
    this.ctx.translate(this.centerX, this.centerY);
    
    // Player dot
    this.ctx.fillStyle = this.playerColor;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 5, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Direction indicator (arrow pointing forward)
    this.ctx.strokeStyle = this.playerColor;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0, -10);
    this.ctx.stroke();
    
    // Arrow head
    this.ctx.beginPath();
    this.ctx.moveTo(0, -10);
    this.ctx.lineTo(-3, -7);
    this.ctx.lineTo(3, -7);
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
    
    // Circular clipping mask
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
    this.ctx.clip();
    
    // Background
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Concentric range rings
    this.drawRangeRings();
    
    // World elements (relative to player)
    this.drawWalls(player, worldMap);
    this.drawEntities(player, entities);
    this.drawFOVCone(player);
    
    // Player indicator (center)
    this.drawPlayer();
    
    // Scanning sweep effect
    this.drawScannerSweep();
    
    this.ctx.restore();
    
    // Outer border
    this.drawRadarBorder();
    
    // Update scan animation
    this.scanAngle += this.scanSpeed;
    if (this.scanAngle > Math.PI * 2) this.scanAngle = 0;
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

