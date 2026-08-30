import React from 'react';
import { useGameStore } from '../game/gameState';
import { CROPS, TREES_BUSHES } from '../config/crops';
import { BUILDINGS } from '../config/buildings';
import { DECORATIONS } from '../config/decorations';
import { sounds } from '../audio/SoundManager';
import { triggerTelegramHaptic } from '../utils/telegram';
import { RotateCw, Check, X, Trash2, Info } from 'lucide-react';
import { Building3DThumbnail } from './Building3DThumbnail';

const CoinSvg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 inline-block">
    <circle cx="12" cy="12" r="10" fill="url(#coin_f_g)" stroke="#92400E" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="7.5" stroke="#FEF08A" strokeWidth="1" strokeDasharray="2.5 1" />
    <text x="12" y="16" fontSize="11" fontWeight="900" fill="#78350F" textAnchor="middle" fontFamily="sans-serif">🪙</text>
    <defs>
      <linearGradient id="coin_f_g" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
  </svg>
);

// Key Quick-Build Catalog Items
const QUICK_BUILD_ITEMS = [
  { id: 'field_plot', name: 'Грядка', icon: '🌾', cost: 1, level: 1 },
  { id: 'chicken_coop', name: 'Курятник', icon: '🐔', cost: 20, level: 1 },
  { id: 'cow_pasture', name: 'Коровник', icon: '🐄', cost: 50, level: 2 },
  { id: 'silo', name: 'Силос', icon: '🥖', cost: 100, level: 1 },
  { id: 'barn', name: 'Амбар', icon: '🏚️', cost: 120, level: 1 },
  { id: 'bakery', name: 'Пекарня', icon: '🍞', cost: 250, level: 2 },
  { id: 'feed_mill', name: 'Мельница', icon: '🌽', cost: 150, level: 1 },
  { id: 'apple_tree', name: 'Яблоня', icon: '🍎', cost: 80, level: 2 },
  { id: 'fountain', name: 'Фонтан', icon: '⛲', cost: 120, level: 3 },
];

