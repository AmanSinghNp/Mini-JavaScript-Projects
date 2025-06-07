/**
 * Breakout Brick Entity
 * Destructible blocks with different colors and point values
 */

export class Brick {
  constructor(x, y, w, h, color = "#FF5722", points = 100) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
    this.points = points;
    this.alive = true;
    this.cornerRadius = 4;

    // Visual effects
    this.destroyAnimation = 0;
    this.isDestroying = false;
  }

  /**
   * Mark brick for destruction with animation
   */
  destroy() {
    if (!this.alive) return;
    this.alive = false;
    this.isDestroying = true;
    this.destroyAnimation = 1.0;
  }

  /**
   * Update brick animations
   * @param {number} dt - Delta time in seconds
   */
  update(dt) {
    if (this.isDestroying && this.destroyAnimation > 0) {
      this.destroyAnimation -= dt * 3; // Animation duration
      if (this.destroyAnimation <= 0) {
        this.isDestroying = false;
      }
    }
  }

  /**
   * Draw the brick
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    if (!this.alive && !this.isDestroying) return;

    ctx.save();

    // Apply destruction animation
    if (this.isDestroying) {
      const scale = this.destroyAnimation;
      const centerX = this.x + this.w / 2;
      const centerY = this.y + this.h / 2;

      ctx.translate(centerX, centerY);
      ctx.scale(scale, scale);
      ctx.rotate((1 - scale) * Math.PI * 0.5);
      ctx.translate(-this.w / 2, -this.h / 2);
      ctx.globalAlpha = scale;

      this.drawBrick(ctx, 0, 0);
    } else {
      this.drawBrick(ctx, this.x, this.y);
    }

    ctx.restore();
  }

  /**
   * Draw the brick shape
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  drawBrick(ctx, x, y) {
    // Draw rounded rectangle
    this.drawRoundedRect(ctx, x, y, this.w, this.h, this.cornerRadius);

    // Create gradient for 3D effect
    const gradient = ctx.createLinearGradient(x, y, x, y + this.h);
    gradient.addColorStop(0, this.lightenColor(this.color, 20));
    gradient.addColorStop(0.5, this.color);
    gradient.addColorStop(1, this.darkenColor(this.color, 20));

    ctx.fillStyle = gradient;
    ctx.fill();

    // Add border
    ctx.strokeStyle = this.darkenColor(this.color, 40);
    ctx.lineWidth = 1;
    ctx.stroke();

    // Add highlight
    ctx.beginPath();
    ctx.rect(x + 2, y + 2, this.w - 4, this.h / 3);
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.fill();
  }

  /**
   * Draw a rounded rectangle
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {number} radius - Corner radius
   */
  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  /**
   * Lighten a color by a percentage
   * @param {string} color - Hex color string
   * @param {number} percent - Percentage to lighten
   * @returns {string} Lightened color
   */
  lightenColor(color, percent) {
    const r = parseInt(color.substr(1, 2), 16);
    const g = parseInt(color.substr(3, 2), 16);
    const b = parseInt(color.substr(5, 2), 16);

    const newR = Math.min(255, Math.floor(r + ((255 - r) * percent) / 100));
    const newG = Math.min(255, Math.floor(g + ((255 - g) * percent) / 100));
    const newB = Math.min(255, Math.floor(b + ((255 - b) * percent) / 100));

    return `#${newR.toString(16).padStart(2, "0")}${newG
      .toString(16)
      .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
  }

  /**
   * Darken a color by a percentage
   * @param {string} color - Hex color string
   * @param {number} percent - Percentage to darken
   * @returns {string} Darkened color
   */
  darkenColor(color, percent) {
    const r = parseInt(color.substr(1, 2), 16);
    const g = parseInt(color.substr(3, 2), 16);
    const b = parseInt(color.substr(5, 2), 16);

    const newR = Math.max(0, Math.floor((r * (100 - percent)) / 100));
    const newG = Math.max(0, Math.floor((g * (100 - percent)) / 100));
    const newB = Math.max(0, Math.floor((b * (100 - percent)) / 100));

    return `#${newR.toString(16).padStart(2, "0")}${newG
      .toString(16)
      .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
  }

  /**
   * Get brick collision rectangle
   * @returns {Object} Rectangle {x, y, w, h}
   */
  getRect() {
    return {
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
    };
  }
}
