import { useRef, useState, useEffect } from 'react';
import { updateStats, saveMoodHistory } from '@utils/storage';

interface DrawCanvasProps {
  onComplete?: () => void;
}

interface BrushTrail {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
}

interface Point {
  x: number;
  y: number;
}

function DrawCanvas({ onComplete }: DrawCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const historyRef = useRef<string[]>([]);
  const lastPointRef = useRef<Point | null>(null);
  const [currentColor, setCurrentColor] = useState('#E74C3C');
  const [brushSize, setBrushSize] = useState(8);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [brushTrails, setBrushTrails] = useState<BrushTrail[]>([]);

  const colors = ['#E74C3C', '#F39C12', '#2ECC71', '#3498DB', '#9B59B6', '#1ABC9C', '#000000'];
  const brushSizes = [4, 8, 16, 24];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = 400 * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = '400px';
      ctx.scale(dpr, dpr);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      saveState();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    historyRef.current.push(canvas.toDataURL());
    if (historyRef.current.length > 20) {
      historyRef.current.shift();
    }
    setCanUndo(historyRef.current.length > 1);
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawingRef.current = true;
    setHasDrawn(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = currentColor;
    ctx.fill();
    
    lastPointRef.current = pos;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = currentColor;
    ctx.shadowBlur = brushSize * 0.3;
    
    const lastPoint = lastPointRef.current;
    if (lastPoint) {
      const midX = (lastPoint.x + pos.x) / 2;
      const midY = (lastPoint.y + pos.y) / 2;
      
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, midX, midY);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.quadraticCurveTo(pos.x, pos.y, pos.x, pos.y);
      ctx.stroke();
    }
    
    ctx.shadowBlur = 0;
    lastPointRef.current = pos;

    const newTrail: BrushTrail = {
      id: Date.now(),
      x: pos.x,
      y: pos.y,
      size: brushSize * 2,
      color: currentColor,
      opacity: 0.6,
    };
    setBrushTrails((prev) => [...prev.slice(-10), newTrail]);
    setTimeout(() => {
      setBrushTrails((prev) => prev.filter((t) => t.id !== newTrail.id));
    }, 300);
  };

  const stopDrawing = () => {
    if (isDrawingRef.current) {
      saveState();
    }
    isDrawingRef.current = false;
  };

  const undo = () => {
    if (historyRef.current.length <= 1) return;
    historyRef.current.pop();
    const prevState = historyRef.current[historyRef.current.length - 1];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = prevState;
    setCanUndo(historyRef.current.length > 1);
    if (historyRef.current.length <= 1) {
      setHasDrawn(false);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    historyRef.current = [canvas.toDataURL()];
    setHasDrawn(false);
    setCanUndo(false);
    setShowClearConfirm(false);
  };

  const handleComplete = () => {
    if (!hasDrawn) return;
    saveMoodHistory({
      mood: '释放',
      intensity: 100,
      description: '涂鸦发泄',
    });
    updateStats();
    if (onComplete) onComplete();
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => setCurrentColor(color)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: color,
                border: currentColor === color ? '3px solid #2C3E50' : '2px solid #E0E0E0',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transform: currentColor === color ? 'scale(1.2)' : 'scale(1)',
                boxShadow: currentColor === color ? `0 0 12px ${color}` : 'none',
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: '#7F8C8D' }}>画笔:</span>
          {brushSizes.map((size) => (
            <button
              key={size}
              onClick={() => setBrushSize(size)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: brushSize === size ? currentColor : '#E8E8E8',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transform: brushSize === size ? 'scale(1.15)' : 'scale(1)',
              }}
            >
              <div
                style={{
                  width: Math.min(size, 16),
                  height: Math.min(size, 16),
                  borderRadius: '50%',
                  background: brushSize === size ? 'white' : '#7F8C8D',
                }}
              />
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={undo} disabled={!canUndo} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            ↩️ 撤销
          </button>
          <button className="btn btn-secondary" onClick={() => hasDrawn && setShowClearConfirm(true)} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            🗑️ 清空
          </button>
        </div>
      </div>

      <div
        style={{
          border: '2px solid #E8E8E8',
          borderRadius: '16px',
          overflow: 'hidden',
          background: 'white',
          cursor: 'crosshair',
          position: 'relative',
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        {brushTrails.map((trail) => (
          <div
            key={trail.id}
            style={{
              position: 'absolute',
              left: trail.x - trail.size / 2,
              top: trail.y - trail.size / 2,
              width: trail.size,
              height: trail.size,
              borderRadius: '50%',
              background: trail.color,
              opacity: trail.opacity,
              animation: 'fadeOut 0.3s ease forwards',
              pointerEvents: 'none',
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes fadeOut {
          from { opacity: 0.6; transform: scale(1); }
          to { opacity: 0; transform: scale(1.5); }
        }
      `}</style>

      {showClearConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <div className="card animate-bounce-in" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗑️</div>
            <p style={{ marginBottom: '1.5rem' }}>确定要清空画布吗？</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setShowClearConfirm(false)}>取消</button>
              <button className="btn btn-primary" onClick={clearCanvas} style={{ background: '#E74C3C' }}>确认清空</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <button className="btn btn-primary" onClick={handleComplete} disabled={!hasDrawn}>
          完成发泄，继续 →
        </button>
      </div>
    </div>
  );
}

export default DrawCanvas;
