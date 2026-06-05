import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DrawCanvas from '@components/DrawCanvas';
import BubblePop from '@components/BubblePop';
import TextVent from '@components/TextVent';
import StressBall from '@components/StressBall';
import { updateStats } from '@utils/storage';

function VentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('text');
  const [isComplete, setIsComplete] = useState(false);

  const handleComplete = () => {
    setIsComplete(true);
  };

  const handleContinue = () => {
    updateStats();
    navigate('/guide', { state: { initialMood: location.state?.initialMood } });
  };

  if (isComplete) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div className="card animate-bounce-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="animate-float" style={{ fontSize: '4rem', marginBottom: '1rem' }}>💨</div>
          <h2 className="animate-fade-in-up" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
            情绪已经释放
          </h2>
          <p className="animate-fade-in-up stagger-2" style={{ fontSize: '1.1rem', color: '#7F8C8D', marginBottom: '2rem', lineHeight: 1.6 }}>
            你做得很好，现在让我们一起理清思绪，找到解决问题的方向。
          </p>
          <button className="btn btn-primary animate-scale-in stagger-3" onClick={handleContinue}>
            继续 →
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'text', label: '文字倾倒', icon: '📝' },
    { id: 'ball', label: '压力球', icon: '👊' },
    { id: 'draw', label: '涂鸦发泄', icon: '🎨' },
    { id: 'bubble', label: '捏泡泡', icon: '🫧' },
  ];

  return (
    <div className="page-container">
      <button className="btn btn-secondary animate-fade-in-left" onClick={() => navigate('/')} style={{ marginBottom: '2rem' }}>
        ← 返回首页
      </button>

      <h1 className="animate-fade-in-down" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
        释放你的情绪
      </h1>

      <div className="animate-fade-in-up" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'} animate-scale-in`}
            style={{ animationDelay: `${i * 0.1}s` }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="card animate-fade-in-up stagger-2" style={{ maxWidth: '700px', margin: '0 auto', minHeight: '400px' }}>
        {activeTab === 'text' && <TextVent onComplete={handleComplete} />}
        {activeTab === 'ball' && <StressBall onComplete={handleComplete} />}
        {activeTab === 'draw' && <DrawCanvas onComplete={handleComplete} />}
        {activeTab === 'bubble' && <BubblePop onComplete={handleComplete} />}
      </div>

      {!isComplete && (activeTab === 'text' || activeTab === 'ball') && (
        <div className="animate-fade-in-up stagger-3" style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button className="btn btn-primary" onClick={handleContinue}>
            我感觉好一些了，继续 →
          </button>
        </div>
      )}
    </div>
  );
}

export default VentPage;
