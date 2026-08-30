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
  Truck,
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

export interface BuyOrder {
  id: string;
  buyerName: string;
  buyerAvatar: string;
  itemId: string;
  count: number;
  pricePerUnit: number;
  totalPrice: number;
  timestamp: string;
  isMyOrder?: boolean;
}

const INITIAL_BUY_ORDERS: BuyOrder[] = [
  { id: 'bo_1', buyerName: '@dasha_agro', buyerAvatar: '👩‍🌾', itemId: 'wheat', count: 10, pricePerUnit: 3, totalPrice: 30, timestamp: '10 мин. назад' },
  { id: 'bo_2', buyerName: '@ivan_tractor', buyerAvatar: '👨‍🌾', itemId: 'plank', count: 5, pricePerUnit: 28, totalPrice: 140, timestamp: '15 мин. назад' },
  { id: 'bo_3', buyerName: '@mikhail_bee', buyerAvatar: '🐝', itemId: 'bread', count: 4, pricePerUnit: 18, totalPrice: 72, timestamp: '25 мин. назад' },
  { id: 'bo_4', buyerName: '@alex_top1', buyerAvatar: '🚜', itemId: 'carrot', count: 15, pricePerUnit: 7, totalPrice: 105, timestamp: '1 ч. назад' },
  { id: 'bo_5', buyerName: '@crypto_farmer', buyerAvatar: '💎', itemId: 'cheese', count: 3, pricePerUnit: 45, totalPrice: 135, timestamp: '2 ч. назад' },
];

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

