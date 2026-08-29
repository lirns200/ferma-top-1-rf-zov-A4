import React from 'react';
import { useGameStore } from '../game/gameState';
import { sounds } from '../audio/SoundManager';
import { triggerTelegramHaptic } from '../utils/telegram';

export const BottomActionDock: React.FC = () => {
  const {
    activeModal, openModal, closeModal,
    shopSlots,
    isActionStripOpen, toggleActionStrip,
    isDesign2026,
  } = useGameStore();

  const hasSoldItems = shopSlots.some(s => s.isSold);
  const isInsideTab = activeModal !== null;

  return (
    <footer className={`fixed bottom-0 left-0 right-0 z-50 pointer-events-none select-none ${
      isDesign2026 ? 'p-1.5 sm:p-3 pb-[max(0.35rem,env(safe-area-inset-bottom))]' : 'p-0 pb-[max(0.25rem,env(safe-area-inset-bottom))]'
    }`}>
      
      {/* ── Dynamic Bottom Dock: [Магазин] [Рынок] [Строить/Ферма] [Друзья] [Настройки] ── */}
      <div
        className={`pointer-events-auto w-full grid grid-cols-5 items-center justify-items-center relative transition-all duration-300 ${
          isDesign2026
            ? 'hud-ios26-dock max-w-md mx-auto px-1 sm:px-3 py-1.5 sm:py-2.5 shadow-2xl mb-0.5 sm:mb-1'
            : 'hud-wood-dock max-w-3xl mx-auto px-1.5 sm:px-6 pt-1.5 pb-2.5 sm:pb-4 rounded-t-3xl shadow-2xl border-b-0'
        }`}
      >

        {/* 1. 🎪 Магазин (Магазин строительства и декораций) */}
        <button
          onClick={() => {
            sounds.playClick();
            triggerTelegramHaptic('light');
            if (activeModal === 'shop') closeModal();
            else openModal('shop');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 group active:scale-95 transition-transform cursor-pointer relative w-full ${
            activeModal === 'shop' ? 'scale-105' : ''
          }`}
        >
          <div className={`w-9.5 h-9.5 min-w-[38px] sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl transition-all shadow-inner ${
            activeModal === 'shop'
              ? 'bg-yellow-400 border-2 border-yellow-200 shadow-lg text-[#3B1F0D]'
              : isDesign2026
              ? 'bg-white/10 border border-white/15 hover:bg-white/15'
              : 'bg-amber-950/70 border border-amber-700/80'
          }`}>
            🎪
          </div>
          <span className={`text-[9px] sm:text-xs font-bold tracking-tight ${
            activeModal === 'shop' ? 'text-yellow-300' : isDesign2026 ? 'text-zinc-300' : 'text-amber-200'
          }`}>
            Магазин
          </span>
        </button>

        {/* 2. 🏪 Рынок (Придорожная лавка и Газета объявлений) */}
        <button
          onClick={() => {
            sounds.playClick();
            triggerTelegramHaptic('light');
            if (activeModal === 'roadside' || activeModal === 'market') closeModal();
            else openModal('roadside');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 group active:scale-95 transition-transform cursor-pointer relative w-full ${
            activeModal === 'roadside' || activeModal === 'market' ? 'scale-105' : ''
          }`}
        >
          {hasSoldItems && (
            <span className="absolute -top-1 right-1.5 sm:right-3 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-500 border border-white rounded-full text-white text-[8px] sm:text-[9px] font-black flex items-center justify-center shadow-lg animate-bounce">
              🪙
            </span>
          )}
          <div className={`w-9.5 h-9.5 min-w-[38px] sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl transition-all shadow-inner ${
            activeModal === 'roadside' || activeModal === 'market'
              ? 'bg-yellow-400 border-2 border-yellow-200 shadow-lg text-[#3B1F0D]'
              : isDesign2026
              ? 'bg-white/10 border border-white/15 hover:bg-white/15'
              : 'bg-amber-950/70 border border-amber-700/80'
          }`}>
            🏪
          </div>
          <span className={`text-[9px] sm:text-xs font-bold tracking-tight ${
            activeModal === 'roadside' || activeModal === 'market' ? 'text-yellow-300' : isDesign2026 ? 'text-zinc-300' : 'text-amber-200'
          }`}>
            Рынок
          </span>
        </button>

        {/* 3. 🏡 СТРОИТЬ / 🌾 ФЕРМА (Центральная динамическая кнопка) */}
        <button
          id={isInsideTab ? 'btn-return-farm' : 'btn-build-action'}
          onClick={() => {
            if (isInsideTab) {
              sounds.playClick();
              triggerTelegramHaptic('medium');
              closeModal();
            } else {
              sounds.playClick();
              triggerTelegramHaptic('light');
              toggleActionStrip();
            }
          }}
          className="flex flex-col items-center justify-center gap-0.5 group active:scale-95 transition-transform cursor-pointer w-full -my-1"
        >
          {isInsideTab ? (
            /* Inside Tab: 🌾 Ферма */
            <>
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl transition-all shadow-lg border-2 border-green-300 bg-gradient-to-tr from-green-600 via-emerald-500 to-green-400 text-white animate-pulse">
                🌾
              </div>
              <span className="text-[9px] sm:text-xs font-black tracking-tight text-emerald-400 uppercase leading-tight mt-0.5">
                Ферма
              </span>
            </>
          ) : (
            /* On Farm: 🏡 Строить */
            <>
              <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl transition-all shadow-lg border-2 ${
                isActionStripOpen
                  ? 'border-yellow-200 ring-4 ring-yellow-400/50 scale-105 bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 text-amber-950 shadow-yellow-500/50'
                  : 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-yellow-300 border-yellow-200 shadow-yellow-500/40 text-amber-950 hover:scale-105'
              }`}>
                🏡
              </div>
              <span className="text-[9px] sm:text-xs font-black tracking-tight text-yellow-300 uppercase leading-tight mt-0.5">
                Строить
              </span>
            </>
          )}
        </button>

        {/* 4. 👥 Друзья (Соседи, подарки и рейтинг в Telegram) */}
        <button
          onClick={() => {
            sounds.playClick();
            triggerTelegramHaptic('light');
            if (activeModal === 'friends') closeModal();
            else openModal('friends');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 group active:scale-95 transition-transform cursor-pointer relative w-full ${
            activeModal === 'friends' ? 'scale-105' : ''
          }`}
        >
          <div className={`w-9.5 h-9.5 min-w-[38px] sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl transition-all shadow-inner ${
            activeModal === 'friends'
              ? 'bg-yellow-400 border-2 border-yellow-200 shadow-lg text-[#3B1F0D]'
              : isDesign2026
              ? 'bg-white/10 border border-white/15 hover:bg-white/15'
              : 'bg-amber-950/70 border border-amber-700/80'
          }`}>
            👥
          </div>
          <span className={`text-[9px] sm:text-xs font-bold tracking-tight ${
            activeModal === 'friends' ? 'text-yellow-300' : isDesign2026 ? 'text-zinc-300' : 'text-amber-200'
          }`}>
            Друзья
          </span>
        </button>

        {/* 5. ⚙️ Настройки (Звук, графика, ID фермы) */}
        <button
          onClick={() => {
            sounds.playClick();
            triggerTelegramHaptic('light');
            if (activeModal === 'settings') closeModal();
            else openModal('settings');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 group active:scale-95 transition-transform cursor-pointer relative w-full ${
            activeModal === 'settings' ? 'scale-105' : ''
          }`}
        >
          <div className={`w-9.5 h-9.5 min-w-[38px] sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl transition-all shadow-inner ${
            activeModal === 'settings'
              ? 'bg-yellow-400 border-2 border-yellow-200 shadow-lg text-[#3B1F0D]'
              : isDesign2026
              ? 'bg-white/10 border border-white/15 hover:bg-white/15'
              : 'bg-amber-950/70 border border-amber-700/80'
          }`}>
            ⚙️
          </div>
          <span className={`text-[9px] sm:text-xs font-bold tracking-tight ${
            activeModal === 'settings' ? 'text-yellow-300' : isDesign2026 ? 'text-zinc-300' : 'text-amber-200'
          }`}>
            Опции
          </span>
        </button>

      </div>
    </footer>
  );
};
