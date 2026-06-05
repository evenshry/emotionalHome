import { useState, useEffect, useRef } from 'react';
import useSound from '@hooks/useSound';

interface BreathingGameProps {
  onComplete?: () => void;
}

function BreathingGame({ onComplete }: BreathingGameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [countdown, setCountdown] = useState(4);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; color: string }[]>([]);
  const [energy, setEnergy] = useState(0);
  const [breathCircleSize, setBreathCircleSize] = useState(50);
  const intervalRef = useRef<number | null>(null);
  const particleIdRef = useRef(0);
  const { playSound } = useSound();

  const phases = [
    { id: 'inhale' as const, name: '吸气', duration: 4, color: '#1ABC9C', instruction: '吸...' },
    { id: 'hold' as const, name: '屏息', duration: 4, color: '#3498DB', instruction: '停...' },
    { id: 'exhale' as const, name: '呼气', duration: 6, color: '#E74C3C', instruction: '呼...' },
  ];

  const currentPhaseConfig = phases.find((p) => p.id === phase) || phases[0];

  const createParticle = () => {
    const colors = ['#1ABC9C', '#3498DB', '#9B59B6', '#F39C12', '#E74C3C'];
    const newParticle = {
      id: particleIdRef.current++,
      x: 50 + (Math.random() - 0.5) * 30,
      y: 50 + (Math.random() - 0.5) * 30,
      size: 4 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    setParticles([...particles, newParticle]);
    
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 2000);
  };

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setStars(0);
    setEnergy(0);
    setPhase('inhale');
    setCountdown(4);

    intervalRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setPhase((currentPhase) => {
            const phaseIndex = phases.findIndex((p) => p.id === currentPhase);
            const nextPhase = phases[(phaseIndex + 1) % phases.length];
            
            setTimeout(() => {
              setCountdown(nextPhase.duration);
              
              if (nextPhase.id === 'inhale') {
                playSound('breath-in');
              } else if (nextPhase.id === 'exhale') {
                playSound('breath-out');
              }
              
              if (nextPhase.id === 'exhale') {
                setScore((s) => {
                  const newScore = s + 10;
                  setEnergy((e) => Math.min(e + 15, 100));
                  
                  if (Math.random() > 0.7) {
                    createParticle();
                  }
                  
                  setStars((st) => {
                    if (newScore >= 40 && st < 1) return 1;
                    if (newScore >= 80 && st < 2) return 2;
                    if (newScore >= 120 && st < 3) return 3;
                    return st;
                  });
                  
                  return newScore;
                });
              }
            }, 0);
            
            return nextPhase.id;
          });
          return phases[0].duration;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopGame = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (stars >= 3) {
      playSound('complete');
      onComplete?.();
    }
  };

  useEffect(() => {
    if (isPlaying) {
      let targetSize = breathCircleSize;
      
      if (phase === 'inhale') {
        targetSize = 80;
      } else if (phase === 'exhale') {
        targetSize = 40;
      } else {
        targetSize = 80;
      }

      const animate = () => {
        setBreathCircleSize((prev) => {
          const diff = targetSize - prev;
          if (Math.abs(diff) < 0.5) return targetSize;
          return prev + diff * 0.15;
        });
      };

      const animationInterval = setInterval(animate, 16);
      return () => clearInterval(animationInterval);
    }
  }, [phase, isPlaying]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="page-container" style={{ textAlign: 'center', padding: '2rem' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '2rem', color: '#2C3E50' }}>
        🌬️ 正念呼吸游戏
      </h2>
      
      <p style={{ color: '#7F8C8D', marginBottom: '2rem', fontSize: '1.1rem' }}>
        跟随呼吸指引，收集能量，获得星星奖励！
      </p>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          maxWidth: '400px',
          margin: '0 auto 2rem',
          padding: '1rem',
          background: '#F8F9FA',
          borderRadius: '16px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F39C12' }}>{score}</div>
          <div style={{ fontSize: '0.8rem', color: '#7F8C8D' }}>分数</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem' }}>
            {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#7F8C8D' }}>星级</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1ABC9C' }}>{energy}%</div>
          <div style={{ fontSize: '0.8rem', color: '#7F8C8D' }}>能量</div>
        </div>
      </div>

      <div
        style={{
          position: 'relative',
          width: '300px',
          height: '300px',
          margin: '0 auto 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #E8F5F1 0%, #FFFFFF 70%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 40px rgba(26, 188, 156, 0.15)',
          }}
        >
          <div
            style={{
              width: `${breathCircleSize}%`,
              height: `${breathCircleSize}%`,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${currentPhaseConfig.color}, ${currentPhaseConfig.color}88)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease-out',
              boxShadow: `0 0 30px ${currentPhaseConfig.color}50`,
            }}
          >
            <div style={{ fontSize: '3rem' }}>🫁</div>
          </div>

          {particles.map((particle) => (
            <div
              key={particle.id}
              style={{
                position: 'absolute',
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                borderRadius: '50%',
                background: particle.color,
                animation: 'floatUp 2s ease-out forwards',
              }}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          background: `linear-gradient(135deg, ${currentPhaseConfig.color}15, #fff)`,
          borderRadius: '16px',
          padding: '1.5rem',
          maxWidth: '300px',
          margin: '0 auto 2rem',
          border: `2px solid ${currentPhaseConfig.color}30`,
        }}
      >
        <div style={{ fontSize: '2rem', fontWeight: 800, color: currentPhaseConfig.color, marginBottom: '0.5rem' }}>
          {countdown}
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: 600, color: currentPhaseConfig.color }}>
          {currentPhaseConfig.name}
        </div>
        <div style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>{currentPhaseConfig.instruction}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        {!isPlaying ? (
          <button
            onClick={startGame}
            style={{
              padding: '1rem 2rem',
              borderRadius: '30px',
              border: 'none',
              backgroundColor: '#1ABC9C',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 6px 20px rgba(26, 188, 156, 0.4)',
            }}
          >
            🎮 开始游戏
          </button>
        ) : (
          <button
            onClick={stopGame}
            style={{
              padding: '1rem 2rem',
              borderRadius: '30px',
              border: 'none',
              backgroundColor: '#E74C3C',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 6px 20px rgba(231, 76, 60, 0.4)',
            }}
          >
            ⏹️ 结束游戏
          </button>
        )}
      </div>

      {stars >= 3 && !isPlaying && (
        <div
          style={{
            marginTop: '2rem',
            background: 'linear-gradient(135deg, #FEF5E7, #fff)',
            borderRadius: '16px',
            padding: '1.5rem',
            maxWidth: '350px',
            margin: '0 auto',
            boxShadow: '0 10px 40px rgba(243, 156, 18, 0.2)',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
          <h4 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#F39C12' }}>
            恭喜完成！
          </h4>
          <p style={{ color: '#7F8C8D', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            你已获得 3 颗星星！深呼吸练习完成
          </p>
        </div>
      )}

      <button
        className="btn btn-secondary"
        onClick={onComplete}
        style={{ marginTop: '2rem' }}
      >
        ← 返回
      </button>

      <style>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-60px) scale(0.5);
          }
        }
      `}</style>
    </div>
  );
}

export default BreathingGame;