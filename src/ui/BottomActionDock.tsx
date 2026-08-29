import React from 'react';
import { useGameStore } from '../game/gameState';
import { sounds } from '../audio/SoundManager';

export const BottomActionDock: React.FC = () => {
  const {
    openModal,
    truckState, shopSlots, orders,
    isActionStripOpen, toggleActionStrip,
  } = useGameStore();

  const hasSoldItems = shopSlots.some(s => s.isSold);
  const readyOrders = orders.length;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none select-none">
      
      {/* ── Dark Carved Oak Bottom Navigation Dock ── */}
      <div className="hud-wood-dock pointer-events-auto w-full px-2 sm:px-4 py-2 flex items-center justify-around max-w-lg mx-auto rounded-t-3xl shadow-2xl relative">

        {/* 1. 🎪 Магазин (Рынок / Торговля) */}
        <button
          onClick={() => {
            sounds.playClick();
            openModal('roadside');
          }}
          className="flex flex-col items-center justify-center gap-0.5 group active:scale-95 transition-transform cursor-pointer relative"
        >
          {hasSoldItems && (
            <span className="absolute -top-1 right-1 w-4 h-4 bg-green-500 border border-white rounded-full text-white text-[9px] font-black flex items-center justify-center shadow-lg animate-bounce">
              🪙
            </span>
          )}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-950/70 border border-amber-700/80 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shadow-inner">
            🎪
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-amber-200 tracking-tight">
            Магазин
          </span>
        </button>

        {/* 2. 📦 Склад (Сундук сокровищ — Силос и Амбар) */}
        <button
          onClick={() => {
            sounds.playClick();
            openModal('barn');
          }}
          className="flex flex-col items-center justify-center gap-0.5 group active:scale-95 transition-transform cursor-pointer"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-950/70 border border-amber-700/80 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shadow-inner">
            📦
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-amber-200 tracking-tight">
            Склад
          </span>
        </button>

        {/* 3. ⚡ ИСПОЛЬЗОВАТЬ (Большая выступающая желтая кнопка по центру!) */}
        <div className="relative -top-4 sm:-top-5 z-30">
          <button
            id="btn-use-action"
            onClick={() => {
              sounds.playClick();
              toggleActionStrip();
            }}
            className={`hud-build-btn w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex flex-col items-center justify-center gap-0.5 shadow-2xl active:scale-90 transition-all duration-150 cursor-pointer ${
              isActionStripOpen ? 'ring-4 ring-yellow-300 brightness-110 scale-105' : ''
            }`}
          >
            <span className="text-2xl sm:text-3xl filter drop-shadow animate-bounce" style={{ animationDuration: '2.5s' }}>
              ⚡
            </span>
            <span className="text-[9px] sm:text-[10px] font-black text-[#3B1F0D] uppercase tracking-tight text-center leading-tight">
              {isActionStripOpen ? 'Закрыть' : 'Использовать'}
            </span>
          </button>
        </div>

        {/* 4. 📜 Задания (Свиток со звездой — Доска заказов) */}
        <button
          onClick={() => {
            sounds.playClick();
            openModal('orders');
          }}
          className="flex flex-col items-center justify-center gap-0.5 group active:scale-95 transition-transform cursor-pointer relative"
        >
          {!truckState.isDelivering && readyOrders > 0 && (
            <span className="absolute -top-1 right-1 min-w-[18px] h-4 px-1 bg-red-600 border border-white rounded-full text-white text-[9px] font-black flex items-center justify-center shadow-lg animate-bounce">
              {readyOrders}
            </span>
          )}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-950/70 border border-amber-700/80 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shadow-inner">
            📜
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-amber-200 tracking-tight">
            Задания
          </span>
        </button>

        {/* 5. ⚙️ Настройки (Шестерёнка) */}
        <button
          onClick={() => {
            sounds.playClick();
            openModal('settings');
          }}
          className="flex flex-col items-center justify-center gap-0.5 group active:scale-95 transition-transform cursor-pointer"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-950/70 border border-amber-700/80 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shadow-inner">
            ⚙️
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-amber-200 tracking-tight">
            Настройки
          </span>
        </button>

      </div>
    </footer>
  );
};
