import React from 'react';
import { useGameStore } from '../game/gameState';
import { sounds } from '../audio/SoundManager';
import { triggerTelegramHaptic } from '../utils/telegram';

// ── 3D GIFT CHEST MEDAL SVG ──
const GameGiftMedalSvg = () => (
  <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6 sm:w-7 sm:h-7">
    {/* Chest Body */}
    <rect x="5" y="12" width="22" height="15" rx="3" fill="#D97706" stroke="#78350F" strokeWidth="1.2" />
    {/* Chest Lid */}
    <path d="M4 12C4 9.5 7 7 16 7C25 7 28 9.5 28 12H4Z" fill="#F59E0B" stroke="#78350F" strokeWidth="1.2" />
    {/* Gold Ribbons */}
    <rect x="14" y="7" width="4" height="20" fill="#FEF08A" stroke="#B45309" strokeWidth="0.8" />
    <rect x="5" y="17" width="22" height="3" fill="#FEF08A" stroke="#B45309" strokeWidth="0.8" />
    {/* Bow on Top */}
    <path d="M12 4C10 4 9 6 12 7C14 7.7 15.5 7.5 16 7C16.5 7.5 18 7.7 20 7C23 6 22 4 20 4C17 4 16 6.5 16 6.5C16 6.5 15 4 12 4Z" fill="#EF4444" stroke="#991B1B" strokeWidth="0.8" />
  </svg>
);

// ── 3D CARNIVAL SALE TICKET SVG ──
const GameSaleTicketSvg = () => (
  <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6 sm:w-7 sm:h-7">
    {/* Glowing Fire / Ticket */}
    <rect x="5" y="8" width="22" height="16" rx="3" fill="#DC2626" stroke="#7F1D1D" strokeWidth="1.2" transform="rotate(-6 16 16)" />
    <rect x="7" y="10" width="18" height="12" rx="2" fill="#EF4444" stroke="#FCA5A5" strokeWidth="0.8" strokeDasharray="2 1.5" transform="rotate(-6 16 16)" />
    <path d="M16 11L18 15L22 16L18.5 18.5L19 22.5L16 20.5L13 22.5L13.5 18.5L10 16L14 15L16 11Z" fill="#FEF08A" stroke="#B45309" strokeWidth="0.8" />
  </svg>
);

export const HudSideWidgets: React.FC = () => {
  const { openModal, activeModal, dailyBonusStreak, lastDailyBonusClaimTime } = useGameStore();

  // Only show on main 3D farm map when no modal is active
  if (activeModal !== null) return null;

  const isDailyReady = !lastDailyBonusClaimTime || (Date.now() - lastDailyBonusClaimTime >= 60000);

  return (
    <div className="fixed top-[88px] sm:top-[104px] left-1.5 sm:left-3 z-40 pointer-events-auto select-none flex flex-col gap-2.5 animate-pop-in">
      
      {/* 1. 🎁 Daily Bonus Hanging Game Medal */}
      <button
        onClick={() => {
          sounds.playClick();
          triggerTelegramHaptic('light');
          openModal('daily_bonus');
        }}
        className={`game-side-medal relative w-11 h-11 sm:w-13 sm:h-13 flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer group ${
          isDailyReady ? 'ring-2 ring-yellow-300 shadow-[0_0_16px_rgba(250,204,21,0.6)] animate-pulse' : ''
        }`}
        title="Ежедневный подарок"
      >
        <div className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform">
          <GameGiftMedalSvg />
        </div>

        {/* Bottom Banner Ribbon */}
        <div className="absolute -bottom-2 px-1.5 py-0.2 game-ribbon-tag text-[8px] sm:text-[9px] font-black text-white uppercase tracking-tight game-text-shadow">
          {isDailyReady ? 'ГОТОВ' : `#${dailyBonusStreak}`}
        </div>
      </button>

      {/* 2. 🔥 Special Promos / Sale Game Medal */}
      <button
        onClick={() => {
          sounds.playClick();
          triggerTelegramHaptic('light');
          openModal('shop');
        }}
        className="game-side-medal relative w-11 h-11 sm:w-13 sm:h-13 flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer group"
        title="Ярмарка и Акции"
      >
        <div className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform">
          <GameSaleTicketSvg />
        </div>

        {/* Bottom Banner Ribbon */}
        <div className="absolute -bottom-2 px-1.5 py-0.2 game-ribbon-tag text-[8px] sm:text-[9px] font-black text-yellow-200 uppercase tracking-tight game-text-shadow">
          -70%
        </div>
      </button>

    </div>
  );
};

