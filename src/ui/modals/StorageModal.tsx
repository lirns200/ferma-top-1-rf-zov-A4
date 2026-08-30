import React, { useState } from 'react';
import { useGameStore } from '../../game/gameState';
import { PRODUCTS } from '../../config/products';
import { sounds } from '../../audio/SoundManager';
import { triggerTelegramHaptic } from '../../utils/telegram';
import { ArrowUpCircle, Hammer } from 'lucide-react';
import { Item3DThumbnail } from '../Item3DThumbnail';

export const StorageModal: React.FC = () => {
  const {
    activeModal,
    siloCapacity,
    barnCapacity,
    inventory,
    getStorageUsed,
    upgradeStorage,
    isDesign2026,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'silo' | 'barn'>(
    activeModal === 'silo' ? 'silo' : 'barn'
  );

  if (activeModal !== 'silo' && activeModal !== 'barn') return null;

  const currentType = activeTab;
  const capacity = currentType === 'silo' ? siloCapacity : barnCapacity;
  const used = getStorageUsed(currentType);
  const percent = Math.min(100, Math.round((used / capacity) * 100));

  // Items currently in this storage
  const storedItems = Object.entries(inventory)
    .filter(([itemId, count]) => {
      const item = PRODUCTS[itemId];
      return item && item.storage === currentType && count > 0;
    })
    .map(([itemId, count]) => ({
      item: PRODUCTS[itemId],
      count,
    }));

  // Upgrade material calculations
  const reqCount = Math.floor(capacity / 25);
  const siloMats = [
    { id: 'nail', name: 'Гвозди', icon: '🔩', have: inventory.nail || 0 },
    { id: 'screw', name: 'Шурупы', icon: '🪛', have: inventory.screw || 0 },
    { id: 'wood_panel', name: 'Панели', icon: '🪵', have: inventory.wood_panel || 0 },
  ];
  const barnMats = [
    { id: 'bolt', name: 'Болты', icon: '🔩', have: inventory.bolt || 0 },
    { id: 'plank', name: 'Доски', icon: '🪵', have: inventory.plank || 0 },
    { id: 'duct_tape', name: 'Скотч', icon: '🩹', have: inventory.duct_tape || 0 },
  ];
  const currentMats = currentType === 'silo' ? siloMats : barnMats;
  const canUpgrade = currentMats.every(m => m.have >= reqCount);

  return (
    <div className="fixed inset-0 pt-12 sm:pt-14 pb-16 sm:pb-20 z-40 flex flex-col select-none animate-pop-in overflow-hidden game-screen-bg text-amber-100">
      
      {/* ── TABS SWITCHER HEADER ── */}
      <div className="px-3 sm:px-6 py-2.5 sm:py-3 flex items-center gap-2 game-screen-header shrink-0">
        <button
          onClick={() => {
            sounds.playClick();
            triggerTelegramHaptic('light');
            setActiveTab('silo');
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'silo' ? 'game-tab-btn-active' : 'game-tab-btn'
          }`}
        >
          <span className="text-sm sm:text-base">🌾</span>
          <span>Силос ({getStorageUsed('silo')}/{siloCapacity})</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            triggerTelegramHaptic('light');
            setActiveTab('barn');
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'barn' ? 'game-tab-btn-active' : 'game-tab-btn'
          }`}
        >
          <span className="text-sm sm:text-base">🏚️</span>
          <span>Амбар ({getStorageUsed('barn')}/{barnCapacity})</span>
        </button>
      </div>

      {/* ── CAPACITY PROGRESS BAR ── */}
      <div className="px-4 sm:px-6 py-2.5 bg-black/40 border-b border-amber-900/60">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <span className="text-xs font-black text-amber-200 uppercase tracking-wider shrink-0 game-text-shadow">
            Вместимость:
          </span>
          <div className="game-badge-slot w-full h-3.5 p-[2px] overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                percent >= 90
                  ? 'bg-gradient-to-r from-red-600 to-rose-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]'
                  : percent >= 75
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  : 'bg-gradient-to-r from-emerald-500 via-green-400 to-lime-300 shadow-[0_0_6px_rgba(74,222,128,0.8)]'
              }`}
              style={{ width: `${Math.max(3, percent)}%` }}
            />
          </div>
          <span className="text-xs font-black text-yellow-300 game-text-gold shrink-0">{used}/{capacity}</span>
        </div>
      </div>

      {/* ── STORED ITEMS GRID & UPGRADE BLOCK ── */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-5 pb-12">
          
          {/* Stored Items Grid */}
          <div>
            <h2 className="text-xs sm:text-sm font-black text-yellow-300 uppercase tracking-wide mb-3 game-text-gold">
              Предметы в хранилище:
            </h2>

            {storedItems.length === 0 ? (
              <div className="p-8 rounded-2xl text-center flex flex-col items-center justify-center gap-2 game-card border border-amber-800">
                <span className="text-4xl">🌾</span>
                <span className="text-sm font-bold text-amber-200">Хранилище пока пусто. Соберите урожай на ферме!</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {storedItems.map(({ item, count }) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2.5 p-3 rounded-2xl game-card border border-amber-800/80 shadow"
                  >
                    <Item3DThumbnail itemId={item.id} fallbackIcon={item.icon} className="w-10 h-10 shrink-0 filter drop-shadow-md" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-extrabold text-xs text-amber-100 truncate game-text-shadow">
                        {item.name}
                      </span>
                      <span className="font-black text-sm text-emerald-300">
                        ×{count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upgrade Storage Card */}
          <div className="p-4 sm:p-5 rounded-2xl game-card border-2 border-amber-500/80 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <ArrowUpCircle size={22} className="text-emerald-400 filter drop-shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
                <h3 className="font-black text-sm sm:text-base text-yellow-300 game-text-gold">
                  Увеличить склад на +25 мест
                </h3>
              </div>
              <p className="text-xs text-amber-200/80 font-medium">
                Требуются строительные материалы:
              </p>

              {/* Material Badges */}
              <div className="flex items-center gap-2 mt-2">
                {currentMats.map(mat => {
                  const hasEnough = mat.have >= reqCount;
                  return (
                    <div
                      key={mat.id}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-black text-xs ${
                        hasEnough
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_6px_rgba(74,222,128,0.4)]'
                          : 'game-badge-slot border-amber-900/60 text-amber-200/70'
                      }`}
                    >
                      <Item3DThumbnail itemId={mat.id} fallbackIcon={mat.icon} className="w-5 h-5 shrink-0" />
                      <span>{mat.have}/{reqCount}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upgrade Action Button */}
            <button
              onClick={() => {
                if (canUpgrade) {
                  sounds.playLevelUp();
                  triggerTelegramHaptic('success');
                  upgradeStorage(currentType);
                }
              }}
              disabled={!canUpgrade}
              className={`px-5 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 shrink-0 cursor-pointer ${
                canUpgrade
                  ? 'game-btn-gold animate-bounce'
                  : 'bg-black/50 text-amber-500/40 border border-amber-900/40 cursor-not-allowed'
              }`}
            >
              <Hammer size={16} />
              <span>Улучшить склад</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
