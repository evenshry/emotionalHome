import { useCallback, useRef, useEffect } from 'react';

export type SoundType = 'bubble-pop' | 'complete' | 'click' | 'success' | 'error' | 'slide' | 'breath-in' | 'breath-out';

interface SoundOptions {
  volume?: number;
  rate?: number;
}

function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isEnabledRef = useRef(true);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
    if (!isEnabledRef.current) return;
    
    try {
      const ctx = initAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }, [initAudioContext]);

  const playNoise = useCallback((duration: number, volume: number = 0.3) => {
    if (!isEnabledRef.current) return;
    
    try {
      const ctx = initAudioContext();
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * volume;
      }
      
      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      source.buffer = buffer;
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      
      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      source.start(ctx.currentTime);
    } catch (e) {
      console.warn('Noise playback failed:', e);
    }
  }, [initAudioContext]);

  const playSound = useCallback((type: SoundType, options: SoundOptions = {}) => {
    const volume = options.volume ?? 0.3;
    const rate = options.rate ?? 1;
    
    switch (type) {
      case 'bubble-pop':
        playTone(800, 0.15 / rate, 'sine', volume);
        setTimeout(() => playNoise(0.1, volume * 0.5), 50);
        break;
        
      case 'complete':
        playTone(523, 0.15 / rate, 'sine', volume);
        setTimeout(() => playTone(659, 0.15 / rate, 'sine', volume), 150);
        setTimeout(() => playTone(784, 0.2 / rate, 'sine', volume), 300);
        break;
        
      case 'click':
        playTone(1200, 0.05 / rate, 'sine', volume * 0.5);
        break;
        
      case 'success':
        playTone(600, 0.1 / rate, 'sine', volume);
        setTimeout(() => playTone(800, 0.15 / rate, 'sine', volume), 100);
        break;
        
      case 'error':
        playTone(200, 0.2 / rate, 'sawtooth', volume);
        setTimeout(() => playTone(150, 0.2 / rate, 'sawtooth', volume), 200);
        break;
        
      case 'slide':
        playTone(400, 0.1 / rate, 'sine', volume * 0.3);
        break;
        
      case 'breath-in':
        playTone(200, 0.5 / rate, 'sine', volume * 0.2);
        break;
        
      case 'breath-out':
        playTone(150, 0.5 / rate, 'sine', volume * 0.2);
        break;
    }
  }, [playTone, playNoise]);

  const setEnabled = useCallback((enabled: boolean) => {
    isEnabledRef.current = enabled;
  }, []);

  const getEnabled = useCallback(() => isEnabledRef.current, []);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return { playSound, setEnabled, getEnabled };
}

export default useSound;