/**
 * PistolSprite - Procedural pistol sprite drawing
 * Draws weapon using canvas primitives with green accent details
 */

export function drawPistol(ctx, x, y, recoilOffset) {
  ctx.save();
  ctx.translate(x, y + recoilOffset);
  
  // Grip (main body)
  ctx.fillStyle = '#333';
  ctx.fillRect(-15, 0, 30, 60);
  
  // Grip texture lines
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-12, 10 + i * 8);
    ctx.lineTo(12, 10 + i * 8);
    ctx.stroke();
  }
  
  // Barrel
  ctx.fillStyle = '#555';
  ctx.fillRect(-8, -40, 16, 40);
  
  // Barrel detail (green accent)
  ctx.fillStyle = '#0f0';
  ctx.fillRect(-6, -38, 12, 3);
  
  // Barrel tip
  ctx.fillStyle = '#444';
  ctx.fillRect(-7, -45, 14, 5);
  
  // Trigger guard
  ctx.strokeStyle = '#0f0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 20, 10, 0, Math.PI);
  ctx.stroke();
  
  // Trigger
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(0, 25, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Slide (top part)
  ctx.fillStyle = '#666';
  ctx.fillRect(-10, -50, 20, 10);
  
  // Slide serrations
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(-8 + i * 3, -50);
    ctx.lineTo(-8 + i * 3, -45);
    ctx.stroke();
  }
  
  // Sights (rear)
  ctx.fillStyle = '#0f0';
  ctx.fillRect(-2, -48, 4, 3);
  
  // Sights (front)
  ctx.fillRect(-1, -42, 2, 4);
  
  // Magazine
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(-8, 58, 16, 8);
  
  // Magazine base (green accent)
  ctx.fillStyle = '#0f0';
  ctx.fillRect(-6, 64, 12, 2);
  
  // Glow effect
  ctx.shadowColor = 'rgba(0, 255, 0, 0.5)';
  ctx.shadowBlur = 5;
  ctx.strokeStyle = '#0f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(-15, -50, 30, 74);
  ctx.shadowBlur = 0;
  
  ctx.restore();
}

