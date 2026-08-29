import React, { useState } from 'react';
import { useGameStore } from '../../game/gameState';
import { BUILDINGS } from '../../config/buildings';
import { DECORATIONS } from '../../config/decorations';
import { TREES_BUSHES } from '../../config/crops';
import { sounds } from '../../audio/SoundManager';
import { triggerTelegramHaptic } from '../../utils/telegram';
import { Search, Check } from 'lucide-react';

const CoinSvg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 inline-block">
    <circle cx="12" cy="12" r="10" fill="url(#coin_b_g)" stroke="#92400E" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="7.5" stroke="#FEF08A" strokeWidth="1" strokeDasharray="2.5 1" />
    <text x="12" y="16" fontSize="11" fontWeight="900" fill="#78350F" textAnchor="middle" fontFamily="sans-serif">🪙</text>
    <defs>
      <linearGradient id="coin_b_g" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
  </svg>
);

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
    activeModal, closeModal, level, coins, setPlacingBuilding,
    isDesign2026,
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
    triggerTelegramHaptic('medium');
    setPlacingBuilding(id);
    closeModal();
  };

  return (
    <div className={`fixed inset-0 pt-14 sm:pt-16 pb-20 sm:pb-24 z-40 flex flex-col select-none animate-pop-in overflow-hidden transition-colors ${
      isDesign2026 ? 'bg-[#0F1115] text-white' : 'bg-[#2A1406] text-[#3B1F0D]'
    }`}>
      
      {/* ── TOP TITLE & CATEGORY BAR ── */}
      <div className={`px-3 sm:px-6 py-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-b shrink-0 ${
        isDesign2026 ? 'bg-[#181C24] border-[#242A35]' : 'bg-[#3D2008] border-[#5C3718]'
      }`}>
        
        {/* Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playClick();
                  triggerTelegramHaptic('light');
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? isDesign2026
                      ? 'bg-purple-600 text-white shadow-lg border border-purple-400 scale-105'
                      : 'hud-parchment shadow-lg border-2 border-yellow-400 scale-105'
                    : isDesign2026
                    ? 'bg-[#242A35] text-[#8E939D] hover:text-white'
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
            className={`w-full sm:w-56 border rounded-xl px-3 py-1.5 text-xs placeholder-zinc-500 focus:outline-none pl-8 ${
              isDesign2026
                ? 'bg-[#242A35] border-[#353D4C] text-white focus:border-purple-400'
                : 'bg-[#2A1406] border-amber-800 text-yellow-200 focus:border-yellow-400'
            }`}
          />
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
              ✕
            </button>
          )}
        </div>

      </div>

      {/* ── CARDS GRID ── */}
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
                className={`flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl shadow-md border transition-all relative ${
                  isDesign2026
                    ? 'bg-[#181C24] border-[#242A35] text-white'
                    : 'hud-parchment text-[#3B1F0D] border-2'
                } ${
                  !unlocked
                    ? 'opacity-60 grayscale'
                    : canAfford
                    ? 'hover:scale-[1.02] hover:border-purple-400'
                    : ''
                }`}
              >
                {/* Level Lock Badge */}
                {!unlocked && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-black/80 border border-yellow-500/80 text-[10px] font-black text-yellow-300 flex items-center gap-1 shadow">
                    <span>🔒</span>
                    <span>Ур. {item.unlockLevel}</span>
                  </div>
                )}

                {/* Top Info */}
                <div>
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-3xl shadow-inner shrink-0 ${
                      isDesign2026 ? 'bg-[#242A35] border border-[#353D4C]' : 'bg-amber-100/90 border border-[#5C3718]'
                    }`}>
                      {item.icon}
                    </div>
                    <div className="flex flex-col flex-1 pr-12 sm:pr-0">
                      <h3 className={`font-extrabold text-xs sm:text-sm leading-tight ${
                        isDesign2026 ? 'text-white' : 'text-[#3B1F0D]'
                      }`}>
                        {item.name}
                      </h3>
                      <span className={`text-[10px] font-bold mt-0.5 ${
                        isDesign2026 ? 'text-zinc-400' : 'text-[#78350F]'
                      }`}>
                        {w}×{d} кл.
                      </span>
                    </div>
                  </div>

                  <p className={`text-[11px] leading-snug line-clamp-2 my-1.5 font-medium ${
                    isDesign2026 ? 'text-[#8E939D]' : 'text-[#5C3718]'
                  }`}>
                    {(item as { description?: string }).description || 'Постройка для развития и процветания вашей фермы.'}
                  </p>
                </div>

                {/* Bottom Action: Price + Build Button */}
                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-white/10">
                  {/* Price */}
                  <div className="flex items-center gap-1 font-extrabold text-xs">
                    {cost === 0 ? (
                      <span className="text-emerald-400">Бесплатно</span>
                    ) : (
                      <>
                        <CoinSvg />
                        <span className={canAfford ? (isDesign2026 ? 'text-yellow-300' : 'text-[#3B1F0D]') : 'text-red-400'}>
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
                        ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                        : !canAfford
                        ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                        : 'bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 border border-emerald-300 text-white shadow-lg'
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
