import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveGratitudeJournal, updateStats } from '@utils/storage';
import { BREATHING_STAGES, ACTIVITY_NAMES } from '@data/constants';
import ReframeExercise from '@components/ReframeExercise';
import MusicRelax from '@components/MusicRelax';
import BodyScanMeditation from '@components/BodyScanMeditation';
import useSound from '@hooks/useSound';

function TransformPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('breathing');
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);

  const handleComplete = (activity: string) => {
    if (!completedActivities.includes(activity)) {
      setCompletedActivities([...completedActivities, activity]);
    }
  };

  return (
    <div className="page-container">
      <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ marginBottom: '2rem' }}>
        ← 返回首页
      </button>

      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>
        积极转化
      </h1>
      <p style={{ color: '#7F8C8D', textAlign: 'center', marginBottom: '2rem' }}>
        选择一个练习，让心情变得更好
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeTab === 'breathing' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('breathing')}
        >
          🫁 呼吸放松
        </button>
        <button
          className={`btn ${activeTab === 'music' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('music')}
        >
          🎵 音乐放松
        </button>
        <button
          className={`btn ${activeTab === 'meditation' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('meditation')}
        >
          🧘 身体扫描
        </button>
        <button
          className={`btn ${activeTab === 'gratitude' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('gratitude')}
        >
          📝 感恩日记
        </button>
        <button
          className={`btn ${activeTab === 'reframe' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('reframe')}
        >
          🔄 积极重构
        </button>
      </div>

      {completedActivities.length > 0 && (
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <span style={{
            background: '#F0FFF4',
            color: '#27AE60',
            padding: '0.3rem 1rem',
            borderRadius: '20px',
            fontSize: '0.9rem',
          }}>
            ✓ 已完成: {completedActivities.join('、')}
          </span>
        </div>
      )}

      <div className="card" style={{ maxWidth: '700px', margin: '0 auto', minHeight: '400px' }}>
        {activeTab === 'breathing' && <BreathingExercise onComplete={() => handleComplete(ACTIVITY_NAMES.BREATHING)} />}
        {activeTab === 'music' && <MusicRelax onComplete={() => handleComplete(ACTIVITY_NAMES.MUSIC)} />}
        {activeTab === 'meditation' && <BodyScanMeditation onComplete={() => handleComplete(ACTIVITY_NAMES.MEDITATION)} />}
        {activeTab === 'gratitude' && <GratitudeJournal onComplete={() => handleComplete(ACTIVITY_NAMES.GRATITUDE)} />}
        {activeTab === 'reframe' && <ReframeExercise onComplete={() => handleComplete(ACTIVITY_NAMES.REFRAME)} />}
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button className="btn btn-primary" onClick={() => {
          updateStats();
          navigate('/dashboard');
        }}>
          完成本次疏导，查看记录
        </button>
      </div>
    </div>
  );
}

interface BreathingExerciseProps {
  onComplete: () => void;
}

