import React, { useState } from 'react';
import { useGameStore } from '../../game/gameState';
import { sounds } from '../../audio/SoundManager';
import { triggerTelegramHaptic, getTelegramUserProfile } from '../../utils/telegram';
import { Sparkles, Zap, Coins, Gift, Crown, Check, Star, ShieldCheck, Flame } from 'lucide-react';

type ShopTab = 'deals' | 'coins' | 'energy' | 'vip';

const CoinSvg = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 inline-block">
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

export const BuildShopModal: React.FC = () => {
  const {
    activeModal,
    isDesign2026,
    coins,
    gems,
    addFloatingText,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<ShopTab>('deals');
  const [dailyClaimed, setDailyClaimed] = useState(false);

  if (activeModal !== 'shop') return null;

  const tgProfile = getTelegramUserProfile();

  const handlePurchase = (itemTitle: string, coinAmount: number, energyAmount: number, starCost: number) => {
    sounds.playCoin();
    triggerTelegramHaptic('success');

    // Add purchased resources to store
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
      
      {/* ── TOP TABS BAR ── */}
      <div className={`px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 border-b shrink-0 ${
        isDesign2026 ? 'bg-[#181C24] border-[#242A35]' : 'bg-[#3D2008] border-[#5C3718]'
      }`}>
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto">
          
          <button
            onClick={() => {
              sounds.playClick();
              triggerTelegramHaptic('light');
              setActiveTab('deals');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
              activeTab === 'deals'
                ? isDesign2026
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg scale-105 font-black'
                  : 'hud-parchment shadow-lg border-2 border-yellow-400 scale-105 text-[#3B1F0D]'
                : isDesign2026
                ? 'bg-[#242A35] text-[#8E939D] hover:text-white'
                : 'bg-[#2A1406]/80 text-amber-200 border border-amber-900 hover:bg-[#2A1406]'
            }`}
          >
            <Flame size={15} className="text-amber-400" />
            <span>Акции и Наборы</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              triggerTelegramHaptic('light');
              setActiveTab('coins');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
              activeTab === 'coins'
                ? isDesign2026
                  ? 'bg-purple-600 text-white shadow-lg border border-purple-400 scale-105'
                  : 'hud-parchment shadow-lg border-2 border-yellow-400 scale-105 text-[#3B1F0D]'
                : isDesign2026
                ? 'bg-[#242A35] text-[#8E939D] hover:text-white'
                : 'bg-[#2A1406]/80 text-amber-200 border border-amber-900 hover:bg-[#2A1406]'
            }`}
          >
            <Coins size={15} className="text-yellow-400" />
            <span>Монеты</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              triggerTelegramHaptic('light');
              setActiveTab('energy');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
              activeTab === 'energy'
                ? isDesign2026
                  ? 'bg-purple-600 text-white shadow-lg border border-purple-400 scale-105'
                  : 'hud-parchment shadow-lg border-2 border-yellow-400 scale-105 text-[#3B1F0D]'
                : isDesign2026
                ? 'bg-[#242A35] text-[#8E939D] hover:text-white'
                : 'bg-[#2A1406]/80 text-amber-200 border border-amber-900 hover:bg-[#2A1406]'
            }`}
          >
            <Zap size={15} className="text-sky-400" />
            <span>Энергия</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              triggerTelegramHaptic('light');
              setActiveTab('vip');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
              activeTab === 'vip'
                ? isDesign2026
                  ? 'bg-purple-600 text-white shadow-lg border border-purple-400 scale-105'
                  : 'hud-parchment shadow-lg border-2 border-yellow-400 scale-105 text-[#3B1F0D]'
                : isDesign2026
                ? 'bg-[#242A35] text-[#8E939D] hover:text-white'
                : 'bg-[#2A1406]/80 text-amber-200 border border-amber-900 hover:bg-[#2A1406]'
            }`}
          >
            <Crown size={15} className="text-amber-400" />
            <span>VIP Клуб</span>
          </button>

        </div>

        {/* Telegram Stars Balance Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-yellow-300 text-xs font-black shrink-0">
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
          <span>Telegram Stars</span>
        </div>
      </div>

      {/* ── CONTENT AREA ── */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6">
        <div className="max-w-5xl mx-auto flex flex-col gap-4 pb-12">
          
          {/* ── DAILY FREE GIFT BANNER ── */}
          <div className={`p-4 rounded-2xl border shadow-lg flex items-center justify-between gap-4 ${
            isDesign2026
              ? 'bg-gradient-to-r from-emerald-950/40 via-[#181C24] to-teal-950/40 border-emerald-500/40 text-white'
              : 'hud-parchment border-emerald-600 text-[#3B1F0D]'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center text-2xl shadow-lg shrink-0">
                🎁
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm flex items-center gap-2">
                  <span>Ежедневный подарок фермера</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-black font-black uppercase">Бесплатно</span>
                </span>
                <span className={`text-xs ${isDesign2026 ? 'text-[#8E939D]' : 'text-[#5C3718]'}`}>
                  +500 Монет 🪙 и +5 Энергии ⚡ каждые 24 часа
                </span>
              </div>
            </div>

            <button
              onClick={handleClaimDaily}
              disabled={dailyClaimed}
              className={`px-4 py-2.5 rounded-xl text-xs font-black shadow-lg flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0 ${
                dailyClaimed
                  ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-default'
                  : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:brightness-110 border border-emerald-300 animate-pulse'
              }`}
            >
              {dailyClaimed ? <Check size={14} className="text-emerald-400" /> : <Sparkles size={14} />}
              <span>{dailyClaimed ? 'Получено сегодня' : 'Забрать подарок'}</span>
            </button>
          </div>

          {/* ── TAB 1: АКЦИИ И НАБОРЫ (DEALS) ── */}
          {activeTab === 'deals' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              
              {/* Deal 1: Набор Первопроходца */}
              <div className={`p-4 rounded-2xl border shadow-xl flex flex-col justify-between relative overflow-hidden ${
                isDesign2026 ? 'bg-[#181C24] border-amber-500/50 text-white' : 'hud-parchment border-amber-600 text-[#3B1F0D]'
              }`}>
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow">
                  СКИДКА -70%
                </div>
                <div>
                  <div className="text-4xl my-2">🚀</div>
                  <h3 className="font-extrabold text-base mb-1">Набор Первопроходца</h3>
                  <p className={`text-xs mb-3 ${isDesign2026 ? 'text-[#8E939D]' : 'text-[#5C3718]'}`}>
                    Быстрый старт для новой фермы с монетами, энергией и редкими стройматериалами!
                  </p>
                  <div className="flex flex-col gap-1.5 mb-4 bg-black/20 p-2.5 rounded-xl text-xs font-bold">
                    <span className="text-amber-300">🪙 +15,000 Монет</span>
                    <span className="text-sky-300">⚡ +20 Энергии</span>
                    <span className="text-emerald-300">🪵 5 Досок + 5 Гвоздей</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase('Набор Первопроходца', 15000, 20, 99)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-amber-950 font-black text-xs shadow-lg flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                >
                  <Star size={14} className="fill-amber-950" />
                  <span>Купить за 99 ⭐ (149 ₽)</span>
                </button>
              </div>

              {/* Deal 2: Набор Мега-Строителя */}
              <div className={`p-4 rounded-2xl border shadow-xl flex flex-col justify-between relative overflow-hidden ${
                isDesign2026 ? 'bg-[#181C24] border-purple-500/50 text-white' : 'hud-parchment border-amber-600 text-[#3B1F0D]'
              }`}>
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider shadow">
                  ХИТ ПРОДАЖ
                </div>
                <div>
                  <div className="text-4xl my-2">🏰</div>
                  <h3 className="font-extrabold text-base mb-1">Сундук Архитектора</h3>
                  <p className={`text-xs mb-3 ${isDesign2026 ? 'text-[#8E939D]' : 'text-[#5C3718]'}`}>
                    Огромный запас материалов для моментального расширения амбара и силоса!
                  </p>
                  <div className="flex flex-col gap-1.5 mb-4 bg-black/20 p-2.5 rounded-xl text-xs font-bold">
                    <span className="text-amber-300">🪙 +35,000 Монет</span>
                    <span className="text-sky-300">⚡ +30 Энергии</span>
                    <span className="text-purple-300">📦 +15 Болтов, Панелей и Скотча</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase('Сундук Архитектора', 35000, 30, 249)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer border border-purple-300"
                >
                  <Star size={14} className="fill-yellow-300 text-yellow-300" />
                  <span>Купить за 249 ⭐ (349 ₽)</span>
                </button>
              </div>

              {/* Deal 3: Золотой Запас Магната */}
              <div className={`p-4 rounded-2xl border shadow-xl flex flex-col justify-between relative overflow-hidden ${
                isDesign2026 ? 'bg-[#181C24] border-emerald-500/50 text-white' : 'hud-parchment border-amber-600 text-[#3B1F0D]'
              }`}>
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow">
                  МАКСИМУМ
                </div>
                <div>
                  <div className="text-4xl my-2">👑</div>
                  <h3 className="font-extrabold text-base mb-1">Казна Магната</h3>
                  <p className={`text-xs mb-3 ${isDesign2026 ? 'text-[#8E939D]' : 'text-[#5C3718]'}`}>
                    Беспредельный достаток на месяцы вперед! Покупайте любые заводы и украшения.
                  </p>
                  <div className="flex flex-col gap-1.5 mb-4 bg-black/20 p-2.5 rounded-xl text-xs font-bold">
                    <span className="text-amber-300">🪙 +150,000 Монет</span>
                    <span className="text-sky-300">⚡ Полный бак энергии</span>
                    <span className="text-emerald-300">🌟 VIP статус на 14 дней</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase('Казна Магната', 150000, 30, 699)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs shadow-lg flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer border border-emerald-300"
                >
                  <Star size={14} className="fill-yellow-300 text-yellow-300" />
                  <span>Купить за 699 ⭐ (899 ₽)</span>
                </button>
              </div>

            </div>
          )}

          {/* ── TAB 2: МОНЕТЫ (COINS) ── */}
          {activeTab === 'coins' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[
                { name: 'Горсть монет', icon: '🪙', coins: 3000, stars: 29, price: '49 ₽' },
                { name: 'Кошель золота', icon: '💰', coins: 12000, stars: 99, price: '149 ₽' },
                { name: 'Сундук золота', icon: '📦', coins: 50000, stars: 299, price: '399 ₽' },
                { name: 'Сейф банкира', icon: '🏦', coins: 200000, stars: 899, price: '1,190 ₽' },
              ].map(item => (
                <div
                  key={item.name}
                  className={`p-4 rounded-2xl border shadow flex flex-col items-center justify-between text-center gap-2 ${
                    isDesign2026 ? 'bg-[#181C24] border-[#242A35] text-white' : 'hud-parchment border-amber-700/60 text-[#3B1F0D]'
                  }`}
                >
                  <span className="text-4xl my-1">{item.icon}</span>
                  <span className="font-bold text-xs">{item.name}</span>
                  <span className="font-black text-base text-amber-400">+{item.coins.toLocaleString('ru-RU')} 🪙</span>
                  <button
                    onClick={() => handlePurchase(item.name, item.coins, 0, item.stars)}
                    className="w-full mt-2 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-950 font-black text-xs shadow transition-transform active:scale-95 cursor-pointer"
                  >
                    {item.stars} ⭐ ({item.price})
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── TAB 3: ЭНЕРГИЯ (ENERGY) ── */}
          {activeTab === 'energy' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[
                { name: 'Зелье бодрости', icon: '🧪', energy: 10, stars: 19, price: '29 ₽' },
                { name: 'Бочка энергии', icon: '⚡', energy: 30, stars: 49, price: '79 ₽' },
                { name: 'Генератор Теслы', icon: '🔋', energy: 60, stars: 99, price: '149 ₽' },
                { name: 'Вечный двигатель', icon: '🔮', energy: 150, stars: 199, price: '299 ₽' },
              ].map(item => (
                <div
                  key={item.name}
                  className={`p-4 rounded-2xl border shadow flex flex-col items-center justify-between text-center gap-2 ${
                    isDesign2026 ? 'bg-[#181C24] border-[#242A35] text-white' : 'hud-parchment border-amber-700/60 text-[#3B1F0D]'
                  }`}
                >
                  <span className="text-4xl my-1">{item.icon}</span>
                  <span className="font-bold text-xs">{item.name}</span>
                  <span className="font-black text-base text-sky-400">+{item.energy} ⚡</span>
                  <button
                    onClick={() => handlePurchase(item.name, 0, item.energy, item.stars)}
                    className="w-full mt-2 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-xs shadow transition-transform active:scale-95 cursor-pointer"
                  >
                    {item.stars} ⭐ ({item.price})
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── TAB 4: VIP КЛУБ (VIP PASS) ── */}
          {activeTab === 'vip' && (
            <div className={`p-6 rounded-2xl border-2 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 ${
              isDesign2026
                ? 'bg-gradient-to-tr from-amber-950/60 via-[#181C24] to-purple-950/60 border-amber-400 text-white'
                : 'hud-parchment border-yellow-500 text-[#3B1F0D]'
            }`}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-400 via-amber-500 to-yellow-300 flex items-center justify-center text-4xl shadow-2xl text-amber-950 shrink-0">
                  👑
                </div>
                <div className="flex flex-col">
                  <h2 className="text-lg font-black flex items-center gap-2">
                    <span>VIP Золотой Статус Фермера</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-400 text-black font-black uppercase">Премиум</span>
                  </h2>
                  <p className={`text-xs mt-1 max-w-lg ${isDesign2026 ? 'text-[#8E939D]' : 'text-[#5C3718]'}`}>
                    Эксклюзивные привилегии: ускоренный в 2 раза рост всех культур, бесплатная доставка заказов пикапом без ожидания, золотая рамка профиля и +200% очков в рейтинге!
                  </p>
                </div>
              </div>

              <button
                onClick={() => handlePurchase('VIP Статус', 50000, 30, 499)}
                className="w-full md:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-300 text-amber-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shrink-0"
              >
                <Crown size={18} />
                <span>Активировать за 499 ⭐ (699 ₽)</span>
              </button>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
