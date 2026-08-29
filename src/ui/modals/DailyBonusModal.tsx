import React from 'react';
import { useGameStore, DAILY_REWARDS_SCHEDULE } from '../../game/gameState';
import { sounds } from '../../audio/SoundManager';
import { triggerTelegramHaptic } from '../../utils/telegram';
import { Gift, Check, Sparkles, Award, Zap, X, Calendar, Crown } from 'lucide-react';

const CoinSvg = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="shrink-0 inline-block">
    <circle cx="12" cy="12" r="10" fill="url(#coin_db30_g)" stroke="#92400E" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="7.5" stroke="#FEF08A" strokeWidth="1" strokeDasharray="2.5 1" />
    <text x="12" y="16" fontSize="11" fontWeight="900" fill="#78350F" textAnchor="middle" fontFamily="sans-serif">🪙</text>
    <defs>
      <linearGradient id="coin_db30_g" x1="0" y1="0" x2="24" y2="24">
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
  const currentActiveDay = Math.max(1, Math.min(30, dailyBonusStreak || 1));

  const handleClaim = () => {
    claimDailyLoginBonus();
  };

  return (
    <div
      onClick={closeModal}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md select-none animate-pop-in"
    >
      {/* ── CENTERED 30-DAY MODAL DIALOG ── */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-all ${
          isDesign2026
            ? 'bg-[#12161F]/95 border-[#283244] text-white shadow-black/80'
            : 'bg-[#2A1406]/95 border-amber-500/50 text-[#FDE68A] shadow-amber-950/90'
        }`}
      >
        {/* Top Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-b border-white/10 flex items-center justify-between bg-black/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-xl text-amber-950 shadow-md border border-amber-300">
              🎁
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="font-black text-sm sm:text-base text-white tracking-wide">
                  30-Дневный Календарь Наград
                </h2>
                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-amber-500/20 text-yellow-300 border border-amber-400/30">
                  {currentActiveDay} / 30
                </span>
              </div>
              <span className="text-[11px] text-[#8E939D] font-medium">
                Заходите каждый день — награды увеличиваются!
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

        {/* 30-Day Scrollable Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 scrollbar-thin scrollbar-thumb-amber-500/20">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-2.5">
            {DAILY_REWARDS_SCHEDULE.map((reward) => {
              const isPastClaimed = reward.day < currentActiveDay;
              const isToday = reward.day === currentActiveDay;
              const isGrand = reward.day === 7 || reward.day === 14 || reward.day === 21 || reward.day === 28 || reward.day === 30;
              const isMonthFinal = reward.day === 30;

              return (
                <div
                  key={reward.day}
                  className={`p-2 sm:p-2.5 rounded-2xl border flex flex-col items-center justify-between text-center gap-1.5 relative transition-all min-h-[105px] sm:min-h-[115px] ${
                    isMonthFinal
                      ? 'col-span-2 sm:col-span-2 bg-gradient-to-br from-amber-950 via-[#3D2508] to-[#1F1404] border-yellow-400 ring-2 ring-yellow-400/60 shadow-xl'
                      : isGrand
                      ? 'bg-gradient-to-b from-amber-950/60 to-[#181C24] border-amber-400/80 shadow-lg'
                      : isToday
                      ? 'bg-gradient-to-b from-amber-900/60 to-[#181C24] border-amber-400 ring-2 ring-amber-400/50 shadow-xl scale-[1.03]'
                      : isPastClaimed
                      ? 'bg-[#0E1117] border-white/5 opacity-55'
                      : isDesign2026
                      ? 'bg-[#181C24]/90 border-[#242A35]'
                      : 'hud-parchment border-amber-800'
                  }`}
                >
                  {/* Top Day Badge */}
                  <div className="flex items-center justify-between w-full text-[9px] font-black uppercase text-[#8E939D]">
                    <span>Д.{reward.day}</span>
                    {isPastClaimed && (
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-black shadow">
                        ✓
                      </span>
                    )}
                    {isToday && (
                      <span className="px-1 py-0.2 rounded bg-amber-500 text-amber-950 font-black text-[7px] animate-pulse">
                        СЕГОДНЯ
                      </span>
                    )}
                    {isGrand && !isPastClaimed && !isToday && (
                      <span className="text-yellow-400 font-extrabold flex items-center">
                        <Sparkles size={10} />
                      </span>
                    )}
                  </div>

                  {/* Icon */}
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-lg sm:text-xl shadow-inner ${
                    isToday ? 'bg-amber-500/20 text-yellow-300 scale-105' : isGrand ? 'bg-yellow-500/20 text-yellow-300' : 'bg-black/25'
                  }`}>
                    {reward.tool ? reward.tool.icon : '🎁'}
                  </div>

                  {/* Rewards Breakdown */}
                  <div className="flex flex-col items-center gap-0.2 w-full">
                    <span className="font-extrabold text-amber-300 text-[10px] sm:text-[11px] flex items-center gap-0.5 leading-tight">
                      <CoinSvg /> +{reward.coins >= 1000 ? `${(reward.coins / 1000).toFixed(reward.coins % 1000 === 0 ? 0 : 1)}k` : reward.coins}
                    </span>
                    <span className="font-bold text-sky-400 text-[9px] flex items-center gap-0.5 leading-tight">
                      <Zap size={9} /> +{reward.gems} ⚡
                    </span>
                    {reward.tool && (
                      <span className="text-[8px] sm:text-[9px] text-emerald-400 font-extrabold truncate max-w-[90%] leading-tight">
                        +{reward.tool.count} {reward.tool.name}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Claim Action Bar */}
        <div className="p-3.5 sm:p-4 bg-black/40 border-t border-white/10 shrink-0">
          <button
            onClick={handleClaim}
            disabled={!isReadyToClaim}
            className={`w-full py-3.5 sm:py-4 rounded-2xl font-black text-xs sm:text-base shadow-2xl flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer border ${
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
  );
};