const MARKET_TRENDS = [
  { icon: '🪵', name: 'Доски', change: '+18.4%', isUp: true },
  { icon: '🪓', name: 'Топоры', change: '+24.1%', isUp: true },
  { icon: '🍞', name: 'Хлеб', change: '-3.2%', isUp: false },
  { icon: '🥕', name: 'Морковь', change: '+9.5%', isUp: true },
  { icon: '🧀', name: 'Сыр', change: '+12.0%', isUp: true },
  { icon: '🌾', name: 'Пшеница', change: '+5.7%', isUp: true },
  { icon: '🍯', name: 'Мед', change: '+31.4%', isUp: true },
  { icon: '⛏️', name: 'Кирка', change: '+15.2%', isUp: true },
  { icon: '🌽', name: 'Кукуруза', change: '-1.8%', isUp: false },
  { icon: '🧈', name: 'Масло', change: '+8.3%', isUp: true },
  { icon: '🥚', name: 'Яйцо', change: '+4.1%', isUp: true },
  { icon: '🍓', name: 'Клубника', change: '+22.6%', isUp: true },
  { icon: '🥛', name: 'Молоко', change: '+6.9%', isUp: true },
  { icon: '🥧', name: 'Пирог', change: '+19.3%', isUp: true },
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
    marketDelivery,
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
  const [buyOrdersList, setBuyOrdersList] = useState<BuyOrder[]>(INITIAL_BUY_ORDERS);

  // Buy from Seller Modal State
  const [buyingLot, setBuyingLot] = useState<{
    id: string;
    seller: string;
    avatar: string;
    itemName: string;
    itemId: string;
    maxCount: number;
    unitPrice: number;
  } | null>(null);
  const [buyLotCount, setBuyLotCount] = useState<number>(1);

  // Buy Order Interactive Form State
  const [isBuyOrderModalOpen, setIsBuyOrderModalOpen] = useState<boolean>(false);
  const [buyOrderCount, setBuyOrderCount] = useState<number>(5);
  const [buyOrderPricePerUnit, setBuyOrderPricePerUnit] = useState<number>(10);
  const [orderBookTab, setOrderBookTab] = useState<'sell_listings' | 'buy_orders'>('sell_listings');

  // Sell form state
  const [sellItemKey, setSellItemKey] = useState<string>('wheat');
  const [sellCount, setSellCount] = useState<number>(1);
  const [sellPricePerUnit, setSellPricePerUnit] = useState<number>(5);

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
    const base = PRODUCTS[itemKey]?.basePrice || 5;
    setSellPricePerUnit(base);
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

    const totalPrice = sellCount * sellPricePerUnit;
    sounds.playCoin();
    triggerTelegramHaptic('success');
    createRoadsideSale(freeSlot.id, sellItemKey, sellCount, totalPrice);

    const prod = PRODUCTS[sellItemKey];
    setHistoryList(prev => [
      {
        id: `tx_${Date.now()}`,
        type: 'sell',
        itemName: prod?.name || sellItemKey,
        itemIcon: prod?.icon || '📦',
        count: sellCount,
        price: totalPrice,
        timestamp: 'Только что',
        otherUser: 'Торговая площадка',
      },
      ...prev,
    ]);

    addFloatingText(`Лот выставлен: ${sellCount} шт. за ${totalPrice} 🪙 (${sellPricePerUnit} 🪙/шт.)!`, window.innerWidth / 2, window.innerHeight / 2, '#4ADE80');
    setActiveTab('my_listings');
  };

  const handleOpenBuyLotModal = (lot: { id: string; seller: string; avatar: string; count: number; price: number }) => {
    if (marketDelivery) {
      alert(`⛔ К вам уже едет машина с товаром от ${marketDelivery.sellerName}!\nДождитесь её прибытия и разгрузите товар, чтобы заказать следующий.`);
      return;
    }

    sounds.playClick();
    triggerTelegramHaptic('light');
    const unitPrice = Math.max(1, Math.round(lot.price / lot.count));
    setBuyingLot({
      id: lot.id,
      seller: lot.seller,
      avatar: lot.avatar,
      itemName: selectedItem?.name || 'Товар',
      itemId: selectedItem?.id || 'wheat',
      maxCount: lot.count,
      unitPrice,
    });
    setBuyLotCount(lot.count);
  };

  const handleConfirmBuyLot = () => {
    if (!buyingLot) return;
    const totalCost = buyLotCount * buyingLot.unitPrice;
    if (coins < totalCost) {
      alert('Недостаточно монет для покупки!');
      return;
    }

    sounds.playCoin();
    triggerTelegramHaptic('success');
    buyFromMarket(buyingLot.id, buyLotCount, buyingLot.seller, buyingLot.avatar, buyingLot.unitPrice);

    setHistoryList(prev => [
      {
        id: `tx_${Date.now()}`,
        type: 'buy',
        itemName: buyingLot.itemName,
        itemIcon: PRODUCTS[buyingLot.itemId]?.icon || '📦',
        count: buyLotCount,
        price: totalCost,
        timestamp: 'Только что',
        otherUser: buyingLot.seller,
      },
      ...prev,
    ]);

    setBuyingLot(null);
  };

  const itemBuyOrders = useMemo(() => {
    if (!selectedItemId) return [];
    return buyOrdersList.filter(o => o.itemId === selectedItemId);
  }, [buyOrdersList, selectedItemId]);

  const handleOpenBuyOrderModal = (item: typeof PRODUCTS[string]) => {
    sounds.playClick();
    triggerTelegramHaptic('light');
    setBuyOrderCount(5);
    setBuyOrderPricePerUnit(item.basePrice);
    setIsBuyOrderModalOpen(true);
  };

  const handleConfirmBuyOrder = () => {
    if (!selectedItem) return;
    const totalCost = buyOrderCount * buyOrderPricePerUnit;
    if (coins < totalCost) {
      alert('Недостаточно монет для размещения заказа на покупку!');
      return;
    }

    sounds.playCoin();
    triggerTelegramHaptic('success');

    // Deduct coins for escrow / order
    useGameStore.setState(state => ({
      coins: state.coins - totalCost,
    }));

    const newOrder: BuyOrder = {
      id: `bo_${Date.now()}`,
      buyerName: tgProfile.username ? `@${tgProfile.username}` : '@вы',
      buyerAvatar: '⭐',
      itemId: selectedItem.id,
      count: buyOrderCount,
      pricePerUnit: buyOrderPricePerUnit,
      totalPrice: totalCost,
      timestamp: 'Только что',
      isMyOrder: true,
    };

    setBuyOrdersList(prev => [newOrder, ...prev]);
    setIsBuyOrderModalOpen(false);
    setOrderBookTab('buy_orders');

    addFloatingText(`Заказ на покупку ${selectedItem.name} ×${buyOrderCount} размещен!`, window.innerWidth / 2, window.innerHeight / 2, '#4ADE80');
  };

  const handleCancelBuyOrder = (orderId: string) => {
    const order = buyOrdersList.find(o => o.id === orderId);
    if (!order) return;

    sounds.playCoin();
    triggerTelegramHaptic('medium');

    // Refund coins back to player
    useGameStore.setState(state => ({
      coins: state.coins + order.totalPrice,
    }));

    setBuyOrdersList(prev => prev.filter(o => o.id !== orderId));
    addFloatingText(`Заказ отменен (+${order.totalPrice} 🪙)!`, window.innerWidth / 2, window.innerHeight / 2, '#FBBF24');
  };

  const handleSellToBuyer = (order: BuyOrder) => {
    const available = inventory[order.itemId] || 0;
    if (available < order.count) {
      alert(`У вас недостаточно ${PRODUCTS[order.itemId]?.name || order.itemId} на складе (нужно ${order.count} шт., у вас ${available} шт.)!`);
      return;
    }

    sounds.playCoin();
    triggerTelegramHaptic('success');

    // Deduct item from inventory & add coins
    useGameStore.setState(state => ({
      coins: state.coins + order.totalPrice,
      inventory: {
        ...state.inventory,
        [order.itemId]: Math.max(0, (state.inventory[order.itemId] || 0) - order.count),
      },
    }));

    // Remove fulfilled order
    setBuyOrdersList(prev => prev.filter(o => o.id !== order.id));

    // Add to history
    setHistoryList(prev => [
      {
        id: `tx_${Date.now()}`,
        type: 'sell',
        itemName: PRODUCTS[order.itemId]?.name || order.itemId,
        itemIcon: PRODUCTS[order.itemId]?.icon || '📦',
        count: order.count,
        price: order.totalPrice,
        timestamp: 'Только что',
        otherUser: order.buyerName,
      },
      ...prev,
    ]);

    addFloatingText(`Продано покупателю ${order.buyerName} (+${order.totalPrice} 🪙)!`, window.innerWidth / 2, window.innerHeight / 2, '#4ADE80');
  };

  if (activeModal !== 'roadside' && activeModal !== 'market') return null;

  return (
    <div className="fixed inset-0 pt-12 sm:pt-14 pb-16 sm:pb-20 z-40 flex flex-col select-none animate-pop-in overflow-hidden game-screen-bg text-amber-100">
      
      {/* ── TOP MARKET HEADER ── */}
      <div className="px-2.5 sm:px-6 py-2.5 sm:py-3 flex flex-col gap-2 sm:gap-2.5 game-screen-header shrink-0">
        <div className="flex items-center justify-between gap-2">
          
          {/* Market Title Badge */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl game-side-medal flex items-center justify-center text-base sm:text-lg shadow-md">
              🏪
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xs sm:text-base tracking-wide flex items-center gap-1.5 text-yellow-300 game-text-gold">
                <span>Рынок Долины</span>
                <span className="text-[8.5px] sm:text-[9px] px-1.5 py-0.2 rounded-full game-ribbon-tag text-white font-black">
                  Онлайн
                </span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-200/80">
                Торговая площадка между игроками
              </span>
            </div>
          </div>

        </div>

        {/* ── MARKET NAVIGATION TABS ── */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          
          {/* Tab 1: Торговая площадка */}
          <button
            onClick={() => {
              sounds.playClick();
              triggerTelegramHaptic('light');
              setActiveTab('browse');
              setSelectedItemId(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer shrink-0 ${
              activeTab === 'browse' ? 'game-tab-btn-active' : 'game-tab-btn'
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
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer shrink-0 ${
              activeTab === 'sell' ? 'game-tab-btn-active' : 'game-tab-btn'
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
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer shrink-0 relative ${
              activeTab === 'my_listings' ? 'game-tab-btn-active' : 'game-tab-btn'
            }`}
          >
            <Tag size={14} />
            <span>Мои лоты</span>
            {shopSlots.some(s => s.isSold) && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute top-1 right-1" />
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
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer shrink-0 ${
              activeTab === 'history' ? 'game-tab-btn-active' : 'game-tab-btn'
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
              TAB 1: ТОРГОВАЯ ПЛОЩАДКА (КАТАЛОГ)
              ════════════════════════════════════════════════════════════ */}
          {activeTab === 'browse' && !selectedItemId && (
            <>
              {/* 🔥 LIVE AUTO-SCROLLING MARKET TICKER MARQUEE */}
              <div className={`px-3.5 py-2 rounded-xl border flex items-center gap-3 text-xs overflow-hidden ${
                isDesign2026 ? 'bg-[#181C24] border-[#242A35]' : 'hud-parchment border-amber-800'
              }`}>
                <div className="flex items-center gap-1.5 shrink-0 font-extrabold text-amber-400 pr-2 border-r border-white/10 z-10">
                  <span className="text-sm">🔥</span>
                  <span className="uppercase text-[10px] tracking-wider font-black whitespace-nowrap">Тренды:</span>
                </div>

                <div className="flex-1 overflow-hidden relative">
                  <div className="animate-market-marquee flex items-center gap-6 whitespace-nowrap">
                    {[...MARKET_TRENDS, ...MARKET_TRENDS].map((t, idx) => (
                      <span key={idx} className="flex items-center gap-1.5 shrink-0 text-[11px] font-bold text-[#8E939D]">
                        <span>{t.icon} {t.name}</span>
                        <b className={`font-black ${t.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {t.change}
                        </b>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Search & Category Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 justify-between">
                
                {/* Search Input */}
                <div className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border w-full sm:w-80 ${
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
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
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

              {/* Items Grid (Catalog Cards) */}
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

                      <div className="w-full pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
                        <div className="flex flex-col text-left">
                          <span className="text-[9px] text-[#8E939D] uppercase font-bold">Начиная с</span>
                          <span className="text-xs font-black text-amber-400 flex items-center gap-0.5">
                            <CoinSvg /> {minPrice}
                          </span>
                        </div>

                        {/* Кнопка "Открыть" за место стрелочки */}
                        <div className="px-3 py-1.5 rounded-xl bg-sky-600 group-hover:bg-sky-500 text-white text-xs font-black shadow transition-all active:scale-95 flex items-center gap-1 border border-sky-400">
                          <span>Открыть</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ════════════════════════════════════════════════════════════
              ITEM DETAIL / ORDER BOOK VIEW
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
                    onClick={() => handleOpenBuyOrderModal(selectedItem)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-black text-xs shadow-lg active:scale-95 transition-transform cursor-pointer shrink-0 border border-sky-400"
                  >
                    📋 Заказ на покупку
                  </button>
                </div>
              </div>

              {/* 📈 INTERACTIVE PRICE CHART (Динамика цен за 24ч) */}
              <div className={`p-4 rounded-2xl border shadow-lg flex flex-col gap-2.5 ${
                isDesign2026 ? 'bg-[#181C24] border-[#242A35] text-white' : 'hud-parchment border-amber-700/60 text-[#3B1F0D]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-[#8E939D] flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-emerald-400" />
                      <span>График цен рынка (24 часа)</span>
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

              {/* ── DUAL ORDER BOOK TABS (В продаже / Заказы на покупку) ── */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setOrderBookTab('sell_listings');
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                        orderBookTab === 'sell_listings'
                          ? 'bg-sky-600 text-white shadow border-sky-400'
                          : isDesign2026
                          ? 'bg-[#181C24] text-[#8E939D] border-[#242A35] hover:text-white'
                          : 'bg-amber-100 text-[#3B1F0D] border-amber-300'
                      }`}
                    >
                      📥 В продаже ({itemMarketListings.length > 0 ? itemMarketListings.length : 4})
                    </button>

                    <button
                      onClick={() => {
                        sounds.playClick();
                        setOrderBookTab('buy_orders');
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                        orderBookTab === 'buy_orders'
                          ? 'bg-emerald-600 text-white shadow border-emerald-400'
                          : isDesign2026
                          ? 'bg-[#181C24] text-[#8E939D] border-[#242A35] hover:text-white'
                          : 'bg-amber-100 text-[#3B1F0D] border-amber-300'
                      }`}
                    >
                      📋 Заказы на покупку ({itemBuyOrders.length})
                    </button>
                  </div>

                  <span className="text-xs text-[#8E939D] font-bold hidden sm:inline-block">
                    Комиссия: 5%
                  </span>
                </div>

                {/* Sub-tab 1: В ПРОДАЖЕ (SELL LISTINGS) */}
                {orderBookTab === 'sell_listings' && (
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
                            <span className="text-[10px] text-[#8E939D] flex items-center gap-0.5 justify-end">
                              <span>{(lot.price / lot.count).toFixed(1)}</span>
                              <CoinSvg />
                              <span>/ шт.</span>
                            </span>
                          </div>

                          <button
                            onClick={() => handleOpenBuyLotModal(lot)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-black text-xs shadow-lg active:scale-95 transition-transform cursor-pointer border border-sky-400"
                          >
                            Купить
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sub-tab 2: ЗАКАЗЫ НА ПОКУПКУ (BUY ORDERS) */}
                {orderBookTab === 'buy_orders' && (
                  <div className="flex flex-col gap-2">
                    {itemBuyOrders.length === 0 ? (
                      <div className={`p-8 rounded-2xl border text-center flex flex-col items-center justify-center gap-3 ${
                        isDesign2026 ? 'bg-[#181C24] border-[#242A35] text-[#8E939D]' : 'hud-parchment text-[#5C3718]'
                      }`}>
                        <span className="text-4xl">📋</span>
                        <span className="font-bold text-sm">Активных заказов на покупку пока нет</span>
                        <button
                          onClick={() => handleOpenBuyOrderModal(selectedItem)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow border border-emerald-400 cursor-pointer"
                        >
                          + Создать первый заказ на покупку
                        </button>
                      </div>
                    ) : (
                      itemBuyOrders.map(order => {
                        const canSell = (inventory[order.itemId] || 0) >= order.count;

                        return (
                          <div
                            key={order.id}
                            className={`p-3.5 sm:p-4 rounded-2xl border shadow flex items-center justify-between gap-3 ${
                              order.isMyOrder
                                ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30'
                                : isDesign2026
                                ? 'bg-[#181C24] border-[#242A35] text-white'
                                : 'hud-parchment border-amber-700/60 text-[#3B1F0D]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center text-2xl">
                                {order.buyerAvatar}
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs sm:text-sm">{order.buyerName}</span>
                                  {order.isMyOrder && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black uppercase">
                                      Ваш заказ
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-[#8E939D]">
                                  Хочет купить: <b className="text-white font-bold">{order.count} шт.</b> по <b className="text-amber-300 font-bold">{order.pricePerUnit} 🪙/шт.</b>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="flex flex-col text-right">
                                <span className="text-sm font-black text-emerald-400 flex items-center gap-1">
                                  +{order.totalPrice} 🪙
                                </span>
                                <span className="text-[10px] text-[#8E939D]">
                                  {order.timestamp}
                                </span>
                              </div>

                              {order.isMyOrder ? (
                                <button
                                  onClick={() => handleCancelBuyOrder(order.id)}
                                  className="px-3.5 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500 font-black text-xs shadow active:scale-95 transition-transform cursor-pointer"
                                >
                                  Отменить
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleSellToBuyer(order)}
                                  disabled={!canSell}
                                  className={`px-4 py-2 rounded-xl font-black text-xs shadow active:scale-95 transition-transform cursor-pointer border ${
                                    canSell
                                      ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white border-emerald-400'
                                      : 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed'
                                  }`}
                                >
                                  {canSell ? 'Продать' : 'Нет на складе'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              TAB 2: ПРОДАТЬ ПРЕДМЕТ (ВЫСТАВЛЕНИЕ ЛОТА НА РЫНОК)
              ════════════════════════════════════════════════════════════ */}
          {activeTab === 'sell' && (
            <div className="flex flex-col gap-3.5 max-w-2xl mx-auto w-full">
              
              {/* 1. Item Selector: Compact Horizontal Shelf */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-black text-[#8E939D] uppercase tracking-wider">
                    1. Выберите предмет со склада:
                  </span>
                  <span className="text-xs text-sky-400 font-bold">
                    Доступно видов: {userInventoryItems.length}
                  </span>
                </div>

                {userInventoryItems.length === 0 ? (
                  <div className={`p-6 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 ${
                    isDesign2026 ? 'bg-[#181C24] border-[#242A35] text-[#8E939D]' : 'hud-parchment text-[#5C3718]'
                  }`}>
                    <span className="text-3xl">📦</span>
                    <span className="font-extrabold text-sm text-white">Ваш склад пуст!</span>
                    <span className="text-xs text-[#8E939D]">
                      Соберите урожай с грядок или произведите готовую продукцию, чтобы выставить её на рынок.
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 overflow-x-auto py-2 px-1.5 scrollbar-none snap-x">
                    {userInventoryItems.map(({ item, count }) => {
                      const isSelected = sellItemKey === item.id;

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectSellItem(item.id, count)}
                          className={`w-24 sm:w-28 p-2.5 rounded-2xl border-2 shadow-md flex flex-col items-center justify-between text-center gap-1.5 cursor-pointer shrink-0 snap-start transition-all duration-150 relative select-none ${
                            isSelected
                              ? 'bg-gradient-to-b from-emerald-950 to-[#10231C] border-emerald-400 shadow-lg shadow-emerald-950/80 text-white'
                              : isDesign2026
                              ? 'bg-[#181C24] border-[#242A35] text-white hover:border-white/20 hover:bg-[#1E232D] active:scale-95'
                              : 'hud-parchment border-amber-700/60 text-[#3B1F0D]'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black shadow">
                              ✓
                            </div>
                          )}

                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-inner transition-colors ${
                            isSelected ? 'bg-emerald-900/50' : 'bg-black/30'
                          }`}>
                            {item.icon}
                          </div>

                          <div className="flex flex-col items-center w-full">
                            <span className="font-extrabold text-[11px] sm:text-xs truncate max-w-full text-white">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-black mt-0.5">
                              ×{count} шт.
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. Lot Parameters Card */}
              <div className={`p-4 sm:p-5 rounded-3xl border shadow-xl flex flex-col gap-3.5 ${
                isDesign2026 ? 'bg-[#181C24] border-[#2E3644] text-white' : 'hud-parchment border-amber-600 text-[#3B1F0D]'
              }`}>
                
                {/* Selected Item Info Bar */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/30 border border-white/10 shadow-inner">
                  <div className="w-11 h-11 rounded-xl bg-black/40 flex items-center justify-center text-2xl shrink-0">
                    {PRODUCTS[sellItemKey]?.icon || '📦'}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-white truncate">{PRODUCTS[sellItemKey]?.name || sellItemKey}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        Выбран
                      </span>
                    </div>
                    <span className="text-xs text-[#8E939D] flex items-center gap-1 mt-0.5">
                      <span>На складе: <b className="text-emerald-400 font-black">{inventory[sellItemKey] || 0} шт.</b></span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">Базовая: ~{PRODUCTS[sellItemKey]?.basePrice || 10} <CoinSvg /></span>
                    </span>
                  </div>
                </div>

                {/* Quantity Stepper & Presets */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#8E939D]">Количество на продажу:</span>
                    <span className="text-emerald-400 font-black text-sm">{sellCount} шт.</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setSellCount(Math.max(1, sellCount - 1));
                      }}
                      className="w-9 h-9 rounded-xl bg-[#242A35] hover:bg-[#353D4C] text-white font-black text-base flex items-center justify-center cursor-pointer border border-[#353D4C] active:scale-95 transition-transform shrink-0"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min={1}
                      max={Math.max(1, inventory[sellItemKey] || 1)}
                      value={sellCount}
                      onChange={e => setSellCount(Number(e.target.value))}
                      className="flex-1 accent-emerald-500 cursor-pointer"
                    />
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setSellCount(Math.min(inventory[sellItemKey] || 1, sellCount + 1));
                      }}
                      className="w-9 h-9 rounded-xl bg-[#242A35] hover:bg-[#353D4C] text-white font-black text-base flex items-center justify-center cursor-pointer border border-[#353D4C] active:scale-95 transition-transform shrink-0"
                    >
                      +
                    </button>
                  </div>

                  {/* Quick Count Presets */}
                  <div className="flex items-center gap-1.5">
                    {[1, 5, 10].filter(q => q <= (inventory[sellItemKey] || 1)).map(qty => (
                      <button
                        key={qty}
                        onClick={() => {
                          sounds.playClick();
                          setSellCount(qty);
                        }}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                          sellCount === qty
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                            : 'bg-black/20 text-[#8E939D] border-white/5 hover:text-white'
                        }`}
                      >
                        {qty} шт.
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setSellCount(Math.max(1, inventory[sellItemKey] || 1));
                      }}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                        sellCount === (inventory[sellItemKey] || 1)
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                          : 'bg-black/20 text-[#8E939D] border-white/5 hover:text-white'
                      }`}
                    >
                      МАКС ({inventory[sellItemKey] || 1})
                    </button>
                  </div>
                </div>

                {/* Price Setting Stepper & Multipliers: Цена за одну штуку */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#8E939D]">Цена за одну штуку:</span>
                    <span className="text-amber-300 font-black text-sm flex items-center gap-1">
                      <CoinSvg /> {sellPricePerUnit} / шт.
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setSellPricePerUnit(Math.max(1, sellPricePerUnit - 1));
                      }}
                      className="w-9 h-9 rounded-xl bg-[#242A35] hover:bg-[#353D4C] text-white font-black text-base flex items-center justify-center cursor-pointer border border-[#353D4C] active:scale-95 transition-transform shrink-0"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min={Math.max(1, Math.round((PRODUCTS[sellItemKey]?.basePrice || 5) * 0.5))}
                      max={Math.round((PRODUCTS[sellItemKey]?.basePrice || 5) * 3)}
                      value={sellPricePerUnit}
                      onChange={e => setSellPricePerUnit(Number(e.target.value))}
                      className="flex-1 accent-amber-500 cursor-pointer"
                    />
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setSellPricePerUnit(sellPricePerUnit + 1);
                      }}
                      className="w-9 h-9 rounded-xl bg-[#242A35] hover:bg-[#353D4C] text-white font-black text-base flex items-center justify-center cursor-pointer border border-[#353D4C] active:scale-95 transition-transform shrink-0"
                    >
                      +
                    </button>
                  </div>

                  {/* Quick Price Multipliers */}
                  <div className="flex items-center gap-1.5">
                    {[
                      { label: '-15% (быстро)', mul: 0.85 },
                      { label: 'Рыночная', mul: 1.0 },
                      { label: '+25% (выгодно)', mul: 1.25 },
                    ].map((preset, idx) => {
                      const targetP = Math.max(1, Math.round((PRODUCTS[sellItemKey]?.basePrice || 10) * preset.mul));
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            sounds.playClick();
                            setSellPricePerUnit(targetP);
                          }}
                          className={`flex-1 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                            sellPricePerUnit === targetP
                              ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                              : 'bg-black/20 text-[#8E939D] border-white/5 hover:text-white'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Last Sold Price Benchmark */}
                  <div className="flex items-center justify-between px-2 py-1 rounded-xl bg-black/20 border border-white/5 text-[11px] text-[#8E939D] mt-0.5">
                    <span>Последний товар был продан за:</span>
                    <span className="font-extrabold text-amber-300 flex items-center gap-1">
                      <CoinSvg /> {Math.max(1, Math.round((PRODUCTS[sellItemKey]?.basePrice || 5) * 1.15))} / шт.
                    </span>
                  </div>
                </div>

                {/* Total Payout Summary */}
                <div className="flex justify-between items-center p-3.5 rounded-2xl bg-black/35 border border-white/10 shadow-inner">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-[#8E939D]">Итого к получению:</span>
                    <span className="text-[11px] text-white/70 font-semibold mt-0.5">
                      {sellCount} шт. × {sellPricePerUnit} 🪙
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-black text-emerald-400 text-lg">
                    <span>+{sellCount * sellPricePerUnit}</span>
                    <CoinSvg />
                  </div>
                </div>

                {/* Publish Button */}
                <button
                  onClick={handlePublishListing}
                  disabled={(inventory[sellItemKey] || 0) < sellCount}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer border ${
                    (inventory[sellItemKey] || 0) >= sellCount
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white border-emerald-300 shadow-emerald-950/50'
                      : 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed'
                  }`}
                >
                  <Tag size={16} />
                  <span>Выставить лот на продажу</span>
                </button>

              </div>

            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              TAB 3: МОИ АКТИВНЫЕ ЛОТЫ И ЗАКАЗЫ НА ПОКУПКУ
              ════════════════════════════════════════════════════════════ */}
          {activeTab === 'my_listings' && (
            <div className="flex flex-col gap-5">
              
              {/* Section 1: Лоты на продажу */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-extrabold text-[#8E939D] uppercase tracking-wider">
                    Лоты на продажу
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
                                <span>Забрать +{slot.price}</span>
                                <CoinSvg />
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
                                <span className="font-black text-amber-400 text-sm mt-0.5 flex items-center justify-center gap-1">
                                  <CoinSvg /> {slot.price}
                                </span>
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

              {/* Section 2: Мои активные заказы на покупку */}
              <div className="flex flex-col gap-2.5 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-extrabold text-[#8E939D] uppercase tracking-wider">
                    Ваши заказы на покупку ({buyOrdersList.filter(o => o.isMyOrder).length})
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">
                    Монеты возвращаются при отмене
                  </span>
                </div>

                {buyOrdersList.filter(o => o.isMyOrder).length === 0 ? (
                  <div className={`p-6 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 ${
                    isDesign2026 ? 'bg-[#181C24] border-[#242A35] text-[#8E939D]' : 'hud-parchment text-[#5C3718]'
                  }`}>
                    <span className="text-3xl">📋</span>
                    <span className="font-bold text-xs">У вас нет активных заказов на покупку</span>
                    <span className="text-[11px]">Откройте любой товар в каталоге и нажмите «Заказ на покупку»</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {buyOrdersList.filter(o => o.isMyOrder).map(order => {
                      const item = PRODUCTS[order.itemId];
                      return (
                        <div
                          key={order.id}
                          className={`p-3.5 rounded-2xl border shadow flex items-center justify-between gap-3 ${
                            isDesign2026
                              ? 'bg-emerald-950/30 border-emerald-500/40 text-white'
                              : 'hud-parchment border-emerald-600 text-[#3B1F0D]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl p-1 bg-black/20 rounded-xl">{item?.icon || '📦'}</span>
                            <div className="flex flex-col">
                              <span className="font-bold text-xs sm:text-sm">{item?.name || order.itemId}</span>
                              <span className="text-xs text-[#8E939D] flex items-center gap-1">
                                <span>Количество: <b className="text-white font-bold">{order.count} шт.</b> • Цена:</span>
                                <span className="text-amber-300 font-bold flex items-center gap-0.5">
                                  <CoinSvg /> {order.pricePerUnit}/шт.
                                </span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-amber-400 flex items-center gap-1">
                              <CoinSvg /> {order.totalPrice}
                            </span>
                            <button
                              onClick={() => handleCancelBuyOrder(order.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-red-950 hover:bg-red-900 text-red-300 border border-red-500 font-black text-xs shadow cursor-pointer active:scale-95 transition-transform"
                            >
                              Отменить
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
                      <span className={`font-black text-sm flex items-center gap-1 justify-end ${
                        tx.type === 'sell' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        <span>{tx.type === 'sell' ? '+' : '-'}{tx.price}</span>
                        <CoinSvg />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── INTERACTIVE BUY ORDER MODAL (POPUP DIALOG) ── */}
      {isBuyOrderModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md p-5 sm:p-6 rounded-3xl border shadow-2xl flex flex-col gap-4 animate-scale-up ${
            isDesign2026 ? 'bg-[#181C24] border-[#2E3644] text-white' : 'hud-parchment border-amber-600 text-[#3B1F0D]'
          }`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-1.5 rounded-2xl bg-black/30 border border-white/5">{selectedItem.icon}</span>
                <div className="flex flex-col">
                  <span className="font-black text-sm sm:text-base">Заказ на покупку</span>
                  <span className="text-xs text-sky-400 font-bold">{selectedItem.name}</span>
                </div>
              </div>
              <button
                onClick={() => setIsBuyOrderModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col gap-4">
              
              {/* 1. Quantity Selector */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#8E939D]">Количество предметов:</span>
                  <span className="text-emerald-400 font-black text-sm">{buyOrderCount} шт.</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setBuyOrderCount(Math.max(1, buyOrderCount - 1));
                    }}
                    className="w-9 h-9 rounded-xl bg-[#242A35] hover:bg-[#353D4C] text-white font-black text-base flex items-center justify-center cursor-pointer border border-[#353D4C]"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={buyOrderCount}
                    onChange={e => setBuyOrderCount(Number(e.target.value))}
                    className="flex-1 accent-emerald-500 cursor-pointer"
                  />
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setBuyOrderCount(Math.min(50, buyOrderCount + 1));
                    }}
                    className="w-9 h-9 rounded-xl bg-[#242A35] hover:bg-[#353D4C] text-white font-black text-base flex items-center justify-center cursor-pointer border border-[#353D4C]"
                  >
                    +
                  </button>
                </div>
                {/* Quick Presets */}
                <div className="flex items-center gap-1.5">
                  {[1, 5, 10, 20, 50].map(qty => (
                    <button
                      key={qty}
                      onClick={() => {
                        sounds.playClick();
                        setBuyOrderCount(qty);
                      }}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                        buyOrderCount === qty
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                          : 'bg-black/20 text-[#8E939D] border-white/5 hover:text-white'
                      }`}
                    >
                      {qty} шт.
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Price Per Unit Selector */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#8E939D]">Цена за 1 шт:</span>
                  <span className="text-amber-300 font-black text-sm flex items-center gap-1">
                    <CoinSvg /> {buyOrderPricePerUnit}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setBuyOrderPricePerUnit(Math.max(1, buyOrderPricePerUnit - 1));
                    }}
                    className="w-9 h-9 rounded-xl bg-[#242A35] hover:bg-[#353D4C] text-white font-black text-base flex items-center justify-center cursor-pointer border border-[#353D4C]"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min={Math.max(1, Math.round(selectedItem.basePrice * 0.5))}
                    max={Math.round(selectedItem.basePrice * 2.5)}
                    value={buyOrderPricePerUnit}
                    onChange={e => setBuyOrderPricePerUnit(Number(e.target.value))}
                    className="flex-1 accent-amber-500 cursor-pointer"
                  />
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setBuyOrderPricePerUnit(buyOrderPricePerUnit + 1);
                    }}
                    className="w-9 h-9 rounded-xl bg-[#242A35] hover:bg-[#353D4C] text-white font-black text-base flex items-center justify-center cursor-pointer border border-[#353D4C]"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 3. Cost & Balance Summary */}
              <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-[#8E939D]">Итого к оплате:</span>
                  <span className="font-black text-base text-amber-400 flex items-center gap-1">
                    <CoinSvg /> {(buyOrderCount * buyOrderPricePerUnit).toLocaleString('ru-RU')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-white/5">
                  <span className="text-[#8E939D]">Ваш баланс:</span>
                  <span className={`font-bold ${coins >= (buyOrderCount * buyOrderPricePerUnit) ? 'text-white' : 'text-rose-400'}`}>
                    {coins.toLocaleString('ru-RU')} 🪙 {coins < (buyOrderCount * buyOrderPricePerUnit) && '(недостаточно!)'}
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={() => setIsBuyOrderModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmBuyOrder}
                disabled={coins < (buyOrderCount * buyOrderPricePerUnit)}
                className={`flex-[2] py-3 rounded-xl font-black text-xs shadow-xl active:scale-95 transition-transform cursor-pointer flex items-center justify-center gap-1.5 border ${
                  coins >= (buyOrderCount * buyOrderPricePerUnit)
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white border-emerald-400'
                    : 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed'
                }`}
              >
                <span>Разместить заказ на покупку</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── INTERACTIVE BUY QUANTITY MODAL (ПОКУПКА У ИГРОКА) ── */}
      {buyingLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md p-5 sm:p-6 rounded-3xl border shadow-2xl flex flex-col gap-4 animate-scale-up ${
            isDesign2026 ? 'bg-[#181C24] border-[#2E3644] text-white' : 'hud-parchment border-amber-600 text-[#3B1F0D]'
          }`}>
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-black/30 flex items-center justify-center text-2xl border border-white/5">
                  {buyingLot.avatar}
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-sm sm:text-base">Покупка у игрока</span>
                  <span className="text-xs text-sky-400 font-bold">{buyingLot.seller}</span>
                </div>
              </div>
              <button
                onClick={() => setBuyingLot(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-4">
              
              {/* Item Info Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/30 border border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-1 bg-black/20 rounded-xl">{PRODUCTS[buyingLot.itemId]?.icon || '📦'}</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-white">{buyingLot.itemName}</span>
                    <span className="text-xs text-[#8E939D]">В наличии у продавца: {buyingLot.maxCount} шт.</span>
                  </div>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-xs text-[#8E939D]">Цена за 1 шт:</span>
                  <span className="text-sm font-black text-amber-300 flex items-center gap-1 justify-end">
                    <CoinSvg /> {buyingLot.unitPrice}
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#8E939D]">Сколько вы хотите купить:</span>
                  <span className="text-emerald-400 font-black text-sm">{buyLotCount} шт.</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setBuyLotCount(Math.max(1, buyLotCount - 1));
                    }}
                    className="w-9 h-9 rounded-xl bg-[#242A35] hover:bg-[#353D4C] text-white font-black text-base flex items-center justify-center cursor-pointer border border-[#353D4C] active:scale-95 transition-transform"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min={1}
                    max={buyingLot.maxCount}
                    value={buyLotCount}
                    onChange={e => setBuyLotCount(Number(e.target.value))}
                    className="flex-1 accent-sky-500 cursor-pointer"
                  />
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setBuyLotCount(Math.min(buyingLot.maxCount, buyLotCount + 1));
                    }}
                    className="w-9 h-9 rounded-xl bg-[#242A35] hover:bg-[#353D4C] text-white font-black text-base flex items-center justify-center cursor-pointer border border-[#353D4C] active:scale-95 transition-transform"
                  >
                    +
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 mt-1">
                  {[1, 2, 5].filter(q => q <= buyingLot.maxCount).map(qty => (
                    <button
                      key={qty}
                      onClick={() => {
                        sounds.playClick();
                        setBuyLotCount(qty);
                      }}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                        buyLotCount === qty
                          ? 'bg-sky-500/20 text-sky-300 border-sky-400'
                          : 'bg-black/20 text-[#8E939D] border-white/5 hover:text-white'
                      }`}
                    >
                      {qty} шт.
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setBuyLotCount(buyingLot.maxCount);
                    }}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                      buyLotCount === buyingLot.maxCount
                        ? 'bg-sky-500/20 text-sky-300 border-sky-400'
                        : 'bg-black/20 text-[#8E939D] border-white/5 hover:text-white'
                    }`}
                  >
                    Все ({buyingLot.maxCount} шт.)
                  </button>
                </div>
              </div>

              {/* Delivery Vehicle Feature Box */}
              <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-500/30 flex items-center gap-3">
                <span className="text-3xl shrink-0">🚚</span>
                <div className="flex flex-col">
                  <span className="font-extrabold text-xs text-sky-300">Доставка машиной продавца</span>
                  <span className="text-[11px] text-[#A0A6B2]">
                    После покупки машина <b>{buyingLot.seller}</b> привезет товар прямо к вашей ферме. Вы сможете забрать его по прибытии!
                  </span>
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-[#8E939D]">Итого к оплате:</span>
                  <span className="font-black text-base text-amber-400 flex items-center gap-1">
                    <CoinSvg /> {(buyLotCount * buyingLot.unitPrice).toLocaleString('ru-RU')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-white/5">
                  <span className="text-[#8E939D]">Ваш баланс монет:</span>
                  <span className={`font-bold flex items-center gap-1 ${coins >= (buyLotCount * buyingLot.unitPrice) ? 'text-white' : 'text-rose-400'}`}>
                    <span>{coins.toLocaleString('ru-RU')}</span>
                    <CoinSvg />
                    {coins < (buyLotCount * buyingLot.unitPrice) && '(недостаточно!)'}
                  </span>
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={() => setBuyingLot(null)}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmBuyLot}
                disabled={coins < (buyLotCount * buyingLot.unitPrice)}
                className={`flex-[2] py-3 rounded-xl font-black text-xs shadow-xl active:scale-95 transition-transform cursor-pointer flex items-center justify-center gap-1.5 border ${
                  coins >= (buyLotCount * buyingLot.unitPrice)
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white border-sky-400 shadow-sky-950/50'
                    : 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed'
                }`}
              >
                <Truck size={15} />
                <span>Оформить и вызвать доставку</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
