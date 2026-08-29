import React, { useState, useEffect } from 'react';
import { useGameStore } from '../game/gameState';
import { PRODUCTS } from '../config/products';
import { sounds } from '../audio/SoundManager';
import { triggerTelegramHaptic } from '../utils/telegram';
import { Package, Truck } from 'lucide-react';

export const MarketDeliveryBanner: React.FC = () => {
  const { marketDelivery, claimMarketDelivery, isDesign2026 } = useGameStore();
  const [now, setNow] = useState(Date.now());
  const [hasHonked, setHasHonked] = useState(false);

  useEffect(() => {
    if (!marketDelivery) {
      setHasHonked(false);
      return;
    }

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => clearInterval(interval);
  }, [marketDelivery]);

  if (!marketDelivery) return null;

  const item = PRODUCTS[marketDelivery.itemId] || {
    name: marketDelivery.itemId,
    icon: '📦',
  };

  const totalDuration = Math.max(1, marketDelivery.arrivedAt - marketDelivery.orderedAt);
  const elapsed = Math.max(0, now - marketDelivery.orderedAt);
  const progressPercent = Math.min(100, Math.round((elapsed / totalDuration) * 100));
  const timeLeftSec = Math.max(0, Math.ceil((marketDelivery.arrivedAt - now) / 1000));
  const isArrived = timeLeftSec === 0;

  if (isArrived && !hasHonked) {
    sounds.playTruckHonk();
    triggerTelegramHaptic('success');
    setHasHonked(true);
  }

  const handleClaim = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playCoin();
    triggerTelegramHaptic('success');
    claimMarketDelivery();
  };

  return (
    <div className="fixed top-13 sm:top-20 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md animate-pop-in pointer-events-auto">
      <div
        className={`p-3 sm:p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 ${
          isArrived
            ? 'bg-gradient-to-r from-[#0E2E1F]/95 to-[#133E2B]/95 border-emerald-400 ring-2 ring-emerald-400/50 shadow-emerald-950/80'
            : isDesign2026
            ? 'bg-[#181C24]/95 border-[#2E3644] text-white shadow-black/60'
            : 'hud-parchment border-amber-700 text-[#3B1F0D]'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          
          {/* Left: Vehicle / Delivery Status */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-inner shrink-0 ${
              isArrived ? 'bg-emerald-500/20 text-emerald-300' : 'bg-black/30'
            }`}>
              {isArrived ? '📦' : '🚚'}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs text-white truncate">
                  {isArrived ? `Машина ${marketDelivery.sellerName} прибыла!` : `Машина ${marketDelivery.sellerName} в пути`}
                </span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase shrink-0 ${
                  isArrived ? 'bg-emerald-500/30 text-emerald-300' : 'bg-sky-500/20 text-sky-300'
                }`}>
                  {isArrived ? 'Прибыла' : `${timeLeftSec}с`}
                </span>
              </div>

              <span className="text-[11px] text-[#A0A6B2] flex items-center gap-1 mt-0.5 truncate">
                <span>Везет:</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                  <span className="text-emerald-400 font-black">×{marketDelivery.count} шт.</span>
                </span>
              </span>
            </div>
          </div>

          {/* Right: Action Button or Progress */}
          <div className="shrink-0">
            {isArrived ? (
              <button
                onClick={handleClaim}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs shadow-lg active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer border border-emerald-300 animate-pulse"
              >
                <Package size={14} />
                <span>Забрать</span>
              </button>
            ) : (
              <div className="flex flex-col items-end text-right">
                <span className="text-[10px] font-extrabold text-sky-400 flex items-center gap-1">
                  <Truck size={12} className="animate-pulse" />
                  <span>Едет к вам</span>
                </span>
                <span className="text-[10px] text-[#8E939D] font-bold mt-0.5">
                  {timeLeftSec} сек.
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Road Progress Bar (when driving) */}
        {!isArrived && (
          <div className="w-full bg-black/40 h-2 rounded-full mt-2.5 overflow-hidden p-0.5 border border-white/5 relative">
            <div
              className="bg-gradient-to-r from-sky-500 via-emerald-400 to-emerald-300 h-full rounded-full transition-all duration-300 ease-linear shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
