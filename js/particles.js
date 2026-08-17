/**
 * Interactive Particle Network & Ambient Floating Elements
 * Lightweight, 60fps canvas particle connection with mouse interaction
 */

class AmbientBackgroundSystem {
  constructor() {
    this.canvas = document.getElementById('ambient-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.particleCount = window.innerWidth < 768 ? 35 : 65;
    this.mouse = { x: null, y: null, radius: 120 };
    this.animationId = null;
    this.isTabVisible = true;

    this.init();
  }

  init() {
    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createParticles();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    document.addEventListener('visibilitychange', () => {
      this.isTabVisible = !document.hidden;
    });
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1,
        baseAlpha: Math.random() * 0.4 + 0.2,
        color: i % 3 === 0 ? '0, 242, 254' : (i % 3 === 1 ? '79, 172, 254' : '16, 185, 129')
      });
    }
  }

  animate() {
    const render = () => {
      if (this.isTabVisible) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update & draw particles
        for (let i = 0; i < this.particles.length; i++) {
          const p = this.particles[i];

          p.x += p.vx;
          p.y += p.vy;

          // Boundary bounce
          if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

          // Mouse attraction / repel
          if (this.mouse.x !== null && this.mouse.y !== null) {
            const dx = this.mouse.x - p.x;
            const dy = this.mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < this.mouse.radius) {
              const force = (1 - dist / this.mouse.radius) * 0.8;
              p.x -= (dx / dist) * force;
              p.y -= (dy / dist) * force;
            }
          }

          // Draw particle
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          this.ctx.fillStyle = `rgba(${p.color}, ${p.baseAlpha})`;
          this.ctx.fill();

          // Connect adjacent particles
          for (let j = i + 1; j < this.particles.length; j++) {
            const p2 = this.particles[j];
            const dist = Math.hypot(p.x - p2.x, p.y - p2.y);

            if (dist < 130) {
              const alpha = (1 - dist / 130) * 0.18;
              this.ctx.beginPath();
              this.ctx.moveTo(p.x, p.y);
              this.ctx.lineTo(p2.x, p2.y);
              this.ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
              this.ctx.lineWidth = 0.8;
              this.ctx.stroke();
            }
          }
        }
      }

      this.animationId = requestAnimationFrame(render);
    };

    this.animationId = requestAnimationFrame(render);
  }
}

// Instantiate on load
document.addEventListener('DOMContentLoaded', () => {
  window.ambientBg = new AmbientBackgroundSystem();
});
