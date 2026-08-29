import React from 'react';
import { useGameStore } from '../game/gameState';
import { sounds } from '../audio/SoundManager';

export const BottomActionDock: React.FC = () => {
  const {
    openModal, getStorageUsed,
    siloCapacity, barnCapacity,
    truckState, shopSlots, orders,
  } = useGameStore();

  const siloUsed = getStorageUsed('silo');
  const barnUsed = getStorageUsed('barn');
  const hasSoldItems = shopSlots.some(s => s.isSold);
  const readyOrders = orders.length;

  const siloPercent = Math.min(100, Math.round((siloUsed / siloCapacity) * 100));
  const barnPercent = Math.min(100, Math.round((barnUsed / barnCapacity) * 100));

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none p-2.5 sm:p-4 select-none">
      <div className="max-w-7xl mx-auto flex items-end justify-between gap-3">

        {/* ── 1. Big Shop FAB (Магазин) ── */}
        <div className="pointer-events-auto">
          <button
            id="btn-build-shop"
            onClick={() => {
              sounds.playClick();
              openModal('shop');
            }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-400 border-3 border-yellow-200 shadow-2xl flex flex-col items-center justify-center gap-0.5 group active:scale-90 transition-all duration-150 cursor-pointer hover:brightness-110 hover:-translate-y-1"
            style={{
              boxShadow: '0 10px 25px rgba(245, 158, 11, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
            }}
          >
            <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">🚜</span>
            <span className="text-[10px] sm:text-xs font-black text-amber-950 uppercase tracking-tight">
              Магазин
            </span>
          </button>
        </div>

        {/* ── 2. Floating Action Dock (FAB Bar) ── */}
        <div 
          className="pointer-events-auto flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-2.5 rounded-3xl border-2 border-amber-600/90 shadow-2xl backdrop-blur-md"
          style={{
            background: 'linear-gradient(180deg, rgba(45, 23, 5, 0.95) 0%, rgba(26, 12, 4, 0.98) 100%)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.75), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
          }}
        >
          {/* Orders Button */}
          <button
            id="btn-orders-board"
            onClick={() => {
              sounds.playClick();
              openModal('orders');
            }}
            className="relative flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-900/80 hover:bg-amber-800 border border-amber-500/60 shadow active:scale-90 transition-all cursor-pointer"
          >
            {/* Notification Badge */}
            {!truckState.isDelivering && readyOrders > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-red-600 border border-white rounded-full text-white text-[10px] font-black flex items-center justify-center shadow-lg animate-bounce">
                {readyOrders}
              </span>
            )}
            {truckState.isDelivering && (
              <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-cyan-400 border border-white rounded-full animate-ping" />
            )}
            <span className="text-xl sm:text-2xl">📋</span>
            <span className="text-[9px] sm:text-[10px] font-bold text-amber-200">Заказы</span>
          </button>

          {/* Silo Button */}
          <button
            id="btn-silo-storage"
            onClick={() => {
              sounds.playClick();
              openModal('silo');
            }}
            className="flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-900/80 hover:bg-amber-800 border border-amber-500/60 shadow active:scale-90 transition-all cursor-pointer"
          >
            <span className="text-xl sm:text-2xl">🌾</span>
            <span className="text-[9px] sm:text-[10px] font-bold text-yellow-300">
              {siloUsed}/{siloCapacity}
            </span>
            {/* Mini Progress Bar */}
            <div className="w-9 h-1.5 bg-amber-950 rounded-full overflow-hidden border border-amber-700/80 mt-0.5">
              <div 
                className={`h-full rounded-full transition-all ${
                  siloPercent >= 90 ? 'bg-red-500' : siloPercent >= 75 ? 'bg-amber-400' : 'bg-green-400'
                }`}
                style={{ width: `${siloPercent}%` }}
              />
            </div>
          </button>

          {/* Barn Button */}
          <button
            id="btn-barn-storage"
            onClick={() => {
              sounds.playClick();
              openModal('barn');
            }}
            className="flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-900/80 hover:bg-amber-800 border border-amber-500/60 shadow active:scale-90 transition-all cursor-pointer"
          >
            <span className="text-xl sm:text-2xl">🏚️</span>
            <span className="text-[9px] sm:text-[10px] font-bold text-yellow-300">
              {barnUsed}/{barnCapacity}
            </span>
            {/* Mini Progress Bar */}
            <div className="w-9 h-1.5 bg-amber-950 rounded-full overflow-hidden border border-amber-700/80 mt-0.5">
              <div 
                className={`h-full rounded-full transition-all ${
                  barnPercent >= 90 ? 'bg-red-500' : barnPercent >= 75 ? 'bg-amber-400' : 'bg-green-400'
                }`}
                style={{ width: `${barnPercent}%` }}
              />
            </div>
          </button>

          {/* Roadside Shop Button */}
          <button
            id="btn-roadside-shop"
            onClick={() => {
              sounds.playClick();
              openModal('roadside');
            }}
            className="relative flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-900/80 hover:bg-amber-800 border border-amber-500/60 shadow active:scale-90 transition-all cursor-pointer"
          >
            {hasSoldItems && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-500 border border-white rounded-full text-white text-[10px] font-black flex items-center justify-center shadow-lg animate-bounce">
                🪙
              </span>
            )}
            <span className="text-xl sm:text-2xl">🏪</span>
            <span className="text-[9px] sm:text-[10px] font-bold text-amber-200">Лавка</span>
          </button>

          {/* Mailbox / Delivery Truck Button */}
          <button
            id="btn-mailbox"
            onClick={() => {
              sounds.playClick();
              openModal('mailbox');
            }}
            className="flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-900/80 hover:bg-amber-800 border border-amber-500/60 shadow active:scale-90 transition-all cursor-pointer"
          >
            <span className="text-xl sm:text-2xl">📬</span>
            <span className="text-[9px] sm:text-[10px] font-bold text-amber-200">Почта</span>
          </button>
        </div>

      </div>
    </footer>
  );
};
