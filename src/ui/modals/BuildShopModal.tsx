import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../game/gameState';
import { sounds } from '../../audio/SoundManager';
import { triggerTelegramHaptic, getTelegramUserProfile } from '../../utils/telegram';
import { Building3DThumbnail } from '../Building3DThumbnail';
import { Zap, Gift, Crown, Check, Star, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const CoinSvg = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0 inline-block">
    <circle cx="12" cy="12" r="10" fill="url(#coin_s_g)" stroke="#92400E" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="7.5" stroke="#FEF08A" strokeWidth="1" strokeDasharray="2.5 1" />
    <text x="12" y="16" fontSize="11" fontWeight="900" fill="#78350F" textAnchor="middle" fontFamily="sans-serif">🪙</text>
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
    <div className={`fixed inset-0 pt-14 sm:pt-16 pb-20 sm:pb-24 z-40 flex flex-col select-none animate-pop-in overflow-hidden transition-colors ${
      isDesign2026 ? 'bg-[#0F1115] text-white' : 'bg-[#2A1406] text-[#3B1F0D]'
    }`}>
      
      {/* ── TOP HEADER ── */}
      <div className={`px-4 sm:px-6 py-2.5 flex items-center justify-between border-b shrink-0 ${
        isDesign2026 ? 'bg-[#181C24] border-[#242A35]' : 'bg-[#3D2008] border-[#5C3718]'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-sm shadow">
            🎪
          </div>
          <span className="font-extrabold text-sm tracking-wide uppercase">
            Магазин Доната и Банк
          </span>
        </div>

        {/* Telegram Stars Balance Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-400/40 text-yellow-300 text-xs font-black shadow">
          <Star size={13} className="fill-yellow-400 text-yellow-400" />
          <span>Telegram Stars</span>
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT AREA ── */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5">
        <div className="max-w-lg mx-auto flex flex-col gap-4 pb-12">
          
          {/* ════════════════════════════════════════════════════════════
              1. TOP: ЦИКЛИЧЕСКАЯ КАРУСЕЛЬ АКЦИЙ (С 3D МОДЕЛЬЮ)
              ════════════════════════════════════════════════════════════ */}
          <div className="relative">
            <div
              key={currentPromo.id}
              className={`p-4 sm:p-5 rounded-2xl border shadow-2xl flex flex-col justify-between relative transition-all duration-300 ${
                isDesign2026
                  ? 'bg-[#181C24] border-amber-400/60 shadow-amber-950/30 text-white'
                  : 'hud-parchment border-amber-600 text-[#3B1F0D]'
              }`}
            >
              {/* Promo Badge */}
              <div className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-white text-[10px] font-black uppercase tracking-wider shadow ${currentPromo.badgeColor}`}>
                {currentPromo.badge}
              </div>

              {/* 3D Model Rendered Thumbnail */}
              <div className="flex items-center gap-4 my-1">
                <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center filter drop-shadow-xl">
                  <Building3DThumbnail buildingId={currentPromo.modelId} size={88} />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-black text-base sm:text-lg mb-0.5 leading-tight">{currentPromo.title}</h3>
                  <p className={`text-xs leading-relaxed ${isDesign2026 ? 'text-[#8E939D]' : 'text-[#5C3718]'}`}>
                    {currentPromo.desc}
                  </p>
                </div>
              </div>

              {/* Perks with Vector Icons */}
              <div className="flex flex-col gap-1.5 my-3 bg-black/25 p-3 rounded-xl text-xs font-bold border border-white/5">
                {currentPromo.perks.map((perk, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {perk.type === 'coins' && <CoinSvg />}
                    {perk.type === 'energy' && <Zap size={14} className="text-sky-400" />}
                    {perk.type === 'wood' && <WoodSvg />}
                    {perk.type === 'vip' && <Crown size={14} className="text-amber-400" />}
                    <span className={
                      perk.type === 'coins' ? 'text-amber-300' : perk.type === 'energy' ? 'text-sky-300' : 'text-emerald-300'
                    }>
                      {perk.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Buy Action Button */}
              <button
                onClick={() => handlePurchase(currentPromo.title, currentPromo.coins, currentPromo.energy, currentPromo.stars)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-amber-950 font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
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
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
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
                        ? 'w-6 bg-amber-400'
                        : 'w-2 bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => {
                  sounds.playClick();
                  setActivePromoIndex(prev => (prev + 1) % PROMO_DEALS.length);
                }}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* ── DAILY FREE BONUS BANNER ── */}
          <div className={`p-3.5 rounded-2xl border shadow-lg flex items-center justify-between gap-3 ${
            isDesign2026
              ? 'bg-gradient-to-r from-emerald-950/40 via-[#181C24] to-teal-950/40 border-emerald-500/40 text-white'
              : 'hud-parchment border-emerald-600 text-[#3B1F0D]'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center text-xl shadow-lg shrink-0">
                🎁
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xs">Ежедневный подарок</span>
                <span className={`text-[11px] ${isDesign2026 ? 'text-emerald-300' : 'text-emerald-800 font-bold'}`}>
                  +500 🪙 и +5 ⚡ бесплатно
                </span>
              </div>
            </div>

            <button
              onClick={handleClaimDaily}
              disabled={dailyClaimed}
              className={`px-3 py-2 rounded-xl text-xs font-black shadow flex items-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0 ${
                dailyClaimed
                  ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-default'
                  : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:brightness-110 border border-emerald-300 animate-pulse'
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
              <span className="text-xs font-extrabold text-[#8E939D] uppercase tracking-wider">
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
                  className={`p-3 rounded-2xl border shadow flex flex-col items-center justify-between text-center gap-1.5 ${
                    isDesign2026 ? 'bg-[#181C24] border-[#242A35] text-white' : 'hud-parchment border-amber-700/60 text-[#3B1F0D]'
                  }`}
                >
                  <div className="w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center my-0.5 filter drop-shadow-md">
                    <Building3DThumbnail buildingId={item.modelId} size={64} />
                  </div>
                  <span className="font-bold text-xs">{item.name}</span>
                  <div className="flex items-center gap-1">
                    <CoinSvg />
                    <span className="font-black text-sm text-amber-400">+{item.coins.toLocaleString('ru-RU')}</span>
                  </div>
                  <button
                    onClick={() => handlePurchase(item.name, item.coins, 0, item.stars)}
                    className="w-full mt-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-950 font-black text-xs shadow transition-transform active:scale-95 cursor-pointer"
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
              <span className="text-xs font-extrabold text-[#8E939D] uppercase tracking-wider">
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
                  className={`p-3 rounded-2xl border shadow flex flex-col items-center justify-between text-center gap-1.5 ${
                    isDesign2026 ? 'bg-[#181C24] border-[#242A35] text-white' : 'hud-parchment border-amber-700/60 text-[#3B1F0D]'
                  }`}
                >
                  <div className="w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center my-0.5 filter drop-shadow-md">
                    <Building3DThumbnail buildingId={item.modelId} size={64} />
                  </div>
                  <span className="font-bold text-xs">{item.name}</span>
                  <div className="flex items-center gap-1">
                    <Zap size={13} className="text-sky-400" />
                    <span className="font-black text-sm text-sky-400">+{item.energy} ⚡</span>
                  </div>
                  <button
                    onClick={() => handlePurchase(item.name, 0, item.energy, item.stars)}
                    className="w-full mt-1 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-xs shadow transition-transform active:scale-95 cursor-pointer"
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
