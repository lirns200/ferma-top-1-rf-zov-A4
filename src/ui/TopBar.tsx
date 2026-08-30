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

// ── COIN 3D CASUAL GAME SVG ──
const GameCoinIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
    {/* Outer drop shadow */}
    <ellipse cx="16" cy="18" rx="14" ry="12" fill="rgba(0,0,0,0.35)" />
    {/* Coin base edge */}
    <circle cx="16" cy="16" r="14" fill="#B45309" stroke="#78350F" strokeWidth="1.5" />
    <circle cx="16" cy="15" r="13" fill="url(#coin_gold_grad)" stroke="#FEF08A" strokeWidth="1" />
    {/* Inner embossed ring */}
    <circle cx="16" cy="15" r="10" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 1.5" />
    {/* Center wheat/star glyph */}
    <path d="M16 8L17.5 12.5H22L18.5 15.5L20 20L16 17L12 20L13.5 15.5L10 12.5H14.5L16 8Z" fill="#FFFBEB" stroke="#B45309" strokeWidth="0.8" />
    {/* Gloss highlight */}
    <ellipse cx="13" cy="10" rx="6" ry="3" fill="rgba(255,255,255,0.45)" transform="rotate(-25 13 10)" />
    <defs>
      <linearGradient id="coin_gold_grad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="40%" stopColor="#FACC15" />
        <stop offset="80%" stopColor="#EAB308" />
        <stop offset="100%" stopColor="#CA8A04" />
      </linearGradient>
    </defs>
  </svg>
);

// ── BARN CRATE 3D CASUAL GAME SVG ──
const GameBarnIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
    <ellipse cx="16" cy="20" rx="13" ry="8" fill="rgba(0,0,0,0.35)" />
    {/* Barn Body */}
    <path d="M5 14L16 6L27 14V26H5V14Z" fill="#DC2626" stroke="#7F1D1D" strokeWidth="1.5" />
    {/* Barn Roof trim */}
    <path d="M4 14L16 5L28 14" stroke="#FEF2F2" strokeWidth="2" strokeLinecap="round" />
    {/* Barn Door with X */}
    <rect x="11" y="16" width="10" height="10" fill="#78350F" stroke="#FDE68A" strokeWidth="1" />
    <line x1="11" y1="16" x2="21" y2="26" stroke="#FDE68A" strokeWidth="1" />
    <line x1="21" y1="16" x2="11" y2="26" stroke="#FDE68A" strokeWidth="1" />
    {/* Loft window */}
    <circle cx="16" cy="11" r="2.2" fill="#FEF08A" stroke="#78350F" strokeWidth="0.8" />
  </svg>
);

// ── ENERGY LIGHTNING 3D CASUAL GAME SVG ──
const GameEnergyIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
    <ellipse cx="16" cy="20" rx="12" ry="8" fill="rgba(0,0,0,0.35)" />
    {/* Glowing Aura */}
    <path d="M18 3L6 17H16L14 29L26 13H16L18 3Z" fill="#38BDF8" opacity="0.4" filter="blur(1px)" />
    {/* Main Bolt */}
    <path d="M18 3L6 17H16L14 29L26 13H16L18 3Z" fill="url(#bolt_energy_grad)" stroke="#0284C7" strokeWidth="1.2" strokeLinejoin="round" />
    {/* Gloss Core */}
    <path d="M17 6L9 16H15L13.5 25L22 14H15L17 6Z" fill="#FFFFFF" opacity="0.75" />
    <defs>
      <linearGradient id="bolt_energy_grad" x1="6" y1="3" x2="26" y2="29" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#BAE6FD" />
        <stop offset="45%" stopColor="#38BDF8" />
        <stop offset="100%" stopColor="#0284C7" />
      </linearGradient>
    </defs>
  </svg>
);

