import React, { useMemo } from 'react';
import { useGameStore } from '../game/gameState';
import { LEVELS } from '../config/levels';
import { sounds } from '../audio/SoundManager';
import { triggerTelegramHaptic, getTelegramUserProfile } from '../utils/telegram';
import { DailyMissionsWidget } from './DailyMissionsWidget';
import { WeatherForecastWidget } from './WeatherForecastWidget';

function fmtNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 10_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString('ru-RU');
}

// ── CRISP VECTOR ICONS ──
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

export const TopBar: React.FC = () => {
  const {
    level, xp, coins, gems,
    getStorageUsed,
    openModal,
    isDesign2026,
  } = useGameStore();

  const tgProfile = useMemo(() => getTelegramUserProfile(), []);

  const currentLevelConfig = LEVELS[level - 1];
  const xpNeeded = currentLevelConfig ? currentLevelConfig.xpRequired : 1000;
  const xpPercent = Math.min(100, Math.round((xp / xpNeeded) * 100));
  const barnUsed = getStorageUsed('barn');

  const badgeBoxClass = isDesign2026
    ? 'bg-[#181C24]/90 border border-[#242A35] shadow-lg rounded-xl text-white px-2 py-1 sm:px-2.5 sm:py-1.5'
    : 'hud-parchment rounded-xl px-2 py-1 sm:px-2.5 sm:py-1.5 text-[#3B1F0D]';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none p-1.5 sm:p-3 select-none">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-1 sm:gap-2.5">

        {/* ── LEFT: Telegram Profile & Daily Missions under Level ── */}
        <div className="flex flex-col items-start pointer-events-auto">
          <div 
            onClick={() => {
              sounds.playClick();
              triggerTelegramHaptic('light');
              openModal('settings');
            }}
            className={`cursor-pointer flex items-center gap-1.5 sm:gap-2.5 active:scale-95 transition-all ${badgeBoxClass}`}
          >
            {/* Telegram User Avatar */}
            <div className="relative shrink-0">
              {tgProfile.photoUrl ? (
                <img
                  src={tgProfile.photoUrl}
                  alt={tgProfile.name}
                  className="w-7 h-7 sm:w-8.5 sm:h-8.5 rounded-lg object-cover border border-white/20 shadow"
                />
              ) : (
                <div className="w-7 h-7 sm:w-8.5 sm:h-8.5 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 border border-white/30 flex items-center justify-center font-black text-white text-[11px] sm:text-xs shadow">
                  {tgProfile.name.charAt(0)}
                </div>
              )}
              {/* Online Green Dot */}
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 border border-black rounded-full" />
            </div>

            {/* User Name & Level */}
            <div className="flex flex-col min-w-[55px] sm:min-w-[80px]">
              <div className="flex items-center gap-1.5 justify-between">
                <span className={`font-bold text-[11px] sm:text-xs tracking-tight truncate max-w-[55px] sm:max-w-[90px] ${
                  isDesign2026 ? 'text-white' : 'text-[#3B1F0D]'
                }`}>
                  {tgProfile.name}
                </span>

                {/* Level Badge */}
                <div className="flex items-center justify-center w-4.5 h-4.5 sm:w-5 sm:h-5 bg-[#3B1F0D] border border-amber-400 rounded-md font-black text-[9px] sm:text-[10px] text-yellow-300 shadow">
                  {level}
                </div>
              </div>

              {/* XP Bar */}
              <div className="w-full h-1 sm:h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/10 mt-0.5 sm:mt-1">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-300"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Daily Missions Under Level */}
          <DailyMissionsWidget />
        </div>

        {/* ── RIGHT: 3 Currency Badges & Weather Widget below them ── */}
        <div className="flex flex-col items-end pointer-events-auto">
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* 1. Coins Badge */}
            <div className={`flex items-center gap-1 sm:gap-1.5 ${badgeBoxClass}`}>
              <CoinSvg />
              <span className={`font-extrabold text-[11px] sm:text-xs md:text-sm min-w-[24px] sm:min-w-[32px] ${
                isDesign2026 ? 'text-amber-300' : 'text-[#3B1F0D]'
              }`}>
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
              className={`cursor-pointer flex items-center gap-1 sm:gap-1.5 hover:brightness-105 active:scale-95 transition-all ${badgeBoxClass}`}
            >
              <WoodSvg />
              <span className={`font-extrabold text-[11px] sm:text-xs md:text-sm ${
                isDesign2026 ? 'text-amber-200' : 'text-[#3B1F0D]'
              }`}>
                {barnUsed}
              </span>
            </div>

            {/* 3. Gems / Energy Badge with [+] Button */}
            <div className={`flex items-center gap-1 sm:gap-1.5 pl-1.5 pr-1 py-0.5 sm:pl-2.5 sm:pr-1 sm:py-1.5 ${badgeBoxClass}`}>
              <EnergySvg />
              <span className={`font-extrabold text-[11px] sm:text-xs md:text-sm ${
                isDesign2026 ? 'text-sky-300' : 'text-[#1E3A8A]'
              }`}>
                {gems}/30
              </span>
              <button
                onClick={() => {
                  sounds.playClick();
                  triggerTelegramHaptic('light');
                  openModal('events');
                }}
                className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 rounded-md sm:rounded-lg bg-emerald-600 hover:bg-emerald-500 border border-emerald-300 text-white flex items-center justify-center text-[10px] sm:text-xs font-black shadow active:scale-90 transition-transform cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Weather & Local Time Widget directly under Currency Badges */}
          <WeatherForecastWidget />
        </div>

      </div>
    </header>
  );
};
