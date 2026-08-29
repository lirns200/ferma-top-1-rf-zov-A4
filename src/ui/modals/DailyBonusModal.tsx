import React from 'react';
import { useGameStore, DAILY_REWARDS_SCHEDULE } from '../../game/gameState';
import { sounds } from '../../audio/SoundManager';
import { triggerTelegramHaptic } from '../../utils/telegram';
import { Gift, Check, Sparkles, Award, Zap } from 'lucide-react';

const CoinSvg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 inline-block">
    <circle cx="12" cy="12" r="10" fill="url(#coin_db_g)" stroke="#92400E" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="7.5" stroke="#FEF08A" strokeWidth="1" strokeDasharray="2.5 1" />
    <text x="12" y="16" fontSize="11" fontWeight="900" fill="#78350F" textAnchor="middle" fontFamily="sans-serif">🪙</text>
    <defs>
      <linearGradient id="coin_db_g" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
  </svg>
);

export const DailyBonusModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    dailyBonusStreak,
    lastDailyBonusClaimTime,
    claimDailyLoginBonus,
    isDesign2026,
  } = useGameStore();

  if (activeModal !== 'daily_bonus') return null;

  const isReadyToClaim = !lastDailyBonusClaimTime || (Date.now() - lastDailyBonusClaimTime >= 60000);
  const currentActiveDay = Math.max(1, Math.min(7, dailyBonusStreak || 1));

  const handleClaim = () => {
    claimDailyLoginBonus();
  };

  return (
    <div className={`fixed inset-0 pt-12 sm:pt-14 pb-16 sm:pb-20 z-50 flex flex-col select-none animate-pop-in overflow-hidden transition-colors ${
      isDesign2026 ? 'bg-[#0F1115] text-white' : 'bg-[#2A1406] text-[#3B1F0D]'
    }`}>
      
      {/* ── TOP HEADER ── */}
      <div className={`px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between border-b shrink-0 ${
        isDesign2026 ? 'bg-[#181C24] border-[#242A35]' : 'bg-[#3D2008] border-[#5C3718]'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-lg text-amber-950 shadow-md border border-amber-300">
            🎁
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm sm:text-base tracking-wide flex items-center gap-1.5">
              <span>Ежедневные подарки</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-500/20 text-yellow-300 font-bold border border-amber-400/30">
                7 Дней
              </span>
            </span>
            <span className={`text-[10px] sm:text-[11px] font-semibold ${isDesign2026 ? 'text-[#8E939D]' : 'text-amber-200'}`}>
              Заходите каждый день и забирайте ценные награды!
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            closeModal();
          }}
          className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold transition-transform active:scale-90 cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5">
        <div className="max-w-xl mx-auto flex flex-col gap-4 pb-10">

          {/* 7 Days Rewards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {DAILY_REWARDS_SCHEDULE.map(reward => {
              const isPastClaimed = reward.day < currentActiveDay;
              const isToday = reward.day === currentActiveDay;
              const isFuture = reward.day > currentActiveDay;
              const isGrandDay = reward.day === 7;

              return (
                <div
                  key={reward.day}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-between text-center gap-2 relative transition-all ${
                    isGrandDay ? 'col-span-2 sm:col-span-2 bg-gradient-to-br from-amber-950 via-[#2A1D0B] to-[#1A1408] border-yellow-400 ring-2 ring-yellow-400/50 shadow-xl' : ''
                  } ${
                    isToday
                      ? 'bg-gradient-to-b from-amber-950/80 to-[#181C24] border-amber-400 ring-2 ring-amber-400/40 shadow-xl scale-[1.02]'
                      : isPastClaimed
                      ? 'bg-[#12151B] border-white/5 opacity-70'
                      : isDesign2026
                      ? 'bg-[#181C24] border-[#242A35]'
                      : 'hud-parchment border-amber-800'
                  }`}
                >
                  {/* Day Badge */}
                  <div className="flex items-center justify-between w-full text-[10px] font-black uppercase text-[#8E939D]">
                    <span>День {reward.day}</span>
                    {isPastClaimed && (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black shadow">
                        ✓
                      </span>
                    )}
                    {isToday && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500 text-amber-950 font-black text-[8px] animate-pulse">
                        СЕГОДНЯ
                      </span>
                    )}
                    {isGrandDay && !isPastClaimed && (
                      <span className="text-yellow-300 font-extrabold flex items-center gap-0.5">
                        <Sparkles size={11} /> СУПЕР
                      </span>
                    )}
                  </div>

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
                    isToday ? 'bg-amber-500/20 text-yellow-300' : isGrandDay ? 'bg-yellow-500/20 text-yellow-300' : 'bg-black/20'
                  }`}>
                    {reward.tool ? reward.tool.icon : '🎁'}
                  </div>

                  {/* Rewards Breakdown */}
                  <div className="flex flex-col items-center gap-0.5 text-xs">
                    <span className="font-black text-amber-300 flex items-center gap-1">
                      <CoinSvg /> +{reward.coins.toLocaleString('ru-RU')}
                    </span>
                    <span className="font-extrabold text-sky-400 text-[10px] flex items-center gap-0.5">
                      <Zap size={11} /> +{reward.gems} ⚡
                    </span>
                    {reward.tool && (
                      <span className="text-[10px] text-emerald-400 font-bold">
                        +{reward.tool.count} {reward.tool.name}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Claim Action Button */}
          <div className="mt-2">
            <button
              onClick={handleClaim}
              disabled={!isReadyToClaim}
              className={`w-full py-4 rounded-2xl font-black text-sm sm:text-base shadow-2xl flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer border ${
                isReadyToClaim
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-amber-950 border-amber-200 shadow-amber-500/40 animate-bounce'
                  : 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed'
              }`}
            >
              <Gift size={20} />
              <span>
                {isReadyToClaim
                  ? `🎁 Забрать награду Дня ${currentActiveDay}!`
                  : '✅ Награда уже получена сегодня (Заходите завтра!)'}
              </span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
