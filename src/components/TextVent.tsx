import { useRef, useState } from 'react';
import { updateStats, saveMoodHistory } from '@utils/storage';

interface TextVentProps {
  onComplete?: () => void;
}

interface ShredPiece {
  x: number;
  y: number;
  width: number;
  height: number;
  points: { x: number; y: number }[];
  rotation: number;
  velocityX: number;
  velocityY: number;
  rotationSpeed: number;
  opacity: number;
  scale: number;
  gravity: number;
  delay: number;
  ashProgress: number;
  isAsh: boolean;
  color: string;
  isOnGround?: boolean;
  groundTime?: number;
}

function TextVent({ onComplete }: TextVentProps) {
  const [textContent, setTextContent] = useState('');
  const [isShredding, setIsShredding] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const showModal = () => {
    if (modalRef.current) return;

    const modalContainer = document.createElement('div');
    modalContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease forwards;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 2rem;
      max-width: 400px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    `;

    modalContent.innerHTML = `
      <div style="font-size: 4rem; margin-bottom: 1rem; animation: bounceIn 0.5s ease;">
        ✨
      </div>
      <h3 style="font-size: 1.4rem; font-weight: 700; color: #2C3E50; margin-bottom: 0.5rem;">
        释放成功！
      </h3>
      <p style="font-size: 1rem; color: #7F8C8D; margin-bottom: 1.5rem; line-height: 1.6;">
        烦恼已经被撕碎并化为灰烬，<br>你的心情有没有轻松一点呢？
      </p>
      <div style="display: flex; gap: 1rem; justify-content: center;">
        <button 
          id="continue-btn"
          style="padding: 0.8rem 2rem; font-size: 1rem; background: linear-gradient(135deg, #FF8C66, #6BA3BE); color: white; border: none; border-radius: 25px; cursor: pointer; transition: all 0.3s ease; font-weight: 600;"
          onmouseover="this.style.transform='scale(1.05)'"
          onmouseout="this.style.transform='scale(1)'"
        >
          继续写
        </button>
        <button 
          id="complete-btn"
          style="padding: 0.8rem 2rem; font-size: 1rem; background: rgba(255, 140, 102, 0.1); color: #FF8C66; border: 2px solid #FF8C66; border-radius: 25px; cursor: pointer; transition: all 0.3s ease; font-weight: 600;"
          onmouseover="this.style.transform='scale(1.05)'"
          onmouseout="this.style.transform='scale(1)'"
        >
          完成
        </button>
      </div>
    `;

    modalContainer.appendChild(modalContent);
    document.body.appendChild(modalContainer);
    modalRef.current = modalContainer;

    const closeModal = () => {
      if (modalRef.current) {
        document.body.removeChild(modalRef.current);
        modalRef.current = null;
      }
    };

    document.getElementById('continue-btn')?.addEventListener('click', closeModal);
    document.getElementById('complete-btn')?.addEventListener('click', () => {
      closeModal();
      saveMoodHistory({
        mood: '释放',
        intensity: 100,
        description: textContent.slice(0, 50),
      });
      updateStats();
      if (onComplete) onComplete();
    });
    modalContainer.addEventListener('click', closeModal);
    modalContent.addEventListener('click', (e) => e.stopPropagation());
  };

  const handleShred = () => {
    if (!textContent.trim()) return;

    setIsShredding(true);

    const paper = paperRef.current;
    if (!paper) return;

    const rect = paper.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const pieces: ShredPiece[] = [];
    const numPieces = 50;

    for (let i = 0; i < numPieces; i++) {
      const baseX = rect.left + Math.random() * rect.width;
      const baseY = rect.top + Math.random() * rect.height;

      const sizeFactor = 0.7 + Math.random() * 0.8;
      const baseSize = Math.min(rect.width, rect.height) / 3;
      const width = baseSize * sizeFactor;
      const height = baseSize * sizeFactor;

      const points: { x: number; y: number }[] = [];
      const numPoints = 3 + Math.floor(Math.random() * 3);
      for (let j = 0; j < numPoints; j++) {
        const angle = (j / numPoints) * Math.PI * 2 + Math.random() * 0.6 - 0.3;
        const radius = (0.7 + Math.random() * 0.3) * (j % 2 === 0 ? 1 : 0.8);
        points.push({
          x: Math.cos(angle) * width / 2 * radius,
          y: Math.sin(angle) * height / 2 * radius,
        });
      }

      pieces.push({
        x: baseX + (Math.random() - 0.5) * 40,
        y: baseY + (Math.random() - 0.5) * 40,
        width,
        height,
        points,
        rotation: Math.random() * 30 - 15,
        velocityX: (Math.random() - 0.5) * 45 - 5,
        velocityY: -Math.random() * 35 - 12,
        rotationSpeed: (Math.random() - 0.5) * 40,
        opacity: 1,
        scale: 1,
        gravity: 0.35 + Math.random() * 0.45,
        delay: Math.random() * 0.25,
        ashProgress: 0,
        isAsh: false,
        color: `hsl(${30 + Math.random() * 20}, ${60 + Math.random() * 30}%, ${80 + Math.random() * 15}%)`,
        isOnGround: false,
        groundTime: undefined,
      });
    }

    let startTime: number | null = null;
    const delay = 200;
    const groundY = window.innerHeight;
    const wallLeft = 0;
    const wallRight = window.innerWidth;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (elapsed < delay) {
        requestAnimationFrame(animate);
        return;
      }

      const flyElapsed = elapsed - delay;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      let allOnGroundAndFaded = true;

      pieces.forEach((piece) => {
        if (!piece.isOnGround) {
          piece.x += piece.velocityX;
          piece.y += piece.velocityY;
          piece.velocityY += piece.gravity;
          piece.rotation += piece.rotationSpeed;

          const pieceBottom = piece.y + piece.height;
          const pieceTop = piece.y;
          const pieceLeft = piece.x;
          const pieceRight = piece.x + piece.width;

          if (pieceBottom >= groundY) {
            piece.y = groundY - piece.height;
            piece.velocityY = -piece.velocityY * 0.4;
            piece.velocityX *= 0.7;
            piece.rotationSpeed *= 0.5;

            if (Math.abs(piece.velocityY) < 2) {
              piece.isOnGround = true;
              piece.groundTime = flyElapsed;
            }
          }

          if (pieceLeft <= wallLeft) {
            piece.x = wallLeft;
            piece.velocityX = -piece.velocityX * 0.6;
          }

          if (pieceRight >= wallRight) {
            piece.x = wallRight - piece.width;
            piece.velocityX = -piece.velocityX * 0.6;
          }

          if (pieceTop <= 0) {
            piece.y = 0;
            piece.velocityY = -piece.velocityY * 0.6;
          }

          allOnGroundAndFaded = false;
        } else {
          const groundTime = flyElapsed - (piece.groundTime ?? 0);
          const fadeDuration = 2000;

          if (groundTime < fadeDuration) {
            piece.opacity = 1 - groundTime / fadeDuration;
            piece.isAsh = true;
            allOnGroundAndFaded = false;
          } else {
            piece.opacity = 0;
          }
        }

        if (piece.opacity <= 0) return;

        ctx.save();
        ctx.translate(piece.x + piece.width / 2, piece.y + piece.height / 2);
        ctx.rotate((piece.rotation * Math.PI) / 180);
        ctx.scale(piece.scale, piece.scale);
        ctx.globalAlpha = piece.opacity;

        if (piece.isAsh) {
          ctx.fillStyle = '#95A5A6';
          ctx.globalAlpha = piece.opacity * 0.5;
        } else {
          ctx.fillStyle = piece.color;
        }

        ctx.beginPath();
        if (piece.points && piece.points.length > 0) {
          ctx.moveTo(piece.points[0].x, piece.points[0].y);
          for (let p = 1; p < piece.points.length; p++) {
            ctx.lineTo(piece.points[p].x, piece.points[p].y);
          }
          ctx.closePath();
        } else {
          const w = piece.width;
          const h = piece.height;
          ctx.moveTo(-w / 2 + Math.random() * 3, -h / 2);
          ctx.lineTo(w / 2 - Math.random() * 3, -h / 2 + Math.random() * 4);
          ctx.lineTo(w / 2 + Math.random() * 3, h / 2);
          ctx.lineTo(-w / 2, h / 2 - Math.random() * 4);
          ctx.closePath();
        }
        ctx.fill();

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.lineWidth = 0.6;
        ctx.stroke();

        if (piece.isAsh && piece.opacity > 0.3) {
          for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(
              (Math.random() - 0.5) * piece.width * 0.8,
              (Math.random() - 0.5) * piece.height * 0.8,
              Math.random() * 4 + 1.5,
              0,
              Math.PI * 2
            );
            ctx.fillStyle = `rgba(150, 150, 150, ${piece.opacity * 0.25})`;
            ctx.fill();
          }
        }

        ctx.restore();
      });

      if (!allOnGroundAndFaded) {
        requestAnimationFrame(animate);
      } else {
        setTextContent('');
        setCharCount(0);
        document.body.removeChild(canvas);
        setIsShredding(false);
        setTimeout(showModal, 300);
      }
    };

    requestAnimationFrame(animate);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setTextContent(text);
    setCharCount(text.length);
  };

  const getPaperShadow = () => {
    if (charCount === 0) return '0 4px 20px rgba(0, 0, 0, 0.08)';
    if (charCount < 50) return '0 6px 24px rgba(255, 140, 102, 0.15)';
    if (charCount < 100) return '0 8px 28px rgba(255, 140, 102, 0.25)';
    if (charCount < 200) return '0 10px 32px rgba(231, 76, 60, 0.3)';
    return '0 12px 36px rgba(231, 76, 60, 0.4), 0 0 60px rgba(231, 76, 60, 0.2)';
  };

  const getPaperBorder = () => {
    if (charCount === 0) return '#E8E8E8';
    if (charCount < 50) return '#FFE5D9';
    if (charCount < 100) return '#FFD4BC';
    if (charCount < 200) return '#FFC4A3';
    return '#FF8C66';
  };

  const getShredButtonText = () => {
    if (isShredding) return '🗑️ 撕碎中...';
    if (charCount === 0) return '🗑️ 写下你的烦恼';
    if (charCount < 30) return '🗑️ 继续写...';
    if (charCount < 100) return '🗑️ 撕碎它';
    return '🗑️ 全部释放';
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#555', marginBottom: '0.3rem' }}>
            把烦恼写下来，然后撕碎它
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#95A5A6' }}>
            这里是你的安全空间，写下所有不愉快的事情
          </p>
        </div>
        <div
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: charCount > 0 ? '#FF8C66' : '#BDC3C7',
            transition: 'all 0.3s ease',
            background: charCount > 0 ? 'rgba(255, 140, 102, 0.1)' : 'transparent',
            padding: '0.3rem 0.8rem',
            borderRadius: '20px',
          }}
        >
          {charCount} 字
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <div
          ref={paperRef}
          style={{
            position: 'relative',
            borderRadius: '4px',
            background: 'linear-gradient(135deg, #FFFDF9 0%, #FFF8F0 100%)',
            boxShadow: getPaperShadow(),
            border: `2px solid ${getPaperBorder()}`,
            transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            opacity: isShredding ? 0 : 1,
            transform: isShredding ? 'scale(0.95)' : 'scale(1)',
            animation: charCount > 150 && !isShredding ? 'glow 2s ease-in-out infinite' : 'none',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '40px',
              background: 'linear-gradient(135deg, rgba(255, 140, 102, 0.05), rgba(212, 165, 255, 0.05))',
              borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            }}
          />

          <textarea
            ref={textareaRef}
            className="textarea"
            value={textContent}
            onChange={handleTextChange}
            placeholder="亲爱的日记...&#10;&#10;今天让我把所有不愉快的事情都倒出来..."
            style={{
              border: 'none',
              background: 'transparent',
              minHeight: '250px',
              padding: '3rem 2rem 2rem',
              fontSize: '1.05rem',
              lineHeight: '1.8',
              fontFamily: "'Nunito', 'Quicksand', sans-serif",
              color: '#555',
              resize: 'none',
            }}
            disabled={isShredding}
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '2rem',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <button
          className="btn btn-primary"
          onClick={handleShred}
          disabled={!textContent.trim() || isShredding}
          style={{
            padding: '1rem 2.5rem',
            fontSize: '1.05rem',
            animation: textContent.trim() && !isShredding && charCount > 50 ? 'wiggle 2s ease-in-out infinite' : 'none',
            background: charCount > 100
              ? 'linear-gradient(135deg, #E74C3C, #FF8C66)'
              : 'linear-gradient(135deg, #FF8C66, #6BA3BE)',
            opacity: isShredding ? 0.7 : 1,
          }}
        >
          {isShredding ? (
            <>
              <span className="animate-pulse">✂️</span> 撕碎中...
            </>
          ) : (
            getShredButtonText()
          )}
        </button>
      </div>

      {charCount > 30 && charCount < 100 && (
        <div
          style={{
            textAlign: 'center',
            marginTop: '1rem',
            animation: 'fadeInUp 0.5s ease forwards',
          }}
        >
          <span style={{ fontSize: '0.9rem', color: '#95A5A6', fontStyle: 'italic' }}>
            ✍️ 继续写，把情绪都释放出来...
          </span>
        </div>
      )}

      {charCount >= 100 && !isShredding && (
        <div
          style={{
            textAlign: 'center',
            marginTop: '1rem',
            animation: 'fadeInUp 0.5s ease forwards',
          }}
        >
          <span style={{ fontSize: '0.9rem', color: '#FF8C66', fontWeight: 600 }}>
            💪 写了很多呢！准备好释放它们了吗？
          </span>
        </div>
      )}
    </div>
  );
}

export default TextVent;
