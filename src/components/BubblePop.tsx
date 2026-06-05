import { useState, useEffect, useCallback } from 'react';
import useSound from '@hooks/useSound';

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  popped: boolean;
  floatOffset: number;
  floatSpeed: number;
  highlightX: number;
  highlightY: number;
}

interface ExplosionParticle {
  id: number;
  bubbleId: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  gravity: number;
  friction: number;
}

interface BubblePopProps {
  onComplete?: () => void;
}

const COLORS = ['#FF8C66', '#6BA3BE', '#D4A5FF', '#FFD93D', '#6BCB77', '#FF6B6B'];

function BubblePop({ onComplete }: BubblePopProps) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [floatPhase, setFloatPhase] = useState(0);
  const [explosionParticles, setExplosionParticles] = useState<ExplosionParticle[]>([]);
  const { playSound } = useSound();

  const createBubble = useCallback((id: number): Bubble => ({
    id,
    x: Math.random() * 75 + 12.5,
    y: Math.random() * 75 + 12.5,
    size: Math.random() * 35 + 25,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    popped: false,
    floatOffset: Math.random() * Math.PI * 2,
    floatSpeed: 0.08 + Math.random() * 0.1,
    highlightX: 30 + Math.random() * 10,
    highlightY: 30 + Math.random() * 10,
  }), []);

  useEffect(() => {
    const initialBubbles = Array.from({ length: 12 }, (_, i) => createBubble(i));
    setBubbles(initialBubbles);
  }, [createBubble]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFloatPhase((prev) => prev + 0.05);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (explosionParticles.length === 0) return;
    
    const interval = setInterval(() => {
      setExplosionParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vx: p.vx * p.friction,
            vy: p.vy * p.friction + p.gravity,
            opacity: p.opacity - 0.015,
            size: p.size * 0.985,
          }))
          .filter((p) => p.opacity > 0 && p.y < 120)
      );
    }, 16);
    
    return () => clearInterval(interval);
  }, [explosionParticles.length]);

  const handlePop = (id: number) => {
    if (isAnimating) return;
    
    playSound('bubble-pop');
    
    const bubble = bubbles.find((b) => b.id === id);
    if (bubble) {
      const particles: ExplosionParticle[] = [];
      const particleCount = 50;
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.3;
        const speed = 0.8 + Math.random() * 1.2;
        const upwardBias = -0.2 - Math.random() * 0.3;
        particles.push({
          id: Date.now() + i,
          bubbleId: id,
          x: bubble.x,
          y: bubble.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed + upwardBias,
          size: bubble.size * (0.02 + Math.random() * 0.25),
          color: bubble.color,
          opacity: 0.85 + Math.random() * 0.15,
          gravity: 0.12 + Math.random() * 0.08,
          friction: 0.85 + Math.random() * 0.05,
        });
      }
      setExplosionParticles((prev) => [...prev, ...particles]);
    }
    
    setBubbles((prev) =>
      prev.map((bubble) =>
        bubble.id === id ? { ...bubble, popped: true } : bubble
      )
    );
    setPoppedCount((prev) => prev + 1);
    setIsAnimating(true);
    
    setTimeout(() => {
      setBubbles((prev) => {
        const newBubbles = prev.filter((b) => b.id !== id);
        if (newBubbles.length === 0) {
          playSound('complete');
          onComplete?.();
        }
        return newBubbles;
      });
      setIsAnimating(false);
    }, 350);
  };

  if (bubbles.length === 0) {
    return (
      <div className="animate-scale-in" style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <p style={{ fontSize: '1.2rem', color: '#7F8C8D' }}>所有泡泡都捏破了！</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '400px', overflow: 'hidden', background: 'linear-gradient(180deg, #e8f4fd 0%, #f0f8ff 100%)' }}>
      <div style={{ textAlign: 'center', padding: '1rem', marginBottom: '1rem' }}>
        <p style={{ color: '#7F8C8D' }}>点击泡泡把它们捏破！</p>
        <p style={{ fontSize: '0.9rem', color: '#95A5A6' }}>已捏破: {poppedCount} 个</p>
      </div>
      
      <div style={{ position: 'relative', width: '100%', height: 'calc(100% - 60px)' }}>
        {bubbles.map((bubble) => {
          const floatY = Math.sin(floatPhase * bubble.floatSpeed + bubble.floatOffset) * 8;
          const floatX = Math.cos(floatPhase * bubble.floatSpeed * 0.7 + bubble.floatOffset) * 4;
          
          return (
            <button
              key={bubble.id}
              onClick={() => handlePop(bubble.id)}
              className={bubble.popped ? 'bubble-pop' : 'bubble-hover'}
              style={{
                position: 'absolute',
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
                transform: `translate(-50%, -50%) translate(${floatX}px, ${floatY}px) ${bubble.popped ? 'scale(1.5)' : 'scale(1)'}`,
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
                borderRadius: '50%',
                backgroundColor: bubble.color,
                background: `radial-gradient(circle at ${bubble.highlightX}% ${bubble.highlightY}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.08) 4%, transparent 10%, ${bubble.color} 45%, ${bubble.color}dd 100%)`,
                border: '2px solid rgba(255,255,255,0.6)',
                boxShadow: `
                  inset -8px -8px 20px rgba(0,0,0,0.1),
                  inset 8px 8px 20px rgba(255,255,255,0.4),
                  0 8px 30px ${bubble.color}50,
                  0 4px 15px rgba(0,0,0,0.1)
                `,
                cursor: 'pointer',
                transition: bubble.popped ? 'all 0.35s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
                animationDelay: `${bubble.id * 0.1}s`,
                opacity: bubble.popped ? 0 : 1,
                zIndex: bubble.popped ? 1 : 10,
              }}
              disabled={bubble.popped}
            >
              <span
                style={{
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: `
                    radial-gradient(ellipse at 35% 30%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 5%, transparent 12%),
                    radial-gradient(ellipse at 65% 55%, rgba(255,255,255,0.08) 0%, transparent 6%)
                  `,
                }}
              />
            </button>
          );
        })}
        
        {explosionParticles.map((particle) => (
          <div
            key={particle.id}
            className="explosion-particle"
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              borderRadius: '50%',
              backgroundColor: particle.color,
              boxShadow: `0 0 10px ${particle.color}`,
              opacity: particle.opacity,
              zIndex: 20,
            }}
          />
        ))}
      </div>
      
      <style>{`
        .bubble-hover:hover {
          transform: translate(-50%, -50%) scale(1.15) !important;
          box-shadow: 
            inset -8px -8px 20px rgba(0,0,0,0.1),
            inset 8px 8px 20px rgba(255,255,255,0.4),
            0 12px 40px ${COLORS[0]}60,
            0 6px 20px rgba(0,0,0,0.15) !important;
        }
        
        .bubble-pop {
          animation: pop 0.35s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
        
        @keyframes pop {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.3);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
          }
        }
        
        .explosion-particle {
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

export default BubblePop;