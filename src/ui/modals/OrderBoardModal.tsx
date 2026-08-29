import React from 'react';
import { useGameStore } from '../../game/gameState';
import { PRODUCTS } from '../../config/products';
import { sounds } from '../../audio/SoundManager';
import { ArrowLeft, Trash2, Send, Clock, CheckCircle2 } from 'lucide-react';

export const OrderBoardModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    orders,
    inventory,
    truckState,
    fulfillOrder,
    trashOrder,
  } = useGameStore();

  if (activeModal !== 'orders') return null;

  return (
    <div className="fixed inset-0 pt-14 sm:pt-16 pb-20 sm:pb-24 z-40 flex flex-col bg-[#2A1406] select-none animate-pop-in text-[#3B1F0D] overflow-hidden">

      {/* ── TRUCK DELIVERY STATUS BANNER ── */}
      {truckState.isDelivering && (
        <div className="flex items-center justify-center gap-3 bg-blue-900/90 px-4 py-2 text-white font-bold text-xs sm:text-sm border-b border-blue-500/50 animate-pulse shrink-0">
          <span className="text-xl">🛻</span>
          <span>Красный пикап везет заказ в город...</span>
          <div className="flex items-center gap-1 text-cyan-300 font-mono">
            <Clock size={14} />
            <span>{Math.max(0, Math.ceil((truckState.deliveringUntil - Date.now()) / 1000))}с</span>
          </div>
        </div>
      )}

      {/* ── ORDERS CARDS GRID ── */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 pb-12">
          {orders.map(order => {
            const allItemsAvailable = order.items.every(
              req => (inventory[req.itemId] || 0) >= req.count
            );

            return (
              <div
                key={order.id}
                className={`hud-parchment flex flex-col justify-between p-4 rounded-2xl shadow-lg border-2 transition-all ${
                  allItemsAvailable
                    ? 'border-green-600 bg-[#FDF7E7]'
                    : 'border-[#5C3718]'
                }`}
              >
                {/* Customer header */}
                <div className="flex items-center justify-between mb-3 border-b border-[#5C3718]/30 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{order.customerAvatar}</span>
                    <span className="font-extrabold text-sm text-[#3B1F0D]">{order.customerName}</span>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      trashOrder(order.id);
                    }}
                    className="text-amber-800/60 hover:text-red-700 p-1 rounded-lg transition-colors cursor-pointer"
                    title="Удалить заказ"
                  >
                    <Trash2 size={16} />
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
                            ? 'bg-green-100/80 border-green-500 text-green-950 font-bold'
                            : 'bg-amber-100/70 border-amber-300 text-amber-950 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{item?.icon || '📦'}</span>
                          <span className="text-xs">{item?.name || req.itemId}</span>
                        </div>
                        <span className={`text-xs font-black ${isEnough ? 'text-green-800' : 'text-red-700'}`}>
                          {countHave}/{req.count}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Reward & Send Button */}
                <div className="flex items-center justify-between pt-2.5 border-t border-[#5C3718]/30">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-xs font-extrabold text-amber-900">
                      <span>💰</span>
                      <span>+{order.coinReward}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-extrabold text-blue-900">
                      <span>✨</span>
                      <span>+{order.xpReward} XP</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (allItemsAvailable && !truckState.isDelivering) {
                        sounds.playLevelUp();
                        fulfillOrder(order.id);
                      }
                    }}
                    disabled={!allItemsAvailable || truckState.isDelivering}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow transition-all active:scale-95 ${
                      allItemsAvailable && !truckState.isDelivering
                        ? 'bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 border border-green-300 text-white cursor-pointer shadow-lg animate-pulse'
                        : 'bg-amber-900/30 text-amber-800/60 border border-amber-900/20 cursor-not-allowed'
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
