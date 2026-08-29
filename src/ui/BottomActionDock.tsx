import React from 'react';
import { useGameStore } from '../game/gameState';
import { sounds } from '../audio/SoundManager';
import { triggerTelegramHaptic } from '../utils/telegram';

export const BottomActionDock: React.FC = () => {
  const {
    activeModal, openModal, closeModal,
    truckState, shopSlots, orders,
    isActionStripOpen, toggleActionStrip,
    isDesign2026,
  } = useGameStore();

  const hasSoldItems = shopSlots.some(s => s.isSold);
  const readyOrders = orders.length;
  const isInsideTab = activeModal !== null;

  return (
    <footer className={`fixed bottom-0 left-0 right-0 z-50 pointer-events-none select-none ${
      isDesign2026 ? 'p-2 sm:p-3' : 'p-0'
    }`}>
      
      {/* ── Dynamic Bottom Dock: Floating Island (2026) OR Flush Bottom Dock (Wood) ── */}
      <div
        className={`pointer-events-auto w-full grid grid-cols-5 items-center justify-items-center relative transition-all duration-300 ${
          isDesign2026
            ? 'hud-ios26-dock max-w-lg mx-auto px-2 sm:px-4 py-2.5 shadow-2xl mb-1 sm:mb-2'
            : 'hud-wood-dock max-w-3xl mx-auto px-2 sm:px-6 pt-2 pb-3 sm:pb-4 rounded-t-3xl shadow-2xl border-b-0'
        }`}
      >

        {/* 1. 🎪 Магазин */}
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
          {hasSoldItems && (
            <span className="absolute -top-1 right-2 sm:right-3 w-4 h-4 bg-green-500 border border-white rounded-full text-white text-[9px] font-black flex items-center justify-center shadow-lg animate-bounce">
              🪙
            </span>
          )}
          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-2xl transition-all shadow-inner ${
            activeModal === 'shop'
              ? 'bg-yellow-400 border-2 border-yellow-200 shadow-lg text-[#3B1F0D]'
              : isDesign2026
              ? 'bg-white/10 border border-white/15 hover:bg-white/15'
              : 'bg-amber-950/70 border border-amber-700/80'
          }`}>
            🎪
          </div>
          <span className={`text-[10px] sm:text-xs font-bold tracking-tight ${
            activeModal === 'shop' ? 'text-yellow-300' : isDesign2026 ? 'text-zinc-300' : 'text-amber-200'
          }`}>
            Магазин
          </span>
        </button>

        {/* 2. 📦 Склад */}
        <button
          onClick={() => {
            sounds.playClick();
            triggerTelegramHaptic('light');
            if (activeModal === 'barn' || activeModal === 'silo') closeModal();
            else openModal('barn');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 group active:scale-95 transition-transform cursor-pointer w-full ${
            activeModal === 'barn' || activeModal === 'silo' ? 'scale-105' : ''
          }`}
        >
          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-2xl transition-all shadow-inner ${
            activeModal === 'barn' || activeModal === 'silo'
              ? 'bg-yellow-400 border-2 border-yellow-200 shadow-lg text-[#3B1F0D]'
              : isDesign2026
              ? 'bg-white/10 border border-white/15 hover:bg-white/15'
              : 'bg-amber-950/70 border border-amber-700/80'
          }`}>
            📦
          </div>
          <span className={`text-[10px] sm:text-xs font-bold tracking-tight ${
            activeModal === 'barn' || activeModal === 'silo' ? 'text-yellow-300' : isDesign2026 ? 'text-zinc-300' : 'text-amber-200'
          }`}>
            Склад
          </span>
        </button>

        {/* 3. 🏡 СТРОИТЬ / 🌾 ФЕРМА */}
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
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl transition-all shadow-lg border-2 border-green-300 bg-gradient-to-tr from-green-600 via-emerald-500 to-green-400 text-white animate-pulse">
                🌾
              </div>
              <span className="text-[10px] sm:text-xs font-black tracking-tight text-emerald-400 uppercase leading-tight mt-0.5">
                Ферма
              </span>
            </>
          ) : (
            /* On Farm: 🏡 Строить */
            <>
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl transition-all shadow-lg border-2 ${
                isActionStripOpen
                  ? 'border-yellow-200 ring-4 ring-yellow-400/50 scale-105 bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 text-amber-950 shadow-yellow-500/50'
                  : 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-yellow-300 border-yellow-200 shadow-yellow-500/40 text-amber-950 hover:scale-105'
              }`}>
                🏡
              </div>
              <span className="text-[10px] sm:text-xs font-black tracking-tight text-yellow-300 uppercase leading-tight mt-0.5">
                Строить
              </span>
            </>
          )}
        </button>

        {/* 4. 📜 Задания */}
        <button
          onClick={() => {
            sounds.playClick();
            triggerTelegramHaptic('light');
            if (activeModal === 'orders') closeModal();
            else openModal('orders');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 group active:scale-95 transition-transform cursor-pointer relative w-full ${
            activeModal === 'orders' ? 'scale-105' : ''
          }`}
        >
          {!truckState.isDelivering && readyOrders > 0 && (
            <span className="absolute -top-1 right-2 sm:right-3 min-w-[18px] h-4 px-1 bg-red-600 border border-white rounded-full text-white text-[9px] font-black flex items-center justify-center shadow-lg animate-bounce">
              {readyOrders}
            </span>
          )}
          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-2xl transition-all shadow-inner ${
            activeModal === 'orders'
              ? 'bg-yellow-400 border-2 border-yellow-200 shadow-lg text-[#3B1F0D]'
              : isDesign2026
              ? 'bg-white/10 border border-white/15 hover:bg-white/15'
              : 'bg-amber-950/70 border border-amber-700/80'
          }`}>
            📜
          </div>
          <span className={`text-[10px] sm:text-xs font-bold tracking-tight ${
            activeModal === 'orders' ? 'text-yellow-300' : isDesign2026 ? 'text-zinc-300' : 'text-amber-200'
          }`}>
            Задания
          </span>
        </button>

        {/* 5. ⚙️ Настройки */}
        <button
          onClick={() => {
            sounds.playClick();
            triggerTelegramHaptic('light');
            if (activeModal === 'settings') closeModal();
            else openModal('settings');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 group active:scale-95 transition-transform cursor-pointer w-full ${
            activeModal === 'settings' ? 'scale-105' : ''
          }`}
        >
          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-2xl transition-all shadow-inner ${
            activeModal === 'settings'
              ? 'bg-yellow-400 border-2 border-yellow-200 shadow-lg text-[#3B1F0D]'
              : isDesign2026
              ? 'bg-white/10 border border-white/15 hover:bg-white/15'
              : 'bg-amber-950/70 border border-amber-700/80'
          }`}>
            ⚙️
          </div>
          <span className={`text-[10px] sm:text-xs font-bold tracking-tight ${
            activeModal === 'settings' ? 'text-yellow-300' : isDesign2026 ? 'text-zinc-300' : 'text-amber-200'
          }`}>
            Настройки
          </span>
        </button>

      </div>
    </footer>
  );
};
