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
    <footer className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none select-none p-2 sm:p-3">
      
      {/* ── Dynamic Bottom Dock: 5 Equal Columns with Perfectly Centered Center Button ── */}
      <div
        className={`pointer-events-auto w-full max-w-lg mx-auto grid grid-cols-5 items-center justify-items-center relative transition-all duration-300 ${
          isDesign2026
            ? 'hud-ios26-dock px-3 py-2 shadow-2xl rounded-full'
            : 'hud-wood-dock px-2 sm:px-4 py-2 rounded-t-3xl shadow-2xl'
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
            <span className="absolute -top-1 right-3 w-4 h-4 bg-green-500 border border-white rounded-full text-white text-[9px] font-black flex items-center justify-center shadow-lg animate-bounce">
              🪙
            </span>
          )}
          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-2xl transition-all shadow-inner ${
            activeModal === 'shop'
              ? 'bg-yellow-400/90 border border-yellow-200 shadow-lg text-[#3B1F0D]'
              : isDesign2026
              ? 'bg-white/10 border border-white/15 hover:bg-white/15'
              : 'bg-amber-950/70 border-amber-700/80'
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
              ? 'bg-yellow-400/90 border border-yellow-200 shadow-lg text-[#3B1F0D]'
              : isDesign2026
              ? 'bg-white/10 border border-white/15 hover:bg-white/15'
              : 'bg-amber-950/70 border-amber-700/80'
          }`}>
            📦
          </div>
          <span className={`text-[10px] sm:text-xs font-bold tracking-tight ${
            activeModal === 'barn' || activeModal === 'silo' ? 'text-yellow-300' : isDesign2026 ? 'text-zinc-300' : 'text-amber-200'
          }`}>
            Склад
          </span>
        </button>

        {/* 3. 🏡 СТРОИТЬ / 🌾 ФЕРМА (Центральная кнопка — ТОЧНО ПО ЦЕНТРУ!) */}
        <div className="flex items-center justify-center w-full">
          {isInsideTab ? (
            /* Inside Tab Mode: Center button becomes «ФЕРМА» */
            <button
              id="btn-return-farm"
              onClick={() => {
                sounds.playClick();
                triggerTelegramHaptic('medium');
                closeModal();
              }}
              className={`w-12 h-12 sm:w-14 sm:h-14 flex flex-col items-center justify-center gap-0.5 shadow-2xl active:scale-90 transition-all duration-150 cursor-pointer animate-pulse ${
                isDesign2026 ? 'hud-ios26-btn-farm rounded-full' : 'hud-build-btn rounded-2xl'
              }`}
            >
              <span className="text-xl sm:text-2xl filter drop-shadow">🌾</span>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight text-white leading-none">
                Ферма
              </span>
            </button>
          ) : (
            /* On Farm Mode: Center button is «СТРОИТЬ» */
            <button
              id="btn-build-action"
              onClick={() => {
                sounds.playClick();
                triggerTelegramHaptic('light');
                toggleActionStrip();
              }}
              className={`w-12 h-12 sm:w-14 sm:h-14 flex flex-col items-center justify-center gap-0.5 shadow-2xl active:scale-90 transition-all duration-150 cursor-pointer ${
                isDesign2026 ? 'hud-ios26-btn-center rounded-full' : 'hud-build-btn rounded-2xl'
              } ${isActionStripOpen ? 'ring-4 ring-yellow-300 brightness-110 scale-105' : ''}`}
            >
              <span className="text-xl sm:text-2xl filter drop-shadow animate-bounce" style={{ animationDuration: '2.5s' }}>
                🏡
              </span>
              <span className="text-[9px] sm:text-[10px] font-black text-[#3B1F0D] uppercase tracking-tight text-center leading-none">
                Строить
              </span>
            </button>
          )}
        </div>

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
            <span className="absolute -top-1 right-3 min-w-[18px] h-4 px-1 bg-red-600 border border-white rounded-full text-white text-[9px] font-black flex items-center justify-center shadow-lg animate-bounce">
              {readyOrders}
            </span>
          )}
          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-2xl transition-all shadow-inner ${
            activeModal === 'orders'
              ? 'bg-yellow-400/90 border border-yellow-200 shadow-lg text-[#3B1F0D]'
              : isDesign2026
              ? 'bg-white/10 border border-white/15 hover:bg-white/15'
              : 'bg-amber-950/70 border-amber-700/80'
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
              ? 'bg-yellow-400/90 border border-yellow-200 shadow-lg text-[#3B1F0D]'
              : isDesign2026
              ? 'bg-white/10 border border-white/15 hover:bg-white/15'
              : 'bg-amber-950/70 border-amber-700/80'
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
