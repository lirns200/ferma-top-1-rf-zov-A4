import React from 'react';
import { useGameStore } from '../../game/gameState';
import { PRODUCTS } from '../../config/products';
import { X, Trash2, Send, Clock, CheckCircle2 } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-['Fredoka',sans-serif]">
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-amber-800 to-amber-950 rounded-3xl border-4 border-amber-500 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Board Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-amber-950/90 border-b-2 border-amber-700/60">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📋</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Доска заказов городка</h2>
              <p className="text-xs text-amber-300">Выполняйте заказы жителей и отправляйте грузовик с товарами</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
          >
            <X size={20} />
          </button>
        </div>

        {/* Truck Delivery Status Banner */}
        {truckState.isDelivering && (
          <div className="flex items-center justify-center gap-3 bg-blue-900/90 px-4 py-2 text-white font-bold text-xs sm:text-sm border-b border-blue-500/50 animate-pulse">
            <span className="text-xl">🚚</span>
            <span>Грузовик уехал доставлять заказ покупателю...</span>
            <div className="flex items-center gap-1 text-cyan-300">
              <Clock size={14} />
              <span>{Math.max(0, Math.ceil((truckState.deliveringUntil - Date.now()) / 1000))}с</span>
            </div>
          </div>
        )}

        {/* Orders 3x2 Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {orders.map(order => {
            const allItemsAvailable = order.items.every(
              req => (inventory[req.itemId] || 0) >= req.count
            );

            return (
              <div
                key={order.id}
                className={`relative flex flex-col justify-between p-4 rounded-3xl border-2 transition-all shadow-lg ${
                  allItemsAvailable
                    ? 'bg-amber-900/80 border-amber-400 text-white'
                    : 'bg-amber-950/70 border-amber-800 text-amber-200'
                }`}
              >
                {/* Customer header */}
                <div className="flex items-center justify-between mb-3 border-b border-amber-700/50 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{order.customerAvatar}</span>
                    <span className="font-bold text-sm text-white">{order.customerName}</span>
                  </div>
                  <button
                    onClick={() => trashOrder(order.id)}
                    className="text-amber-400/60 hover:text-red-400 p-1 rounded-lg transition-colors"
                    title="Удалить заказ"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Requested Items List */}
                <div className="flex flex-col gap-2 mb-4">
                  {order.items.map(req => {
                    const item = PRODUCTS[req.itemId];
                    const countHave = inventory[req.itemId] || 0;
                    const isEnough = countHave >= req.count;

                    return (
                      <div
                        key={req.itemId}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-xl border ${
                          isEnough 
                            ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
                            : 'bg-amber-950/60 border-amber-800 text-amber-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{item?.icon || '📦'}</span>
                          <span className="text-xs font-bold">{item?.name || req.itemId}</span>
                        </div>
                        <span className={`text-xs font-black ${isEnough ? 'text-emerald-400' : 'text-red-400'}`}>
                          {countHave}/{req.count}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Reward & Send Button */}
                <div className="flex items-center justify-between pt-2 border-t border-amber-700/50">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-300">
                      <span>💰</span>
                      <span>+{order.coinReward}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-blue-300">
                      <span>✨</span>
                      <span>+{order.xpReward} XP</span>
                    </div>
                  </div>

                  <button
                    disabled={!allItemsAvailable || truckState.isDelivering}
                    onClick={() => fulfillOrder(order.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl font-black text-xs shadow-md transition-all ${
                      allItemsAvailable && !truckState.isDelivering
                        ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-emerald-950 shadow-emerald-900/50 active:scale-95'
                        : 'bg-amber-950/60 text-amber-600/60 cursor-not-allowed border border-amber-900'
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
