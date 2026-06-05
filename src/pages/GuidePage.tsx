import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GUIDE_QUESTIONS } from '@data/constants';
import { saveMoodHistory, updateStats } from '@utils/storage';

function GuidePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(GUIDE_QUESTIONS.length).fill(''));
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = GUIDE_QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / GUIDE_QUESTIONS.length) * 100;

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentStep < GUIDE_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsComplete(true);
      saveMoodHistory({
        mood: location.state?.initialMood || '悲伤',
        intensity: 100,
        description: answers.join(' | '),
      });
      updateStats();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleContinue = () => {
    navigate('/transform', { state: { initialMood: location.state?.initialMood } });
  };

  if (isComplete) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div className="card animate-fade-in-up" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌟</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
            做得很好！
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#7F8C8D', marginBottom: '2rem', lineHeight: 1.6 }}>
            你已经勇敢地面对了自己的情绪，这是非常棒的一步。
            <br />
            接下来，让我们一起做一些积极的事情，让你的心情更好。
          </p>
          <button className="btn btn-primary" onClick={handleContinue}>
            继续 →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ marginBottom: '2rem' }}>
        ← 返回首页
      </button>

      <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div className="progress-bar" style={{ marginBottom: '2rem' }}>
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#7F8C8D' }}>
          问题 {currentStep + 1} / {GUIDE_QUESTIONS.length}
        </div>

        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: '1.5rem',
          textAlign: 'center',
          minHeight: '60px',
        }}>
          {currentQuestion.question}
        </h2>

        <textarea
          className="textarea"
          value={answers[currentStep]}
          onChange={(e) => handleAnswer(e.target.value)}
          placeholder={currentQuestion.placeholder}
          style={{ marginBottom: '1rem' }}
        />

        <p style={{
          fontSize: '0.9rem',
          color: '#95A5A6',
          fontStyle: 'italic',
          textAlign: 'center',
          marginBottom: '2rem',
        }}>
          💡 {currentQuestion.hint}
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {currentStep > 0 && (
            <button className="btn btn-secondary" onClick={handlePrev}>
              ← 上一题
            </button>
          )}
          <button className="btn btn-primary" onClick={handleNext}>
            {currentStep < GUIDE_QUESTIONS.length - 1 ? '下一题 →' : '完成'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GuidePage;
