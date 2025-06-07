/**
 * Breakout Ball Entity
 * Game-specific ball implementation using shared physics engine
 */

import { Vec } from "../../core/vector.js";

export class Ball {
  constructor(x, y, speed = 350, radius = 8) {
    this.pos = new Vec(x, y);
    this.vel = new Vec(0, -speed); // Launch upward
    this.radius = radius;
    this.speed = speed;
    this.color = "#fff";
    this.trail = [];
    this.maxTrailLength = 8;
  }

  /**
   * Update ball position
   * @param {number} dt - Delta time in seconds
   */
  update(dt) {
    // Update position based on velocity
    this.pos.addSelf(this.vel.clone().mulSelf(dt));

    // Update trail
    this.updateTrail();
  }

  /**
   * Update the ball's trail effect
   */
  updateTrail() {
    this.trail.push({ x: this.pos.x, y: this.pos.y });

    // Limit trail length
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }
  }

  /**
   * Draw the ball and its trail
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    // Draw trail
    this.drawTrail(ctx);

    // Draw main ball
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);

    // Create gradient for 3D effect
    const gradient = ctx.createRadialGradient(
      this.pos.x - this.radius * 0.3,
      this.pos.y - this.radius * 0.3,
      0,
      this.pos.x,
      this.pos.y,
      this.radius
    );
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.3, this.color);
    gradient.addColorStop(1, "#cccccc");

    ctx.fillStyle = gradient;
    ctx.fill();

    // Add subtle outline
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  /**
   * Draw the ball's trail
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  drawTrail(ctx) {
    if (this.trail.length < 2) return;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();

    for (let i = 1; i < this.trail.length; i++) {
      const opacity = (i / this.trail.length) * 0.3;
      ctx.globalAlpha = opacity;

      if (i === 1) {
        ctx.moveTo(this.trail[i - 1].x, this.trail[i - 1].y);
      }
      ctx.lineTo(this.trail[i].x, this.trail[i].y);
    }

    ctx.stroke();
    ctx.globalAlpha = 1.0;
  }

  /**
   * Reset ball to launch position
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  reset(x, y) {
    this.pos.set(x, y);
    this.vel.set(0, -this.speed);
    this.trail = [];
  }

  /**
   * Set ball velocity from angle and maintain speed
   * @param {number} angle - Angle in radians
   */
  setVelocityFromAngle(angle) {
    this.vel.x = this.speed * Math.sin(angle);
    this.vel.y = -this.speed * Math.cos(angle);
  }

  /**
   * Reflect velocity along a normal vector
   * @param {Vec} normal - Surface normal
   */
  reflect(normal) {
    // Reflection formula: v' = v - 2(v·n)n
    const dotProduct = this.vel.dot(normal);
    const reflection = normal.multiply(2 * dotProduct);
    this.vel.subSelf(reflection);
  }

  /**
   * Get ball boundaries for collision detection
   * @returns {Object} Bounding box {left, right, top, bottom}
   */
  getBounds() {
    return {
      left: this.pos.x - this.radius,
      right: this.pos.x + this.radius,
      top: this.pos.y - this.radius,
      bottom: this.pos.y + this.radius,
    };
  }
}
