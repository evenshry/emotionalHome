import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMoodHistory, getStats, getGratitudeJournal, clearAllData, exportAllData } from '@utils/storage';
import Celebration from '@components/Celebration';
import AnimatedPage from '@components/AnimatedPage';
import ThemeToggle from '@components/ThemeToggle';
import type { Stats, MoodEntry, GratitudeEntry } from '@/types';

interface WeekDataItem {
  day: string;
  date: string;
  count: number;
  hasSession: boolean;
}

function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'gratitude'>('overview');
  const stats: Stats = getStats();
  const moodHistory: MoodEntry[] = getMoodHistory();
  const gratitudeJournal: GratitudeEntry[] = getGratitudeJournal();

  useEffect(() => {
    if (location.state?.showCelebration === true) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 4000);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleClear = () => {
    clearAllData();
    setShowConfirm(false);
    window.location.reload();
  };

  const handleExport = () => {
    exportAllData();
  };

  const recentMoods = moodHistory.slice(-14);
  const moodEmojis: Record<string, string> = {
    '愤怒': '😡',
    '焦虑': '😰',
    '悲伤': '😢',
    '沮丧': '😞',
    '平静': '😌',
    '还好': '🙂',
  };
  const moodColors: Record<string, string> = {
    '愤怒': '#E74C3C',
    '焦虑': '#F39C12',
    '悲伤': '#34495E',
    '沮丧': '#8E44AD',
    '平静': '#1ABC9C',
    '还好': '#6BA3BE',
  };

  const getWeekData = (): WeekDataItem[] => {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekData: WeekDataItem[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const dateStr = date.toISOString().split('T')[0];
      const dayMoods = moodHistory.filter((m) => new Date(m.timestamp).toISOString().split('T')[0] === dateStr);
      weekData.push({
        day: days[date.getDay()],
        date: dateStr.slice(5),
        count: dayMoods.length,
        hasSession: dayMoods.length > 0,
      });
    }
    return weekData;
  };

  const weekData = getWeekData();
  const maxCount = Math.max(...weekData.map((d) => d.count), 1);

  const moodDistribution: Record<string, number> = {};
  moodHistory.forEach((entry) => {
    moodDistribution[entry.mood] = (moodDistribution[entry.mood] || 0) + 1;
  });

  return (
    <div className="page-container">
      <Celebration show={showCelebration} onComplete={() => setShowCelebration(false)} />

      <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ marginBottom: '1rem' }}>
        ← 返回首页
      </button>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <ThemeToggle />
      </div>

      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
        我的情绪记录
      </h1>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 总览
        </button>
        <button
          className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('history')}
        >
          📅 历史
        </button>
        <button
          className={`btn ${activeTab === 'gratitude' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('gratitude')}
        >
          🙏 感恩
        </button>
      </div>

      {activeTab === 'overview' && (
        <AnimatedPage>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem',
              maxWidth: '800px',
              margin: '0 auto 2rem',
            }}
          >
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎯</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FF8C66' }}>{stats.totalSessions}</div>
              <div style={{ color: '#7F8C8D' }}>疏导次数</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔥</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#E74C3C' }}>{stats.streakDays}</div>
              <div style={{ color: '#7F8C8D' }}>连续天数</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📝</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1ABC9C' }}>{gratitudeJournal.length}</div>
              <div style={{ color: '#7F8C8D' }}>感恩记录</div>
            </div>
          </div>

          <div className="card" style={{ maxWidth: '800px', margin: '0 auto 2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
              本周活动
            </h3>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'flex-end',
                height: '150px',
                padding: '0 1rem',
              }}
            >
              {weekData.map((day, index) => (
                <div key={index} style={{ textAlign: 'center', flex: 1 }}>
                  <div
                    style={{
                      width: '40px',
                      height: `${Math.max((day.count / maxCount) * 100, day.hasSession ? 20 : 4)}px`,
                      background: day.hasSession ? 'linear-gradient(135deg, #FF8C66, #6BA3BE)' : '#E8E8E8',
                      borderRadius: '8px 8px 4px 4px',
                      margin: '0 auto 0.5rem',
                      transition: 'height 0.5s ease',
                    }}
                  />
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: day.hasSession ? '#FF8C66' : '#95A5A6' }}>
                    {day.day}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#BDC3C7' }}>{day.date}</div>
                </div>
              ))}
            </div>
          </div>

          {Object.keys(moodDistribution).length > 0 && (
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto 2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', textAlign: 'center' }}>情绪分布</h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {Object.entries(moodDistribution).map(([mood, count]) => (
                  <div key={mood} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem' }}>{moodEmojis[mood]}</div>
                    <div style={{ fontWeight: 700, color: moodColors[mood] }}>{count}</div>
                    <div style={{ fontSize: '0.8rem', color: '#7F8C8D' }}>{mood}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </AnimatedPage>
      )}

      {activeTab === 'history' && (
        <AnimatedPage>
          {recentMoods.length > 0 ? (
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>最近的情绪记录</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {recentMoods.slice().reverse().map((entry, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      background: '#F8F9FA',
                      borderRadius: '12px',
                      borderLeft: `4px solid ${moodColors[entry.mood] || '#95A5A6'}`,
                    }}
                  >
                    <div style={{ fontSize: '1.5rem' }}>{moodEmojis[entry.mood] || '😊'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>
                        {entry.mood}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#95A5A6' }}>
                        {new Date(entry.timestamp).toLocaleString('zh-CN')}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#BDC3C7', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.description || '-'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <p style={{ color: '#7F8C8D' }}>还没有情绪记录，开始你的第一次疏导吧</p>
              <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>
                开始疏导
              </button>
            </div>
          )}
        </AnimatedPage>
      )}

      {activeTab === 'gratitude' && (
        <AnimatedPage>
          {gratitudeJournal.length > 0 ? (
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>感恩记录</h3>
              {gratitudeJournal.slice().reverse().map((entry, index) => (
                <div key={index} style={{ marginBottom: '1rem', padding: '1rem', background: '#F8F9FA', borderRadius: '12px' }}>
                  <div style={{ fontWeight: 600, color: '#7F8C8D', marginBottom: '0.5rem' }}>{entry.date}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {entry.items.map((item, i) => (
                      <span
                        key={i}
                        style={{ background: '#FFF8F0', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.9rem' }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🙏</div>
              <p style={{ color: '#7F8C8D' }}>还没有感恩记录，试试写下感恩的事吧</p>
              <button className="btn btn-primary" onClick={() => navigate('/transform')} style={{ marginTop: '1rem' }}>
                开始感恩日记
              </button>
            </div>
          )}
        </AnimatedPage>
      )}

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        {showConfirm ? (
          <div>
            <p style={{ marginBottom: '1rem', color: '#E74C3C' }}>确定要清除所有数据吗？此操作不可恢复。</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleClear} style={{ background: '#E74C3C' }}>
                确认清除
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={handleExport}>
              📥 导出数据
            </button>
            <button className="btn btn-secondary" onClick={() => setShowConfirm(true)}>
              🗑️ 清除所有数据
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;