import React from 'react';
import { useGameStore } from '../game/gameState';
import { sounds } from '../audio/SoundManager';

export const BottomActionDock: React.FC = () => {
  const {
    activeModal, openModal, closeModal,
    truckState, shopSlots, orders,
    isActionStripOpen, toggleActionStrip,
  } = useGameStore();

  const hasSoldItems = shopSlots.some(s => s.isSold);
  const readyOrders = orders.length;

  const isInsideTab = activeModal !== null;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none select-none">
      
      {/* ── Dark Carved Oak Bottom Navigation Dock ── */}
      <div className="hud-wood-dock pointer-events-auto w-full px-2 sm:px-4 py-2 flex items-center justify-around max-w-lg mx-auto rounded-t-3xl shadow-2xl relative">

        {/* 1. 🎪 Магазин (Магазин строительства / Товары) */}
        <button
          onClick={() => {
            sounds.playClick();
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
          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center text-2xl transition-all shadow-inner ${
            activeModal === 'shop'
              ? 'bg-yellow-400 border-yellow-200 shadow-lg text-[#3B1F0D]'
              : 'bg-amber-950/70 border-amber-700/80'
          }`}>
            🎪
          </div>
          <span className={`text-[10px] sm:text-xs font-bold tracking-tight ${
            activeModal === 'shop' ? 'text-yellow-300' : 'text-amber-200'
          }`}>
            Магазин
          </span>
        </button>

        {/* 2. 📦 Склад (Сундук сокровищ — Силос и Амбар) */}
        <button
          onClick={() => {
            sounds.playClick();
            if (activeModal === 'barn' || activeModal === 'silo') closeModal();
            else openModal('barn');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 group active:scale-95 transition-transform cursor-pointer ${
            activeModal === 'barn' || activeModal === 'silo' ? 'scale-105' : ''
          }`}
        >
          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center text-2xl transition-all shadow-inner ${
            activeModal === 'barn' || activeModal === 'silo'
              ? 'bg-yellow-400 border-yellow-200 shadow-lg text-[#3B1F0D]'
              : 'bg-amber-950/70 border-amber-700/80'
          }`}>
            📦
          </div>
          <span className={`text-[10px] sm:text-xs font-bold tracking-tight ${
            activeModal === 'barn' || activeModal === 'silo' ? 'text-yellow-300' : 'text-amber-200'
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
                closeModal();
              }}
              className="hud-build-btn w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex flex-col items-center justify-center gap-0.5 shadow-2xl active:scale-90 transition-all duration-150 cursor-pointer bg-gradient-to-b from-green-400 via-emerald-500 to-green-700 border-2 border-green-200 text-white animate-pulse"
              style={{
                background: 'linear-gradient(180deg, #4ADE80 0%, #22C55E 50%, #15803D 100%)',
                boxShadow: '0 8px 24px rgba(34, 197, 94, 0.6), inset 0 2px 4px rgba(255,255,255,0.6)',
              }}
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
                toggleActionStrip();
              }}
              className={`hud-build-btn w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex flex-col items-center justify-center gap-0.5 shadow-2xl active:scale-90 transition-all duration-150 cursor-pointer ${
                isActionStripOpen ? 'ring-4 ring-yellow-300 brightness-110 scale-105' : ''
              }`}
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
          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center text-2xl transition-all shadow-inner ${
            activeModal === 'orders'
              ? 'bg-yellow-400 border-yellow-200 shadow-lg text-[#3B1F0D]'
              : 'bg-amber-950/70 border-amber-700/80'
          }`}>
            📜
          </div>
          <span className={`text-[10px] sm:text-xs font-bold tracking-tight ${
            activeModal === 'orders' ? 'text-yellow-300' : 'text-amber-200'
          }`}>
            Задания
          </span>
        </button>

        {/* 5. ⚙️ Настройки (Шестерёнка) */}
        <button
          onClick={() => {
            sounds.playClick();
            if (activeModal === 'settings') closeModal();
            else openModal('settings');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 group active:scale-95 transition-transform cursor-pointer ${
            activeModal === 'settings' ? 'scale-105' : ''
          }`}
        >
          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center text-2xl transition-all shadow-inner ${
            activeModal === 'settings'
              ? 'bg-yellow-400 border-yellow-200 shadow-lg text-[#3B1F0D]'
              : 'bg-amber-950/70 border-amber-700/80'
          }`}>
            ⚙️
          </div>
          <span className={`text-[10px] sm:text-xs font-bold tracking-tight ${
            activeModal === 'settings' ? 'text-yellow-300' : 'text-amber-200'
          }`}>
            Настройки
          </span>
        </button>

      </div>
    </footer>
  );
};
