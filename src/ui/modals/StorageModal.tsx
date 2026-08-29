import React, { useState } from 'react';
import { useGameStore } from '../../game/gameState';
import { PRODUCTS } from '../../config/products';
import { sounds } from '../../audio/SoundManager';
import { ArrowLeft, ArrowUpCircle, Hammer, Package } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex flex-col bg-[#2A1406] select-none animate-pop-in text-[#3B1F0D] overflow-hidden">
      
      {/* ── TOP HEADER (Назад + Заголовок) ── */}
      <header className="hud-wood-dock px-3 sm:px-6 py-3 flex items-center justify-between gap-2 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              closeModal();
            }}
            className="hud-parchment flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-extrabold shadow cursor-pointer active:scale-95 transition-transform"
          >
            <ArrowLeft size={16} />
            <span>Назад</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-2xl">📦</span>
            <div>
              <h1 className="font-extrabold text-sm sm:text-lg text-yellow-300 tracking-tight leading-tight">
                {currentType === 'silo' ? 'Силос (Хранилище урожая)' : 'Амбар (Склад продуктов и материалов)'}
              </h1>
              <p className="text-[10px] sm:text-xs text-amber-200/80">
                Заполненность: {used} / {capacity} мест ({percent}%)
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── TABS SWITCHER ── */}
      <div className="bg-[#3D2008] px-3 sm:px-6 py-2.5 flex items-center gap-2 border-b-2 border-[#5C3718] shrink-0">
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('silo');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'silo'
              ? 'hud-parchment shadow-lg border-2 border-yellow-400 scale-105'
              : 'bg-[#2A1406]/80 text-amber-200 border border-amber-900 hover:bg-[#2A1406]'
          }`}
        >
          <span className="text-base">🌾</span>
          <span>Силос ({getStorageUsed('silo')}/{siloCapacity})</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('barn');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'barn'
              ? 'hud-parchment shadow-lg border-2 border-yellow-400 scale-105'
              : 'bg-[#2A1406]/80 text-amber-200 border border-amber-900 hover:bg-[#2A1406]'
          }`}
        >
          <span className="text-base">🏚️</span>
          <span>Амбар ({getStorageUsed('barn')}/{barnCapacity})</span>
        </button>
      </div>

      {/* ── CAPACITY PROGRESS BAR ── */}
      <div className="bg-[#241004] px-4 sm:px-6 py-2 border-b border-[#5C3718]/40">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <span className="text-xs font-extrabold text-amber-200 shrink-0">Вместимость:</span>
          <div className="w-full h-3 bg-[#4A2810] rounded-full overflow-hidden border border-[#5C3718]">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                percent >= 90 ? 'bg-red-500' : percent >= 75 ? 'bg-amber-400' : 'bg-green-500'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-xs font-black text-yellow-300 shrink-0">{used}/{capacity}</span>
        </div>
      </div>

      {/* ── STORED ITEMS GRID & UPGRADE BLOCK ── */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-5 pb-12">
          
          {/* Stored Items Grid */}
          <div>
            <h2 className="text-xs sm:text-sm font-extrabold text-amber-200 uppercase tracking-wide mb-3">
              Предметы в хранилище:
            </h2>

            {storedItems.length === 0 ? (
              <div className="hud-parchment p-8 rounded-2xl text-center flex flex-col items-center justify-center gap-2">
                <span className="text-4xl">🌾</span>
                <span className="text-sm font-bold text-[#5C3718]">Хранилище пока пусто. Соберите урожай на ферме!</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {storedItems.map(({ item, count }) => (
                  <div
                    key={item.id}
                    className="hud-parchment flex items-center gap-2.5 p-3 rounded-2xl shadow border-2 border-amber-700/60"
                  >
                    <span className="text-3xl shrink-0">{item.icon}</span>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-extrabold text-xs text-[#3B1F0D] truncate">
                        {item.name}
                      </span>
                      <span className="font-black text-sm text-green-800">
                        ×{count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upgrade Storage Card */}
          <div className="hud-parchment p-4 sm:p-5 rounded-2xl border-2 border-amber-500 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <ArrowUpCircle size={20} className="text-green-700" />
                <h3 className="font-black text-sm sm:text-base text-[#3B1F0D]">
                  Увеличить склад на +25 мест
                </h3>
              </div>
              <p className="text-xs text-[#5C3718]">
                Требуются строительные материалы (можно найти при сборе урожая или в бартере):
              </p>

              {/* Material Badges */}
              <div className="flex items-center gap-2 mt-2">
                {currentMats.map(mat => {
                  const hasEnough = mat.have >= reqCount;
                  return (
                    <div
                      key={mat.id}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs ${
                        hasEnough
                          ? 'bg-green-100 border-green-500 text-green-900'
                          : 'bg-amber-100 border-amber-700 text-amber-950'
                      }`}
                    >
                      <span className="text-base">{mat.icon}</span>
                      <span>{mat.have}/{reqCount}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upgrade Button */}
            <button
              onClick={() => {
                if (canUpgrade) {
                  sounds.playLevelUp();
                  upgradeStorage(currentType);
                }
              }}
              disabled={!canUpgrade}
              className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
                canUpgrade
                  ? 'bg-gradient-to-b from-green-500 to-green-700 border-2 border-green-300 text-white cursor-pointer hover:brightness-110 animate-pulse'
                  : 'bg-stone-600 text-stone-300 border border-stone-500 cursor-not-allowed opacity-60'
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
