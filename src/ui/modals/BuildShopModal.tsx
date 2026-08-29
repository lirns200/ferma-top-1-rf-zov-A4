import React, { useState } from 'react';
import { useGameStore } from '../../game/gameState';
import { BUILDINGS } from '../../config/buildings';
import { DECORATIONS } from '../../config/decorations';
import { TREES_BUSHES } from '../../config/crops';
import { sounds } from '../../audio/SoundManager';
import { ArrowLeft, Search, Check } from 'lucide-react';

type ShopTab = 'farming' | 'factories' | 'trees' | 'decorations';

const TABS: { id: ShopTab; label: string; icon: string }[] = [
  { id: 'farming', label: 'Поля и загоны', icon: '🌾' },
  { id: 'factories', label: 'Производство', icon: '🏭' },
  { id: 'trees', label: 'Сад и деревья', icon: '🍎' },
  { id: 'decorations', label: 'Декорации', icon: '⛲' },
];

function fmtCost(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 10_000) return Math.round(n / 1000) + 'K';
  return n.toLocaleString('ru-RU');
}

export const BuildShopModal: React.FC = () => {
  const {
    activeModal, closeModal, level, coins, gems, setPlacingBuilding,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<ShopTab>('farming');
  const [search, setSearch] = useState('');

  if (activeModal !== 'shop') return null;

  const allItems =
    activeTab === 'farming'
      ? [
          BUILDINGS.field_plot,
          ...Object.values(BUILDINGS).filter(b => b.id !== 'field_plot' && (b.category === 'animal_pen' || b.category === 'storage')),
        ].filter(Boolean)
      : activeTab === 'factories'
      ? Object.values(BUILDINGS).filter(b => b.category === 'production')
      : activeTab === 'trees'
      ? Object.values(TREES_BUSHES)
      : Object.values(DECORATIONS);

  const filtered = search
    ? allItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    : allItems;

  const sorted = [...filtered].sort((a, b) => {
    const aOk = level >= a.unlockLevel && coins >= (a.cost || 0);
    const bOk = level >= b.unlockLevel && coins >= (b.cost || 0);
    if (aOk && !bOk) return -1;
    if (bOk && !aOk) return 1;
    return a.unlockLevel - b.unlockLevel;
  });

  const handleSelect = (id: string, unlocked: boolean, canAfford: boolean) => {
    if (!unlocked || !canAfford) return;
    sounds.playClick();
    setPlacingBuilding(id);
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#2A1406] select-none animate-pop-in text-[#3B1F0D] overflow-hidden">
      
      {/* ── TOP HEADER BAR (Стрелка Назад + Заголовок + Баланс) ── */}
      <header className="hud-wood-dock px-3 sm:px-6 py-3 flex items-center justify-between gap-2 shrink-0 shadow-md">
        
        {/* Back Button & Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              closeModal();
            }}
            className="hud-parchment flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-extrabold shadow cursor-pointer active:scale-95 transition-transform"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Назад</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚜</span>
            <div>
              <h1 className="font-extrabold text-sm sm:text-lg text-yellow-300 tracking-tight leading-tight">
                Магазин строительства
              </h1>
              <p className="text-[10px] sm:text-xs text-amber-200/80 hidden sm:block">
                Постройки, производство, животные и декор
              </p>
            </div>
          </div>
        </div>

        {/* Currency Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Coins */}
          <div className="hud-parchment flex items-center gap-1 px-2.5 py-1 text-xs font-bold">
            <span>🪙</span>
            <span>{fmtCost(coins)}</span>
          </div>
          {/* Gems */}
          <div className="hud-parchment flex items-center gap-1 px-2.5 py-1 text-xs font-bold">
            <span>💎</span>
            <span className="text-cyan-900">{gems}</span>
          </div>
          {/* Level */}
          <div className="hud-parchment flex items-center gap-1 px-2 py-1 text-xs font-bold bg-amber-200">
            <span>⭐</span>
            <span>{level} ур.</span>
          </div>
        </div>

      </header>

      {/* ── CATEGORY TABS & SEARCH BAR ── */}
      <div className="bg-[#3D2008] px-3 sm:px-6 py-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-b-2 border-[#5C3718] shrink-0">
        
        {/* Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playClick();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'hud-parchment shadow-lg border-2 border-yellow-400 scale-105'
                    : 'bg-[#2A1406]/80 text-amber-200 border border-amber-900 hover:bg-[#2A1406]'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-56 bg-[#2A1406] border border-amber-800 rounded-xl px-3 py-1.5 text-xs text-yellow-200 placeholder-amber-400/50 focus:outline-none focus:border-yellow-400 pl-8"
          />
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-400/60" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-amber-400">
              ✕
            </button>
          )}
        </div>

      </div>

      {/* ── CARDS GRID (2 КОЛОНКИ НА ТЕЛЕФОНЕ, 3-4 НА ПК) ── */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pb-12">
          {sorted.map(item => {
            const unlocked = level >= item.unlockLevel;
            const cost = item.cost || 0;
            const canAfford = coins >= cost;
            const w = (item as { width?: number }).width || 1;
            const d = (item as { depth?: number }).depth || 1;

            return (
              <div
                key={item.id}
                className={`hud-parchment flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl shadow-md border-2 transition-all relative ${
                  !unlocked
                    ? 'opacity-65 grayscale bg-amber-950/40'
                    : canAfford
                    ? 'hover:border-yellow-500 hover:scale-[1.02]'
                    : 'border-amber-700/60'
                }`}
              >
                {/* Level Lock Badge */}
                {!unlocked && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-amber-950/90 border border-yellow-500/80 text-[10px] font-black text-yellow-300 flex items-center gap-1 shadow">
                    <span>🔒</span>
                    <span>Ур. {item.unlockLevel}</span>
                  </div>
                )}

                {/* Top Info: Icon + Title + Size */}
                <div>
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-amber-100/90 border border-[#5C3718] flex items-center justify-center text-3xl shadow-inner shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex flex-col flex-1 pr-12 sm:pr-0">
                      <h3 className="font-extrabold text-xs sm:text-sm text-[#3B1F0D] leading-tight">
                        {item.name}
                      </h3>
                      <span className="text-[10px] text-[#78350F] font-bold mt-0.5">
                        {w}×{d} кл.
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#5C3718] leading-snug line-clamp-2 my-1.5 font-medium">
                    {(item as { description?: string }).description || 'Постройка для развития и процветания вашей фермы.'}
                  </p>
                </div>

                {/* Bottom Action: Price + Build Button */}
                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-[#5C3718]/30">
                  {/* Price */}
                  <div className="flex items-center gap-1 font-extrabold text-xs">
                    {cost === 0 ? (
                      <span className="text-green-700">Бесплатно</span>
                    ) : (
                      <>
                        <span>🪙</span>
                        <span className={canAfford ? 'text-[#3B1F0D]' : 'text-red-700'}>
                          {fmtCost(cost)}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Build Button */}
                  <button
                    onClick={() => handleSelect(item.id, unlocked, canAfford)}
                    disabled={!unlocked || !canAfford}
                    className={`px-3.5 py-2 rounded-xl font-extrabold text-xs shadow-md transition-transform active:scale-95 cursor-pointer flex items-center gap-1 ${
                      !unlocked
                        ? 'bg-stone-500 text-stone-200 cursor-not-allowed'
                        : !canAfford
                        ? 'bg-amber-900/60 text-amber-400 border border-amber-700 cursor-not-allowed'
                        : 'bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 border border-green-300 text-white shadow-lg'
                    }`}
                  >
                    {unlocked ? (
                      <>
                        <Check size={14} />
                        <span>Построить</span>
                      </>
                    ) : (
                      <span>Закрыто</span>
                    )}
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
