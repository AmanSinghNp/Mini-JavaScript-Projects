/**
 * Breakout Paddle Entity
 * Player-controlled paddle with smooth movement and ball physics
 */

export class Paddle {
  constructor(w, h, canvasW, canvasH) {
    this.size = { w, h };
    this.pos = {
      x: canvasW / 2,
      y: canvasH - 40, // 40px from bottom
    };
    this.speed = 500; // pixels per second
    this.move = 0; // -1 left, +1 right, 0 idle
    this.canvasW = canvasW;
    this.color = "#4CAF50";
    this.cornerRadius = 8;
  }

  /**
   * Update paddle position based on input
   * @param {number} dt - Delta time in seconds
   */
  update(dt) {
    // Update position based on movement
    this.pos.x += this.move * this.speed * dt;

    // Keep paddle within canvas bounds
    const halfWidth = this.size.w / 2;
    this.pos.x = Math.max(
      halfWidth,
      Math.min(this.canvasW - halfWidth, this.pos.x)
    );
  }

  /**
   * Draw the paddle
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    const x = this.pos.x - this.size.w / 2;
    const y = this.pos.y - this.size.h / 2;

    // Draw rounded rectangle
    this.drawRoundedRect(
      ctx,
      x,
      y,
      this.size.w,
      this.size.h,
      this.cornerRadius
    );

    // Add highlight effect
    const gradient = ctx.createLinearGradient(x, y, x, y + this.size.h);
    gradient.addColorStop(0, "#81C784");
    gradient.addColorStop(0.5, this.color);
    gradient.addColorStop(1, "#388E3C");

    ctx.fillStyle = gradient;
    ctx.fill();

    // Add subtle border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();
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
   * Set movement direction
   * @param {number} direction - -1 for left, 1 for right, 0 for stop
   */
  setMovement(direction) {
    this.move = Math.max(-1, Math.min(1, direction));
  }

  /**
   * Get paddle collision rectangle
   * @returns {Object} Rectangle {x, y, w, h}
   */
  getRect() {
    return {
      x: this.pos.x - this.size.w / 2,
      y: this.pos.y - this.size.h / 2,
      w: this.size.w,
      h: this.size.h,
    };
  }

  /**
   * Get hit position for ball deflection (normalized -1 to 1)
   * @param {number} ballX - Ball X position
   * @returns {number} Hit position (-1 = left edge, 0 = center, 1 = right edge)
   */
  getHitPosition(ballX) {
    const halfWidth = this.size.w / 2;
    const hitX = (ballX - this.pos.x) / halfWidth;
    return Math.max(-1, Math.min(1, hitX));
  }
}
