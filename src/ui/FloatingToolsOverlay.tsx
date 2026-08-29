import React from 'react';
import { useGameStore } from '../game/gameState';
import { CROPS, TREES_BUSHES } from '../config/crops';
import { BUILDINGS } from '../config/buildings';
import { DECORATIONS } from '../config/decorations';
import { sounds } from '../audio/SoundManager';
import { RotateCw, Check, X, Trash2, Info } from 'lucide-react';

function fmtSec(s: number): string {
  if (s <= 0) return '0с';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}м${sec > 0 ? `${sec}с` : ''}` : `${sec}с`;
}

export const FloatingToolsOverlay: React.FC = () => {
  const {
    entities, selectedEntityId, activeTool, placingBuildingConfigId,
    movingEntityId, movingRotation,
    inventory, isActionStripOpen, toggleActionStrip, setActionStripOpen,
    setActiveTool, setPlacingBuilding, rotatePlacingBuilding, setSelectedEntity,
    startMovingEntity, rotateMovingEntity, confirmMoveEntity, cancelMoveEntity, deleteEntity,
    harvestCrop, plantCrop, openModal, activeEvent,
  } = useGameStore();

  const selectedEntity = entities.find(e => e.id === selectedEntityId);
  const movingEntity = entities.find(e => e.id === movingEntityId);

  // Total seeds count
  const totalSeeds = Object.keys(CROPS).reduce((acc, k) => acc + (inventory[k] || 0), 0);

  /* ── 1. Moving / Relocating Entity Toolbar ── */
  if (movingEntityId && movingEntity) {
    const bConfig = BUILDINGS[movingEntity.configId] || DECORATIONS[movingEntity.configId] || TREES_BUSHES[movingEntity.configId];
    const isSpecialCore = movingEntity.type === 'special' || movingEntity.type === 'storage';
    const refundCoins = bConfig?.cost ? Math.floor(bConfig.cost * 0.5) : 0;
    const rotDeg = (movingRotation || 0) * 90;

    return (
      <div
        className="fixed bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 sm:gap-3 px-4 py-2.5 rounded-2xl shadow-2xl hud-parchment animate-pop-in"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-bounce">{bConfig?.icon || '📦'}</span>
          <div>
            <div className="text-xs sm:text-sm font-extrabold text-[#3B1F0D]">
              {bConfig?.name || 'Перемещение'}
            </div>
            <div className="text-[10px] text-[#78350F]">
              Перетащите на зеленую клетку
            </div>
          </div>
        </div>

        {/* Rotate Button */}
        <button
          onClick={() => {
            sounds.playClick();
            rotateMovingEntity();
          }}
          className="hud-tool-btn flex items-center gap-1 px-3 py-2 text-xs font-black shadow"
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
              deleteEntity(movingEntityId);
            }}
            className="flex items-center gap-1 px-3 py-2 rounded-xl font-bold text-xs text-white shadow border border-red-700 bg-red-700 hover:bg-red-600 cursor-pointer"
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
            confirmMoveEntity();
          }}
          className="flex items-center gap-1 px-4 py-2 rounded-xl font-black text-xs text-white shadow border-2 border-green-300 bg-green-600 hover:bg-green-500 cursor-pointer animate-pulse"
        >
          <Check size={16} />
          <span>Поставить</span>
        </button>

        {/* Cancel Button */}
        <button
          onClick={() => {
            sounds.playClick();
            cancelMoveEntity();
          }}
          className="w-8 h-8 rounded-xl bg-amber-950/80 text-amber-200 flex items-center justify-center cursor-pointer active:scale-90"
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
      <div
        className="fixed bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-2xl hud-parchment animate-pop-in"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-bounce">{bConfig?.icon || '🔨'}</span>
          <div>
            <div className="text-xs sm:text-sm font-extrabold text-[#3B1F0D]">
              {bConfig?.name || 'Строительство'}
            </div>
            <div className="text-[10px] text-[#78350F]">
              Кликните на газон
            </div>
          </div>
        </div>

        {/* Rotate Button */}
        <button
          onClick={() => {
            sounds.playClick();
            rotatePlacingBuilding();
          }}
          className="hud-tool-btn flex items-center gap-1.5 px-3 py-2 text-xs font-black shadow border border-amber-600"
          title="Повернуть объект на 90 градусов (Клавиша R)"
        >
          <RotateCw size={14} />
          <span>{rotDegrees}°</span>
        </button>

        {/* Finish / Done Placing Button */}
        <button
          onClick={() => {
            sounds.playClick();
            setPlacingBuilding(null);
          }}
          className="flex items-center gap-1 px-3.5 py-2 rounded-xl font-bold text-xs text-white shadow border border-red-700 bg-red-700 hover:bg-red-600 cursor-pointer"
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

  // Show toolbar if either user clicked "Использовать", or active tool is set, or entity is selected
  const shouldShowActionStrip = isActionStripOpen || !!activeTool || !!selectedEntity;

  return (
    <div className="fixed bottom-20 sm:bottom-22 left-0 right-0 z-30 pointer-events-none select-none flex flex-col items-center gap-2 p-2 max-w-lg mx-auto">
      
      {/* ── 1. SELECTED ENTITY INFO CARD ── */}
      {selectedEntity && (
        <div className="pointer-events-auto w-full hud-parchment p-2.5 sm:p-3 flex items-center justify-between gap-3 shadow-xl animate-pop-in">
          
          {/* Crop / Entity Icon */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-100/90 border border-[#5C3718] flex items-center justify-center text-2xl sm:text-3xl shadow-inner shrink-0">
            {cropIcon}
          </div>

          {/* Title and Dual Progress Bars (Рост & Вода) */}
          <div className="flex flex-col flex-1 gap-1">
            <div className="font-black text-xs sm:text-sm text-[#3B1F0D]">
              {cropName}
            </div>

            <div className="flex items-center gap-3">
              {/* Growth Progress Bar (Green) */}
              <div className="flex flex-col gap-0.5 flex-1">
                <span className="text-[10px] font-bold text-[#78350F]">
                  рост {growthPercent}%
                </span>
                <div className="w-full h-2 bg-[#4A2810] rounded-full overflow-hidden border border-[#5C3718]">
                  <div 
                    className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-300"
                    style={{ width: `${growthPercent}%` }}
                  />
                </div>
              </div>

              {/* Water / Feed Progress Bar (Blue) */}
              <div className="flex flex-col gap-0.5 flex-1">
                <span className="text-[10px] font-bold text-[#78350F]">
                  вода {waterPercent}%
                </span>
                <div className="w-full h-2 bg-[#4A2810] rounded-full overflow-hidden border border-[#5C3718]">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-300"
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
              if (selectedEntity.type === 'field' && selectedEntity.cropId && growthPercent >= 100) {
                harvestCrop(selectedEntity.id);
                setActiveTool({ type: 'harvest' });
              } else {
                startMovingEntity(selectedEntity.id);
              }
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-b from-amber-200 to-amber-400 border border-[#5C3718] text-[#3B1F0D] flex items-center justify-center font-serif font-black text-sm shadow cursor-pointer active:scale-90"
            title="Действие с объектом"
          >
            <Info size={16} />
          </button>
        </div>
      )}

      {/* ── 2. ACTION STRIP (Появляется выше по кнопке «Использовать»: Рука, Посадить, Передвинуть, Строить, Вода, Топор) ── */}
      {shouldShowActionStrip && (
        <div className="pointer-events-auto w-full flex items-center justify-between gap-1 sm:gap-1.5 animate-pop-in">
          
          {/* ✋ 1. Рука */}
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTool(null);
            }}
            className={`hud-tool-btn flex-1 py-1.5 sm:py-2 flex flex-col items-center justify-center gap-0.5 ${
              !activeTool ? 'hud-tool-btn-active' : ''
            }`}
          >
            <span className="text-xl sm:text-2xl">✋</span>
            <span className="text-[9px] sm:text-[10px] font-extrabold tracking-tight">Рука</span>
          </button>

          {/* 🌱 2. Посадить */}
          <button
            onClick={() => {
              sounds.playClick();
              const firstCropId = Object.keys(CROPS)[0] || 'wheat';
              setActiveTool({ type: 'plant', configId: firstCropId });
            }}
            className={`hud-tool-btn flex-1 py-1.5 sm:py-2 flex flex-col items-center justify-center gap-0.5 relative ${
              activeTool?.type === 'plant' ? 'hud-tool-btn-active' : ''
            }`}
          >
            <span className="absolute -top-1.5 right-0.5 px-1 py-0.2 bg-[#4A2810] border border-amber-400 rounded-full text-yellow-300 text-[8px] sm:text-[9px] font-black shadow">
              {totalSeeds || 12}
            </span>
            <span className="text-xl sm:text-2xl">🌱</span>
            <span className="text-[9px] sm:text-[10px] font-extrabold tracking-tight">Посадить</span>
          </button>

          {/* 🚜 3. Передвинуть */}
          <button
            onClick={() => {
              sounds.playClick();
              if (selectedEntity) {
                startMovingEntity(selectedEntity.id);
              } else {
                const firstMovable = entities.find(e => e.type !== 'obstacle');
                if (firstMovable) {
                  startMovingEntity(firstMovable.id);
                }
              }
            }}
            className="hud-tool-btn flex-1 py-1.5 sm:py-2 flex flex-col items-center justify-center gap-0.5"
          >
            <span className="text-xl sm:text-2xl">🚜</span>
            <span className="text-[9px] sm:text-[10px] font-extrabold tracking-tight">Двигать</span>
          </button>

          {/* 🔨 4. Строить */}
          <button
            onClick={() => {
              sounds.playClick();
              openModal('shop');
            }}
            className="hud-tool-btn flex-1 py-1.5 sm:py-2 flex flex-col items-center justify-center gap-0.5"
          >
            <span className="text-xl sm:text-2xl">🔨</span>
            <span className="text-[9px] sm:text-[10px] font-extrabold tracking-tight">Строить</span>
          </button>

        </div>
      )}

    </div>
  );
};