function BreathingExercise({ onComplete }: BreathingExerciseProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [countdown, setCountdown] = useState(BREATHING_STAGES[0].duration);
  const [cycles, setCycles] = useState(0);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; color: string }[]>([]);
  const particleIdRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { playSound } = useSound();

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

  const getStageInfo = (stageName: string) => {
    switch(stageName) {
      case '吸气': return { id: 'inhale', color: '#1ABC9C' };
      case '屏息': return { id: 'hold', color: '#3498DB' };
      case '呼气': return { id: 'exhale', color: '#9B59B6' };
      default: return { id: 'inhale', color: '#1ABC9C' };
    }
  };

  const stage = BREATHING_STAGES[currentStage];
  const stageInfo = getStageInfo(stage.name);

  useEffect(() => {
    if (!isRunning) return;

    setCountdown(stage.duration);

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          const nextStage = (currentStage + 1) % BREATHING_STAGES.length;
          
          // 播放音效
          const nextStageInfo = getStageInfo(BREATHING_STAGES[nextStage].name);
          if (nextStageInfo.id === 'inhale') {
            playSound('breath-in');
          } else if (nextStageInfo.id === 'exhale') {
            playSound('breath-out');
            
            // 呼气时加分和能量
            setScore((s) => s + 10);
            setEnergy((e) => Math.min(e + 15, 100));
            
            if (Math.random() > 0.7) {
              createParticle();
            }
            
            setScore((s) => {
              setStars((st) => {
                if (s >= 40 && st < 1) return 1;
                if (s >= 80 && st < 2) return 2;
                if (s >= 120 && st < 3) return 3;
                return st;
              });
              return s;
            });
          }
          
          setCurrentStage(nextStage);
          
          if (nextStage === 0) {
            setCycles((c) => {
              const newCycles = c + 1;
              if (newCycles >= 3) {
                setTimeout(() => {
                  setIsRunning(false);
                  playSound('complete');
                  onComplete();
                }, 500);
              }
              return newCycles;
            });
          }
          
          return BREATHING_STAGES[nextStage].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, currentStage]);

  const breathColors: Record<string, string> = {
    '吸气': 'linear-gradient(135deg, #1ABC9C, #2ECC71)',
    '屏息': 'linear-gradient(135deg, #3498DB, #6BA3BE)',
    '呼气': 'linear-gradient(135deg, #9B59B6, #D4A5FF)',
  };
  const breathShadows: Record<string, string> = {
    '吸气': '0 8px 40px rgba(26, 188, 156, 0.5)',
    '屏息': '0 8px 40px rgba(52, 152, 219, 0.5)',
    '呼气': '0 8px 40px rgba(155, 89, 182, 0.5)',
  };
  const scale = isRunning
    ? currentStage === 0
      ? 1 + (1 - countdown / stage.duration) * 0.5
      : currentStage === 1
      ? 1.5
      : 1 + (countdown / stage.duration) * 0.5
    : 1;

  return (
    <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
      {/* 游戏化指标 */}
      {isRunning && (
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
      )}

      <div
        style={{
          position: 'relative',
          width: '240px',
          height: '240px',
          margin: '0 auto 2rem',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: isRunning ? breathColors[stage.name] : 'linear-gradient(135deg, #E8F4F8, #F3E8FF)',
            transform: `scale(${scale})`,
            transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.5s ease',
            boxShadow: isRunning ? breathShadows[stage.name] : '0 4px 16px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isRunning ? 'white' : '#7F8C8D',
            fontSize: '2.5rem',
            fontWeight: 700,
            position: 'relative',
          }}
        >
          {isRunning && (
            <div
              style={{
                position: 'absolute',
                inset: '-10px',
                borderRadius: '50%',
                border: '3px solid',
                borderColor:
                  stage.name === '吸气'
                    ? 'rgba(26, 188, 156, 0.3)'
                    : stage.name === '屏息'
                    ? 'rgba(52, 152, 219, 0.3)'
                    : 'rgba(155, 89, 182, 0.3)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
          )}
          
          {/* 粒子效果 */}
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
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
          
          {isRunning ? (
            <div className="animate-bounce-in" key={currentStage}>
              <div style={{ fontSize: '3.5rem', marginBottom: '0.3rem' }}>{countdown}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{stage.name}</div>
            </div>
          ) : (
            '🫁'
          )}
        </div>
      </div>

      {isRunning ? (
        <div className="animate-fade-in-up">
          <div
            style={{
              background: `linear-gradient(135deg, ${stageInfo.color}15, #fff)`,
              borderRadius: '16px',
              padding: '1.5rem',
              maxWidth: '300px',
              margin: '0 auto 1.5rem',
              border: `2px solid ${stageInfo.color}30`,
            }}
          >
            <p style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.5rem', color: stageInfo.color }}>
              {stage.instruction}
            </p>
            <p style={{ color: '#7F8C8D' }}>
              完成循环:{' '}
              <span style={{ fontWeight: 700, color: stageInfo.color, fontSize: '1.2rem' }}>
                {cycles}
              </span>
              /3
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
            {BREATHING_STAGES.map((s, i) => (
              <div
                key={s.name}
                style={{
                  padding: '0.5rem 1.2rem',
                  borderRadius: '20px',
                  background:
                    currentStage === i
                      ? getStageInfo(s.name).color
                      : '#E8E8E8',
                  color: currentStage === i ? 'white' : '#95A5A6',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transform: currentStage === i ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: currentStage === i ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                }}
              >
                {s.name}
              </div>
            ))}
          </div>

          <button
            className="btn btn-secondary"
            onClick={() => {
              setIsRunning(false);
              setCurrentStage(0);
              setCycles(0);
              if (intervalRef.current) clearInterval(intervalRef.current);
            }}
          >
            停止
          </button>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#7F8C8D' }}>
            4-7-8呼吸法：吸气4秒，屏息7秒，呼气8秒
          </p>
          <p style={{ fontSize: '0.9rem', color: '#95A5A6', marginBottom: '2rem' }}>
            跟随呼吸指引，收集能量，获得星星奖励！
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setIsRunning(true);
              setCurrentStage(0);
              setCycles(0);
              setScore(0);
              setStars(0);
              setEnergy(0);
            }}
          >
            🎮 开始呼吸练习
          </button>
          {stars >= 3 && !isRunning && (
            <div
              style={{
                marginTop: '2rem',
                background: 'linear-gradient(135deg, #FEF5E7, #fff)',
                borderRadius: '16px',
                padding: '1.5rem',
                maxWidth: '350px',
                margin: '2rem auto 0',
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
        </div>
      )}

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

interface GratitudeJournalProps {
  onComplete: () => void;
}

function GratitudeJournal({ onComplete }: GratitudeJournalProps) {
  const [items, setItems] = useState(['', '', '']);
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleSave = () => {
    const validItems = items.filter((item) => item.trim());
    if (validItems.length === 0) return;

    saveGratitudeJournal({ items: validItems });
    setIsSaved(true);
    onComplete();
  };

  if (isSaved) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🙏</div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>感恩之心，常乐之道</h3>
        <p style={{ color: '#7F8C8D' }}>你已记录下今天的感恩之事，继续保持这份美好</p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>
        今天，你想感恩什么？
      </h3>
      <p style={{ color: '#7F8C8D', textAlign: 'center', marginBottom: '2rem' }}>
        写下三件让你感到感激的事情，无论大小
      </p>

      {items.map((item, index) => (
        <div key={index} style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#7F8C8D' }}>
            {index + 1}.
          </label>
          <input
            type="text"
            className="textarea"
            value={item}
            onChange={(e) => handleChange(index, e.target.value)}
            placeholder="一件感恩的事..."
            style={{ minHeight: 'auto', padding: '1rem' }}
          />
        </div>
      ))}

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <button className="btn btn-primary" onClick={handleSave}>
          保存
        </button>
      </div>
    </div>
  );
}

export default TransformPage;
