import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../game/gameState';
import { sounds } from '../../audio/SoundManager';
import { triggerTelegramHaptic, getTelegramUserProfile } from '../../utils/telegram';
import { Building3DThumbnail } from '../Building3DThumbnail';
import { Zap, Gift, Crown, Check, Star, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const CoinSvg = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0 inline-block align-middle">
    <circle cx="12" cy="12" r="10" fill="url(#coin_s_g)" stroke="#92400E" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="7.5" stroke="#FEF08A" strokeWidth="1" strokeDasharray="2.5 1" />
    <path d="M12 6.5L13.2 10.2H17L14 12.5L15.2 16.2L12 13.8L8.8 16.2L10 12.5L7 10.2H10.8L12 6.5Z" fill="#FFFBEB" stroke="#B45309" strokeWidth="0.6" />
    <ellipse cx="9.5" cy="8" rx="4" ry="2" fill="rgba(255,255,255,0.45)" transform="rotate(-25 9.5 8)" />
    <defs>
      <linearGradient id="coin_s_g" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
  </svg>
);

const WoodSvg = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0 inline-block">
    <rect x="2" y="6" width="20" height="12" rx="3" fill="#854D0E" stroke="#451A03" strokeWidth="1.5" />
    <ellipse cx="6" cy="12" rx="2" ry="4" fill="#A16207" />
    <line x1="6" y1="9" x2="20" y2="9" stroke="#542D0C" strokeWidth="1" />
    <line x1="6" y1="15" x2="20" y2="15" stroke="#542D0C" strokeWidth="1" />
  </svg>
);

// Featured Promo Deals Carousel Data
const PROMO_DEALS = [
  {
    id: 'starter_pack',
    modelId: 'starter_pack',
    title: 'Набор Первопроходца',
    badge: 'СКИДКА -70%',
    badgeColor: 'bg-red-600',
    desc: 'Быстрый старт для новой фермы с монетами, энергией и редкими стройматериалами!',
    perks: [
      { text: '+15,000 Монет', type: 'coins' },
      { text: '+20 Энергии', type: 'energy' },
      { text: '5 Досок + 5 Гвоздей', type: 'wood' },
    ],
    coins: 15000,
    energy: 20,
    stars: 99,
    rub: '149 ₽',
  },
  {
    id: 'architect_chest',
    modelId: 'architect_chest',
    title: 'Сундук Архитектора',
    badge: 'ХИТ ПРОДАЖ',
    badgeColor: 'bg-purple-600',
    desc: 'Огромный запас материалов для моментального расширения амбара и силоса!',
    perks: [
      { text: '+35,000 Монет', type: 'coins' },
      { text: '+30 Энергии', type: 'energy' },
      { text: '15 Болтов, Панелей и Скотча', type: 'wood' },
    ],
    coins: 35000,
    energy: 30,
    stars: 249,
    rub: '349 ₽',
  },
  {
    id: 'magnate_vault',
    modelId: 'magnate_vault',
    title: 'Казна Магната',
    badge: 'МАКСИМУМ',
    badgeColor: 'bg-emerald-600',
    desc: 'Беспредельный достаток на месяцы вперед! Покупайте любые заводы и украшения.',
    perks: [
      { text: '+150,000 Монет', type: 'coins' },
      { text: 'Полный бак энергии (30/30)', type: 'energy' },
      { text: 'VIP Статус на 14 дней', type: 'vip' },
    ],
    coins: 150000,
    energy: 30,
    stars: 699,
    rub: '899 ₽',
  },
  {
    id: 'vip_club_pass',
    modelId: 'vip_club_pass',
    title: 'VIP Золотой Статус',
    badge: 'ПРЕМИУМ',
    badgeColor: 'bg-amber-500 text-black',
    desc: 'Удвоенная скорость созревания всех грядок, мгновенная доставка грузовиком и золотая рамка!',
    perks: [
      { text: '+50,000 Монет бонусом', type: 'coins' },
      { text: 'Удвоенный рост урожая ×2', type: 'energy' },
      { text: 'Доставка без ожидания', type: 'vip' },
    ],
    coins: 50000,
    energy: 30,
    stars: 499,
    rub: '699 ₽',
  },
];

