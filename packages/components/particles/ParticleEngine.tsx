import React, { useRef, useEffect } from 'react';

export interface ParticleTriggerOptions {
  target?: HTMLElement | null;
  count?: number;
  colors?: string[];
  duration?: number;
  size?: number;
  spread?: number;
  type?: 'coin' | 'sparkle';
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'coin' | 'sparkle';
}

class ParticleEngineClass {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private animationId: number | null = null;
  private particleId = 0;

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    this.animate();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  trigger(options: ParticleTriggerOptions) {
    const {
      target,
      count = 15,
      colors = ['#FFD700', '#FFAA00', '#FFFF00'],
      duration = 2000,
      size = 8,
      spread = 100,
      type = 'coin'
    } = options;

    if (!this.canvas || !this.ctx) return;

    let x = this.canvas.width / 2;
    let y = this.canvas.height / 2;

    if (target) {
      const rect = target.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const velocity = Math.random() * 3 + 2;
      
      this.particles.push({
        id: this.particleId++,
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - Math.random() * 2,
        life: 0,
        maxLife: duration / 16,
        size: size + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        type
      });
    }
  }

  private animate = () => {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update particle
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.1; // gravity
      particle.life++;

      // Fade out
      const alpha = 1 - (particle.life / particle.maxLife);
      
      if (particle.life >= particle.maxLife || alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      // Draw particle
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = particle.color;
      
      if (particle.type === 'coin') {
        // Draw coin
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add shine effect
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(particle.x - particle.size * 0.3, particle.y - particle.size * 0.3, particle.size * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // Draw sparkle
        const spikes = 4;
        const outerRadius = particle.size;
        const innerRadius = particle.size * 0.4;
        
        this.ctx.beginPath();
        for (let j = 0; j < spikes * 2; j++) {
          const angle = (j * Math.PI) / spikes;
          const radius = j % 2 === 0 ? outerRadius : innerRadius;
          const x = particle.x + Math.cos(angle) * radius;
          const y = particle.y + Math.sin(angle) * radius;
          
          if (j === 0) this.ctx.moveTo(x, y);
          else this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.fill();
      }
      
      this.ctx.restore();
    }

    this.animationId = requestAnimationFrame(this.animate);
  };

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.particles = [];
  }
}

export const ParticleEngine = new ParticleEngineClass();

export const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    ParticleEngine.init(canvas);

    const handleResize = () => ParticleEngine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      ParticleEngine.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};