import React from 'react';
import { useGameStore } from '../game/gameState';
import { LEVELS } from '../config/levels';
import { sounds } from '../audio/SoundManager';
import { triggerTelegramHaptic } from '../utils/telegram';

function fmtNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 10_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString('ru-RU');
}

// ── CRISP VECTOR ICONS (Никогда не превращаются в квадратики []) ──
const CoinSvg = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <circle cx="12" cy="12" r="10" fill="url(#coin_g)" stroke="#92400E" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="7.5" stroke="#FEF08A" strokeWidth="1" strokeDasharray="2.5 1" />
    <text x="12" y="16" fontSize="11" fontWeight="900" fill="#78350F" textAnchor="middle" fontFamily="sans-serif">🪙</text>
    <defs>
      <linearGradient id="coin_g" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
  </svg>
);

const WoodSvg = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <rect x="2" y="6" width="20" height="12" rx="3" fill="#854D0E" stroke="#451A03" strokeWidth="1.5" />
    <ellipse cx="6" cy="12" rx="2" ry="4" fill="#A16207" />
    <line x1="6" y1="9" x2="20" y2="9" stroke="#542D0C" strokeWidth="1" />
    <line x1="6" y1="15" x2="20" y2="15" stroke="#542D0C" strokeWidth="1" />
  </svg>
);

const EnergySvg = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#FACC15" stroke="#854D0E" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const SproutSvg = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M12 22V11C12 7 8 4 4 4C4 8 7 12 11 12" stroke="#15803D" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M12 13C16 13 19 11 20 7C16 6 13 8 12 11" fill="#4ADE80" stroke="#15803D" strokeWidth="1.5" />
    <circle cx="12" cy="21" r="2" fill="#78350F" />
  </svg>
);

export const TopBar: React.FC = () => {
  const {
    level, xp, coins, gems,
    getStorageUsed,
    openModal,
    isDesign2026,
  } = useGameStore();

  const currentLevelConfig = LEVELS[level - 1];
  const xpNeeded = currentLevelConfig ? currentLevelConfig.xpRequired : 1000;
  const xpPercent = Math.min(100, Math.round((xp / xpNeeded) * 100));
  const barnUsed = getStorageUsed('barn');

  const pillClass = isDesign2026
    ? 'hud-ios26-pill text-white'
    : 'hud-parchment text-[#3B1F0D]';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none p-2 sm:p-3 select-none">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">

        {/* ── LEFT: Farm Badge + Level Shield + XP Bar ── */}
        <div 
          onClick={() => {
            sounds.playClick();
            triggerTelegramHaptic('light');
            openModal('settings');
          }}
          className={`pointer-events-auto cursor-pointer flex items-center gap-2 px-2.5 py-1.5 active:scale-95 transition-all ${pillClass}`}
        >
          {/* Sprout Icon */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-200/90 border border-amber-700/60 flex items-center justify-center shadow-inner shrink-0">
            <SproutSvg />
          </div>

          {/* Farm Name & Level Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={`font-extrabold text-xs sm:text-sm tracking-tight ${isDesign2026 ? 'text-white' : 'text-[#3B1F0D]'}`}>
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
          <div className={`pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 ${pillClass}`}>
            <CoinSvg />
            <span className={`font-extrabold text-xs sm:text-sm min-w-[28px] sm:min-w-[36px] ${isDesign2026 ? 'text-yellow-300' : 'text-[#3B1F0D]'}`}>
              {fmtNumber(coins)}
            </span>
          </div>

          {/* 2. Wood / Barn Storage Badge */}
          <div 
            onClick={() => {
              sounds.playClick();
              triggerTelegramHaptic('light');
              openModal('barn');
            }}
            className={`pointer-events-auto cursor-pointer flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 hover:brightness-105 active:scale-95 transition-all ${pillClass}`}
          >
            <WoodSvg />
            <span className={`font-extrabold text-xs sm:text-sm ${isDesign2026 ? 'text-amber-200' : 'text-[#3B1F0D]'}`}>
              {barnUsed}
            </span>
          </div>

          {/* 3. Gems / Energy Badge with [+] Button */}
          <div className={`pointer-events-auto flex items-center gap-1.5 pl-2.5 pr-1 py-1 sm:py-1.5 ${pillClass}`}>
            <EnergySvg />
            <span className={`font-extrabold text-xs sm:text-sm ${isDesign2026 ? 'text-cyan-300' : 'text-[#1E3A8A]'}`}>
              {gems}/30
            </span>
            <button
              onClick={() => {
                sounds.playClick();
                triggerTelegramHaptic('light');
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
