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
      
      {/* ── Dynamic Bottom Dock: iOS 26 Glass Capsule OR Carved Wood ── */}
      <div
        className={`pointer-events-auto w-full max-w-lg mx-auto flex items-center justify-around relative transition-all duration-300 ${
          isDesign2026
            ? 'hud-ios26-dock px-3 sm:px-5 py-2.5 mb-1 sm:mb-2 shadow-2xl'
            : 'hud-wood-dock px-2 sm:px-4 py-2 rounded-t-3xl shadow-2xl'
        }`}
      >

        {/* 1. 🎪 Магазин (Магазин строительства / Товары) */}
        <button
          onClick={() => {
            sounds.playClick();
            triggerTelegramHaptic('light');
            if (activeModal === 'shop') closeModal();
            else openModal('shop');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 group active:scale-95 transition-transform cursor-pointer relative ${
            activeModal === 'shop' ? 'scale-105' : ''
          }`}
        >
          {hasSoldItems && (
            <span className="absolute -top-1 right-1 w-4 h-4 bg-green-500 border border-white rounded-full text-white text-[9px] font-black flex items-center justify-center shadow-lg animate-bounce">
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

        {/* 2. 📦 Склад (Сундук сокровищ — Силос и Амбар) */}
        <button
          onClick={() => {
            sounds.playClick();
            triggerTelegramHaptic('light');
            if (activeModal === 'barn' || activeModal === 'silo') closeModal();
            else openModal('barn');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 group active:scale-95 transition-transform cursor-pointer ${
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

        {/* 3. 🏡 СТРОИТЬ / 🌾 ФЕРМА (Центральная динамическая кнопка!) */}
        <div className="relative -top-4 sm:-top-5 z-30">
          {isInsideTab ? (
            /* Inside Tab Mode: Center button becomes «ФЕРМА» to return back! */
            <button
              id="btn-return-farm"
              onClick={() => {
                sounds.playClick();
                triggerTelegramHaptic('medium');
                closeModal();
              }}
              className={`w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center justify-center gap-0.5 shadow-2xl active:scale-90 transition-all duration-150 cursor-pointer animate-pulse ${
                isDesign2026 ? 'hud-ios26-btn-farm rounded-full' : 'hud-build-btn rounded-3xl'
              }`}
            >
              <span className="text-2xl sm:text-3xl filter drop-shadow">🌾</span>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-tight text-white">
                Ферма
              </span>
            </button>
          ) : (
            /* On Farm Mode: Center button is «СТРОИТЬ»! */
            <button
              id="btn-build-action"
              onClick={() => {
                sounds.playClick();
                triggerTelegramHaptic('light');
                toggleActionStrip();
              }}
              className={`w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center justify-center gap-0.5 shadow-2xl active:scale-90 transition-all duration-150 cursor-pointer ${
                isDesign2026 ? 'hud-ios26-btn-center rounded-full' : 'hud-build-btn rounded-3xl'
              } ${isActionStripOpen ? 'ring-4 ring-yellow-300 brightness-110 scale-105' : ''}`}
            >
              <span className="text-2xl sm:text-3xl filter drop-shadow animate-bounce" style={{ animationDuration: '2.5s' }}>
                🏡
              </span>
              <span className="text-[10px] sm:text-xs font-black text-[#3B1F0D] uppercase tracking-tight text-center leading-tight">
                Строить
              </span>
            </button>
          )}
        </div>

        {/* 4. 📜 Задания (Свиток со звездой — Доска заказов) */}
        <button
          onClick={() => {
            sounds.playClick();
            triggerTelegramHaptic('light');
            if (activeModal === 'orders') closeModal();
            else openModal('orders');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 group active:scale-95 transition-transform cursor-pointer relative ${
            activeModal === 'orders' ? 'scale-105' : ''
          }`}
        >
          {!truckState.isDelivering && readyOrders > 0 && (
            <span className="absolute -top-1 right-1 min-w-[18px] h-4 px-1 bg-red-600 border border-white rounded-full text-white text-[9px] font-black flex items-center justify-center shadow-lg animate-bounce">
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

        {/* 5. ⚙️ Настройки (Шестерёнка) */}
        <button
          onClick={() => {
            sounds.playClick();
            triggerTelegramHaptic('light');
            if (activeModal === 'settings') closeModal();
            else openModal('settings');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 group active:scale-95 transition-transform cursor-pointer ${
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
