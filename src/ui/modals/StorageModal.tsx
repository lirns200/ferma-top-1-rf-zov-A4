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
    <div className={`fixed inset-0 pt-12 sm:pt-14 pb-16 sm:pb-20 z-40 flex flex-col select-none animate-pop-in overflow-hidden transition-colors ${
      isDesign2026 ? 'bg-[#0F1115] text-white' : 'bg-[#2A1406] text-[#3B1F0D]'
    }`}>
      
      {/* ── TABS SWITCHER ── */}
      <div className={`px-2.5 sm:px-6 py-2 sm:py-2.5 flex items-center gap-1.5 sm:gap-2 border-b shrink-0 ${
        isDesign2026 ? 'bg-[#181C24] border-[#242A35]' : 'bg-[#3D2008] border-[#5C3718]'
      }`}>
        <button
          onClick={() => {
            sounds.playClick();
            triggerTelegramHaptic('light');
            setActiveTab('silo');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[11px] sm:text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'silo'
              ? isDesign2026
                ? 'bg-purple-600 text-white shadow-lg border border-purple-400 scale-[1.02]'
                : 'hud-parchment shadow-lg border-2 border-yellow-400 scale-[1.02] text-[#3B1F0D]'
              : isDesign2026
              ? 'bg-[#242A35] text-[#8E939D] hover:text-white'
              : 'bg-[#2A1406]/80 text-amber-200 border border-amber-900 hover:bg-[#2A1406]'
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
          className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[11px] sm:text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'barn'
              ? isDesign2026
                ? 'bg-purple-600 text-white shadow-lg border border-purple-400 scale-[1.02]'
                : 'hud-parchment shadow-lg border-2 border-yellow-400 scale-[1.02] text-[#3B1F0D]'
              : isDesign2026
              ? 'bg-[#242A35] text-[#8E939D] hover:text-white'
              : 'bg-[#2A1406]/80 text-amber-200 border border-amber-900 hover:bg-[#2A1406]'
          }`}
        >
          <span className="text-sm sm:text-base">🏚️</span>
          <span>Амбар ({getStorageUsed('barn')}/{barnCapacity})</span>
        </button>
      </div>

      {/* ── CAPACITY PROGRESS BAR ── */}
      <div className={`px-4 sm:px-6 py-2 border-b ${
        isDesign2026 ? 'bg-[#141820] border-[#242A35]' : 'bg-[#241004] border-[#5C3718]/40'
      }`}>
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <span className="text-xs font-extrabold text-[#8E939D] shrink-0">Вместимость:</span>
          <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden border border-white/10">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                percent >= 90 ? 'bg-red-500' : percent >= 75 ? 'bg-amber-400' : 'bg-emerald-500'
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
            <h2 className="text-xs sm:text-sm font-extrabold text-[#8E939D] uppercase tracking-wide mb-3">
              Предметы в хранилище:
            </h2>

            {storedItems.length === 0 ? (
              <div className={`p-8 rounded-2xl text-center flex flex-col items-center justify-center gap-2 border ${
                isDesign2026 ? 'bg-[#181C24] border-[#242A35] text-zinc-400' : 'hud-parchment text-[#5C3718]'
              }`}>
                <span className="text-4xl">🌾</span>
                <span className="text-sm font-bold">Хранилище пока пусто. Соберите урожай на ферме!</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {storedItems.map(({ item, count }) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl shadow border ${
                      isDesign2026
                        ? 'bg-[#181C24] border-[#242A35] text-white hover:border-white/20'
                        : 'hud-parchment border-amber-700/60 text-[#3B1F0D]'
                    }`}
                  >
                    <Item3DThumbnail itemId={item.id} fallbackIcon={item.icon} className="w-10 h-10 shrink-0" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-extrabold text-xs truncate">
                        {item.name}
                      </span>
                      <span className="font-black text-sm text-emerald-400">
                        ×{count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upgrade Storage Card */}
          <div className={`p-4 sm:p-5 rounded-2xl border shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 ${
            isDesign2026 ? 'bg-[#181C24] border-[#242A35] text-white' : 'hud-parchment border-amber-500 text-[#3B1F0D]'
          }`}>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <ArrowUpCircle size={20} className="text-emerald-400" />
                <h3 className="font-black text-sm sm:text-base">
                  Увеличить склад на +25 мест
                </h3>
              </div>
              <p className={`text-xs ${isDesign2026 ? 'text-[#8E939D]' : 'text-[#5C3718]'}`}>
                Требуются строительные материалы:
              </p>

              {/* Material Badges */}
              <div className="flex items-center gap-2 mt-2">
                {currentMats.map(mat => {
                  const hasEnough = mat.have >= reqCount;
                  return (
                    <div
                      key={mat.id}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold text-xs ${
                        hasEnough
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                          : 'bg-[#242A35] border-[#353D4C] text-[#8E939D]'
                      }`}
                    >
                      <Item3DThumbnail itemId={mat.id} fallbackIcon={mat.icon} className="w-5 h-5 shrink-0" />
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
                  triggerTelegramHaptic('success');
                  upgradeStorage(currentType);
                }
              }}
              disabled={!canUpgrade}
              className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
                canUpgrade
                  ? 'bg-gradient-to-b from-emerald-500 to-emerald-700 border-2 border-emerald-300 text-white cursor-pointer hover:brightness-110 animate-pulse'
                  : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-60'
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