export const BuildShopModal: React.FC = () => {
  const {
    activeModal,
    isDesign2026,
    coins,
    gems,
    addFloatingText,
  } = useGameStore();

  const [activePromoIndex, setActivePromoIndex] = useState(0);
  const [dailyClaimed, setDailyClaimed] = useState(false);

  // Auto-cycle carousel every 6 seconds
  useEffect(() => {
    if (activeModal !== 'shop') return;
    const interval = setInterval(() => {
      setActivePromoIndex(prev => (prev + 1) % PROMO_DEALS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeModal]);

  if (activeModal !== 'shop') return null;

  const currentPromo = PROMO_DEALS[activePromoIndex];

  const handlePurchase = (itemTitle: string, coinAmount: number, energyAmount: number, starCost: number) => {
    sounds.playCoin();
    triggerTelegramHaptic('success');

    useGameStore.setState(state => ({
      coins: state.coins + coinAmount,
      gems: Math.min(30, state.gems + energyAmount),
    }));

    addFloatingText(`+${coinAmount.toLocaleString('ru-RU')} 🪙 Начислено!`, window.innerWidth / 2, window.innerHeight / 2, '#FACC15');
    if (energyAmount > 0) {
      setTimeout(() => {
        addFloatingText(`+${energyAmount} ⚡ Энергия пополнена!`, window.innerWidth / 2, window.innerHeight / 2 + 30, '#38BDF8');
      }, 300);
    }
  };

  const handleClaimDaily = () => {
    if (dailyClaimed) return;
    sounds.playLevelUp();
    triggerTelegramHaptic('success');
    setDailyClaimed(true);
    useGameStore.setState(state => ({
      coins: state.coins + 500,
      gems: Math.min(30, state.gems + 5),
    }));
    addFloatingText('+500 🪙 +5 ⚡ Ежедневный бонус!', window.innerWidth / 2, window.innerHeight / 2, '#4ADE80');
  };

  return (
    <div className="fixed inset-0 pt-12 sm:pt-14 pb-16 sm:pb-20 z-40 flex flex-col select-none animate-pop-in overflow-hidden game-screen-bg text-amber-100">
      
      {/* ── TOP HEADER ── */}
      <div className="px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between game-screen-header shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl game-side-medal flex items-center justify-center text-base shadow">
            🎪
          </div>
          <span className="font-black text-xs sm:text-sm tracking-wide uppercase text-yellow-300 game-text-gold">
            Магазин Доната и Банк
          </span>
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT AREA ── */}
      <div className="flex-1 overflow-y-auto p-2.5 sm:p-5">
        <div className="max-w-lg mx-auto flex flex-col gap-3 sm:gap-4 pb-12">
          
          {/* ════════════════════════════════════════════════════════════
              1. TOP: ЦИКЛИЧЕСКАЯ КАРУСЕЛЬ АКЦИЙ (С 3D МОДЕЛЬЮ)
              ════════════════════════════════════════════════════════════ */}
          <div className="relative">
            <div
              key={currentPromo.id}
              className="p-3.5 sm:p-5 rounded-2xl game-card border-2 border-amber-500/80 shadow-2xl flex flex-col justify-between relative transition-all duration-300"
            >
              {/* Promo Badge */}
              <div className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow ${currentPromo.badgeColor}`}>
                {currentPromo.badge}
              </div>

              {/* 3D Model Rendered Thumbnail */}
              <div className="flex items-center gap-3 sm:gap-4 my-1">
                <div className="w-16 h-16 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center filter drop-shadow-xl">
                  <Building3DThumbnail buildingId={currentPromo.modelId} size={72} />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-black text-sm sm:text-lg mb-0.5 leading-tight text-yellow-300 game-text-gold">{currentPromo.title}</h3>
                  <p className="text-[11px] sm:text-xs leading-relaxed text-amber-200/80 font-medium">
                    {currentPromo.desc}
                  </p>
                </div>
              </div>

              {/* Perks with Vector Icons */}
              <div className="flex flex-col gap-1.5 my-3 game-badge-slot p-3 rounded-xl text-xs font-bold">
                {currentPromo.perks.map((perk, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {perk.type === 'coins' && <CoinSvg />}
                    {perk.type === 'energy' && <Zap size={14} className="text-sky-400" />}
                    {perk.type === 'wood' && <WoodSvg />}
                    {perk.type === 'vip' && <Crown size={14} className="text-amber-400" />}
                    <span className={
                      perk.type === 'coins' ? 'text-amber-300 font-extrabold' : perk.type === 'energy' ? 'text-sky-300 font-extrabold' : 'text-emerald-300 font-extrabold'
                    }>
                      {perk.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Buy Action Button */}
              <button
                onClick={() => handlePurchase(currentPromo.title, currentPromo.coins, currentPromo.energy, currentPromo.stars)}
                className="w-full py-3 game-btn-gold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-lg"
              >
                <Star size={15} className="fill-amber-950" />
                <span>Купить за {currentPromo.stars} ⭐ ({currentPromo.rub})</span>
              </button>
            </div>

            {/* Carousel Navigation Arrows & Dots */}
            <div className="flex items-center justify-between mt-2.5 px-1">
              <button
                onClick={() => {
                  sounds.playClick();
                  setActivePromoIndex(prev => (prev - 1 + PROMO_DEALS.length) % PROMO_DEALS.length);
                }}
                className="w-7 h-7 rounded-full game-dock-btn text-amber-200 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Indicator Dots */}
              <div className="flex items-center gap-1.5">
                {PROMO_DEALS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      sounds.playClick();
                      setActivePromoIndex(idx);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      activePromoIndex === idx
                        ? 'w-6 bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.8)]'
                        : 'w-2 bg-amber-900/60 hover:bg-amber-700'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => {
                  sounds.playClick();
                  setActivePromoIndex(prev => (prev + 1) % PROMO_DEALS.length);
                }}
                className="w-7 h-7 rounded-full game-dock-btn text-amber-200 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* ── DAILY FREE BONUS BANNER ── */}
          <div className="p-3.5 rounded-2xl game-card border border-amber-600/70 shadow-lg flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 shrink-0 flex items-center justify-center filter drop-shadow-md">
                <Building3DThumbnail buildingId="daily_gift_box" size={56} />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xs sm:text-sm text-yellow-300 game-text-gold">Ежедневный подарок</span>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-300">
                  <span className="flex items-center gap-1">+500 <CoinSvg /></span>
                  <span>и</span>
                  <span className="flex items-center gap-0.5 text-sky-400">+5 <Zap size={12} /></span>
                  <span className="text-amber-400/60">бесплатно</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleClaimDaily}
              disabled={dailyClaimed}
              className={`px-3.5 py-2 rounded-xl text-xs font-black shadow flex items-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0 ${
                dailyClaimed
                  ? 'bg-black/40 text-amber-500/40 border border-amber-900/40 cursor-default'
                  : 'game-btn-plus text-white animate-pulse'
              }`}
            >
              {dailyClaimed ? <Check size={13} className="text-emerald-400" /> : <Sparkles size={13} />}
              <span>{dailyClaimed ? 'Забрано' : 'Забрать'}</span>
            </button>
          </div>

          {/* ════════════════════════════════════════════════════════════
              2. BOTTOM: КАРТОЧКИ ПОКУПКИ С 3D МОДЕЛЯМИ (2 В РЯД)
              ════════════════════════════════════════════════════════════ */}
          
          {/* SECTION A: 🪙 ПАКЕТЫ МОНЕТ (2 В РЯД С 3D МОДЕЛЯМИ) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 px-1">
              <CoinSvg />
              <span className="text-xs font-black text-yellow-300 uppercase tracking-wider game-text-gold">
                Пакеты монет
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Горсть монет', modelId: 'coins_handful', coins: 3000, stars: 29, price: '49 ₽' },
                { name: 'Кошель золота', modelId: 'coins_pouch', coins: 12000, stars: 99, price: '149 ₽' },
                { name: 'Сундук золота', modelId: 'coins_chest', coins: 50000, stars: 299, price: '399 ₽' },
                { name: 'Сейф банкира', modelId: 'coins_vault', coins: 200000, stars: 899, price: '1,190 ₽' },
              ].map(item => (
                <div
                  key={item.name}
                  className="p-3 rounded-2xl game-card border border-amber-700/60 shadow flex flex-col items-center justify-between text-center gap-1.5"
                >
                  <div className="w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center my-0.5 filter drop-shadow-md">
                    <Building3DThumbnail buildingId={item.modelId} size={64} />
                  </div>
                  <span className="font-bold text-xs text-amber-100">{item.name}</span>
                  <div className="flex items-center gap-1">
                    <CoinSvg />
                    <span className="font-black text-sm text-yellow-300 game-text-gold">+{item.coins.toLocaleString('ru-RU')}</span>
                  </div>
                  <button
                    onClick={() => handlePurchase(item.name, item.coins, 0, item.stars)}
                    className="w-full mt-1 py-2 game-btn-gold text-xs shadow transition-transform active:scale-95 cursor-pointer"
                  >
                    {item.stars} ⭐ ({item.price})
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION B: ⚡ ПАКЕТЫ ЭНЕРГИИ (2 В РЯД С 3D МОДЕЛЯМИ) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 px-1">
              <Zap size={14} className="text-sky-400" />
              <span className="text-xs font-black text-sky-300 uppercase tracking-wider game-text-shadow">
                Пакеты энергии
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Зелье бодрости', modelId: 'energy_potion', energy: 10, stars: 19, price: '29 ₽' },
                { name: 'Бочка энергии', modelId: 'energy_barrel', energy: 30, stars: 49, price: '79 ₽' },
                { name: 'Генератор энергии', modelId: 'energy_generator', energy: 60, stars: 99, price: '149 ₽' },
                { name: 'Вечный двигатель', modelId: 'energy_perpetual', energy: 150, stars: 199, price: '299 ₽' },
              ].map(item => (
                <div
                  key={item.name}
                  className="p-3 rounded-2xl game-card border border-sky-700/60 shadow flex flex-col items-center justify-between text-center gap-1.5"
                >
                  <div className="w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center my-0.5 filter drop-shadow-md">
                    <Building3DThumbnail buildingId={item.modelId} size={64} />
                  </div>
                  <span className="font-bold text-xs text-amber-100">{item.name}</span>
                  <div className="flex items-center gap-1">
                    <Zap size={13} className="text-sky-400" />
                    <span className="font-black text-sm text-sky-300 game-text-shadow">+{item.energy} ⚡</span>
                  </div>
                  <button
                    onClick={() => handlePurchase(item.name, 0, item.energy, item.stars)}
                    className="w-full mt-1 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 border border-sky-300 text-white font-black text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
                  >
                    {item.stars} ⭐ ({item.price})
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
