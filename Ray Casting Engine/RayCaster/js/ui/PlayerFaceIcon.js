/**
 * PlayerFaceIcon - Procedural emoji-style face icon with health-based expressions
 * Renders at 64x64 resolution for pixel art aesthetic
 */

export class PlayerFaceIcon {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    if (!this.canvas) {
      console.error('PlayerFaceIcon: Canvas element not found');
      return;
    }
    this.ctx = canvasElement.getContext('2d');
    this.size = 64;
    this.bloodParticles = [];
    this.lastHealth = 100;
    
    // Set canvas size (if not already set)
    if (this.canvas.width !== this.size || this.canvas.height !== this.size) {
      this.canvas.width = this.size;
      this.canvas.height = this.size;
    }
    
    // Initial render
    this.render(100);
  }

  render(healthPercentage) {
    const ctx = this.ctx;
    const centerX = this.size / 2;
    const centerY = this.size / 2;
    const radius = this.size / 2 - 4;
    
    // Clear canvas
    ctx.clearRect(0, 0, this.size, this.size);
    
    // Determine expression state
    let expression = 'smiling';
    if (healthPercentage > 80) {
      expression = 'smiling';
    } else if (healthPercentage > 50) {
      expression = 'neutral';
    } else if (healthPercentage > 30) {
      expression = 'hurt';
    } else {
      expression = 'critical';
    }
    
    // Draw face circle
    ctx.fillStyle = '#ffdbac'; // Skin tone
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw border
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw eyes
    this.drawEyes(ctx, centerX, centerY, expression);
    
    // Draw mouth based on expression
    this.drawMouth(ctx, centerX, centerY, expression, healthPercentage);
    
    // Draw blood drips if critical
    if (healthPercentage < 30) {
      this.updateBloodDrips(healthPercentage);
      this.drawBloodDrips(ctx);
    } else {
      this.bloodParticles = [];
    }
    
    this.lastHealth = healthPercentage;
  }

  drawEyes(ctx, centerX, centerY, expression) {
    const eyeY = centerY - 8;
    const eyeSpacing = 12;
    const eyeSize = expression === 'critical' ? 3 : 4;
    
    ctx.fillStyle = '#000';
    
    if (expression === 'critical' || expression === 'hurt') {
      // X eyes for critical/hurt
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      
      // Left eye X
      ctx.beginPath();
      ctx.moveTo(centerX - eyeSpacing - eyeSize, eyeY - eyeSize);
      ctx.lineTo(centerX - eyeSpacing + eyeSize, eyeY + eyeSize);
      ctx.moveTo(centerX - eyeSpacing - eyeSize, eyeY + eyeSize);
      ctx.lineTo(centerX - eyeSpacing + eyeSize, eyeY - eyeSize);
      ctx.stroke();
      
      // Right eye X
      ctx.beginPath();
      ctx.moveTo(centerX + eyeSpacing - eyeSize, eyeY - eyeSize);
      ctx.lineTo(centerX + eyeSpacing + eyeSize, eyeY + eyeSize);
      ctx.moveTo(centerX + eyeSpacing - eyeSize, eyeY + eyeSize);
      ctx.lineTo(centerX + eyeSpacing + eyeSize, eyeY - eyeSize);
      ctx.stroke();
    } else {
      // Normal circular eyes
      ctx.beginPath();
      ctx.arc(centerX - eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(centerX + eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawMouth(ctx, centerX, centerY, expression, healthPercentage) {
    const mouthY = centerY + 10;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#000';
    
    if (expression === 'smiling') {
      // Smile (arc)
      ctx.beginPath();
      ctx.arc(centerX, mouthY - 3, 8, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else if (expression === 'neutral') {
      // Straight line
      ctx.beginPath();
      ctx.moveTo(centerX - 6, mouthY);
      ctx.lineTo(centerX + 6, mouthY);
      ctx.stroke();
    } else if (expression === 'hurt') {
      // Frown
      ctx.beginPath();
      ctx.arc(centerX, mouthY + 3, 8, Math.PI + 0.2, -0.2);
      ctx.stroke();
    } else { // critical
      // Open mouth (O shape)
      ctx.beginPath();
      ctx.arc(centerX, mouthY, 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  updateBloodDrips(healthPercentage) {
    // Add new blood particles occasionally when critical
    if (Math.random() < 0.1) {
      this.bloodParticles.push({
        x: this.size / 2 + (Math.random() - 0.5) * 20,
        y: this.size / 2 - 10,
        speed: 0.5 + Math.random() * 0.5,
        size: 2 + Math.random() * 2
      });
    }
    
    // Update existing particles
    this.bloodParticles = this.bloodParticles.filter(particle => {
      particle.y += particle.speed;
      return particle.y < this.size;
    });
  }

  drawBloodDrips(ctx) {
    ctx.fillStyle = '#8b0000'; // Dark red
    this.bloodParticles.forEach(particle => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  update(healthPercentage) {
    this.render(healthPercentage);
  }
  
  // Call this in the game loop when health is critical for continuous blood animation
  animate() {
    if (this.lastHealth < 30 && this.canvas) {
      this.render(this.lastHealth);
    }
  }
}

