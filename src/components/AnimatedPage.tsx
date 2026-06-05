import React, { useEffect, useState } from 'react';

export type AnimationType = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale-in' | 'slide-up' | 'slide-down';

interface AnimatedPageProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
}

const animationStyles: Record<AnimationType, { enter: string; exit: string }> = {
  'fade-up': {
    enter: 'opacity: 1; transform: translateY(0);',
    exit: 'opacity: 0; transform: translateY(30px);',
  },
  'fade-down': {
    enter: 'opacity: 1; transform: translateY(0);',
    exit: 'opacity: 0; transform: translateY(-30px);',
  },
  'fade-left': {
    enter: 'opacity: 1; transform: translateX(0);',
    exit: 'opacity: 0; transform: translateX(-30px);',
  },
  'fade-right': {
    enter: 'opacity: 1; transform: translateX(0);',
    exit: 'opacity: 0; transform: translateX(30px);',
  },
  'scale-in': {
    enter: 'opacity: 1; transform: scale(1);',
    exit: 'opacity: 0; transform: scale(0.9);',
  },
  'slide-up': {
    enter: 'opacity: 1; transform: translateY(0);',
    exit: 'opacity: 0; transform: translateY(100%);',
  },
  'slide-down': {
    enter: 'opacity: 1; transform: translateY(0);',
    exit: 'opacity: 0; transform: translateY(-100%);',
  },
};

function AnimatedPage({ children, animation = 'fade-up', delay = 50, duration = 600 }: AnimatedPageProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const currentStyle = isVisible ? animationStyles[animation].enter : animationStyles[animation].exit;
  const opacity = currentStyle.includes('opacity: 0') ? 0 : 1;
  const transform = currentStyle.includes('translateY(0)') ? 'translateY(0)' :
                    currentStyle.includes('translateY(30px)') ? 'translateY(30px)' :
                    currentStyle.includes('translateY(-30px)') ? 'translateY(-30px)' :
                    currentStyle.includes('translateX(0)') ? 'translateX(0)' :
                    currentStyle.includes('translateX(-30px)') ? 'translateX(-30px)' :
                    currentStyle.includes('translateX(30px)') ? 'translateX(30px)' :
                    currentStyle.includes('scale(1)') ? 'scale(1)' :
                    currentStyle.includes('scale(0.9)') ? 'scale(0.9)' :
                    currentStyle.includes('translateY(100%)') ? 'translateY(100%)' :
                    currentStyle.includes('translateY(-100%)') ? 'translateY(-100%)' : 'translateY(0)';

  return (
    <div
      className="page-container"
      style={{
        opacity,
        transform,
        transition: `opacity ${duration}ms cubic-bezier(0.175, 0.885, 0.32, 1.275), transform ${duration}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`,
      }}
    >
      {children}
    </div>
  );
}

export default AnimatedPage;