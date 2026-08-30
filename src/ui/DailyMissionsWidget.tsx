import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../game/gameState';
import { sounds } from '../audio/SoundManager';
import { triggerTelegramHaptic } from '../utils/telegram';
import { Target, CheckCircle2, Gift, Clock, Sparkles, X, ChevronDown, Award } from 'lucide-react';

const CoinSvg = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="shrink-0 inline-block">
    <circle cx="12" cy="12" r="10" fill="url(#coin_dm_g)" stroke="#92400E" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="7.5" stroke="#FEF08A" strokeWidth="1" strokeDasharray="2.5 1" />
    <text x="12" y="16" fontSize="11" fontWeight="900" fill="#78350F" textAnchor="middle" fontFamily="sans-serif">🪙</text>
    <defs>
      <linearGradient id="coin_dm_g" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
  </svg>
);
const ScrollSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0">
    <path d="M19 3H7C5.34315 3 4 4.34315 4 6C4 7.65685 5.34315 9 7 9H17C18.6569 9 20 10.3431 20 12V18C20 19.6569 18.6569 21 17 21H7C5.34315 21 4 19.6569 4 18V6" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 7H16" stroke="#FDE047" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M8 13H15" stroke="#FEF3C7" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M8 17H13" stroke="#FEF3C7" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="16" cy="17" r="2.5" fill="#EF4444" stroke="#991B1B" strokeWidth="0.8" />
  </svg>
);

