import { useState, useEffect } from 'react';
import { BREATHING_STAGES } from '@data/constants';

function QuickRelief() {
  const [isOpen, setIsOpen] = useState(false);
  const [isBreathing, setIsBreathing] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [breathCount, setBreathCount] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let progressInterval: ReturnType<typeof setInterval>;

    if (isBreathing) {
      const stage = BREATHING_STAGES[currentStage];
      const totalDuration = stage.duration * 1000;
      const increment = 100 / (stage.duration * 10);

      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 0;
          }
          return prev + increment;
        });
      }, 100);

      interval = setTimeout(() => {
        if (currentStage < BREATHING_STAGES.length - 1) {
          setCurrentStage(currentStage + 1);
        } else {
          setCurrentStage(0);
          setBreathCount((prev) => prev + 1);
          if (breathCount >= 3) {
            setIsBreathing(false);
            setBreathCount(0);
          }
        }
      }, totalDuration);
    }

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [isBreathing, currentStage, breathCount]);

  const handleStartBreathing = () => {
    setIsBreathing(true);
    setCurrentStage(0);
    setProgress(0);
    setBreathCount(0);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsBreathing(false);
    setProgress(0);
    setBreathCount(0);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary animate-pulse"
        style={{
          position: 'fixed',
          right: '1.5rem',
          bottom: '7rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          padding: 0,
          fontSize: '1.5rem',
          boxShadow: '0 4px 20px rgba(255, 140, 102, 0.4)',
          zIndex: 900,
        }}
      >
        💆
      </button>

      {isOpen && (
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem',
          }}
          onClick={handleClose}
        >
          <div
            className="card animate-scale-in"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}
          >
            <button
              onClick={handleClose}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
              🧘 快速放松
            </h2>

            {isBreathing ? (
              <div>
                <div
                  style={{
                    width: '150px',
                    height: '150px',
                    margin: '0 auto 1.5rem',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FF8C66, #6BA3BE)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.3s ease',
                    transform: `scale(${0.8 + progress / 250})`,
                  }}
                >
                  <span style={{ fontSize: '3rem' }}>
                    {currentStage === 0 ? '吸' : currentStage === 1 ? '停' : '呼'}
                  </span>
                </div>

                <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                  {BREATHING_STAGES[currentStage].instruction}
                </p>

                <div className="progress-bar" style={{ marginBottom: '0.5rem' }}>
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p style={{ fontSize: '0.9rem', color: '#7F8C8D' }}>
                  已完成 {breathCount} / 4 次呼吸
                </p>
              </div>
            ) : (
              <div>
                <p style={{ marginBottom: '1.5rem', color: '#7F8C8D' }}>
                  跟随引导进行深呼吸练习，帮助你快速平静下来
                </p>
                <button className="btn btn-primary" onClick={handleStartBreathing}>
                  🚀 开始呼吸练习
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default QuickRelief;
