import React, { useState } from 'react';
import { useGameStore } from '../../game/gameState';
import { PRODUCTS } from '../../config/products';
import { sounds } from '../../audio/SoundManager';
import { triggerTelegramHaptic } from '../../utils/telegram';
import { RefreshCw, Plus, CheckCircle2 } from 'lucide-react';

export const RoadsideShopModal: React.FC = () => {
  const {
    activeModal,
    shopSlots,
    marketListings,
    inventory,
    coins,
    createRoadsideSale,
    collectRoadsideCoins,
    buyFromMarket,
    refreshMarket,
    isDesign2026,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'stand' | 'newspaper'>('stand');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [sellingItemId, setSellingItemId] = useState<string | null>(null);
  const [sellingCount, setSellingCount] = useState<number>(1);
  const [sellingPrice, setSellingPrice] = useState<number>(10);

  if (activeModal !== 'roadside' && activeModal !== 'market') return null;

  // Available inventory items that can be sold
  const sellableItems = Object.entries(inventory)
    .filter(([_, count]) => count > 0)
    .map(([itemId, count]) => ({
      item: PRODUCTS[itemId],
      count,
    }))
    .filter(i => !!i.item);

  const handleOpenSaleDialog = (slotId: string) => {
    sounds.playClick();
    triggerTelegramHaptic('light');
    setSelectedSlotId(slotId);
    if (sellableItems.length > 0) {
      const first = sellableItems[0];
      setSellingItemId(first.item.id);
      setSellingCount(Math.min(first.count, 5));
      setSellingPrice(Math.round(first.item.basePrice * Math.min(first.count, 5)));
    }
  };

  const handleConfirmSale = () => {
    if (!selectedSlotId || !sellingItemId) return;
    sounds.playCoin();
    triggerTelegramHaptic('success');
    createRoadsideSale(selectedSlotId, sellingItemId, sellingCount, sellingPrice);
    setSelectedSlotId(null);
  };

  return (
    <div className={`fixed inset-0 pt-14 sm:pt-16 pb-20 sm:pb-24 z-40 flex flex-col select-none animate-pop-in overflow-hidden transition-colors ${
      isDesign2026 ? 'bg-[#0F1115] text-white' : 'bg-[#2A1406] text-[#3B1F0D]'
    }`}>
      
      {/* ── TAB SWITCHER ── */}
      <div className={`px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 border-b shrink-0 ${
        isDesign2026 ? 'bg-[#181C24] border-[#242A35]' : 'bg-[#3D2008] border-[#5C3718]'
      }`}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              triggerTelegramHaptic('light');
              setActiveTab('stand');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'stand'
                ? isDesign2026
                  ? 'bg-purple-600 text-white shadow-lg border border-purple-400 scale-105'
                  : 'hud-parchment shadow-lg border-2 border-yellow-400 scale-105 text-[#3B1F0D]'
                : isDesign2026
                ? 'bg-[#242A35] text-[#8E939D] hover:text-white'
                : 'bg-[#2A1406]/80 text-amber-200 border border-amber-900 hover:bg-[#2A1406]'
            }`}
          >
            <span className="text-base">🏪</span>
            <span>Мой киоск</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              triggerTelegramHaptic('light');
              setActiveTab('newspaper');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'newspaper'
                ? isDesign2026
                  ? 'bg-purple-600 text-white shadow-lg border border-purple-400 scale-105'
                  : 'hud-parchment shadow-lg border-2 border-yellow-400 scale-105 text-[#3B1F0D]'
                : isDesign2026
                ? 'bg-[#242A35] text-[#8E939D] hover:text-white'
                : 'bg-[#2A1406]/80 text-amber-200 border border-amber-900 hover:bg-[#2A1406]'
            }`}
          >
            <span className="text-base">📰</span>
            <span>Газета Долины</span>
          </button>
        </div>

        {activeTab === 'newspaper' && (
          <button
            onClick={() => {
              sounds.playClick();
              triggerTelegramHaptic('light');
              refreshMarket();
            }}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow active:scale-95 transition-transform cursor-pointer border border-sky-400"
          >
            <RefreshCw size={13} />
            <span>Обновить</span>
          </button>
        )}
      </div>

      {/* ── CONTENT AREA ── */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6">
        <div className="max-w-4xl mx-auto pb-12">
          
          {/* Tab 1: Roadside Stand Slots */}
          {activeTab === 'stand' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {shopSlots.map(slot => {
                const item = slot.itemId ? PRODUCTS[slot.itemId] : null;

                return (
                  <div
                    key={slot.id}
                    className={`relative flex flex-col items-center justify-between p-4 rounded-2xl border shadow-md min-h-[160px] ${
                      isDesign2026
                        ? 'bg-[#181C24] border-[#242A35] text-white'
                        : 'hud-parchment border-[#5C3718] text-[#3B1F0D]'
                    }`}
                  >
                    {slot.itemId && item ? (
                      slot.isSold ? (
                        <div className="flex flex-col items-center justify-between h-full w-full">
                          <div className="flex items-center gap-1 text-emerald-300 font-black text-xs bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500">
                            <CheckCircle2 size={13} />
                            <span>ПРОДАНО!</span>
                          </div>
                          <span className="text-4xl my-1">{item.icon}</span>
                          <button
                            onClick={() => {
                              sounds.playCoin();
                              triggerTelegramHaptic('success');
                              collectRoadsideCoins(slot.id);
                            }}
                            className="w-full py-2 bg-gradient-to-b from-yellow-400 to-amber-500 text-amber-950 font-black text-xs rounded-xl shadow-md hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>Забрать +{slot.price} 🪙</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-between h-full w-full">
                          <span className="text-xs font-bold text-[#8E939D]">{item.name}</span>
                          <span className="text-4xl my-1">{item.icon}</span>
                          <div className={`flex items-center justify-between w-full text-xs font-black px-3 py-1 rounded-xl border ${
                            isDesign2026
                              ? 'bg-[#242A35] border-[#353D4C] text-white'
                              : 'bg-amber-100/90 border-amber-300 text-[#3B1F0D]'
                          }`}>
                            <span>×{slot.count}</span>
                            <span>{slot.price} 🪙</span>
                          </div>
                        </div>
                      )
                    ) : (
                      <button
                        onClick={() => handleOpenSaleDialog(slot.id)}
                        className="flex flex-col items-center justify-center gap-2 h-full w-full text-[#8E939D] hover:text-white cursor-pointer"
                      >
                        <div className={`w-11 h-11 rounded-full border-2 border-dashed flex items-center justify-center text-xl ${
                          isDesign2026 ? 'bg-[#242A35] border-[#353D4C]' : 'bg-amber-200/80 border-[#5C3718]'
                        }`}>
                          <Plus size={22} />
                        </div>
                        <span className="text-xs font-extrabold">Выставить товар</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Newspaper Market Listings */}
          {activeTab === 'newspaper' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {marketListings.map(listing => {
                const item = PRODUCTS[listing.itemId];
                const canBuy = coins >= listing.price && !listing.sold;

                return (
                  <div
                    key={listing.id}
                    className={`flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl border shadow-md relative ${
                      isDesign2026
                        ? 'bg-[#181C24] border-[#242A35] text-white'
                        : 'hud-parchment border-[#5C3718] text-[#3B1F0D]'
                    } ${listing.sold ? 'opacity-50 grayscale' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#8E939D] truncate max-w-[90px]">
                        {listing.sellerName}
                      </span>
                      <span className="text-xl">{listing.sellerAvatar}</span>
                    </div>

                    <div className="flex flex-col items-center my-2">
                      <span className="text-4xl">{item?.icon || '📦'}</span>
                      <span className="text-xs font-black mt-1">{item?.name}</span>
                      <span className="text-xs font-bold text-amber-400">Кол-во: ×{listing.count}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="text-xs font-black text-yellow-300">🪙 {listing.price}</span>
                      <button
                        onClick={() => {
                          if (canBuy) {
                            sounds.playCoin();
                            triggerTelegramHaptic('success');
                            buyFromMarket(listing.id);
                          }
                        }}
                        disabled={!canBuy}
                        className={`px-3 py-1.5 rounded-xl font-extrabold text-xs shadow transition-transform active:scale-95 ${
                          listing.sold
                            ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                            : canBuy
                            ? 'bg-gradient-to-b from-emerald-500 to-emerald-700 text-white cursor-pointer hover:brightness-110'
                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        }`}
                      >
                        {listing.sold ? 'Куплено' : 'Купить'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
