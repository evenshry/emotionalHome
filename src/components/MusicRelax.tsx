import { useState, useRef, useEffect } from 'react';

interface SoundOption {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
}

const SOUND_OPTIONS: SoundOption[] = [
  { id: 'rain', name: '雨声', icon: '🌧️', color: '#6BA3BE', bgColor: '#E8F4F8' },
  { id: 'forest', name: '森林', icon: '🌲', color: '#1ABC9C', bgColor: '#E8F5F1' },
  { id: 'waves', name: '海浪', icon: '🌊', color: '#3498DB', bgColor: '#EBF5FB' },
  { id: 'fire', name: '篝火', icon: '🔥', color: '#E74C3C', bgColor: '#FDF2E9' },
  { id: 'birds', name: '鸟鸣', icon: '🐦', color: '#2ECC71', bgColor: '#F0FFF4' },
  { id: 'cafe', name: '咖啡馆', icon: '☕', color: '#9B59B6', bgColor: '#F5EEF8' },
];

interface MusicRelaxProps {
  onComplete?: () => void;
}

function MusicRelax({ onComplete }: MusicRelaxProps) {
  const [selectedSound, setSelectedSound] = useState<SoundOption | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<number | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const generateWhiteNoise = () => {
    if (!audioContextRef.current) return null;
    
    const bufferSize = 2 * audioContextRef.current.sampleRate;
    const noiseBuffer = audioContextRef.current.createBuffer(1, bufferSize, audioContextRef.current.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const whiteNoise = audioContextRef.current.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    
    return whiteNoise;
  };

  const playRainSound = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    
    const ctx = audioContextRef.current;
    const noise = generateWhiteNoise();
    if (!noise) return;
    
    noiseNodeRef.current = noise;
    
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 400;
    
    const gainNode = ctx.createGain();
    gainNode.gain.value = volume * 0.3;
    gainNodeRef.current = gainNode;
    
    noise.connect(lowpass);
    lowpass.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noise.start();
  };

  const playForestSound = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    
    const ctx = audioContextRef.current;
    const noise = generateWhiteNoise();
    if (!noise) return;
    
    noiseNodeRef.current = noise;
    
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 800;
    
    const gainNode = ctx.createGain();
    gainNode.gain.value = volume * 0.25;
    gainNodeRef.current = gainNode;
    
    noise.connect(lowpass);
    lowpass.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noise.start();
  };

  const playWavesSound = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    
    const ctx = audioContextRef.current;
    
    const noise = generateWhiteNoise();
    if (!noise) return;
    
    noiseNodeRef.current = noise;
    
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 600;
    
    const gainNode = ctx.createGain();
    gainNodeRef.current = gainNode;
    gainNode.gain.value = volume * 0.3;
    
    noise.connect(lowpass);
    lowpass.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noise.start();
    
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.1;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = volume * 0.15;
    
    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);
    lfo.start();
  };

  const playFireSound = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    
    const ctx = audioContextRef.current;
    const noise = generateWhiteNoise();
    if (!noise) return;
    
    noiseNodeRef.current = noise;
    
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 200;
    
    const gainNode = ctx.createGain();
    gainNode.gain.value = volume * 0.2;
    gainNodeRef.current = gainNode;
    
    noise.connect(lowpass);
    lowpass.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noise.start();
  };

  const playBirdsSound = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    
    const ctx = audioContextRef.current;
    
    const playChirp = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2000 + Math.random() * 1000, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(3000 + Math.random() * 1500, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(volume * 0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    };
    
    const interval = setInterval(() => {
      if (Math.random() > 0.5) playChirp();
    }, 500 + Math.random() * 1500);
    
    intervalRef.current = interval;
  };

  const playCafeSound = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    
    const ctx = audioContextRef.current;
    const noise = generateWhiteNoise();
    if (!noise) return;
    
    noiseNodeRef.current = noise;
    
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 1000;
    
    const gainNode = ctx.createGain();
    gainNode.gain.value = volume * 0.15;
    gainNodeRef.current = gainNode;
    
    noise.connect(lowpass);
    lowpass.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noise.start();
  };

  const stopSound = () => {
    if (noiseNodeRef.current) {
      noiseNodeRef.current.stop();
      noiseNodeRef.current = null;
    }
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopSound();
      setIsPlaying(false);
    } else {
      if (!selectedSound) return;
      
      switch (selectedSound.id) {
        case 'rain':
          playRainSound();
          break;
        case 'forest':
          playForestSound();
          break;
        case 'waves':
          playWavesSound();
          break;
        case 'fire':
          playFireSound();
          break;
        case 'birds':
          playBirdsSound();
          break;
        case 'cafe':
          playCafeSound();
          break;
      }
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume * (selectedSound?.id === 'birds' ? 1 : 0.3);
    }
  }, [volume]);

  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setProgress((prev) => Math.min(prev + 1, 100));
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      stopSound();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="page-container" style={{ textAlign: 'center', padding: '2rem' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '2rem', color: '#2C3E50' }}>
        🎵 音乐放松
      </h2>
      
      <p style={{ color: '#7F8C8D', marginBottom: '2rem', fontSize: '1.1rem' }}>
        选择一种声音，让身心放松下来
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '1rem',
          maxWidth: '600px',
          margin: '0 auto 2rem',
        }}
      >
        {SOUND_OPTIONS.map((sound) => (
          <button
            key={sound.id}
            onClick={() => {
              if (isPlaying) {
                stopSound();
                setIsPlaying(false);
              }
              setSelectedSound(sound);
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1.2rem 1rem',
              borderRadius: '16px',
              border: selectedSound?.id === sound.id ? `2px solid ${sound.color}` : '2px solid transparent',
              backgroundColor: selectedSound?.id === sound.id ? sound.bgColor : '#FAFBFC',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: selectedSound?.id === sound.id ? `0 8px 25px ${sound.color}30` : '0 4px 15px rgba(0,0,0,0.08)',
              transform: selectedSound?.id === sound.id ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <span style={{ fontSize: '2rem' }}>{sound.icon}</span>
            <span
              style={{
                fontSize: '0.9rem',
                fontWeight: selectedSound?.id === sound.id ? 600 : 500,
                color: selectedSound?.id === sound.id ? sound.color : '#555',
              }}
            >
              {sound.name}
            </span>
          </button>
        ))}
      </div>

      {selectedSound && (
        <div
          style={{
            background: `linear-gradient(135deg, ${selectedSound.bgColor}, #fff)`,
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '400px',
            margin: '0 auto',
            boxShadow: `0 10px 40px ${selectedSound.color}20`,
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{selectedSound.icon}</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: selectedSound.color, marginBottom: '1.5rem' }}>
            {selectedSound.name}
          </h3>

          <button
            onClick={togglePlay}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: selectedSound.color,
              color: 'white',
              fontSize: '2rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: `0 6px 20px ${selectedSound.color}50`,
              transform: isPlaying ? 'scale(0.95)' : 'scale(1)',
            }}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>

          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: '#7F8C8D' }}>音量</span>
              <span style={{ fontSize: '0.9rem', color: selectedSound.color }}>{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                backgroundColor: '#E8E8E8',
                appearance: 'none',
                cursor: 'pointer',
              }}
            />
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: '#7F8C8D' }}>进度</span>
              <span style={{ fontSize: '0.9rem', color: selectedSound.color }}>{progress}%</span>
            </div>
            <div
              style={{
                height: '4px',
                borderRadius: '2px',
                backgroundColor: '#E8E8E8',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${selectedSound.color}, ${selectedSound.color}99)`,
                  borderRadius: '2px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {isPlaying && (
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '6px',
                    height: '20px',
                    backgroundColor: selectedSound.color,
                    borderRadius: '3px',
                    animation: `soundWave 0.8s ease-in-out ${i * 0.15}s infinite`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedSound && (
        <div
          className="card"
          style={{ maxWidth: '400px', margin: '0 auto', padding: '3rem', backgroundColor: '#F8F9FA' }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎧</div>
          <p style={{ color: '#7F8C8D' }}>请先选择一种放松声音</p>
        </div>
      )}

      <button
        className="btn btn-secondary"
        onClick={onComplete}
        style={{ marginTop: '2rem' }}
      >
        ← 返回
      </button>

      <style>{`
        @keyframes soundWave {
          0%, 100% { transform: scaleY(0.3); opacity: 0.5; }
          50% { transform: scaleY(1); opacity: 1; }
        }
        
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: ${selectedSound?.color || '#6BA3BE'};
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: ${selectedSound?.color || '#6BA3BE'};
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
      `}</style>
    </div>
  );
}

export default MusicRelax;