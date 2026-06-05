import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDailyQuote } from '@data/quotes';
import type { Quote } from '@/types';

interface ReminderItem {
  icon: string;
  text: string;
}

function SummaryPage() {
  const navigate = useNavigate();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setQuote(getDailyQuote());
    setLoaded(true);
  }, []);

  const reminders: ReminderItem[] = [
    { icon: '🫁', text: '深呼吸是随时可用的平静工具' },
    { icon: '📝', text: '写下感受可以帮助理清思绪' },
    { icon: '🙏', text: '感恩能改变看待世界的角度' },
    { icon: '💪', text: '求助是勇敢的表现，不是软弱' },
    { icon: '🌅', text: '每一天都是新的开始' },
    { icon: '💝', text: '对自己温柔一些' },
  ];

  return (
    <div className="page-container" style={{ textAlign: 'center' }}>
      <div style={{ paddingTop: '3rem', maxWidth: '600px', margin: '0 auto' }}>
        <div
          className={loaded ? 'animate-fade-in-up' : ''}
          style={{ fontSize: '5rem', marginBottom: '1rem' }}
        >
          🌟
        </div>

        <h1
          className={loaded ? 'animate-fade-in-up' : ''}
          style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #FF8C66, #6BA3BE, #D4A5FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem',
          }}
        >
          你今天做得很棒！
        </h1>

        <p
          className={loaded ? 'animate-fade-in-up' : ''}
          style={{
            fontSize: '1.1rem',
            color: '#7F8C8D',
            marginBottom: '2rem',
            lineHeight: 1.6,
          }}
        >
          情绪疏导不是消除负面情绪，而是学会与它们和平相处。
          <br />
          你已经迈出了重要的一步。
        </p>

        {quote && (
          <div
            className={loaded ? 'animate-fade-in-up' : ''}
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '1.5rem 2rem',
              marginBottom: '2rem',
              borderLeft: '4px solid #1ABC9C',
            }}
          >
            <p style={{ fontStyle: 'italic', color: '#555', marginBottom: '0.5rem' }}>
              "{quote.text}"
            </p>
            <p style={{ fontSize: '0.9rem', color: '#999' }}>— {quote.author}</p>
          </div>
        )}

        <div className={loaded ? 'animate-fade-in-up' : ''} style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem', color: '#555' }}>
            记住这些小事
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
            }}
          >
            {reminders.map((item, index) => (
              <div
                key={index}
                className="card"
                style={{ padding: '1rem', textAlign: 'center', animationDelay: `${index * 0.1}s` }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                <p style={{ fontSize: '0.9rem', color: '#7F8C8D' }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            🏠 返回首页
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            📊 查看记录
          </button>
        </div>
      </div>
    </div>
  );
}

export default SummaryPage;