import { useState, useRef } from 'react';

interface Emotion {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
}

const EMOTIONS: Emotion[] = [
  { id: 'happy', name: '开心', emoji: '😊', color: '#F39C12', bgColor: '#FEF5E7' },
  { id: 'sad', name: '难过', emoji: '😢', color: '#3498DB', bgColor: '#EBF5FB' },
  { id: 'angry', name: '生气', emoji: '😤', color: '#E74C3C', bgColor: '#FDF2E9' },
  { id: 'anxious', name: '焦虑', emoji: '😰', color: '#9B59B6', bgColor: '#F5EEF8' },
  { id: 'calm', name: '平静', emoji: '😌', color: '#1ABC9C', bgColor: '#E8F5F1' },
  { id: 'confused', name: '困惑', emoji: '😕', color: '#7F8C8D', bgColor: '#F5F5F5' },
  { id: 'excited', name: '兴奋', emoji: '🤩', color: '#E67E22', bgColor: '#FEF9E7' },
  { id: 'tired', name: '疲惫', emoji: '😴', color: '#95A5A6', bgColor: '#ECF0F1' },
];

interface EmotionCard {
  id: string;
  emotion: Emotion;
  note: string;
  timestamp: number;
}

interface EmotionCardsProps {
  onComplete?: () => void;
}

