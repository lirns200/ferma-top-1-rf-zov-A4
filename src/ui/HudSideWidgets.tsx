import React from 'react';
import { useGameStore } from '../game/gameState';
import { sounds } from '../audio/SoundManager';
import { triggerTelegramHaptic } from '../utils/telegram';
import { Gift, Flame, Sparkles } from 'lucide-react';

export const HudSideWidgets: React.FC = () => {
  const { openModal, activeModal, isDesign2026, dailyBonusStreak, lastDailyBonusClaimTime } = useGameStore();

  // Only show on main 3D farm map when no full modal is active
  if (activeModal !== null) return null;

  const isDailyReady = !lastDailyBonusClaimTime || (Date.now() - lastDailyBonusClaimTime >= 60000);

  return (
    <div className="fixed top-[96px] sm:top-[112px] left-2 sm:left-3 z-40 pointer-events-auto select-none flex flex-col gap-2 animate-pop-in">
      
      {/* 1. 🎁 Daily Login Bonus Button */}
      <button
        onClick={() => {
          sounds.playClick();
          triggerTelegramHaptic('light');
          openModal('daily_bonus');
        }}
        className={`relative flex items-center gap-2 p-2 sm:p-2.5 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-200 active:scale-90 cursor-pointer group ${
          isDailyReady
            ? 'bg-gradient-to-r from-amber-950/90 to-yellow-950/90 border-amber-400 ring-2 ring-amber-400/40 shadow-amber-950/80 animate-pulse'
            : isDesign2026
            ? 'bg-[#181C24]/90 border-[#242A35] text-white hover:border-white/20'
            : 'hud-parchment border-amber-800'
        }`}
        title="Забрать ежедневный бонус"
      >
        {isDailyReady && (
          <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 bg-red-600 border border-white text-white text-[8px] font-black rounded-full shadow-lg animate-bounce">
            ГОТОВ
          </span>
        )}

        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-lg sm:text-xl text-amber-950 shadow-md group-hover:scale-105 transition-transform shrink-0">
          🎁
        </div>

        <div className="flex flex-col text-left pr-1">
          <span className="text-[10px] sm:text-xs font-black text-white leading-tight flex items-center gap-1">
            <span>Бонус дня</span>
            <span className="text-[9px] text-amber-300 font-extrabold">#{dailyBonusStreak}</span>
          </span>
          <span className="text-[9px] text-emerald-400 font-bold">
            {isDailyReady ? 'Забрать подарок' : 'Получен'}
          </span>
        </div>
      </button>

      {/* 2. 🔥 Hot Promos & Sales Button */}
      <button
        onClick={() => {
          sounds.playClick();
          triggerTelegramHaptic('light');
          openModal('shop');
        }}
        className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-200 active:scale-90 cursor-pointer group ${
          isDesign2026
            ? 'bg-gradient-to-r from-rose-950/80 to-[#181C24]/90 border-rose-500/50 hover:border-rose-400 text-white shadow-rose-950/40'
            : 'hud-parchment border-red-700 text-[#3B1F0D]'
        }`}
        title="Спецпредложения и акции"
      >
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-lg sm:text-xl text-white shadow-md group-hover:scale-105 transition-transform shrink-0">
          🔥
        </div>

        <div className="flex flex-col text-left pr-1">
          <span className="text-[10px] sm:text-xs font-black text-white leading-tight">
            Акции
          </span>
          <span className="text-[9px] text-rose-400 font-extrabold">
            Скидки -70%
          </span>
        </div>
      </button>

    </div>
  );
};
