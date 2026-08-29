import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../game/gameState';

interface AnimatedText {
  id: string;
  text: string;
  color: string;
  x: number; // percent 20..80
  y: number; // percent 20..60
  born: number;
}

export const FloatingTextsOverlay: React.FC = () => {
  const { floatingTexts } = useGameStore();
  const [animated, setAnimated] = useState<AnimatedText[]>([]);
  const seenIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    floatingTexts.forEach(ft => {
      if (!seenIds.current.has(ft.id)) {
        seenIds.current.add(ft.id);
        const x = 20 + Math.random() * 60; // random 20%–80% of screen width
        const y = 25 + Math.random() * 35; // random 25%–60% of screen height
        setAnimated(prev => [...prev, { ...ft, x, y, born: Date.now() }]);
        // Clean up after animation completes
        setTimeout(() => {
          setAnimated(prev => prev.filter(a => a.id !== ft.id));
          seenIds.current.delete(ft.id);
        }, 1400);
      }
    });
  }, [floatingTexts]);

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden font-['Fredoka',sans-serif]">
      {animated.map(ft => (
        <div
          key={ft.id}
          className="absolute font-black text-xl sm:text-2xl select-none"
          style={{
            left: `${ft.x}%`,
            top: `${ft.y}%`,
            color: ft.color,
            textShadow: '0 2px 8px rgba(0,0,0,0.85), 0 0 12px rgba(0,0,0,0.5)',
            WebkitTextStroke: '0.5px rgba(0,0,0,0.4)',
            animation: 'floatUp 1.4s ease-out forwards',
            transform: 'translateX(-50%)',
          }}
        >
          {ft.text}
        </div>
      ))}
      <style>{`
        @keyframes floatUp {
          0%   { opacity: 0;   transform: translateX(-50%) translateY(0px)   scale(0.7); }
          15%  { opacity: 1;   transform: translateX(-50%) translateY(-8px)  scale(1.15); }
          40%  { opacity: 1;   transform: translateX(-50%) translateY(-24px) scale(1); }
          100% { opacity: 0;   transform: translateX(-50%) translateY(-64px) scale(0.9); }
        }
      `}</style>
    </div>
  );
};