function EmotionCards({ onComplete }: EmotionCardsProps) {
  const [selectedEmotions, setSelectedEmotions] = useState<EmotionCard[]>([]);
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [note, setNote] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleEmotionClick = (emotion: Emotion) => {
    setSelectedEmotion(emotion);
  };

  const handleAddCard = () => {
    if (!selectedEmotion) return;
    
    const newCard: EmotionCard = {
      id: Date.now().toString(),
      emotion: selectedEmotion,
      note: note.trim(),
      timestamp: Date.now(),
    };
    
    setSelectedEmotions([...selectedEmotions, newCard]);
    setNote('');
    setSelectedEmotion(null);
  };

  const handleRemoveCard = (index: number) => {
    setSelectedEmotions(selectedEmotions.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setHoveredIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newCards = [...selectedEmotions];
    const [draggedCard] = newCards.splice(draggedIndex, 1);
    newCards.splice(index, 0, draggedCard);
    
    setSelectedEmotions(newCards);
    setDraggedIndex(null);
    setHoveredIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setHoveredIndex(null);
  };

  const getTotalEmotion = (): Emotion | null => {
    if (selectedEmotions.length === 0) return null;
    
    const emotionCounts: Record<string, number> = {};
    selectedEmotions.forEach((card) => {
      emotionCounts[card.emotion.id] = (emotionCounts[card.emotion.id] || 0) + 1;
    });
    
    let maxCount = 0;
    let dominantEmotion: Emotion | null = null;
    
    Object.entries(emotionCounts).forEach(([id, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantEmotion = EMOTIONS.find((e) => e.id === id) || null;
      }
    });
    
    return dominantEmotion;
  };

  const dominantEmotion: Emotion | null = getTotalEmotion();

  return (
    <div className="page-container" style={{ textAlign: 'center', padding: '2rem' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '2rem', color: '#2C3E50' }}>
        🎴 情绪卡片
      </h2>
      
      <p style={{ color: '#7F8C8D', marginBottom: '2rem', fontSize: '1.1rem' }}>
        选择你现在的情绪，创建情绪卡片
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '0.8rem',
          maxWidth: '500px',
          margin: '0 auto 2rem',
        }}
      >
        {EMOTIONS.map((emotion) => (
          <button
            key={emotion.id}
            onClick={() => handleEmotionClick(emotion)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '1rem',
              borderRadius: '12px',
              border: selectedEmotion?.id === emotion.id ? `2px solid ${emotion.color}` : '2px solid transparent',
              backgroundColor: selectedEmotion?.id === emotion.id ? emotion.bgColor : '#FAFBFC',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: selectedEmotion?.id === emotion.id ? `0 6px 20px ${emotion.color}30` : '0 4px 12px rgba(0,0,0,0.06)',
              transform: selectedEmotion?.id === emotion.id ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <span style={{ fontSize: '1.8rem' }}>{emotion.emoji}</span>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: selectedEmotion?.id === emotion.id ? 600 : 500,
                color: selectedEmotion?.id === emotion.id ? emotion.color : '#555',
              }}
            >
              {emotion.name}
            </span>
          </button>
        ))}
      </div>

      {selectedEmotion && (
        <div
          style={{
            background: `linear-gradient(135deg, ${selectedEmotion.bgColor}, #fff)`,
            borderRadius: '16px',
            padding: '1.5rem',
            maxWidth: '400px',
            margin: '0 auto 2rem',
            boxShadow: `0 8px 30px ${selectedEmotion.color}20`,
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{selectedEmotion.emoji}</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: selectedEmotion.color, marginBottom: '1rem' }}>
            你选择了：{selectedEmotion.name}
          </h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="添加备注（可选）..."
            rows={3}
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: '10px',
              border: `2px solid ${selectedEmotion.color}40`,
              resize: 'none',
              fontSize: '1rem',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.3s ease',
            }}
          />
          <button
            onClick={handleAddCard}
            style={{
              marginTop: '1rem',
              width: '100%',
              padding: '0.8rem',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: selectedEmotion.color,
              color: 'white',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: `0 4px 15px ${selectedEmotion.color}40`,
            }}
          >
            + 添加情绪卡片
          </button>
        </div>
      )}

      {selectedEmotions.length > 0 && (
        <div ref={containerRef}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#2C3E50', marginBottom: '1.5rem' }}>
            我的情绪卡片 ({selectedEmotions.length})
          </h3>
          
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem',
              maxWidth: '400px',
              margin: '0 auto 2rem',
            }}
          >
            {selectedEmotions.map((card, index) => (
              <div
                key={card.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: '12px',
                  backgroundColor: card.emotion.bgColor,
                  border: `2px solid ${card.emotion.color}30`,
                  cursor: 'grab',
                  transition: 'all 0.3s ease',
                  opacity: draggedIndex === index ? 0.5 : 1,
                  transform: hoveredIndex === index && draggedIndex !== null ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: hoveredIndex === index && draggedIndex !== null ? `0 8px 25px ${card.emotion.color}30` : '0 4px 12px rgba(0,0,0,0.08)',
                }}
              >
                <div style={{ fontSize: '2rem' }}>{card.emotion.emoji}</div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, color: card.emotion.color }}>{card.emotion.name}</div>
                  {card.note && (
                    <div style={{ fontSize: '0.85rem', color: '#7F8C8D', marginTop: '0.2rem' }}>
                      {card.note}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveCard(index)}
                  style={{
                    padding: '0.4rem 0.6rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#E8E8E8',
                    color: '#7F8C8D',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {dominantEmotion && (
            <div
              style={{
                background: `linear-gradient(135deg, ${dominantEmotion.bgColor}, #fff)`,
                borderRadius: '16px',
                padding: '1.5rem',
                maxWidth: '350px',
                margin: '0 auto 2rem',
                boxShadow: `0 8px 30px ${dominantEmotion.color}20`,
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{dominantEmotion.emoji}</div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 600, color: dominantEmotion.color }}>
                当前主导情绪
              </h4>
              <p style={{ color: '#7F8C8D', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                你今天的情绪主要是 {dominantEmotion.name}
              </p>
            </div>
          )}
        </div>
      )}

      {selectedEmotions.length === 0 && (
        <div
          className="card"
          style={{ maxWidth: '350px', margin: '0 auto 2rem', padding: '3rem', backgroundColor: '#F8F9FA' }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
          <p style={{ color: '#7F8C8D' }}>还没有情绪卡片，选择一个情绪开始记录吧</p>
        </div>
      )}

      <button
        className="btn btn-secondary"
        onClick={() => {
          if (selectedEmotions.length > 0) {
            onComplete?.();
          }
        }}
        disabled={selectedEmotions.length === 0}
        style={{
          opacity: selectedEmotions.length === 0 ? 0.5 : 1,
          cursor: selectedEmotions.length === 0 ? 'not-allowed' : 'pointer',
        }}
      >
        ← 返回
      </button>
    </div>
  );
}

export default EmotionCards;