export const TopBar: React.FC = () => {
  const {
    level,
    xp,
    coins,
    gems,
    getStorageUsed,
    openModal,
    activeModal,
  } = useGameStore();

  const tgProfile = useMemo(() => getTelegramUserProfile(), []);

  const currentLevelConfig = LEVELS[level - 1];
  const xpNeeded = currentLevelConfig ? currentLevelConfig.xpRequired : 1000;
  const xpPercent = Math.min(100, Math.round((xp / xpNeeded) * 100));
  const barnUsed = getStorageUsed('barn');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none p-1.5 sm:p-3 select-none">
      <div className="max-w-4xl mx-auto flex items-start justify-between gap-1.5 sm:gap-3">

        {/* ── LEFT: Studio-Quality Telegram Profile & Daily Quests ── */}
        <div className="flex flex-col items-stretch pointer-events-auto gap-1 min-w-[125px] max-w-[155px] sm:min-w-[175px] sm:max-w-none">
          
          {/* Profile Plaque with Level Star Frame */}
          <div 
            onClick={() => {
              sounds.playClick();
              triggerTelegramHaptic('light');
              openModal('settings');
            }}
            className="game-badge-wood cursor-pointer flex items-center p-1 sm:p-1.5 gap-1.5 sm:gap-2 active:scale-95 transition-all"
          >
            {/* Avatar Frame with Star Badge */}
            <div className="relative shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl border border-amber-400/80 bg-gradient-to-tr from-amber-800 to-yellow-600 p-0.5 shadow-md overflow-hidden">
                {tgProfile.photoUrl ? (
                  <img
                    src={tgProfile.photoUrl}
                    alt={tgProfile.name}
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-gradient-to-tr from-amber-700 to-yellow-500 flex items-center justify-center font-black text-white text-[11px]">
                    {tgProfile.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Golden Level Star Shield */}
              <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 sm:w-5 sm:h-5 game-level-star flex items-center justify-center text-[9px] sm:text-[10px] font-black text-amber-950 shadow-md">
                {level}
              </div>
            </div>

            {/* Name & Glossy XP Bar */}
            <div className="flex flex-col flex-1 min-w-0 pr-0.5">
              <span className="font-extrabold text-[10px] sm:text-xs text-amber-100 tracking-tight truncate game-text-shadow">
                {tgProfile.name}
              </span>
              
              {/* Recessed XP slot */}
              <div className="game-badge-slot w-full h-2 mt-0.5 p-[1px] overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-green-400 to-lime-300 rounded-full transition-all duration-300 shadow-[0_0_6px_rgba(74,222,128,0.6)]"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Daily Quests Board Button (Only on 3D Farm Map) */}
          {activeModal === null && <DailyMissionsWidget />}
        </div>

        {/* ── RIGHT: Casual Game Overlapping Currency Counters & Weather ── */}
        <div className="flex flex-col items-end pointer-events-auto gap-1">
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* 1. Golden Coins Plaque with Overlapping 3D Coin */}
            <div className="game-badge-wood flex items-center pl-1.5 pr-2 py-1 sm:pl-2 sm:pr-2.5 sm:py-1 gap-1.5 cursor-pointer active:scale-95 transition-transform">
              <div className="w-6 h-6 sm:w-7 sm:h-7 -ml-2.5 sm:-ml-3 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] shrink-0">
                <GameCoinIcon />
              </div>
              <span className="font-black text-[11px] sm:text-xs md:text-sm text-yellow-300 font-sans tracking-tight game-text-gold min-w-[20px] sm:min-w-[32px] text-right">
                {fmtNumber(coins)}
              </span>
            </div>

            {/* 2. Barn Storage Plaque with Overlapping Barn */}
            <div 
              onClick={() => {
                sounds.playClick();
                triggerTelegramHaptic('light');
                openModal('barn');
              }}
              className="game-badge-wood flex items-center pl-1.5 pr-2 py-1 sm:pl-2 sm:pr-2.5 sm:py-1 gap-1.5 cursor-pointer hover:brightness-110 active:scale-95 transition-all"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 -ml-2.5 sm:-ml-3 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] shrink-0">
                <GameBarnIcon />
              </div>
              <span className="font-black text-[11px] sm:text-xs md:text-sm text-amber-100 font-sans tracking-tight game-text-shadow">
                {barnUsed}
              </span>
            </div>

            {/* 3. Energy Flask Plaque with Chunky 3D [+] Button */}
            <div className="game-badge-wood flex items-center pl-1.5 pr-1 py-0.5 sm:pl-2 sm:pr-1 sm:py-1 gap-1">
              <div className="w-6 h-6 sm:w-7 sm:h-7 -ml-2.5 sm:-ml-3 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] shrink-0">
                <GameEnergyIcon />
              </div>
              <span className="font-black text-[11px] sm:text-xs md:text-sm text-sky-200 font-sans tracking-tight game-text-shadow">
                {gems}/30
              </span>
              <button
                onClick={() => {
                  sounds.playClick();
                  triggerTelegramHaptic('light');
                  openModal('events');
                }}
                className="game-btn-plus w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 text-white flex items-center justify-center text-[10px] sm:text-xs font-black shrink-0"
                title="Пополнить энергию"
              >
                +
              </button>
            </div>

          </div>

          {/* Weather Barometer Widget (Only on 3D Farm Map) */}
          {activeModal === null && <WeatherForecastWidget />}
        </div>

      </div>
    </header>
  );
};

