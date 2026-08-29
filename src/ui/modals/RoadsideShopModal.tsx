import React, { useState, useMemo } from 'react';
import { useGameStore } from '../../game/gameState';
import { PRODUCTS } from '../../config/products';
import { sounds } from '../../audio/SoundManager';
import { triggerTelegramHaptic, getTelegramUserProfile } from '../../utils/telegram';
import {
  Search,
  SlidersHorizontal,
  TrendingUp,
  Store,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpDown,
  ShoppingBag,
  History,
  Tag,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  ChevronRight,
} from 'lucide-react';

type MarketTab = 'browse' | 'sell' | 'my_listings' | 'history';
type MarketCategory = 'all' | 'crop' | 'product' | 'material' | 'animal' | 'fish';

interface TransactionHistoryItem {
  id: string;
  type: 'buy' | 'sell';
  itemName: string;
  itemIcon: string;
  count: number;
  price: number;
  timestamp: string;
  otherUser: string;
}

const INITIAL_HISTORY: TransactionHistoryItem[] = [
  {
    id: 'tx_1',
    type: 'sell',
    itemName: 'Хлеб',
    itemIcon: '🍞',
    count: 3,
    price: 60,
    timestamp: '5 мин. назад',
    otherUser: '@pavel_durov',
  },
  {
    id: 'tx_2',
    type: 'buy',
    itemName: 'Доски',
    itemIcon: '🪵',
    count: 5,
    price: 150,
    timestamp: '25 мин. назад',
    otherUser: '@farmer_ivan',
  },
  {
    id: 'tx_3',
    type: 'sell',
    itemName: 'Морковь',
    itemIcon: '🥕',
    count: 10,
    price: 100,
    timestamp: '1 ч. назад',
    otherUser: '@alice_green',
  },
];

