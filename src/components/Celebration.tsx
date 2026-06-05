import { useEffect, useRef } from 'react';

interface CelebrationProps {
  show?: boolean;
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

function Celebration({ show = true, onComplete }: CelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!show) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#FF8C66', '#6BA3BE', '#D4A5FF', '#1ABC9C', '#F39C12', '#E74C3C', '#2ECC71'];
    const particles: Particle[] = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let i = 0; i < 150; i++) {
      const angle = (Math.PI * 2 * i) / 150 + Math.random() * 0.5;
      const speed = 3 + Math.random() * 5;
      particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 8,
        life: 0,
        maxLife: 80 + Math.random() * 60,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1;
        particle.life++;

        const progress = particle.life / particle.maxLife;
        const opacity = 1 - progress;
        const scale = 1 - progress * 0.5;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = opacity;
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * scale * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = opacity * 0.3;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      const activeParticles = particles.filter((p) => p.life < p.maxLife);
      if (activeParticles.length > 0) {
        requestAnimationFrame(animate);
      } else if (onComplete) {
        setTimeout(onComplete, 500);
      }
    };

    requestAnimationFrame(animate);
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
    >
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      
      <div
        style={{
          textAlign: 'center',
          zIndex: 1,
          animation: 'scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
      >
        <div style={{ fontSize: '6rem', marginBottom: '1rem', animation: 'bounceIn 0.6s ease' }}>
          🎉
        </div>
        <h2 style={{ fontSize: '2rem', color: 'white', marginBottom: '0.5rem' }}>
          恭喜你！
        </h2>
        <p style={{ fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.8)' }}>
          你成功完成了今天的情绪调节练习
        </p>
      </div>
    </div>
  );
}

export default Celebration;
