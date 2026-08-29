import React, { useState } from 'react';
import { useGameStore } from '../../game/gameState';
import { PRODUCTS } from '../../config/products';
import { X, ArrowUpCircle, Hammer, Package } from 'lucide-react';

export const StorageModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    siloCapacity,
    barnCapacity,
    inventory,
    getStorageUsed,
    upgradeStorage,
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-['Fredoka',sans-serif]">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-amber-900 to-amber-950 rounded-3xl border-4 border-amber-500 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-amber-950/80 border-b-2 border-amber-700/60">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentType === 'silo' ? '🌾' : '🏠'}</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {currentType === 'silo' ? 'Силос (Хранилище урожая)' : 'Амбар (Склад продуктов и инструментов)'}
              </h2>
              <p className="text-xs text-amber-300">
                Заполненность: {used} / {capacity} мест ({percent}%)
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
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 bg-amber-950/50 border-b border-amber-800/60">
          <button
            onClick={() => setActiveTab('silo')}
            className={`flex items-center gap-2 px-5 py-2 rounded-2xl font-bold text-sm transition-all ${
              activeTab === 'silo'
                ? 'bg-amber-500 text-amber-950 shadow-md border border-amber-300'
                : 'bg-amber-900/60 text-amber-200 hover:bg-amber-800'
            }`}
          >
            <span>🌾</span>
            <span>Силос ({getStorageUsed('silo')}/{siloCapacity})</span>
          </button>
          <button
            onClick={() => setActiveTab('barn')}
            className={`flex items-center gap-2 px-5 py-2 rounded-2xl font-bold text-sm transition-all ${
              activeTab === 'barn'
                ? 'bg-amber-500 text-amber-950 shadow-md border border-amber-300'
                : 'bg-amber-900/60 text-amber-200 hover:bg-amber-800'
            }`}
          >
            <span>🏠</span>
            <span>Амбар ({getStorageUsed('barn')}/{barnCapacity})</span>
          </button>
        </div>

        {/* Storage Bar */}
        <div className="px-6 py-3 bg-amber-950/30">
          <div className="w-full bg-amber-950 h-4 rounded-full overflow-hidden border border-amber-700/60 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                percent > 90 ? 'bg-red-500' : percent > 75 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Items Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 flex-1">
          {storedItems.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-amber-400/60 gap-2">
              <Package size={48} />
              <span className="text-sm font-bold">Хранилище пусто</span>
            </div>
          ) : (
            storedItems.map(({ item, count }) => (
              <div
                key={item.id}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-900/70 border border-amber-700/80 text-white relative shadow-sm"
              >
                <span className="text-3xl mb-1">{item.icon}</span>
                <span className="text-xs font-bold text-center truncate w-full">{item.name}</span>
                <div className="mt-1 bg-amber-950/80 text-amber-300 text-[11px] px-2 py-0.5 rounded-full font-black border border-amber-600/50">
                  {count} шт
                </div>
              </div>
            ))
          )}
        </div>

        {/* Upgrade Footer */}
        <div className="p-4 sm:p-6 bg-amber-950/90 border-t-2 border-amber-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-amber-300 font-bold">Материалы для улучшения (+25 мест):</span>
              <div className="flex items-center gap-2 mt-1">
                {currentMats.map(mat => (
                  <div
                    key={mat.id}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl border ${
                      mat.have >= reqCount
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                        : 'bg-red-950/80 border-red-500 text-red-300'
                    }`}
                  >
                    <span>{mat.icon}</span>
                    <span className="font-bold">{mat.have}/{reqCount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            disabled={!canUpgrade}
            onClick={() => upgradeStorage(currentType)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-xs sm:text-sm shadow-lg transition-all ${
              canUpgrade
                ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-emerald-950 active:scale-95'
                : 'bg-amber-900/50 text-amber-600 cursor-not-allowed border border-amber-800'
            }`}
          >
            <Hammer size={18} />
            <span>Улучшить склад</span>
          </button>
        </div>
      </div>
    </div>
  );
};
