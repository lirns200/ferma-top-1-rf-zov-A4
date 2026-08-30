import React, { useState, useEffect } from 'react';
import { useGameStore } from '../game/gameState';
import { sounds } from '../audio/SoundManager';

export const CinematicIntroOverlay: React.FC = () => {
  const { introStage, setIntroStage } = useGameStore();
  const [fadeState, setFadeState] = useState<'showing' | 'clearing'>('showing');
  const [displayedTextIndex, setDisplayedTextIndex] = useState(0);

  const storyLines = [
    '🌲 В тихой, залитой утренним солнцем горной Долине...',
    '🚚 Вы приехали на своём стареньком, но верном красном пикапе на семейный участок.',
    '🌾 Земля здесь плодородна и полна надежд. Пришло время вдохнуть в неё жизнь!',
    '🏡 Давайте вместе построим процветающее хозяйство!'
  ];

  useEffect(() => {
    if (introStage === 'completed') return;
    const timer = setInterval(() => {
      setDisplayedTextIndex(prev => (prev < storyLines.length - 1 ? prev + 1 : prev));
    }, 2400);
    return () => clearInterval(timer);
  }, [introStage, storyLines.length]);

  // If already completed, do not render
  if (introStage === 'completed') return null;

  const handleStartAdventure = () => {
    sounds.playClick();
    sounds.playLevelUp();
    setFadeState('clearing');
    setIntroStage('dispersing');
    setTimeout(() => {
      setIntroStage('completed');
    }, 1200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center select-none transition-all duration-1000 ${
        fadeState === 'clearing' ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 pointer-events-auto'
      }`}
      style={{
        background: 'radial-gradient(circle at 50% 40%, rgba(254, 243, 199, 0.96) 0%, rgba(241, 245, 249, 0.98) 50%, rgba(226, 232, 240, 0.99) 100%)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div className="relative z-10 max-w-lg w-11/12 mx-auto p-6 sm:p-8 rounded-3xl text-center shadow-2xl border-4 border-amber-600/80 transform transition-all"
        style={{
          background: 'linear-gradient(180deg, #3d2208 0%, #231206 100%)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.2)',
        }}
      >
        <div className="w-20 h-20 mx-auto -mt-16 mb-4 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 border-4 border-yellow-200 flex items-center justify-center text-4xl shadow-xl animate-bounce">
          🌾
        </div>
        <h1 className="text-lg sm:text-2xl font-bold text-yellow-300 drop-shadow mb-2 font-['Press_Start_2P']">
          ФЕРМА В ДОЛИНЕ
        </h1>
        <div className="h-0.5 w-3/4 mx-auto bg-gradient-to-r from-transparent via-amber-500 to-transparent my-4" />
        <div className="space-y-3 min-h-[130px] flex flex-col justify-center my-4 text-amber-100 font-sans text-sm sm:text-base leading-relaxed">
          {storyLines.slice(0, displayedTextIndex + 1).map((line, idx) => (
            <p key={idx} className="animate-fade-in transition-all"
              style={{
                textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                color: idx === displayedTextIndex ? '#FEF08A' : '#FDE68A',
                fontWeight: idx === displayedTextIndex ? 600 : 400,
              }}
            >
              {line}
            </p>
          ))}
        </div>
        <div className="mt-6 pt-3">
          <button onClick={handleStartAdventure}
            className="w-full py-3.5 px-6 rounded-2xl font-['Press_Start_2P'] text-xs sm:text-sm text-white shadow-xl transition-all duration-200 active:scale-95 border-2 border-green-300 animate-pulse hover:brightness-110"
            style={{
              background: 'linear-gradient(180deg, #22C55E 0%, #15803D 100%)',
              boxShadow: '0 8px 24px rgba(34, 197, 94, 0.45)',
            }}
          >
            🌾 НАЧАТЬ ПРИКЛЮЧЕНИЕ ▶
          </button>
        </div>
        <p className="text-[10px] text-amber-400/80 mt-3 font-sans">
          Дядя Семён встретит вас и поможет возвести первые постройки
        </p>
      </div>
    </div>
  );
};
