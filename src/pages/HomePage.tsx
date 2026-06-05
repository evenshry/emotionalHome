import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOODS } from '@data/constants';
import { getDailyQuote } from '@data/quotes';
import type { Quote, Mood } from '@/types';

function HomePage() {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    setLoaded(true);
    setQuote(getDailyQuote());
  }, []);

  return (
    <div className="page-container" style={{ textAlign: 'center' }}>
      <div style={{ paddingTop: '3rem' }}>
        {quote && (
          <div
            className="animate-fade-in"
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '1rem 2rem',
              marginBottom: '2rem',
              maxWidth: '600px',
              margin: '0 auto 2rem',
              borderLeft: '4px solid #FF8C66',
            }}
          >
            <p style={{ fontStyle: 'italic', color: '#555', marginBottom: '0.5rem' }}>
              "{quote.text}"
            </p>
            <p style={{ fontSize: '0.9rem', color: '#999' }}>— {quote.author}</p>
          </div>
        )}

        <h1
          className={`${loaded ? 'animate-fade-in-up' : ''} gradient-text`}
          style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            marginBottom: '1rem',
          }}
        >
          情绪港湾
        </h1>
        <p
          className={loaded ? 'animate-fade-in-up' : ''}
          style={{
            fontSize: '1.3rem',
            color: '#7F8C8D',
            marginBottom: '3rem',
            animationDelay: '0.2s',
            opacity: 0,
            animationFillMode: 'forwards',
          }}
        >
          一个安全的空间，释放情绪，找回平静与快乐
        </p>

        <div
          className={loaded ? 'animate-fade-in-up' : ''}
          style={{
            animationDelay: '0.4s',
            marginBottom: '2rem',
            opacity: 0,
            animationFillMode: 'forwards',
          }}
        >
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', fontWeight: 600 }}>
            你现在感觉如何？
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1.5rem',
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
            {MOODS.map((mood: Mood, index: number) => (
              <button
                key={mood.name}
                onClick={() => navigate(mood.nextStep, { state: { initialMood: mood.name } })}
                className="card mood-card"
                style={{
                  cursor: 'pointer',
                  animationDelay: `${index * 0.1}s`,
                  borderLeft: `4px solid ${mood.color}`,
                  textAlign: 'center',
                  padding: '1.5rem 1rem',
                  opacity: 0,
                  animation: loaded ? `fadeInUp 0.6s ease forwards ${0.6 + index * 0.1}s` : 'none',
                }}
              >
                <div
                  className="animate-float"
                  style={{ fontSize: '2.5rem', marginBottom: '0.5rem', animationDelay: `${index * 0.2}s` }}
                >
                  {mood.emoji}
                </div>
                <div style={{ fontWeight: 600, color: mood.color }}>{mood.name}</div>
              </button>
            ))}
          </div>
        </div>

        <div
          style={{ marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            📊 查看我的情绪记录
          </button>
        </div>

        <div style={{ marginTop: '4rem', padding: '2rem', color: '#95A5A6', fontSize: '0.9rem' }}>
          <p>🔒 你的所有数据都存储在本地，完全保护你的隐私</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;