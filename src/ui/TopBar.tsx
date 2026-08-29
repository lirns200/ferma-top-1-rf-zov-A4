import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../game/gameState';
import { LEVELS } from '../config/levels';
import { SEASONS_INFO } from '../config/events';
import { Settings, Volume2, VolumeX, Plus } from 'lucide-react';
import { sounds } from '../audio/SoundManager';

function fmtNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 10_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString('ru-RU');
}

export const TopBar: React.FC = () => {
  const {
    level, xp, coins, gems,
    activeSeason, activeEvent,
    soundMuted, setSoundMuted, openModal,
  } = useGameStore();

  const currentLevelConfig = LEVELS[level - 1];
  const xpNeeded = currentLevelConfig ? currentLevelConfig.xpRequired : 1000;
  const xpPercent = Math.min(100, Math.round((xp / xpNeeded) * 100));
  const seasonInfo = SEASONS_INFO[activeSeason];

  return (
    <header className="fixed top-0 left-0 right-0 z-30 pointer-events-none p-2.5 sm:p-4 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        
        {/* ── LEFT: Level & XP Bar ── */}
        <div 
          onClick={() => {
            sounds.playClick();
            openModal('levelup');
          }}
          className="pointer-events-auto cursor-pointer flex items-center gap-2 farm-pill px-3 py-1.5 active:scale-95 transition-transform"
        >
          {/* Level Star Badge */}
          <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-full border-2 border-yellow-100 shadow-md font-black text-amber-950 text-sm sm:text-base">
            <span>{level}</span>
          </div>

          {/* XP Bar */}
          <div className="flex flex-col gap-0.5 min-w-[70px] sm:min-w-[110px]">
            <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold text-amber-200">
              <span className="hidden sm:inline">ОПЫТ</span>
              <span>{xp}/{xpNeeded}</span>
            </div>
            <div className="w-full h-2 sm:h-2.5 bg-amber-950/80 rounded-full overflow-hidden border border-amber-600/60">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-300 transition-all duration-500 rounded-full"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── CENTER: Coins & Gems Currency Badges ── */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Coins */}
          <div className="pointer-events-auto flex items-center gap-1.5 farm-pill px-2.5 sm:px-3 py-1 sm:py-1.5">
            <span className="text-base sm:text-lg animate-bounce" style={{ animationDuration: '3s' }}>🪙</span>
            <span className="font-extrabold text-xs sm:text-sm text-yellow-300 tracking-wide min-w-[36px] sm:min-w-[48px]">
              {fmtNumber(coins)}
            </span>
            <button 
              onClick={() => {
                sounds.playClick();
                openModal('orders');
              }}
              className="w-5 h-5 rounded-full bg-green-500 hover:bg-green-400 border border-green-200 text-white flex items-center justify-center text-xs font-black shadow active:scale-90 transition-transform cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Gems */}
          <div className="pointer-events-auto flex items-center gap-1.5 farm-pill px-2.5 sm:px-3 py-1 sm:py-1.5">
            <span className="text-base sm:text-lg animate-pulse">💎</span>
            <span className="font-extrabold text-xs sm:text-sm text-cyan-300 tracking-wide min-w-[24px] sm:min-w-[32px]">
              {fmtNumber(gems)}
            </span>
            <button 
              onClick={() => {
                sounds.playClick();
                openModal('events');
              }}
              className="w-5 h-5 rounded-full bg-cyan-500 hover:bg-cyan-400 border border-cyan-200 text-white flex items-center justify-center text-xs font-black shadow active:scale-90 transition-transform cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* ── RIGHT: Season & Settings ── */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Season Badge */}
          <button
            onClick={() => {
              sounds.playClick();
              openModal('events');
            }}
            className="pointer-events-auto hidden sm:flex items-center gap-1.5 farm-pill px-3 py-1.5 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <span className="text-base">{seasonInfo.icon}</span>
            <span className="text-xs font-bold text-amber-200">{seasonInfo.name}</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => {
              sounds.playClick();
              openModal('settings');
            }}
            className="pointer-events-auto w-9 h-9 sm:w-10 sm:h-10 rounded-full farm-pill flex items-center justify-center text-amber-200 hover:text-white hover:brightness-110 active:scale-90 transition-transform cursor-pointer"
            title="Настройки фермы"
          >
            <Settings size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

      </div>
    </header>
  );
};
