import { useState, useEffect, useRef } from 'react';

interface BodyPart {
  id: string;
  name: string;
  icon: string;
  description: string;
  duration: number;
}

const BODY_PARTS: BodyPart[] = [
  { id: 'head', name: '头部', icon: '🧠', description: '放松头皮、额头、眉毛、眼睛、脸颊、嘴巴和下巴', duration: 8 },
  { id: 'neck', name: '颈部', icon: '💪', description: '放松颈部肌肉，感受颈椎的舒展', duration: 6 },
  { id: 'shoulders', name: '肩膀', icon: '🫰', description: '放下肩膀的紧张，让它们自然下沉', duration: 6 },
  { id: 'arms', name: '手臂', icon: '🦾', description: '放松上臂、前臂、手腕和手指', duration: 8 },
  { id: 'chest', name: '胸部', icon: '❤️', description: '深呼吸，感受胸腔的起伏', duration: 6 },
  { id: 'back', name: '背部', icon: '🩰', description: '放松背部肌肉，感受脊柱的放松', duration: 6 },
  { id: 'abdomen', name: '腹部', icon: '🍎', description: '放松腹部，让呼吸自然深入', duration: 6 },
  { id: 'legs', name: '腿部', icon: '🦵', description: '放松大腿、小腿、脚踝和脚趾', duration: 8 },
];

interface BodyScanMeditationProps {
  onComplete?: () => void;
}

function BodyScanMeditation({ onComplete }: BodyScanMeditationProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [countdown, setCountdown] = useState(BODY_PARTS[0].duration);
  const [progress, setProgress] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const intervalRef = useRef<number | null>(null);
  const breathIntervalRef = useRef<number | null>(null);

  const currentPart = BODY_PARTS[currentIndex] || BODY_PARTS[0];

  const startBreathCycle = () => {
    let phaseIndex = 0;
    const phases: ('inhale' | 'hold' | 'exhale')[] = ['inhale', 'hold', 'exhale'];
    
    breathIntervalRef.current = window.setInterval(() => {
      phaseIndex = (phaseIndex + 1) % 3;
      setBreathPhase(phases[phaseIndex]);
    }, 3000);
  };

  const stopBreathCycle = () => {
    if (breathIntervalRef.current) {
      clearInterval(breathIntervalRef.current);
      breathIntervalRef.current = null;
    }
  };

  const handleStart = () => {
    setIsPlaying(true);
    setCurrentIndex(0);
    setProgress(0);
    startBreathCycle();
    
    const totalDuration = BODY_PARTS.reduce((sum, part) => sum + part.duration, 0);
    const startTime = Date.now();
    
    const runScan = (index: number = 0) => {
      if (index >= BODY_PARTS.length) {
        setIsPlaying(false);
        stopBreathCycle();
        onComplete?.();
        return;
      }

      const part = BODY_PARTS[index];
      setCountdown(part.duration);

      intervalRef.current = window.setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            const nextIndex = index + 1;
            setCurrentIndex(nextIndex);
            
            const elapsed = Date.now() - startTime;
            setProgress(Math.min((elapsed / (totalDuration * 1000)) * 100, 100));
            
            if (nextIndex < BODY_PARTS.length) {
              setTimeout(() => runScan(nextIndex), 500);
            } else {
              setIsPlaying(false);
              stopBreathCycle();
              onComplete?.();
            }
            return part.duration;
          }
          return prev - 1;
        });
      }, 1000);
    };

    runScan(0);
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    stopBreathCycle();
  };

  const handleResume = () => {
    if (currentIndex >= BODY_PARTS.length) {
      return;
    }
    
    setIsPlaying(true);
    startBreathCycle();
    
    const part = BODY_PARTS[currentIndex];
    setCountdown(countdown);
    
    intervalRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          if (currentIndex >= BODY_PARTS.length - 1) {
            setIsPlaying(false);
            stopBreathCycle();
            onComplete?.();
          } else {
            setCurrentIndex((idx) => idx + 1);
          }
          return part.duration;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    setCountdown(BODY_PARTS[0].duration);
    setProgress(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    stopBreathCycle();
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      stopBreathCycle();
    };
  }, []);

  const getBreathInstruction = () => {
    switch (breathPhase) {
      case 'inhale':
        return '深吸气...';
      case 'hold':
        return '保持...';
      case 'exhale':
        return '缓缓呼气...';
    }
  };

  return (
    <div className="page-container" style={{ textAlign: 'center', padding: '2rem' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '2rem', color: '#2C3E50' }}>
        🧘 身体扫描冥想
      </h2>
      
      <p style={{ color: '#7F8C8D', marginBottom: '2rem', fontSize: '1.1rem' }}>
        跟随引导，放松身体的每一个部位
      </p>

      <div
        style={{
          background: 'linear-gradient(135deg, #E8F5F1, #FFFFFF)',
          borderRadius: '20px',
          padding: '2rem',
          maxWidth: '500px',
          margin: '0 auto 2rem',
          boxShadow: '0 10px 40px rgba(26, 188, 156, 0.15)',
        }}
      >
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: isPlaying ? 'pulse 2s ease-in-out infinite' : 'none' }}>
            {currentPart.icon}
          </div>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 600, color: '#1ABC9C', marginBottom: '0.5rem' }}>
            {currentPart.name}
          </h3>
          <p style={{ color: '#7F8C8D', fontSize: '1rem' }}>
            {currentPart.description}
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: `breath ${breathPhase === 'inhale' ? '3s' : breathPhase === 'hold' ? '1s' : '4s'} ease-in-out infinite` }}>
            🫁
          </div>
          <p style={{ color: '#3498DB', fontSize: '1.2rem', fontWeight: 500 }}>
            {getBreathInstruction()}
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: '#1ABC9C' }}>
            {countdown}
          </div>
          <p style={{ color: '#95A5A6', fontSize: '0.9rem' }}>秒</p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#7F8C8D' }}>进度</span>
            <span style={{ fontSize: '0.9rem', color: '#1ABC9C' }}>{Math.round(progress)}%</span>
          </div>
          <div
            style={{
              height: '6px',
              borderRadius: '3px',
              backgroundColor: '#E8E8E8',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #1ABC9C, #16A085)',
                borderRadius: '3px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          {!isPlaying ? (
            <button
              onClick={currentIndex === 0 ? handleStart : handleResume}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#1ABC9C',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 6px 20px rgba(26, 188, 156, 0.4)',
              }}
            >
              ▶️
            </button>
          ) : (
            <button
              onClick={handlePause}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#F39C12',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 6px 20px rgba(243, 156, 18, 0.4)',
              }}
            >
              ⏸️
            </button>
          )}
          
          <button
            onClick={handleReset}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#95A5A6',
              color: 'white',
              fontSize: '1.2rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 6px 20px rgba(149, 165, 166, 0.3)',
            }}
          >
            🔄
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          maxWidth: '400px',
          margin: '0 auto 2rem',
        }}
      >
        {BODY_PARTS.map((part, index) => (
          <div
            key={part.id}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              backgroundColor: index === currentIndex ? '#1ABC9C' : '#F0F0F0',
              color: index === currentIndex ? 'white' : '#7F8C8D',
              fontSize: '0.9rem',
              opacity: index < currentIndex ? 0.5 : 1,
              transition: 'all 0.3s ease',
            }}
          >
            {part.icon} {part.name}
          </div>
        ))}
      </div>

      <button
        className="btn btn-secondary"
        onClick={onComplete}
      >
        ← 返回
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        
        @keyframes breath {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

export default BodyScanMeditation;