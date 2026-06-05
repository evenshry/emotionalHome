import { useState } from 'react';
import { saveMoodHistory, updateStats } from '@utils/storage';

interface ReframeExerciseProps {
  onComplete?: () => void;
}

interface ReflectionStep {
  id: number;
  title: string;
  prompt: string;
  placeholder: string;
}

const REFLECTION_STEPS: ReflectionStep[] = [
  {
    id: 1,
    title: '负面想法',
    prompt: '写下你当前的负面想法或信念',
    placeholder: '例如：我总是搞砸事情...',
  },
  {
    id: 2,
    title: '挑战想法',
    prompt: '这个想法是否有证据支持？有没有其他角度看这件事？',
    placeholder: '例如：上次我成功完成了...',
  },
  {
    id: 3,
    title: '替代观点',
    prompt: '写下一个更平衡、更积极的替代想法',
    placeholder: '例如：每个人都会犯错，重要的是从中学习...',
  },
];

function ReframeExercise({ onComplete }: ReframeExerciseProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<string[]>(['', '', '']);
  const [showResult, setShowResult] = useState(false);

  const handleInputChange = (value: string) => {
    const newResponses = [...responses];
    newResponses[currentStep] = value;
    setResponses(newResponses);
  };

  const handleNext = () => {
    if (currentStep < REFLECTION_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
      saveMoodHistory({
        mood: '积极重构',
        intensity: 100,
        description: responses.join(' | '),
      });
      updateStats();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (showResult) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>✨</div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>重构完成！</h2>
        
        <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#E74C3C', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
              🔄 原来的想法
            </h3>
            <p style={{ background: 'rgba(231, 76, 60, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              {responses[0]}
            </p>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#F39C12', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
              🤔 挑战与反思
            </h3>
            <p style={{ background: 'rgba(243, 156, 18, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              {responses[1]}
            </p>
          </div>
          
          <div>
            <h3 style={{ color: '#2ECC71', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
              🌟 新的视角
            </h3>
            <p style={{ background: 'rgba(46, 204, 113, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              {responses[2]}
            </p>
          </div>
        </div>

        <button className="btn btn-primary" onClick={onComplete}>
          继续前进 →
        </button>
      </div>
    );
  }

  const step = REFLECTION_STEPS[currentStep];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            {REFLECTION_STEPS.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: index <= currentStep ? 'linear-gradient(135deg, #FF8C66, #6BA3BE)' : '#E8E8E8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: index <= currentStep ? 'white' : '#BDC3C7',
                  fontWeight: 700,
                  transition: 'all 0.3s ease',
                }}
              >
                {index + 1}
              </div>
            ))}
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#555' }}>
            {step.title}
          </h3>
          <p style={{ fontSize: '0.95rem', color: '#7F8C8D' }}>{step.prompt}</p>
        </div>
      </div>

      <textarea
        className="textarea"
        value={responses[currentStep]}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={step.placeholder}
        style={{ minHeight: '200px', fontSize: '1.1rem' }}
      />

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
        {currentStep > 0 && (
          <button className="btn btn-secondary" onClick={handlePrev}>
            ← 上一步
          </button>
        )}
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!responses[currentStep].trim()}
        >
          {currentStep < REFLECTION_STEPS.length - 1 ? '下一步 →' : '完成重构'}
        </button>
      </div>
    </div>
  );
}

export default ReframeExercise;
