import React from 'react';
import { useGameStore } from '../../game/gameState';
import { PRODUCTS } from '../../config/products';
import { sounds } from '../../audio/SoundManager';
import { triggerTelegramHaptic } from '../../utils/telegram';
import { Trash2, Send, Clock } from 'lucide-react';

export const OrderBoardModal: React.FC = () => {
  const {
    activeModal,
    orders,
    inventory,
    truckState,
    fulfillOrder,
    trashOrder,
    isDesign2026,
  } = useGameStore();

  if (activeModal !== 'orders') return null;

  return (
    <div className="fixed inset-0 pt-12 sm:pt-14 pb-16 sm:pb-20 z-40 flex flex-col select-none animate-pop-in overflow-hidden game-screen-bg text-amber-100">

      {/* ── TOP HEADER ── */}
      <div className="px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between game-screen-header shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl game-side-medal flex items-center justify-center text-base shadow">
            📋
          </div>
          <span className="font-black text-xs sm:text-sm tracking-wide uppercase text-yellow-300 game-text-gold">
            Доска заказов Долины
          </span>
        </div>
      </div>

      {/* ── TRUCK DELIVERY STATUS BANNER ── */}
      {truckState.isDelivering && (
        <div className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 px-3 py-2 text-yellow-300 font-black text-xs sm:text-sm border-b-2 border-amber-500/80 animate-pulse shrink-0 game-text-gold shadow-md">
          <span className="text-lg sm:text-xl">🛻</span>
          <span>Красный пикап везет заказ в город...</span>
          <div className="flex items-center gap-1 text-amber-200 font-mono bg-black/40 px-2 py-0.5 rounded-md border border-amber-700/60">
            <Clock size={13} className="text-amber-400" />
            <span>{Math.max(0, Math.ceil((truckState.deliveringUntil - Date.now()) / 1000))}с</span>
          </div>
        </div>
      )}

      {/* ── ORDERS CARDS GRID ── */}
      <div className="flex-1 overflow-y-auto p-2.5 sm:p-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4 pb-12">
          {orders.map(order => {
            const allItemsAvailable = order.items.every(
              req => (inventory[req.itemId] || 0) >= req.count
            );

            return (
              <div
                key={order.id}
                className={`flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl shadow-xl game-card transition-all ${
                  allItemsAvailable
                    ? 'border-2 border-emerald-500/90 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                    : 'border border-amber-700/60'
                }`}
              >
                {/* Customer header */}
                <div className="flex items-center justify-between mb-3 border-b border-amber-900/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl filter drop-shadow-md">{order.customerAvatar}</span>
                    <span className="font-black text-sm text-yellow-300 game-text-gold">{order.customerName}</span>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      triggerTelegramHaptic('warning');
                      trashOrder(order.id);
                    }}
                    className="text-amber-400/60 hover:text-rose-400 p-1.5 rounded-lg game-dock-btn transition-colors cursor-pointer"
                    title="Удалить заказ"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Requested Items List */}
                <div className="flex flex-col gap-2 mb-3">
                  {order.items.map(req => {
                    const item = PRODUCTS[req.itemId];
                    const countHave = inventory[req.itemId] || 0;
                    const isEnough = countHave >= req.count;

                    return (
                      <div
                        key={req.itemId}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-xl border ${
                          isEnough 
                            ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-300 font-black shadow-[0_0_6px_rgba(74,222,128,0.3)]'
                            : 'game-badge-slot border-amber-900/60 text-amber-200/80 font-bold'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{item?.icon || '📦'}</span>
                          <span className="text-xs">{item?.name || req.itemId}</span>
                        </div>
                        <span className={`text-xs font-black ${isEnough ? 'text-emerald-300' : 'text-rose-400'}`}>
                          {countHave}/{req.count}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Reward & Send Button */}
                <div className="flex items-center justify-between pt-2.5 border-t border-amber-900/60">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-xs font-black text-yellow-300 game-text-gold">
                      <span>🪙</span>
                      <span>+{order.coinReward}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-black text-sky-300 game-text-shadow">
                      <span>✨</span>
                      <span>+{order.xpReward} XP</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (allItemsAvailable && !truckState.isDelivering) {
                        sounds.playLevelUp();
                        triggerTelegramHaptic('success');
                        fulfillOrder(order.id);
                      }
                    }}
                    disabled={!allItemsAvailable || truckState.isDelivering}
                    className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg transition-all active:scale-95 ${
                      allItemsAvailable && !truckState.isDelivering
                        ? 'game-btn-plus text-white cursor-pointer animate-bounce'
                        : 'bg-black/50 text-amber-500/40 border border-amber-900/40 cursor-not-allowed'
                    }`}
                  >
                    <Send size={14} />
                    <span>Отправить</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
