import React from 'react';
import { useGameStore } from '../game/gameState';
import { LEVELS } from '../config/levels';
import { sounds } from '../audio/SoundManager';
import { Plus } from 'lucide-react';

function fmtNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 10_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString('ru-RU');
}

export const TopBar: React.FC = () => {
  const {
    level, xp, coins, gems,
    getStorageUsed, barnCapacity,
    openModal,
  } = useGameStore();

  const currentLevelConfig = LEVELS[level - 1];
  const xpNeeded = currentLevelConfig ? currentLevelConfig.xpRequired : 1000;
  const xpPercent = Math.min(100, Math.round((xp / xpNeeded) * 100));
  const barnUsed = getStorageUsed('barn');

  return (
    <header className="fixed top-0 left-0 right-0 z-30 pointer-events-none p-2 sm:p-3 select-none">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">

        {/* ── LEFT: Farm Badge + Level Shield + XP Bar ── */}
        <div 
          onClick={() => {
            sounds.playClick();
            openModal('levelup');
          }}
          className="pointer-events-auto cursor-pointer hud-parchment flex items-center gap-2 px-2.5 py-1.5 active:scale-95 transition-transform"
        >
          {/* Farm Sprout Icon */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-200/80 border border-amber-700/60 flex items-center justify-center text-lg sm:text-xl shadow-inner shrink-0">
            🌱
          </div>

          {/* Farm Name & Level Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs sm:text-sm text-[#3B1F0D] tracking-tight">
                Ферма Репка
              </span>

              {/* Level Shield */}
              <div className="flex items-center justify-center w-6 h-6 bg-[#3B1F0D] border border-amber-500 rounded font-black text-[11px] text-yellow-300 shadow">
                {level}
              </div>
            </div>

            {/* XP Mini Bar */}
            <div className="w-full h-1.5 bg-[#4A2810] rounded-full overflow-hidden border border-amber-900 mt-1">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-300"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── RIGHT: Currencies & Resources Badges ── */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* 1. Coins Badge */}
          <div className="pointer-events-auto hud-parchment flex items-center gap-1 px-2.5 py-1 sm:py-1.5">
            <span className="text-base sm:text-lg">🪙</span>
            <span className="font-extrabold text-xs sm:text-sm text-[#3B1F0D] min-w-[28px] sm:min-w-[36px]">
              {fmtNumber(coins)}
            </span>
          </div>

          {/* 2. Wood / Barn Storage Badge */}
          <div 
            onClick={() => {
              sounds.playClick();
              openModal('barn');
            }}
            className="pointer-events-auto cursor-pointer hud-parchment flex items-center gap-1 px-2.5 py-1 sm:py-1.5 hover:brightness-105 active:scale-95 transition-all"
          >
            <span className="text-base sm:text-lg">🪵</span>
            <span className="font-extrabold text-xs sm:text-sm text-[#3B1F0D]">
              {barnUsed}
            </span>
          </div>

          {/* 3. Gems / Energy Badge with [+] Button */}
          <div className="pointer-events-auto hud-parchment flex items-center gap-1.5 pl-2.5 pr-1 py-1 sm:py-1.5">
            <span className="text-base sm:text-lg">⚡</span>
            <span className="font-extrabold text-xs sm:text-sm text-[#1E3A8A]">
              {gems}/30
            </span>
            <button
              onClick={() => {
                sounds.playClick();
                openModal('events');
              }}
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-green-600 hover:bg-green-500 border border-green-300 text-white flex items-center justify-center text-xs font-black shadow active:scale-90 transition-transform cursor-pointer"
            >
              +
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
