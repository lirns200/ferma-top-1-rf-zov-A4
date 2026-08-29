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

export const DailyMissionsWidget: React.FC = () => {
  const { dailyMissions, dailyMissionsExpiresAt, claimDailyMission, isDesign2026 } = useGameStore();
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
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const completedCount = dailyMissions.filter(m => m.isClaimed).length;
  const hasReadyToClaim = dailyMissions.some(m => !m.isClaimed && m.currentCount >= m.targetCount);

  return (
    <div ref={popoverRef} className="relative z-40">
      
      {/* ── SIMPLE & CLEAN BUTTON "🎯 Миссии" UNDER LEVEL ── */}
      <button
        onClick={() => {
          sounds.playClick();
          triggerTelegramHaptic('light');
          setIsOpen(prev => !prev);
        }}
        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-2xl border shadow-lg backdrop-blur-md transition-all active:scale-95 cursor-pointer text-xs font-black group ${
          hasReadyToClaim
            ? 'bg-gradient-to-r from-emerald-950 to-green-950 border-emerald-400 ring-2 ring-emerald-400/50 text-white animate-pulse'
            : isDesign2026
            ? 'bg-[#181C24]/90 border-[#283244] text-amber-300 hover:border-amber-400/40 hover:text-white'
            : 'hud-parchment border-amber-800 text-[#3B1F0D]'
        }`}
        title="Ежедневные миссии"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-xs">{hasReadyToClaim ? '🎁' : '🎯'}</span>
          <span className="tracking-tight text-white/90">Миссии</span>
        </div>
        <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black ${
          hasReadyToClaim ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/70'
        }`}>
          {completedCount}/3
        </span>
      </button>

      {/* ── BEAUTIFUL 24H MISSIONS DROPDOWN DIALOG (ON TOP OF ALL WINDOWS z-[110]) ── */}
      {isOpen && (
        <div className="fixed top-[52px] sm:top-[60px] left-2 sm:left-4 w-[calc(100vw-16px)] max-w-[340px] sm:max-w-[380px] p-3.5 sm:p-4 rounded-3xl bg-[#10141D]/95 backdrop-blur-2xl border border-white/20 shadow-2xl shadow-black/90 text-white flex flex-col gap-3 animate-pop-in z-[110]">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-base shrink-0">
                🎯
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-black text-xs sm:text-sm text-white flex items-center gap-1.5 truncate">
                  <span>Миссии дня</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-yellow-300 font-bold">
                    24ч
                  </span>
                </span>
                <span className="text-[10px] text-[#8E939D] flex items-center gap-1 truncate">
                  <Clock size={11} /> Сброс через {timeLeftStr}
                </span>
              </div>
            </div>

            {/* Bright, high-contrast Close Button (Крестик) */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsOpen(false);
              }}
              className="w-8 h-8 rounded-xl bg-white/15 hover:bg-red-600 border border-white/30 text-white flex items-center justify-center text-sm font-black transition-all cursor-pointer shrink-0 shadow-md active:scale-90 ml-2"
              title="Закрыть"
            >
              <X size={18} strokeWidth={2.5} />
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
                      ? 'bg-[#12151B]/80 border-white/5 opacity-60'
                      : isFinished
                      ? 'bg-gradient-to-r from-emerald-950/80 to-[#122E1F]/90 border-emerald-400/70 ring-1 ring-emerald-400/40 shadow-lg'
                      : 'bg-[#181C24]/90 border-[#283244]'
                  }`}
                >
                  {/* Top Bar with Difficulty and Reward */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded-md border"
                        style={{
                          backgroundColor: `${m.tierColor}15`,
                          borderColor: `${m.tierColor}40`,
                          color: m.tierColor,
                        }}
                      >
                        {m.tierLabel}
                      </span>
                      <span className="font-extrabold text-xs text-white">
                        {m.title}
                      </span>
                    </div>

                    {/* Reward Badges */}
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-300">
                      <span className="flex items-center gap-0.5"><CoinSvg /> +{m.rewardCoins}</span>
                      <span className="text-sky-300 font-bold">+{m.rewardXP} XP</span>
                      {m.rewardGems && (
                        <span className="text-emerald-400 font-bold">+{m.rewardGems} 💎</span>
                      )}
                    </div>
                  </div>

                  {/* Description & Icon */}
                  <div className="flex items-center gap-2 text-[11px] text-white/80">
                    <span className="text-lg shrink-0">{m.icon}</span>
                    <span className="text-[10px] text-[#8E939D] leading-tight flex-1">{m.description}</span>
                  </div>

                  {/* Progress Bar & Claim Button */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex flex-col gap-0.5">
                      <div className="flex justify-between text-[9px] font-black text-[#8E939D]">
                        <span>Прогресс</span>
                        <span className={isFinished ? 'text-emerald-400 font-black' : 'text-white'}>
                          {m.currentCount} / {m.targetCount} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/5">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isFinished ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Claim Button */}
                    {m.isClaimed ? (
                      <span className="px-2 py-1 rounded-xl bg-white/5 text-emerald-400 text-[10px] font-bold flex items-center gap-0.5 shrink-0">
                        <CheckCircle2 size={11} /> Готово
                      </span>
                    ) : isFinished ? (
                      <button
                        onClick={() => claimDailyMission(m.id)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 text-white font-black text-[10px] shadow-lg shadow-emerald-950/60 transition-transform active:scale-95 cursor-pointer shrink-0 animate-bounce"
                      >
                        Забрать!
                      </button>
                    ) : (
                      <span className="px-2 py-1 rounded-xl bg-black/30 text-[#8E939D] text-[9px] font-bold shrink-0">
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