const CoinSvg = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0 inline-block">
    <circle cx="12" cy="12" r="10" fill="url(#coin_m_g)" stroke="#92400E" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="7.5" stroke="#FEF08A" strokeWidth="1" strokeDasharray="2.5 1" />
    <text x="12" y="16" fontSize="11" fontWeight="900" fill="#78350F" textAnchor="middle" fontFamily="sans-serif">🪙</text>
    <defs>
      <linearGradient id="coin_m_g" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
  </svg>
);

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
    addFloatingText,
    isDesign2026,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<MarketTab>('browse');
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [historyList, setHistoryList] = useState<TransactionHistoryItem[]>(INITIAL_HISTORY);

  // Sell form state
  const [sellItemKey, setSellItemKey] = useState<string>('wheat');
  const [sellCount, setSellCount] = useState<number>(1);
  const [sellPrice, setSellPrice] = useState<number>(10);

  if (activeModal !== 'roadside' && activeModal !== 'market') return null;

  const tgProfile = getTelegramUserProfile();

  const allTradableItems = useMemo(() => {
    return Object.values(PRODUCTS);
  }, []);

  const filteredTradableItems = useMemo(() => {
    return allTradableItems.filter(item => {
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'crop' && item.category !== 'crop') return false;
        if (selectedCategory === 'product' && item.category !== 'product') return false;
        if (selectedCategory === 'material' && item.category !== 'material') return false;
        if (selectedCategory === 'animal' && item.category !== 'animal_feed' && item.category !== 'animal_produce') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allTradableItems, selectedCategory, searchQuery]);

  const userInventoryItems = useMemo(() => {
    return Object.entries(inventory)
      .filter(([_, count]) => count > 0)
      .map(([id, count]) => ({
        item: PRODUCTS[id] || { id, name: id, icon: '📦', basePrice: 10, category: 'product' },
        count,
      }));
  }, [inventory]);

  const selectedItem = selectedItemId ? PRODUCTS[selectedItemId] : null;

  const itemMarketListings = useMemo(() => {
    if (!selectedItemId) return [];
    return marketListings.filter(l => l.itemId === selectedItemId && !l.sold);
  }, [marketListings, selectedItemId]);

  const handleSelectSellItem = (itemKey: string, availableCount: number) => {
    sounds.playClick();
    triggerTelegramHaptic('light');
    setSellItemKey(itemKey);
    setSellCount(Math.min(5, availableCount));
    const base = PRODUCTS[itemKey]?.basePrice || 10;
    setSellPrice(Math.round(base * Math.min(5, availableCount) * 1.2));
  };

  const handlePublishListing = () => {
    if (!sellItemKey || sellCount <= 0) return;
    const available = inventory[sellItemKey] || 0;
    if (available < sellCount) {
      alert('Недостаточно предметов на складе!');
      return;
    }

    const freeSlot = shopSlots.find(s => !s.itemId);
    if (!freeSlot) {
      alert('Все торговые слоты заняты! Освободите место или дождитесь продажи.');
      return;
    }

    sounds.playCoin();
    triggerTelegramHaptic('success');
    createRoadsideSale(freeSlot.id, sellItemKey, sellCount, sellPrice);

    const prod = PRODUCTS[sellItemKey];
    setHistoryList(prev => [
      {
        id: `tx_${Date.now()}`,
        type: 'sell',
        itemName: prod?.name || sellItemKey,
        itemIcon: prod?.icon || '📦',
        count: sellCount,
        price: sellPrice,
        timestamp: 'Только что',
        otherUser: 'Торговая площадка',
      },
      ...prev,
    ]);

    addFloatingText(`Лот выставлен за ${sellPrice} 🪙!`, window.innerWidth / 2, window.innerHeight / 2, '#4ADE80');
    setActiveTab('my_listings');
  };

  const handleBuyMarketListing = (listingId: string, itemName: string, price: number, count: number) => {
    if (coins < price) {
      alert('Недостаточно монет для покупки!');
      return;
    }

    sounds.playCoin();
    triggerTelegramHaptic('success');
    buyFromMarket(listingId);

    setHistoryList(prev => [
      {
        id: `tx_${Date.now()}`,
        type: 'buy',
        itemName,
        itemIcon: PRODUCTS[selectedItemId || '']?.icon || '📦',
        count,
        price,
        timestamp: 'Только что',
        otherUser: '@valley_trader',
      },
      ...prev,
    ]);

    addFloatingText(`Куплено: ${itemName} ×${count}!`, window.innerWidth / 2, window.innerHeight / 2, '#38BDF8');
  };

  return (
    <div className={`fixed inset-0 pt-14 sm:pt-16 pb-20 sm:pb-24 z-40 flex flex-col select-none animate-pop-in overflow-hidden transition-colors ${
      isDesign2026 ? 'bg-[#0F1115] text-white' : 'bg-[#2A1406] text-[#3B1F0D]'
    }`}>
      
      {/* ── TOP STEAM MARKET HEADER ── */}
      <div className={`px-3 sm:px-6 py-2.5 flex flex-col gap-2.5 border-b shrink-0 ${
        isDesign2026 ? 'bg-[#181C24] border-[#242A35]' : 'bg-[#3D2008] border-[#5C3718]'
      }`}>
        <div className="flex items-center justify-between gap-3">
          
          {/* Market Title Badge */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-base shadow border border-sky-400/40">
              🏪
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-wide uppercase flex items-center gap-1.5">
                <span>Рынок Долины</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-400/30 uppercase">
                  Steam Market
                </span>
              </span>
              <span className={`text-[11px] ${isDesign2026 ? 'text-[#8E939D]' : 'text-amber-200'}`}>
                Торговая площадка между игроками
              </span>
            </div>
          </div>

          {/* Player Balance */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow font-black text-xs ${
            isDesign2026 ? 'bg-[#242A35] border-[#353D4C] text-amber-300' : 'bg-amber-100 border-amber-400 text-[#3B1F0D]'
          }`}>
            <CoinSvg />
            <span>{coins.toLocaleString('ru-RU')}</span>
          </div>

        </div>

        {/* ── STEAM MARKET NAVIGATION TABS ── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          
          {/* Tab 1: Торговая площадка */}
          <button
            onClick={() => {
              sounds.playClick();
              triggerTelegramHaptic('light');
              setActiveTab('browse');
              setSelectedItemId(null);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
              activeTab === 'browse'
                ? isDesign2026
                  ? 'bg-sky-600 text-white shadow-lg border border-sky-400 scale-105'
                  : 'hud-parchment shadow-lg border-2 border-yellow-400 scale-105 text-[#3B1F0D]'
                : isDesign2026
                ? 'bg-[#242A35] text-[#8E939D] hover:text-white'
                : 'bg-[#2A1406]/80 text-amber-200 border border-amber-900 hover:bg-[#2A1406]'
            }`}
          >
            <ShoppingBag size={14} />
            <span>Торговая площадка</span>
          </button>

          {/* Tab 2: Продать предмет */}
          <button
            onClick={() => {
              sounds.playClick();
              triggerTelegramHaptic('light');
              setActiveTab('sell');
              setSelectedItemId(null);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
              activeTab === 'sell'
                ? isDesign2026
                  ? 'bg-emerald-600 text-white shadow-lg border border-emerald-400 scale-105'
                  : 'hud-parchment shadow-lg border-2 border-yellow-400 scale-105 text-[#3B1F0D]'
                : isDesign2026
                ? 'bg-[#242A35] text-[#8E939D] hover:text-white'
                : 'bg-[#2A1406]/80 text-amber-200 border border-amber-900 hover:bg-[#2A1406]'
            }`}
          >
            <Plus size={14} />
            <span>Продать предмет</span>
          </button>

          {/* Tab 3: Мои активные лоты */}
          <button
            onClick={() => {
              sounds.playClick();
              triggerTelegramHaptic('light');
              setActiveTab('my_listings');
              setSelectedItemId(null);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 relative ${
              activeTab === 'my_listings'
                ? isDesign2026
                  ? 'bg-purple-600 text-white shadow-lg border border-purple-400 scale-105'
                  : 'hud-parchment shadow-lg border-2 border-yellow-400 scale-105 text-[#3B1F0D]'
                : isDesign2026
                ? 'bg-[#242A35] text-[#8E939D] hover:text-white'
                : 'bg-[#2A1406]/80 text-amber-200 border border-amber-900 hover:bg-[#2A1406]'
            }`}
          >
            <Tag size={14} />
            <span>Мои лоты</span>
            {shopSlots.some(s => s.isSold) && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute top-1 right-1" />
            )}
          </button>

          {/* Tab 4: История сделок */}
          <button
            onClick={() => {
              sounds.playClick();
              triggerTelegramHaptic('light');
              setActiveTab('history');
              setSelectedItemId(null);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
              activeTab === 'history'
                ? isDesign2026
                  ? 'bg-amber-600 text-white shadow-lg border border-amber-400 scale-105'
                  : 'hud-parchment shadow-lg border-2 border-yellow-400 scale-105 text-[#3B1F0D]'
                : isDesign2026
                ? 'bg-[#242A35] text-[#8E939D] hover:text-white'
                : 'bg-[#2A1406]/80 text-amber-200 border border-amber-900 hover:bg-[#2A1406]'
            }`}
          >
            <History size={14} />
            <span>История</span>
          </button>

        </div>
      </div>

      {/* ── SCROLLABLE CONTENT AREA ── */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5">
        <div className="max-w-5xl mx-auto flex flex-col gap-4 pb-12">

          {/* ════════════════════════════════════════════════════════════
              TAB 1: ТОРГОВАЯ ПЛОЩАДКА (КАТАЛОГ STEAM MARKET)
              ════════════════════════════════════════════════════════════ */}
          {activeTab === 'browse' && !selectedItemId && (
            <>
              {/* 🔥 LIVE STEAM MARKET TICKER */}
              <div className={`px-3.5 py-2 rounded-xl border flex items-center justify-between gap-3 text-xs overflow-hidden ${
                isDesign2026 ? 'bg-[#181C24] border-[#242A35]' : 'hud-parchment border-amber-800'
              }`}>
                <div className="flex items-center gap-2 shrink-0 font-extrabold text-amber-400">
                  <span className="text-sm animate-bounce">🔥</span>
                  <span className="uppercase text-[10px] tracking-wider">Тренды рынка:</span>
                </div>
                <div className="flex items-center gap-4 overflow-x-auto text-[11px] font-bold text-[#8E939D] scrollbar-none">
                  <span className="flex items-center gap-1 shrink-0">
                    <span>🪵 Доски</span>
                    <b className="text-emerald-400 font-extrabold">+18.4%</b>
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    <span>🪓 Топоры</span>
                    <b className="text-emerald-400 font-extrabold">+24.1%</b>
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    <span>🍞 Хлеб</span>
                    <b className="text-rose-400 font-extrabold">-3.2%</b>
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    <span>🥕 Морковь</span>
                    <b className="text-emerald-400 font-extrabold">+9.5%</b>
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    <span>🧀 Сыр</span>
                    <b className="text-emerald-400 font-extrabold">+12.0%</b>
                  </span>
                </div>
              </div>

              {/* Search & Category Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 justify-between">
                
                {/* Search Input */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border w-full sm:w-80 ${
                  isDesign2026 ? 'bg-[#181C24] border-[#242A35] text-white' : 'bg-amber-100 border-[#5C3718] text-[#3B1F0D]'
                }`}>
                  <Search size={16} className="text-[#8E939D] shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Поиск по рынку..."
                    className="bg-transparent border-none outline-none text-xs font-bold w-full placeholder:text-[#8E939D]"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-xs text-[#8E939D] hover:text-white">✕</button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                  {[
                    { id: 'all', label: 'Все', icon: '🌟' },
                    { id: 'crop', label: 'Урожай', icon: '🌾' },
                    { id: 'product', label: 'Продукция', icon: '🍞' },
                    { id: 'material', label: 'Материалы', icon: '🪵' },
                    { id: 'animal', label: 'Животные', icon: '🥚' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        sounds.playClick();
                        setSelectedCategory(cat.id as MarketCategory);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                        selectedCategory === cat.id
                          ? 'bg-sky-600 text-white shadow border border-sky-400'
                          : isDesign2026
                          ? 'bg-[#181C24] text-[#8E939D] border border-[#242A35] hover:text-white'
                          : 'bg-amber-100/80 text-[#3B1F0D] border border-amber-300'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>

              </div>

              {/* Items Grid (Steam Catalog Cards) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {filteredTradableItems.map(item => {
                  const matchingListings = marketListings.filter(l => l.itemId === item.id && !l.sold);
                  const minPrice = matchingListings.length > 0
                    ? Math.min(...matchingListings.map(l => l.price))
                    : item.basePrice;
                  const totalLots = matchingListings.length > 0
                    ? matchingListings.reduce((sum, l) => sum + l.count, 0)
                    : 14;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        sounds.playClick();
                        triggerTelegramHaptic('light');
                        setSelectedItemId(item.id);
                      }}
                      className={`p-3.5 rounded-2xl border shadow flex flex-col justify-between items-center text-center gap-2 group cursor-pointer transition-all hover:scale-[1.02] hover:border-sky-500/60 ${
                        isDesign2026
                          ? 'bg-[#181C24] border-[#242A35] text-white'
                          : 'hud-parchment border-[#5C3718] text-[#3B1F0D]'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner bg-black/20 my-1 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>

                      <div className="flex flex-col">
                        <span className="font-extrabold text-xs sm:text-sm tracking-tight">{item.name}</span>
                        <span className="text-[11px] text-[#8E939D]">
                          В продаже: {totalLots} шт.
                        </span>
                      </div>

                      <div className="w-full pt-2 border-t border-white/10 flex items-center justify-between">
                        <div className="flex flex-col text-left">
                          <span className="text-[9px] text-[#8E939D] uppercase">Начиная с</span>
                          <span className="text-xs font-black text-amber-400 flex items-center gap-0.5">
                            <CoinSvg /> {minPrice}
                          </span>
                        </div>

                        <div className="p-1.5 rounded-lg bg-sky-600 group-hover:bg-sky-500 text-white shadow">
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ════════════════════════════════════════════════════════════
              STEAM ORDER BOOK / ITEM DETAIL VIEW
              ════════════════════════════════════════════════════════════ */}
          {activeTab === 'browse' && selectedItem && (
            <div className="flex flex-col gap-4">
              
              {/* Back button */}
              <button
                onClick={() => setSelectedItemId(null)}
                className="flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 cursor-pointer self-start"
              >
                ← Вернуться в каталог рынка
              </button>

              {/* Item Header Card */}
              <div className={`p-4 sm:p-5 rounded-2xl border shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 ${
                isDesign2026 ? 'bg-[#181C24] border-[#242A35] text-white' : 'hud-parchment border-amber-600 text-[#3B1F0D]'
              }`}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-black/30 flex items-center justify-center text-4xl shadow-inner shrink-0">
                    {selectedItem.icon}
                  </div>
                  <div className="flex flex-col">
                    <h2 className="font-black text-lg flex items-center gap-2">
                      <span>{selectedItem.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-400/30 uppercase">
                        {selectedItem.category}
                      </span>
                    </h2>
                    <p className={`text-xs ${isDesign2026 ? 'text-[#8E939D]' : 'text-[#5C3718]'}`}>
                      {selectedItem.description || 'Популярный фермерский товар на Торговой площадке Долины.'}
                    </p>
                    <div className="flex items-center gap-3 text-xs font-bold mt-1.5">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <TrendingUp size={13} />
                        <span>Медианная цена: {selectedItem.basePrice} 🪙</span>
                      </span>
                      <span className="text-amber-400">
                        Объем 24ч: 1,420 шт.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setActiveTab('sell');
                      setSellItemKey(selectedItem.id);
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-black text-xs shadow-lg active:scale-95 transition-transform cursor-pointer shrink-0 border border-emerald-400"
                  >
                    + Продать товар
                  </button>
                  <button
                    onClick={() => {
                      sounds.playCoin();
                      triggerTelegramHaptic('success');
                      addFloatingText(`Запрос на автовыкуп ${selectedItem.name} создан!`, window.innerWidth / 2, window.innerHeight / 2, '#38BDF8');
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#242A35] hover:bg-[#353D4C] text-white font-black text-xs shadow-lg active:scale-95 transition-transform cursor-pointer shrink-0 border border-white/10"
                  >
                    Заказ на покупку
                  </button>
                </div>
              </div>

              {/* 📈 STEAM INTERACTIVE PRICE CHART (Динамика цен за 24ч) */}
              <div className={`p-4 rounded-2xl border shadow-lg flex flex-col gap-2.5 ${
                isDesign2026 ? 'bg-[#181C24] border-[#242A35] text-white' : 'hud-parchment border-amber-700/60 text-[#3B1F0D]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-[#8E939D] flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-emerald-400" />
                      <span>График цен Steam (24 часа)</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-black">+14.2%</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#8E939D]">
                    <span>Мин: <b className="text-white">{Math.round(selectedItem.basePrice * 0.85)} 🪙</b></span>
                    <span>•</span>
                    <span>Макс: <b className="text-white">{Math.round(selectedItem.basePrice * 1.35)} 🪙</b></span>
                  </div>
                </div>

                {/* SVG Chart Graphic */}
                <div className="w-full h-28 bg-black/25 rounded-xl p-2 relative overflow-hidden border border-white/5 flex items-end">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 400 80" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chart_grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 60 Q 50 40, 100 55 T 200 35 T 300 45 T 400 20 L 400 80 L 0 80 Z"
                      fill="url(#chart_grad)"
                    />
                    <path
                      d="M 0 60 Q 50 40, 100 55 T 200 35 T 300 45 T 400 20"
                      fill="none"
                      stroke="#34D399"
                      strokeWidth="2.5"
                    />
                    {/* Data Points */}
                    {[
                      [0, 60], [100, 55], [200, 35], [300, 45], [400, 20]
                    ].map(([cx, cy], i) => (
                      <circle key={i} cx={cx} cy={cy} r="3.5" fill="#34D399" stroke="#064E3B" strokeWidth="1.5" />
                    ))}
                  </svg>
                </div>
              </div>

              {/* Active Listings Table (Как в Steam) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-extrabold text-[#8E939D] uppercase tracking-wider">
                    Предложения игроков на рынке ({itemMarketListings.length > 0 ? itemMarketListings.length : 4} лотов)
                  </span>
                  <span className="text-xs text-sky-400 font-bold">
                    Комиссия Steam: 5%
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {[
                    { id: 'lot_1', seller: '@dasha_agro', avatar: '👩‍🌾', count: 5, price: Math.round(selectedItem.basePrice * 5 * 0.9) },
                    { id: 'lot_2', seller: '@ivan_tractor', avatar: '👨‍🌾', count: 10, price: Math.round(selectedItem.basePrice * 10) },
                    { id: 'lot_3', seller: '@mikhail_bee', avatar: '🐝', count: 3, price: Math.round(selectedItem.basePrice * 3 * 1.1) },
                    { id: 'lot_4', seller: '@alex_top1', avatar: '🚜', count: 8, price: Math.round(selectedItem.basePrice * 8 * 1.2) },
                  ].map(lot => (
                    <div
                      key={lot.id}
                      className={`p-3 sm:p-4 rounded-2xl border shadow flex items-center justify-between gap-3 ${
                        isDesign2026
                          ? 'bg-[#181C24] border-[#242A35] text-white'
                          : 'hud-parchment border-amber-700/60 text-[#3B1F0D]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center text-2xl">
                          {lot.avatar}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-xs sm:text-sm">{lot.seller}</span>
                          <span className="text-xs text-[#8E939D]">
                            Количество: <b className="text-white font-bold">{lot.count} шт.</b>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex flex-col text-right">
                          <span className="text-sm font-black text-amber-400 flex items-center gap-1">
                            <CoinSvg /> {lot.price}
                          </span>
                          <span className="text-[10px] text-[#8E939D]">
                            {(lot.price / lot.count).toFixed(1)} 🪙 / шт.
                          </span>
                        </div>

                        <button
                          onClick={() => handleBuyMarketListing(lot.id, selectedItem.name, lot.price, lot.count)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-black text-xs shadow-lg active:scale-95 transition-transform cursor-pointer border border-sky-400"
                        >
                          Купить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              TAB 2: ПРОДАТЬ ПРЕДМЕТ (ВЫСТАВЛЕНИЕ ЛОТА НА STEAM MARKET)
              ════════════════════════════════════════════════════════════ */}
          {activeTab === 'sell' && (
            <div className="flex flex-col sm:flex-row gap-4">
              
              {/* Left Column: Select Item from Inventory */}
              <div className="flex-1 flex flex-col gap-2">
                <span className="text-xs font-extrabold text-[#8E939D] uppercase tracking-wider px-1">
                  Выберите предмет со склада
                </span>

                {userInventoryItems.length === 0 ? (
                  <div className={`p-8 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 ${
                    isDesign2026 ? 'bg-[#181C24] border-[#242A35] text-[#8E939D]' : 'hud-parchment text-[#5C3718]'
                  }`}>
                    <span className="text-4xl">📦</span>
                    <span className="font-bold text-sm">Ваш склад пуст!</span>
                    <span className="text-xs">Соберите урожай или произведите товары, чтобы продавать на рынке.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {userInventoryItems.map(({ item, count }) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectSellItem(item.id, count)}
                        className={`p-3 rounded-2xl border shadow flex flex-col items-center justify-between text-center gap-1 cursor-pointer transition-all ${
                          sellItemKey === item.id
                            ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-400/50 scale-105'
                            : isDesign2026
                            ? 'bg-[#181C24] border-[#242A35] text-white hover:border-white/30'
                            : 'hud-parchment border-amber-700/60 text-[#3B1F0D]'
                        }`}
                      >
                        <span className="text-3xl my-0.5">{item.icon}</span>
                        <span className="font-bold text-xs truncate max-w-full">{item.name}</span>
                        <span className="text-[11px] font-black text-emerald-400">×{count} на складе</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Pricing & Fee Calculator */}
              <div className={`w-full sm:w-80 p-4 sm:p-5 rounded-2xl border shadow-xl flex flex-col justify-between gap-4 ${
                isDesign2026 ? 'bg-[#181C24] border-[#242A35] text-white' : 'hud-parchment border-amber-600 text-[#3B1F0D]'
              }`}>
                <div>
                  <span className="text-xs font-black uppercase text-[#8E939D]">
                    Параметры лота
                  </span>

                  {/* Selected Item Info */}
                  <div className="flex items-center gap-3 my-3 p-3 rounded-xl bg-black/20 border border-white/5">
                    <span className="text-3xl">{PRODUCTS[sellItemKey]?.icon || '📦'}</span>
                    <div className="flex flex-col">
                      <span className="font-extrabold text-sm">{PRODUCTS[sellItemKey]?.name || sellItemKey}</span>
                      <span className="text-xs text-[#8E939D]">Доступно: {inventory[sellItemKey] || 0} шт.</span>
                    </div>
                  </div>

                  {/* Quantity Slider */}
                  <div className="flex flex-col gap-1.5 mb-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>Количество:</span>
                      <span className="text-emerald-400 font-black">{sellCount} шт.</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={Math.max(1, inventory[sellItemKey] || 1)}
                      value={sellCount}
                      onChange={e => setSellCount(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* Price Setting */}
                  <div className="flex flex-col gap-1.5 mb-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>Цена продажи:</span>
                      <span className="text-amber-300 font-black flex items-center gap-1"><CoinSvg /> {sellPrice}</span>
                    </div>
                    <input
                      type="range"
                      min={Math.max(1, Math.round((PRODUCTS[sellItemKey]?.basePrice || 5) * sellCount * 0.5))}
                      max={Math.round((PRODUCTS[sellItemKey]?.basePrice || 5) * sellCount * 3)}
                      value={sellPrice}
                      onChange={e => setSellPrice(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Steam Fee Breakdown */}
                  <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-black/25 text-xs">
                    <div className="flex justify-between text-[#8E939D]">
                      <span>Покупатель заплатит:</span>
                      <span className="font-bold text-white">{sellPrice} 🪙</span>
                    </div>
                    <div className="flex justify-between text-[#8E939D]">
                      <span>Комиссия площадки (5%):</span>
                      <span className="text-red-400 font-bold">-{Math.round(sellPrice * 0.05)} 🪙</span>
                    </div>
                    <div className="flex justify-between font-black text-emerald-400 pt-1 border-t border-white/10">
                      <span>Вы получите чистыми:</span>
                      <span>+{Math.round(sellPrice * 0.95)} 🪙</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePublishListing}
                  disabled={(inventory[sellItemKey] || 0) < sellCount}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer border border-emerald-300"
                >
                  <Tag size={15} />
                  <span>Выставить на Торговую площадку</span>
                </button>
              </div>

            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              TAB 3: МОИ АКТИВНЫЕ ЛОТЫ
              ════════════════════════════════════════════════════════════ */}
          {activeTab === 'my_listings' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-extrabold text-[#8E939D] uppercase tracking-wider">
                  Ваши активные лоты в продаже
                </span>
                <span className="text-xs text-sky-400 font-bold">
                  Занято слотов: {shopSlots.filter(s => !!s.itemId).length} / {shopSlots.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {shopSlots.map(slot => {
                  const item = slot.itemId ? PRODUCTS[slot.itemId] : null;

                  return (
                    <div
                      key={slot.id}
                      className={`p-4 rounded-2xl border shadow-md flex flex-col justify-between items-center text-center min-h-[170px] relative ${
                        isDesign2026
                          ? 'bg-[#181C24] border-[#242A35] text-white'
                          : 'hud-parchment border-[#5C3718] text-[#3B1F0D]'
                      }`}
                    >
                      {slot.itemId && item ? (
                        slot.isSold ? (
                          <div className="flex flex-col items-center justify-between h-full w-full">
                            <div className="flex items-center gap-1 text-emerald-300 font-black text-xs bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500 animate-pulse">
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
                            <div className="flex items-center gap-1 text-sky-400 font-bold text-xs">
                              <Clock size={12} />
                              <span>В продаже</span>
                            </div>
                            <span className="text-4xl my-1">{item.icon}</span>
                            <div className="flex flex-col w-full">
                              <span className="font-bold text-xs">{item.name} ×{slot.count}</span>
                              <span className="font-black text-amber-400 text-sm mt-0.5">{slot.price} 🪙</span>
                            </div>
                          </div>
                        )
                      ) : (
                        <button
                          onClick={() => {
                            sounds.playClick();
                            setActiveTab('sell');
                          }}
                          className="flex flex-col items-center justify-center gap-2 h-full w-full text-[#8E939D] hover:text-white cursor-pointer"
                        >
                          <div className={`w-11 h-11 rounded-full border-2 border-dashed flex items-center justify-center text-xl ${
                            isDesign2026 ? 'bg-[#242A35] border-[#353D4C]' : 'bg-amber-200/80 border-[#5C3718]'
                          }`}>
                            <Plus size={22} />
                          </div>
                          <span className="text-xs font-extrabold">Свободный слот</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              TAB 4: ИСТОРИЯ СДЕЛОК (TRANSACTION HISTORY)
              ════════════════════════════════════════════════════════════ */}
          {activeTab === 'history' && (
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-extrabold text-[#8E939D] uppercase tracking-wider px-1">
                История покупок и продаж на рынке
              </span>

              <div className="flex flex-col gap-2">
                {historyList.map(tx => (
                  <div
                    key={tx.id}
                    className={`p-3.5 rounded-2xl border shadow flex items-center justify-between gap-3 ${
                      isDesign2026
                        ? 'bg-[#181C24] border-[#242A35] text-white'
                        : 'hud-parchment border-amber-700/60 text-[#3B1F0D]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl shadow-inner ${
                        tx.type === 'sell' ? 'bg-emerald-950/60 border border-emerald-500/40' : 'bg-sky-950/60 border border-sky-500/40'
                      }`}>
                        {tx.itemIcon}
                      </div>

                      <div className="flex flex-col">
                        <span className="font-bold text-xs sm:text-sm flex items-center gap-2">
                          <span>{tx.itemName} ×{tx.count}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            tx.type === 'sell' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-sky-500/20 text-sky-300'
                          }`}>
                            {tx.type === 'sell' ? 'Продано' : 'Куплено'}
                          </span>
                        </span>
                        <span className="text-[11px] text-[#8E939D]">
                          {tx.otherUser} • {tx.timestamp}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`font-black text-sm ${
                        tx.type === 'sell' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {tx.type === 'sell' ? '+' : '-'}{tx.price} 🪙
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