export const DailyMissionsWidget: React.FC = () => {
  const { dailyMissions, dailyMissionsExpiresAt, claimDailyMission } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeftStr, setTimeLeftStr] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTimer = () => {
      const remainingMs = Math.max(0, dailyMissionsExpiresAt - Date.now());
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeftStr(`${hours}ч ${String(mins).padStart(2, '0')}м`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 30000);
    return () => clearInterval(interval);
  }, [dailyMissionsExpiresAt]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const completedCount = dailyMissions.filter(m => m.isClaimed).length;
  const hasReadyToClaim = dailyMissions.some(m => !m.isClaimed && m.currentCount >= m.targetCount);

  return (
    <div ref={popoverRef} className="relative z-40">
      
      {/* ── CARVED WOOD QUEST BOARD BUTTON ── */}
      <button
        onClick={() => {
          sounds.playClick();
          triggerTelegramHaptic('light');
          setIsOpen(prev => !prev);
        }}
        className={`game-badge-wood w-full flex items-center justify-between px-2 py-1 sm:py-1.5 active:scale-95 transition-all cursor-pointer ${
          hasReadyToClaim ? 'ring-2 ring-emerald-400 animate-pulse' : ''
        }`}
        title="Ежедневные задания"
      >
        <div className="flex items-center gap-1.5">
          <ScrollSvg />
          <span className="text-[10.5px] sm:text-xs font-black text-amber-100 game-text-shadow">
            Задания
          </span>
        </div>
        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
          hasReadyToClaim
            ? 'bg-emerald-500 text-white shadow'
            : 'bg-black/40 text-amber-200 border border-amber-800'
        }`}>
          {completedCount}/3
        </span>
      </button>

      {/* ── BEAUTIFUL 24H MISSIONS DROPDOWN DIALOG (ON TOP OF ALL WINDOWS z-[110]) ── */}
      {isOpen && (
        <div className="fixed top-[52px] sm:top-[60px] left-2 sm:left-4 w-[calc(100vw-16px)] max-w-[340px] sm:max-w-[380px] p-3.5 sm:p-4 rounded-3xl game-dock-tray border-2 border-amber-500/80 shadow-2xl shadow-black/95 text-white flex flex-col gap-3 animate-pop-in z-[110]">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-amber-900/60 pb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl game-side-medal flex items-center justify-center text-base shrink-0 shadow-md">
                📜
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-black text-xs sm:text-sm text-yellow-300 game-text-gold flex items-center gap-1.5 truncate">
                  <span>Задания дня</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full game-ribbon-tag text-white font-black">
                    24ч
                  </span>
                </span>
                <span className="text-[10px] text-amber-200/80 flex items-center gap-1 truncate">
                  <Clock size={11} className="text-amber-400" /> Сброс через {timeLeftStr}
                </span>
              </div>
            </div>

            {/* Tactile Close Button (Крестик) */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsOpen(false);
              }}
              className="w-7 h-7 rounded-xl game-dock-btn text-amber-200 hover:text-white hover:border-red-400 flex items-center justify-center text-sm font-black transition-all cursor-pointer shrink-0 shadow-md active:scale-90 ml-2"
              title="Закрыть"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* 3 Missions Cards */}
          <div className="flex flex-col gap-2">
            {dailyMissions.map((m) => {
              const isFinished = m.currentCount >= m.targetCount;
              const percent = Math.min(100, Math.round((m.currentCount / m.targetCount) * 100));

              return (
                <div
                  key={m.id}
                  className={`p-2.5 sm:p-3 rounded-2xl border flex flex-col gap-2 transition-all ${
                    m.isClaimed
                      ? 'bg-black/40 border-amber-950/60 opacity-60'
                      : isFinished
                      ? 'bg-gradient-to-r from-amber-950 via-[#2E1A0C] to-[#1F1106] border-emerald-400/80 ring-1 ring-emerald-400/50 shadow-lg'
                      : 'game-badge-wood'
                  }`}
                >
                  {/* Top Bar with Difficulty and Reward */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full border shadow-sm"
                        style={{
                          backgroundColor: `${m.tierColor}25`,
                          borderColor: m.tierColor,
                          color: m.tierColor === '#10B981' ? '#86EFAC' : m.tierColor === '#F59E0B' ? '#FDE047' : '#FCA5A5',
                        }}
                      >
                        {m.tierLabel}
                      </span>
                      <span className="font-extrabold text-xs text-amber-100 game-text-shadow">
                        {m.title}
                      </span>
                    </div>

                    {/* Reward Badges */}
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-300">
                      <span className="flex items-center gap-0.5 game-text-gold"><CoinSvg /> +{m.rewardCoins}</span>
                      <span className="text-sky-300 font-extrabold">+{m.rewardXP} XP</span>
                      {m.rewardGems && (
                        <span className="text-emerald-300 font-extrabold">+{m.rewardGems} 💎</span>
                      )}
                    </div>
                  </div>

                  {/* Description & Icon */}
                  <div className="flex items-center gap-2 text-[11px] text-white/80">
                    <span className="text-lg shrink-0 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">{m.icon}</span>
                    <span className="text-[10px] text-amber-200/80 leading-tight flex-1 font-medium">{m.description}</span>
                  </div>

                  {/* Progress Bar & Claim Button */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex flex-col gap-0.5">
                      <div className="flex justify-between text-[9px] font-black text-amber-200/90">
                        <span>Прогресс</span>
                        <span className={isFinished ? 'text-emerald-300 font-black' : 'text-amber-100'}>
                          {m.currentCount} / {m.targetCount} ({percent}%)
                        </span>
                      </div>
                      <div className="game-badge-slot w-full h-2 p-[1px] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isFinished ? 'bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]' : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Claim Button */}
                    {m.isClaimed ? (
                      <span className="px-2.5 py-1 rounded-xl bg-black/40 border border-emerald-600/40 text-emerald-300 text-[10px] font-extrabold flex items-center gap-1 shrink-0">
                        <CheckCircle2 size={12} /> Готово
                      </span>
                    ) : isFinished ? (
                      <button
                        onClick={() => claimDailyMission(m.id)}
                        className="game-btn-plus px-3 py-1 text-white font-black text-[10px] shadow-lg transition-transform active:scale-95 cursor-pointer shrink-0 animate-bounce"
                      >
                        Забрать!
                      </button>
                    ) : (
                      <span className="px-2 py-0.5 rounded-lg bg-black/40 border border-amber-900/60 text-amber-400/60 text-[9px] font-bold shrink-0">
                        В процессе
                      </span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
