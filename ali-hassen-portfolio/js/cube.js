/**
 * 3D Rotating Brand Cube Controller
 * Faces: WEB, AI, WORDPRESS, CONTENT, VIDEO, MARKETING
 */

class InteractiveBrandCube {
  constructor(cubeElement) {
    this.cube = cubeElement;
    if (!this.cube) return;

    this.rotX = -20;
    this.rotY = 30;
    this.autoRotateSpeed = 0.35;
    this.isDragging = false;
    this.isHovered = false;
    this.isPaused = false;
    this.startX = 0;
    this.startY = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.animationFrameId = null;

    this.initEvents();
    this.startAutoRotation();

    // Pause animation when tab is hidden (saves CPU/GPU when not visible)
    document.addEventListener('visibilitychange', () => {
      this.isPaused = document.hidden;
    });
  }

  initEvents() {
    const container = this.cube.closest('.cube-container') || this.cube;

    // Mouse events
    container.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      container.style.cursor = 'grabbing';
      // Remove transition so cube tracks finger instantly
      this.cube.style.transition = 'none';
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.lastX;
      const deltaY = e.clientY - this.lastY;

      this.rotY += deltaX * 0.5;
      this.rotX -= deltaY * 0.5;

      this.lastX = e.clientX;
      this.lastY = e.clientY;

      this.updateTransform();
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        container.style.cursor = 'grab';
        // Restore smooth transition for auto-rotation
        this.cube.style.transition = 'transform 0.15s ease-out';
      }
    });

    // Touch events for mobile
    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
        this.lastX = e.touches[0].clientX;
        this.lastY = e.touches[0].clientY;
        this.cube.style.transition = 'none';
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - this.lastX;
      const deltaY = e.touches[0].clientY - this.lastY;

      this.rotY += deltaX * 0.6;
      this.rotX -= deltaY * 0.6;

      this.lastX = e.touches[0].clientX;
      this.lastY = e.touches[0].clientY;

      this.updateTransform();
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
      this.cube.style.transition = 'transform 0.15s ease-out';
    });

    // Hover slowdown
    container.addEventListener('mouseenter', () => {
      this.isHovered = true;
    });

    container.addEventListener('mouseleave', () => {
      this.isHovered = false;
    });

    // Double click to reset orientation
    container.addEventListener('dblclick', () => {
      this.rotX = -20;
      this.rotY = 30;
      this.updateTransform();
    });
  }

  updateTransform() {
    this.cube.style.transform = `rotateX(${this.rotX}deg) rotateY(${this.rotY}deg)`;
  }

  startAutoRotation() {
    let lastTime = 0;
    const TARGET_FPS = 30;
    const FRAME_DURATION = 1000 / TARGET_FPS;

    const loop = (timestamp) => {
      const elapsed = timestamp - lastTime;

      if (!this.isDragging && !this.isPaused && elapsed >= FRAME_DURATION) {
        lastTime = timestamp - (elapsed % FRAME_DURATION);
        const speed = this.isHovered ? this.autoRotateSpeed * 0.3 : this.autoRotateSpeed;
        this.rotY += speed;
        this.updateTransform();
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
