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
    <div className={`fixed inset-0 pt-12 sm:pt-14 pb-16 sm:pb-20 z-40 flex flex-col select-none animate-pop-in overflow-hidden transition-colors ${
      isDesign2026 ? 'bg-[#0F1115] text-white' : 'bg-[#2A1406] text-[#3B1F0D]'
    }`}>

      {/* ── TRUCK DELIVERY STATUS BANNER ── */}
      {truckState.isDelivering && (
        <div className="flex items-center justify-center gap-2.5 bg-blue-900/90 px-3 py-1.5 text-white font-bold text-xs sm:text-sm border-b border-blue-500/50 animate-pulse shrink-0">
          <span className="text-lg sm:text-xl">🛻</span>
          <span>Красный пикап везет заказ в город...</span>
          <div className="flex items-center gap-1 text-cyan-300 font-mono">
            <Clock size={13} />
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
                className={`flex flex-col justify-between p-3 sm:p-4 rounded-2xl shadow-lg border transition-all ${
                  isDesign2026
                    ? allItemsAvailable
                      ? 'bg-[#181C24] border-emerald-500 shadow-emerald-950/40 text-white'
                      : 'bg-[#181C24] border-[#242A35] text-white'
                    : allItemsAvailable
                    ? 'hud-parchment border-green-600 bg-[#FDF7E7] text-[#3B1F0D]'
                    : 'hud-parchment border-[#5C3718] text-[#3B1F0D]'
                }`}
              >
                {/* Customer header */}
                <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{order.customerAvatar}</span>
                    <span className="font-extrabold text-sm">{order.customerName}</span>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      triggerTelegramHaptic('warning');
                      trashOrder(order.id);
                    }}
                    className="text-[#8E939D] hover:text-red-400 p-1 rounded-lg transition-colors cursor-pointer"
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
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                            : isDesign2026
                            ? 'bg-[#242A35] border-[#353D4C] text-[#8E939D]'
                            : 'bg-amber-100/70 border-amber-300 text-amber-950 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{item?.icon || '📦'}</span>
                          <span className="text-xs">{item?.name || req.itemId}</span>
                        </div>
                        <span className={`text-xs font-black ${isEnough ? 'text-emerald-400' : 'text-red-400'}`}>
                          {countHave}/{req.count}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Reward & Send Button */}
                <div className="flex items-center justify-between pt-2.5 border-t border-white/10">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-xs font-extrabold text-yellow-400">
                      <span>🪙</span>
                      <span>+{order.coinReward}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-extrabold text-blue-400">
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
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow transition-all active:scale-95 ${
                      allItemsAvailable && !truckState.isDelivering
                        ? 'bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 border border-emerald-300 text-white cursor-pointer shadow-lg animate-pulse'
                        : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
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
