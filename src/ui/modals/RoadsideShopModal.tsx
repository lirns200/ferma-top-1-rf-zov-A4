import React, { useState } from 'react';
import { useGameStore } from '../../game/gameState';
import { PRODUCTS } from '../../config/products';
import { CROPS } from '../../config/crops';
import { sounds } from '../../audio/SoundManager';
import { triggerTelegramHaptic } from '../../utils/telegram';
import { RefreshCw, Plus, CheckCircle2, Sprout, Sparkles, Store, Newspaper } from 'lucide-react';

const FERTILIZERS_AND_TOOLS = [
  { id: 'speed_grow', name: 'Быстророст 50%', icon: '🧪', desc: 'Ускоряет созревание всех грядок на 50%', cost: 45, type: 'fertilizer' },
  { id: 'double_yield', name: 'Супер-Урожай ×2', icon: '💧', desc: 'Удваивает количество собранного урожая', cost: 75, type: 'fertilizer' },
  { id: 'axe', name: 'Топор дровосека', icon: '🪓', desc: 'Для спила засохших деревьев и добычи древесины', cost: 35, type: 'tool' },
  { id: 'dynamite', name: 'Динамит', icon: '🧨', desc: 'Для взрыва скал и расчистки территории', cost: 50, type: 'tool' },
  { id: 'saw', name: 'Ручная пила', icon: '🪚', desc: 'Для расчистки густых кустарников', cost: 30, type: 'tool' },
  { id: 'shovel', name: 'Лопата', icon: '🪵', desc: 'Для перекопки и выкорчевывания пней', cost: 25, type: 'tool' },
];