export const FloatingToolsOverlay: React.FC = () => {
  const {
    entities, selectedEntityId, placingBuildingConfigId,
    movingEntityId, movingRotation,
    level, coins, isActionStripOpen, toggleActionStrip, setActionStripOpen,
    setPlacingBuilding, rotatePlacingBuilding,
    startMovingEntity, rotateMovingEntity, confirmMoveEntity, cancelMoveEntity, deleteEntity,
    harvestCrop, openModal, activeEvent,
    isDesign2026,
  } = useGameStore();

  const selectedEntity = entities.find(e => e.id === selectedEntityId);
  const movingEntity = entities.find(e => e.id === movingEntityId);

  /* ── 1. Moving / Relocating Entity Toolbar ── */
  if (movingEntityId && movingEntity) {
    const bConfig = BUILDINGS[movingEntity.configId] || DECORATIONS[movingEntity.configId] || TREES_BUSHES[movingEntity.configId];
    const isSpecialCore = movingEntity.type === 'special' || movingEntity.type === 'storage';
    const refundCoins = bConfig?.cost ? Math.floor(bConfig.cost * 0.5) : 0;
    const rotDeg = (movingRotation || 0) * 90;

    return (
      <div className="fixed bottom-20 sm:bottom-28 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 sm:gap-3 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl game-dock-tray border-2 border-amber-500/80 shadow-2xl shadow-black/90 text-amber-100 animate-pop-in max-w-[95vw]">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-bounce filter drop-shadow-md">{bConfig?.icon || '📦'}</span>
          <div>
            <div className="text-xs sm:text-sm font-black text-yellow-300 game-text-gold">
              {bConfig?.name || 'Перемещение'}
            </div>
            <div className="text-[10px] text-amber-200/80 font-bold">
              Перетащите на зеленую клетку
            </div>
          </div>
        </div>

        {/* Rotate Button */}
        <button
          onClick={() => {
            sounds.playClick();
            triggerTelegramHaptic('light');
            rotateMovingEntity();
          }}
          className="flex items-center gap-1 px-3 py-2 text-xs font-black game-dock-btn text-amber-200 hover:text-white transition-all cursor-pointer shadow"
          title="Повернуть на 90 градусов"
        >
          <RotateCw size={14} />
          <span>{rotDeg}°</span>
        </button>

        {/* Delete Button */}
        {!isSpecialCore && (
          <button
            onClick={() => {
              sounds.playClick();
              triggerTelegramHaptic('warning');
              deleteEntity(movingEntityId);
            }}
            className="flex items-center gap-1 px-3 py-2 rounded-xl font-black text-xs text-white shadow-md border border-rose-400 bg-gradient-to-b from-red-600 to-rose-700 hover:brightness-110 cursor-pointer active:scale-90"
            title={refundCoins > 0 ? `Удалить и вернуть 🪙 ${refundCoins}` : 'Удалить'}
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">{refundCoins > 0 ? `+🪙${refundCoins}` : 'Удалить'}</span>
          </button>
        )}

        {/* Confirm Placement Button */}
        <button
          onClick={() => {
            sounds.playClick();
            triggerTelegramHaptic('success');
            confirmMoveEntity();
          }}
          className="flex items-center gap-1 px-4 py-2 rounded-xl font-black text-xs text-white shadow-lg border-2 border-green-300 game-btn-plus cursor-pointer animate-pulse"
        >
          <Check size={16} strokeWidth={2.5} />
          <span>Поставить</span>
        </button>

        {/* Cancel Button */}
        <button
          onClick={() => {
            sounds.playClick();
            triggerTelegramHaptic('light');
            cancelMoveEntity();
          }}
          className="w-8 h-8 rounded-xl game-dock-btn text-amber-200 hover:text-rose-400 flex items-center justify-center cursor-pointer active:scale-90"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  /* ── 2. Placing New Building Toolbar ── */
  if (placingBuildingConfigId) {
    const { placingRotation } = useGameStore.getState();
    const bConfig = BUILDINGS[placingBuildingConfigId] || DECORATIONS[placingBuildingConfigId] || TREES_BUSHES[placingBuildingConfigId];
    const rotDegrees = (placingRotation || 0) * 90;

    return (
      <div className="fixed bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2.5 rounded-2xl game-dock-tray border-2 border-amber-500/80 shadow-2xl shadow-black/90 text-amber-100 animate-pop-in">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-bounce filter drop-shadow-md">{bConfig?.icon || '🔨'}</span>
          <div>
            <div className="text-xs sm:text-sm font-black text-yellow-300 game-text-gold">
              {bConfig?.name || 'Строительство'}
            </div>
            <div className="text-[10px] text-amber-200/80 font-bold">
              Кликните на газон
            </div>
          </div>
        </div>

        {/* Rotate Button */}
        <button
          onClick={() => {
            sounds.playClick();
            triggerTelegramHaptic('light');
            rotatePlacingBuilding();
          }}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-black game-dock-btn text-amber-200 hover:text-white transition-all cursor-pointer shadow"
          title="Повернуть объект на 90 градусов (Клавиша R)"
        >
          <RotateCw size={14} />
          <span>{rotDegrees}°</span>
        </button>

        {/* Finish / Done Placing Button */}
        <button
          onClick={() => {
            sounds.playClick();
            triggerTelegramHaptic('light');
            setPlacingBuilding(null);
          }}
          className="flex items-center gap-1 px-3.5 py-2 rounded-xl font-black text-xs text-white shadow border border-rose-400 bg-gradient-to-b from-red-600 to-rose-700 hover:brightness-110 cursor-pointer active:scale-90"
        >
          <X size={14} />
          <span>Готово</span>
        </button>
      </div>
    );
  }

  // Calculate Growth & Status percentages for selected Field / Crop
  let cropName = 'Грядка';
  let cropIcon = '🌱';
  let growthPercent = 0;
  let waterPercent = 100;

  if (selectedEntity?.type === 'field' && selectedEntity.cropId && selectedEntity.plantedAt) {
    const crop = CROPS[selectedEntity.cropId];
    if (crop) {
      cropName = crop.name;
      cropIcon = crop.icon;
      const weatherMult = activeEvent?.growthSpeedMultiplier || 1.0;
      const growMs = (crop.growTimeSeconds * 1000) / weatherMult;
      const elapsed = Date.now() - selectedEntity.plantedAt;
      growthPercent = Math.min(100, Math.round((elapsed / growMs) * 100));
      waterPercent = Math.max(20, Math.round(100 - (growthPercent * 0.4)));
    }
  } else if (selectedEntity?.type === 'animal_pen') {
    cropName = selectedEntity.configId === 'chicken_coop' ? 'Курятник' : 'Загон';
    cropIcon = '🐔';
    growthPercent = 75;
    waterPercent = 85;
  } else if (selectedEntity?.type === 'special' || selectedEntity?.type === 'storage') {
    const b = BUILDINGS[selectedEntity.configId];
    cropName = b?.name || 'Постройка';
    cropIcon = b?.icon || '🏡';
    growthPercent = 100;
  }

  return (
    <div className="fixed bottom-20 sm:bottom-24 left-0 right-0 z-30 pointer-events-none select-none flex flex-col items-center gap-2 p-2 max-w-lg mx-auto">
      
      {/* ── 1. SELECTED ENTITY INFO CARD ── */}
      {selectedEntity && (
        <div className="pointer-events-auto w-full p-2.5 sm:p-3.5 flex items-center justify-between gap-2.5 sm:gap-3 rounded-2xl game-dock-tray border-2 border-amber-500/80 shadow-2xl shadow-black/90 text-amber-100 animate-pop-in">
          
          {/* Crop / Entity Icon */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-black/40 border border-amber-700/60 flex items-center justify-center text-2xl sm:text-3xl shadow-inner shrink-0">
            {cropIcon}
          </div>

          {/* Title and Dual Progress Bars (Рост & Вода) */}
          <div className="flex flex-col flex-1 gap-1 min-w-0">
            <div className="font-black text-xs sm:text-sm text-yellow-300 game-text-gold truncate">
              {cropName}
            </div>

            <div className="flex items-center gap-3">
              {/* Growth Progress Bar (Green) */}
              <div className="flex flex-col gap-0.5 flex-1">
                <span className="text-[10px] font-black text-emerald-300 game-text-shadow">
                  рост {growthPercent}%
                </span>
                <div className="w-full h-2.5 game-badge-slot p-[1px] overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 via-green-400 to-lime-300 rounded-full transition-all duration-300 shadow-[0_0_6px_rgba(74,222,128,0.6)]"
                    style={{ width: `${growthPercent}%` }}
                  />
                </div>
              </div>

              {/* Water / Feed Progress Bar (Blue) */}
              <div className="flex flex-col gap-0.5 flex-1">
                <span className="text-[10px] font-black text-sky-300 game-text-shadow">
                  вода {waterPercent}%
                </span>
                <div className="w-full h-2.5 game-badge-slot p-[1px] overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300 rounded-full transition-all duration-300 shadow-[0_0_6px_rgba(56,189,248,0.6)]"
                    style={{ width: `${waterPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action / Info Button */}
          <button
            onClick={() => {
              sounds.playClick();
              triggerTelegramHaptic('light');
              if (selectedEntity.type === 'field' && selectedEntity.cropId && growthPercent >= 100) {
                harvestCrop(selectedEntity.id);
              } else {
                startMovingEntity(selectedEntity.id);
              }
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl game-dock-btn text-amber-200 hover:text-white flex items-center justify-center font-serif font-black text-sm shadow cursor-pointer active:scale-90"
            title="Действие с объектом"
          >
            <Info size={16} />
          </button>
        </div>
      )}

      {/* ── 2. QUICK BUILD DRAWER (Тёплая деревянная мастерская строительства) ── */}
      {isActionStripOpen && (
        <div className="pointer-events-auto w-full p-3.5 sm:p-4 rounded-3xl game-dock-tray border-2 border-amber-500/80 shadow-2xl shadow-black/95 text-amber-100 flex flex-col gap-2.5 animate-pop-in">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-amber-900/60 pb-2 px-0.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl game-side-medal flex items-center justify-center text-sm shadow">
                🔨
              </div>
              <span className="text-xs font-black tracking-wide uppercase text-yellow-300 game-text-gold">
                Строительство
              </span>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                triggerTelegramHaptic('light');
                setActionStripOpen(false);
              }}
              className="w-7 h-7 rounded-xl game-dock-btn text-amber-200 hover:text-white hover:border-red-400 flex items-center justify-center text-xs font-bold cursor-pointer active:scale-90 transition-all shadow"
              title="Закрыть"
            >
              <X size={15} strokeWidth={2.5} />
            </button>
          </div>

          {/* Horizontal Scrollable Building Cards */}
          <div className="flex items-center gap-2.5 overflow-x-auto py-1 px-0.5 scrollbar-none snap-x">
            {QUICK_BUILD_ITEMS.map(item => {
              const isUnlocked = level >= item.level;
              const canAfford = coins >= item.cost;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (isUnlocked && canAfford) {
                      sounds.playClick();
                      triggerTelegramHaptic('medium');
                      setPlacingBuilding(item.id);
                      setActionStripOpen(false);
                    }
                  }}
                  disabled={!isUnlocked || !canAfford}
                  className={`group flex flex-col items-center justify-center gap-1 p-2.5 sm:p-3 min-w-[86px] sm:min-w-[92px] shrink-0 relative rounded-2xl game-dock-btn transition-all duration-150 cursor-pointer snap-start ${
                    !isUnlocked || !canAfford ? 'opacity-55 grayscale cursor-not-allowed' : 'active:scale-95 hover:border-yellow-400 hover:scale-105'
                  }`}
                >
                  <Building3DThumbnail
                    buildingId={item.id}
                    fallbackEmoji={item.icon}
                    size={48}
                    className="my-0.5 group-hover:scale-110 transition-transform duration-150 filter drop-shadow-md"
                  />
                  <span className="text-[11px] font-black truncate max-w-[78px] tracking-tight text-amber-100 game-text-shadow">
                    {item.name}
                  </span>
                  
                  {/* Price with crisp Vector Coin */}
                  <div className="flex items-center gap-1 mt-0.5 game-badge-slot px-2 py-0.5 rounded-md">
                    <CoinSvg />
                    <span className="text-xs font-black text-yellow-300 game-text-gold">
                      {item.cost}
                    </span>
                  </div>

                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/80 rounded-2xl flex items-center justify-center text-[10px] font-black text-yellow-300 backdrop-blur-sm border border-amber-900">
                      Ур. {item.level}
                    </div>
                  )}
                </button>
              );
            })}

            {/* View Full Catalog Button */}
            <button
              onClick={() => {
                sounds.playClick();
                triggerTelegramHaptic('light');
                setActionStripOpen(false);
                openModal('shop');
              }}
              className="group flex flex-col items-center justify-center gap-1 p-2.5 sm:p-3 min-w-[86px] sm:min-w-[92px] shrink-0 rounded-2xl game-dock-btn hover:border-yellow-400 hover:scale-105 active:scale-95 transition-all cursor-pointer snap-start"
            >
              <span className="text-3xl my-1 group-hover:scale-110 transition-transform filter drop-shadow-md">📑</span>
              <span className="text-[10.5px] font-black text-center leading-tight text-yellow-300 game-text-gold">
                Все здания...
              </span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
