/**
 * MuzzleFlash - Procedural muzzle flash effect
 * Draws radial gradient flash with random rotation for variety
 */

let flashRotation = 0;

export function drawMuzzleFlash(ctx, x, y, fadeProgress = 1.0) {
  if (fadeProgress <= 0) return;
  
  ctx.save();
  ctx.translate(x, y - 40); // Position at barrel tip
  
  // Random rotation for variety (update occasionally)
  if (Math.random() < 0.1) {
    flashRotation = Math.random() * Math.PI * 2;
  }
  ctx.rotate(flashRotation);
  
  // Opacity based on fade progress
  const opacity = fadeProgress;
  
  // Main flash (bright yellow-white center)
  const gradient1 = ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
  gradient1.addColorStop(0, `rgba(255, 255, 200, ${opacity * 0.9})`);
  gradient1.addColorStop(0.3, `rgba(255, 255, 150, ${opacity * 0.7})`);
  gradient1.addColorStop(0.6, `rgba(255, 200, 0, ${opacity * 0.5})`);
  gradient1.addColorStop(1, `rgba(255, 100, 0, 0)`);
  
  ctx.fillStyle = gradient1;
  ctx.fillRect(-30, -30, 60, 60);
  
  // Secondary flash (orange outer)
  const gradient2 = ctx.createRadialGradient(0, 0, 15, 0, 0, 40);
  gradient2.addColorStop(0, `rgba(255, 150, 0, ${opacity * 0.4})`);
  gradient2.addColorStop(0.5, `rgba(255, 100, 0, ${opacity * 0.2})`);
  gradient2.addColorStop(1, `rgba(255, 50, 0, 0)`);
  
  ctx.fillStyle = gradient2;
  ctx.fillRect(-40, -40, 80, 80);
  
  // Muzzle smoke (subtle)
  const gradient3 = ctx.createRadialGradient(0, 0, 20, 0, 0, 50);
  gradient3.addColorStop(0, `rgba(100, 100, 100, ${opacity * 0.1})`);
  gradient3.addColorStop(1, `rgba(50, 50, 50, 0)`);
  
  ctx.fillStyle = gradient3;
  ctx.fillRect(-50, -50, 100, 100);
  
  ctx.restore();
}



