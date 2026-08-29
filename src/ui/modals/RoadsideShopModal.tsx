import React, { useState } from 'react';
import { useGameStore } from '../../game/gameState';
import { PRODUCTS } from '../../config/products';
import { X, RefreshCw, ShoppingCart, Plus, CheckCircle2, Megaphone } from 'lucide-react';

export const RoadsideShopModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    shopSlots,
    marketListings,
    inventory,
    coins,
    createRoadsideSale,
    collectRoadsideCoins,
    buyFromMarket,
    refreshMarket,
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
    createRoadsideSale(selectedSlotId, sellingItemId, sellingCount, sellingPrice);
    setSelectedSlotId(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-['Fredoka',sans-serif]">
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-amber-900 to-amber-950 rounded-3xl border-4 border-amber-500 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-amber-950/80 border-b-2 border-amber-700/60">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{activeTab === 'stand' ? '🏪' : '📰'}</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {activeTab === 'stand' ? 'Придорожный киоск' : 'Газета объявлений Долины'}
              </h2>
              <p className="text-xs text-amber-300">
                {activeTab === 'stand' 
                  ? 'Продавайте излишки урожая и продуктов соседям'
                  : 'Покупайте редкие товары и стройматериалы у других фермеров'}
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-between px-6 pt-3 pb-2 bg-amber-950/50 border-b border-amber-800/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('stand')}
              className={`flex items-center gap-2 px-5 py-2 rounded-2xl font-bold text-sm transition-all ${
                activeTab === 'stand'
                  ? 'bg-amber-500 text-amber-950 shadow-md border border-amber-300'
                  : 'bg-amber-900/60 text-amber-200 hover:bg-amber-800'
              }`}
            >
              <span>🏪</span>
              <span>Мой киоск</span>
            </button>
            <button
              onClick={() => setActiveTab('newspaper')}
              className={`flex items-center gap-2 px-5 py-2 rounded-2xl font-bold text-sm transition-all ${
                activeTab === 'newspaper'
                  ? 'bg-amber-500 text-amber-950 shadow-md border border-amber-300'
                  : 'bg-amber-900/60 text-amber-200 hover:bg-amber-800'
              }`}
            >
              <span>📰</span>
              <span>Газета Долины</span>
            </button>
          </div>

          {activeTab === 'newspaper' && (
            <button
              onClick={refreshMarket}
              className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-md active:scale-95 transition-transform"
            >
              <RefreshCw size={14} />
              <span>Обновить</span>
            </button>
          )}
        </div>

        {/* Tab 1: Roadside Stand Slots */}
        {activeTab === 'stand' && (
          <div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1">
            {shopSlots.map(slot => {
              const item = slot.itemId ? PRODUCTS[slot.itemId] : null;

              return (
                <div
                  key={slot.id}
                  className="relative flex flex-col items-center justify-between p-4 rounded-3xl bg-amber-900/70 border-2 border-amber-600/80 shadow-lg min-h-[160px]"
                >
                  {slot.itemId && item ? (
                    slot.isSold ? (
                      <div className="flex flex-col items-center justify-between h-full w-full">
                        <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/60">
                          <CheckCircle2 size={14} />
                          <span>ПРОДАНО!</span>
                        </div>
                        <span className="text-4xl my-1">{item.icon}</span>
                        <button
                          onClick={() => collectRoadsideCoins(slot.id)}
                          className="w-full py-2 bg-gradient-to-b from-yellow-400 to-amber-500 text-amber-950 font-black text-xs rounded-xl shadow-md hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-1"
                        >
                          <span>Забрать +{slot.price} 💰</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-between h-full w-full">
                        <div className="flex items-center gap-1 text-amber-300 font-bold text-[11px]">
                          <Megaphone size={12} />
                          <span>В продаже</span>
                        </div>
                        <span className="text-4xl my-1">{item.icon}</span>
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-white">{item.name} x{slot.count}</span>
                          <span className="text-xs font-black text-amber-300">{slot.price} 💰</span>
                        </div>
                      </div>
                    )
                  ) : (
                    <button
                      onClick={() => handleOpenSaleDialog(slot.id)}
                      className="flex flex-col items-center justify-center h-full w-full gap-2 text-amber-300/70 hover:text-white transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-amber-950/80 border-2 border-dashed border-amber-500/60 flex items-center justify-center">
                        <Plus size={24} />
                      </div>
                      <span className="text-xs font-bold">Выставить товар</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Daily Newspaper Market */}
        {activeTab === 'newspaper' && (
          <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 flex-1">
            {marketListings.map(listing => {
              const item = PRODUCTS[listing.itemId] || PRODUCTS.wheat;
              const canAfford = coins >= listing.price;

              return (
                <div
                  key={listing.id}
                  className={`flex flex-col justify-between p-4 rounded-3xl border-2 transition-all shadow-lg ${
                    listing.sold
                      ? 'bg-amber-950/40 border-amber-900 text-amber-700/60 opacity-60'
                      : 'bg-amber-900/80 border-amber-500 text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-amber-700/50">
                    <span className="text-2xl">{listing.sellerAvatar}</span>
                    <span className="font-bold text-xs text-amber-200">{listing.sellerName}</span>
                  </div>

                  <div className="flex items-center gap-3 my-2">
                    <span className="text-4xl">{item.icon}</span>
                    <div>
                      <h4 className="font-bold text-sm text-white">{item.name}</h4>
                      <span className="text-xs text-amber-300 font-black">Количество: {listing.count} шт</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-amber-700/50">
                    <div className="flex items-center gap-1 text-sm font-bold text-amber-300">
                      <span>💰</span>
                      <span>{listing.price}</span>
                    </div>

                    <button
                      disabled={listing.sold || !canAfford}
                      onClick={() => buyFromMarket(listing.id)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-black shadow-md transition-transform ${
                        listing.sold
                          ? 'bg-amber-950 text-amber-700 cursor-not-allowed'
                          : canAfford
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950 active:scale-95'
                          : 'bg-amber-950 text-amber-600 cursor-not-allowed'
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

        {/* Create Sale Popup Dialog */}
        {selectedSlotId && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-20 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-amber-950 rounded-3xl border-4 border-amber-500 p-6 flex flex-col gap-4 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Выставить товар на продажу</h3>
                <button
                  onClick={() => setSelectedSlotId(null)}
                  className="w-7 h-7 rounded-full bg-amber-800 flex items-center justify-center text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Select Item */}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-amber-300 font-bold">Выберите товар:</span>
                <div className="flex items-center gap-2 overflow-x-auto p-2 bg-amber-900/60 rounded-2xl border border-amber-800">
                  {sellableItems.map(({ item, count }) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSellingItemId(item.id);
                        setSellingCount(Math.min(count, 5));
                        setSellingPrice(Math.round(item.basePrice * Math.min(count, 5)));
                      }}
                      className={`flex flex-col items-center p-2 rounded-xl border transition-all min-w-[60px] ${
                        sellingItemId === item.id
                          ? 'bg-amber-500 text-amber-950 border-white shadow-md'
                          : 'bg-amber-950 text-white border-amber-700'
                      }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-[10px] font-bold truncate w-full text-center">{item.name}</span>
                      <span className="text-[9px] font-black">{count} шт</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount & Price Controls */}
              {sellingItemId && (
                <>
                  <div className="flex items-center justify-between bg-amber-900/60 p-3 rounded-2xl border border-amber-800">
                    <span className="text-xs text-amber-300 font-bold">Количество:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSellingCount(Math.max(1, sellingCount - 1))}
                        className="w-8 h-8 rounded-lg bg-amber-800 text-white font-black"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm px-2">{sellingCount}</span>
                      <button
                        onClick={() => {
                          const max = inventory[sellingItemId] || 1;
                          setSellingCount(Math.min(max, sellingCount + 1));
                        }}
                        className="w-8 h-8 rounded-lg bg-amber-800 text-white font-black"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-amber-900/60 p-3 rounded-2xl border border-amber-800">
                    <span className="text-xs text-amber-300 font-bold">Цена продажи:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSellingPrice(Math.max(5, sellingPrice - 5))}
                        className="w-8 h-8 rounded-lg bg-amber-800 text-white font-black"
                      >
                        -5
                      </button>
                      <span className="font-bold text-sm text-amber-300 px-2">{sellingPrice} 💰</span>
                      <button
                        onClick={() => setSellingPrice(sellingPrice + 5)}
                        className="w-8 h-8 rounded-lg bg-amber-800 text-white font-black"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={handleConfirmSale}
                className="w-full py-3 bg-gradient-to-b from-emerald-400 to-emerald-600 text-emerald-950 font-black text-sm rounded-2xl shadow-lg active:scale-95 transition-transform"
              >
                Выставить на продажу
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