export const RoadsideShopModal: React.FC = () => {
  const {
    activeModal,
    shopSlots,
    marketListings,
    inventory,
    coins,
    level,
    createRoadsideSale,
    collectRoadsideCoins,
    buyFromMarket,
    refreshMarket,
    addFloatingText,
    isDesign2026,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'seeds' | 'tools' | 'stand' | 'newspaper'>('seeds');
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

  const handleBuySeed = (cropId: string, cost: number, name: string) => {
    if (coins < cost) {
      alert('Недостаточно монет!');
      return;
    }
    sounds.playCoin();
    triggerTelegramHaptic('success');
    useGameStore.setState(state => ({
      coins: state.coins - cost,
      inventory: {
        ...state.inventory,
        [cropId]: (state.inventory[cropId] || 0) + 3,
      },
    }));
    addFloatingText(`+3 ${name} куплено!`, window.innerWidth / 2, window.innerHeight / 2, '#4ADE80');
  };

  const handleBuyTool = (tool: typeof FERTILIZERS_AND_TOOLS[0]) => {
    if (coins < tool.cost) {
      alert('Недостаточно монет!');
      return;
    }
    sounds.playCoin();
    triggerTelegramHaptic('success');
    useGameStore.setState(state => ({
      coins: state.coins - tool.cost,
      inventory: {
        ...state.inventory,
        [tool.id]: (state.inventory[tool.id] || 0) + 1,
      },
    }));
    addFloatingText(`+1 ${tool.name} куплено!`, window.innerWidth / 2, window.innerHeight / 2, '#38BDF8');
  };

  return (
    <div className={`fixed inset-0 pt-14 sm:pt-16 pb-20 sm:pb-24 z-40 flex flex-col select-none animate-pop-in overflow-hidden transition-colors ${
      isDesign2026 ? 'bg-[#0F1115] text-white' : 'bg-[#2A1406] text-[#3B1F0D]'
    }`}>
      
      {/* ── TOP TABS BAR ── */}
      <div className={`px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 border-b shrink-0 ${
        isDesign2026 ? 'bg-[#181C24] border-[#242A35]' : 'bg-[#3D2008] border-[#5C3718]'
      }`}>
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto">
          
          {/* 1. Семена */}
          <button
            onClick={() => {
              sounds.playClick();
              triggerTelegramHaptic('light');
              setActiveTab('seeds');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
              activeTab === 'seeds'
                ? isDesign2026
                  ? 'bg-emerald-600 text-white shadow-lg border border-emerald-400 scale-105'
                  : 'hud-parchment shadow-lg border-2 border-yellow-400 scale-105 text-[#3B1F0D]'
                : isDesign2026
                ? 'bg-[#242A35] text-[#8E939D] hover:text-white'
                : 'bg-[#2A1406]/80 text-amber-200 border border-amber-900 hover:bg-[#2A1406]'
            }`}
          >
            <Sprout size={15} />
            <span>Семена</span>
          </button>

          {/* 2. Удобрения */}
          <button
            onClick={() => {
              sounds.playClick();
              triggerTelegramHaptic('light');
              setActiveTab('tools');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
              activeTab === 'tools'
                ? isDesign2026
                  ? 'bg-emerald-600 text-white shadow-lg border border-emerald-400 scale-105'
                  : 'hud-parchment shadow-lg border-2 border-yellow-400 scale-105 text-[#3B1F0D]'
                : isDesign2026
                ? 'bg-[#242A35] text-[#8E939D] hover:text-white'
                : 'bg-[#2A1406]/80 text-amber-200 border border-amber-900 hover:bg-[#2A1406]'
            }`}
          >
            <Sparkles size={15} />
            <span>Удобрения и Инструменты</span>
          </button>

          {/* 3. Мой киоск */}
          <button
            onClick={() => {
              sounds.playClick();
              triggerTelegramHaptic('light');
              setActiveTab('stand');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
              activeTab === 'stand'
                ? isDesign2026
                  ? 'bg-purple-600 text-white shadow-lg border border-purple-400 scale-105'
                  : 'hud-parchment shadow-lg border-2 border-yellow-400 scale-105 text-[#3B1F0D]'
                : isDesign2026
                ? 'bg-[#242A35] text-[#8E939D] hover:text-white'
                : 'bg-[#2A1406]/80 text-amber-200 border border-amber-900 hover:bg-[#2A1406]'
            }`}
          >
            <Store size={15} />
            <span>Мой киоск</span>
          </button>

          {/* 4. Газета Долины */}
          <button
            onClick={() => {
              sounds.playClick();
              triggerTelegramHaptic('light');
              setActiveTab('newspaper');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
              activeTab === 'newspaper'
                ? isDesign2026
                  ? 'bg-purple-600 text-white shadow-lg border border-purple-400 scale-105'
                  : 'hud-parchment shadow-lg border-2 border-yellow-400 scale-105 text-[#3B1F0D]'
                : isDesign2026
                ? 'bg-[#242A35] text-[#8E939D] hover:text-white'
                : 'bg-[#2A1406]/80 text-amber-200 border border-amber-900 hover:bg-[#2A1406]'
            }`}
          >
            <Newspaper size={15} />
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
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow active:scale-95 transition-transform cursor-pointer border border-sky-400 shrink-0"
          >
            <RefreshCw size={13} />
            <span>Обновить</span>
          </button>
        )}
      </div>

      {/* ── CONTENT AREA ── */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6">
        <div className="max-w-5xl mx-auto pb-12">
          
          {/* ── TAB 1: СЕМЕНА (SEEDS) ── */}
          {activeTab === 'seeds' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {Object.values(CROPS).map(crop => {
                const unlocked = level >= crop.unlockLevel;
                const seedCost = crop.cost * 3;
                const canAfford = coins >= seedCost;

                return (
                  <div
                    key={crop.id}
                    className={`p-4 rounded-2xl border shadow-md flex flex-col justify-between items-center text-center gap-2 relative ${
                      isDesign2026 ? 'bg-[#181C24] border-[#242A35] text-white' : 'hud-parchment border-[#5C3718] text-[#3B1F0D]'
                    } ${!unlocked ? 'opacity-50 grayscale' : ''}`}
                  >
                    {!unlocked && (
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/80 text-yellow-300 text-[10px] font-black">
                        Ур. {crop.unlockLevel}
                      </div>
                    )}

                    <span className="text-4xl my-1">{crop.icon}</span>
                    <div className="flex flex-col">
                      <span className="font-extrabold text-sm">{crop.name}</span>
                      <span className={`text-[11px] ${isDesign2026 ? 'text-[#8E939D]' : 'text-[#5C3718]'}`}>
                        Созревание: {crop.growTimeSeconds} сек.
                      </span>
                    </div>

                    <button
                      onClick={() => unlocked && handleBuySeed(crop.id, seedCost, crop.name)}
                      disabled={!unlocked || !canAfford}
                      className={`w-full py-2 rounded-xl text-xs font-black shadow transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 ${
                        !unlocked
                          ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                          : canAfford
                          ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white border border-emerald-300'
                          : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      }`}
                    >
                      <span>Купить 3 шт. • {seedCost} 🪙</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── TAB 2: УДОБРЕНИЯ И ИНСТРУМЕНТЫ (TOOLS) ── */}
          {activeTab === 'tools' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {FERTILIZERS_AND_TOOLS.map(item => {
                const canAfford = coins >= item.cost;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border shadow-md flex items-center justify-between gap-3 ${
                      isDesign2026 ? 'bg-[#181C24] border-[#242A35] text-white' : 'hud-parchment border-[#5C3718] text-[#3B1F0D]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-3xl shadow-inner shrink-0 ${
                        isDesign2026 ? 'bg-[#242A35]' : 'bg-amber-100'
                      }`}>
                        {item.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-extrabold text-sm">{item.name}</span>
                        <span className={`text-[11px] line-clamp-1 ${isDesign2026 ? 'text-[#8E939D]' : 'text-[#5C3718]'}`}>
                          {item.desc}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuyTool(item)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-xl text-xs font-black shadow transition-transform active:scale-95 cursor-pointer shrink-0 ${
                        canAfford
                          ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:brightness-110 border border-sky-300'
                          : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      }`}
                    >
                      {item.cost} 🪙
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── TAB 3: МОЙ КИОСК (STAND) ── */}
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

          {/* ── TAB 4: ГАЗЕТА ДОЛИНЫ (NEWSPAPER) ── */}
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
