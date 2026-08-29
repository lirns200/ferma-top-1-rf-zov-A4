import React, { useEffect } from 'react';
import { useGameStore } from '../game/gameState';
import { sounds } from '../audio/SoundManager';
import { triggerTelegramHaptic } from '../utils/telegram';
import { ShoppingBag, X, Sparkles } from 'lucide-react';

const CoinSvg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 inline-block">
    <circle cx="12" cy="12" r="10" fill="url(#coin_nt_g)" stroke="#92400E" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="7.5" stroke="#FEF08A" strokeWidth="1" strokeDasharray="2.5 1" />
    <text x="12" y="16" fontSize="11" fontWeight="900" fill="#78350F" textAnchor="middle" fontFamily="sans-serif">🪙</text>
    <defs>
      <linearGradient id="coin_nt_g" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
  </svg>
);

export const MarketNotificationToasts: React.FC = () => {
  const { marketNotifications, dismissMarketNotification, openModal, isDesign2026 } = useGameStore();

  // Auto-dismiss top notification after 6 seconds
  useEffect(() => {
    if (marketNotifications.length === 0) return;
    const timer = setTimeout(() => {
      dismissMarketNotification(marketNotifications[0].id);
    }, 6000);
    return () => clearTimeout(timer);
  }, [marketNotifications, dismissMarketNotification]);

  if (marketNotifications.length === 0) return null;

  const currentToast = marketNotifications[0];

  return (
    <div className="fixed top-12 sm:top-14 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md pointer-events-auto select-none animate-pop-in">
      <div
        onClick={() => {
          sounds.playClick();
          triggerTelegramHaptic('light');
          openModal('roadside');
        }}
        className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#122E1F]/95 via-[#163D2A]/95 to-[#10241A]/95 border-2 border-emerald-400/80 shadow-2xl shadow-emerald-950/80 text-white backdrop-blur-xl flex items-center justify-between gap-3 cursor-pointer hover:scale-[1.01] active:scale-95 transition-all"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-2xl shadow-inner shrink-0 animate-bounce">
            {currentToast.icon || '🛍️'}
          </div>

          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-xs text-emerald-300 leading-tight flex items-center gap-1">
              <span>{currentToast.title}</span>
            </span>
            <span className="text-[11px] text-white/90 font-medium leading-snug mt-0.5 truncate">
              {currentToast.message}
            </span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            dismissMarketNotification(currentToast.id);
          }}
          className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center text-xs font-bold shrink-0 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
