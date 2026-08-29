import React, { useEffect, useState } from 'react';
import { useGameStore } from '../game/gameState';
import { CROPS, TREES_BUSHES } from '../config/crops';
import { BUILDINGS } from '../config/buildings';
import { DECORATIONS } from '../config/decorations';
import { RECIPES } from '../config/recipes';
import { ANIMALS } from '../config/animals';
import { PRODUCTS } from '../config/products';
import { sounds } from '../audio/SoundManager';
import { RotateCw, Check, X, Trash2, Zap } from 'lucide-react';

function fmtSec(s: number): string {
  if (s <= 0) return '0с';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}м${sec > 0 ? `${sec}с` : ''}` : `${sec}с`;
}

function useCountdown(targetMs: number | undefined): number {
  const [remaining, setRemaining] = useState(() =>
    targetMs ? Math.max(0, Math.ceil((targetMs - Date.now()) / 1000)) : 0
  );
  useEffect(() => {
    if (!targetMs) return;
    const tick = () => setRemaining(Math.max(0, Math.ceil((targetMs - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  return remaining;
}

export const FloatingToolsOverlay: React.FC = () => {
  const {
    entities, selectedEntityId, activeTool, placingBuildingConfigId,
    movingEntityId, movingRotation,
    inventory, level,
    setActiveTool, setPlacingBuilding, rotatePlacingBuilding, setSelectedEntity,
    startMovingEntity, rotateMovingEntity, confirmMoveEntity, cancelMoveEntity, deleteEntity,
    startProduction, collectProduct, speedUpProductionWithGems,
    harvestCrop, plantCrop, feedAnimal, collectAnimalProduct, storeDecoration,
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
      <div
        className="fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 sm:gap-3 px-4 py-3 sm:px-5 sm:py-3.5 rounded-3xl shadow-2xl animate-pop-in"
        style={{
          background: 'linear-gradient(180deg, rgba(45, 23, 5, 0.98) 0%, rgba(26, 12, 4, 0.99) 100%)',
          border: '3px solid #F59E0B',
          boxShadow: '0 16px 40px rgba(0,0,0,0.85), inset 0 1px 2px rgba(255,255,255,0.2)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-2xl sm:text-3xl animate-bounce">{bConfig?.icon || '📦'}</span>
          <div>
            <div className="text-xs sm:text-sm font-black text-yellow-200">
              {bConfig?.name || 'Перемещение'}
            </div>
            <div className="text-[10px] sm:text-xs text-amber-400">
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
          className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl font-bold text-xs text-white shadow-lg active:scale-95 transition-all cursor-pointer border border-amber-400"
          style={{
            background: 'linear-gradient(180deg, #D97706 0%, #B45309 100%)',
          }}
          title="Повернуть на 90 градусов"
        >
          <RotateCw size={15} />
          <span>{rotDeg}°</span>
        </button>

        {/* Delete / Refund Button */}
        {!isSpecialCore && (
          <button
            onClick={() => {
              sounds.playClick();
              deleteEntity(movingEntityId);
            }}
            className="flex items-center gap-1 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl font-bold text-xs text-white shadow active:scale-95 transition-all cursor-pointer border border-red-500 bg-red-700 hover:bg-red-600"
            title={refundCoins > 0 ? `Удалить и вернуть 🪙 ${refundCoins}` : 'Удалить'}
          >
            <Trash2 size={15} />
            <span className="hidden sm:inline">{refundCoins > 0 ? `+🪙${refundCoins}` : 'Удалить'}</span>
          </button>
        )}

        {/* Confirm Placement Button */}
        <button
          onClick={() => {
            sounds.playClick();
            confirmMoveEntity();
          }}
          className="flex items-center gap-1 px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl font-black text-xs text-white shadow-lg active:scale-95 transition-all cursor-pointer border-2 border-green-300 animate-pulse"
          style={{
            background: 'linear-gradient(180deg, #22C55E 0%, #15803D 100%)',
            boxShadow: '0 4px 14px rgba(34, 197, 94, 0.45)',
          }}
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
          className="w-9 h-9 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
          title="Отменить"
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
    const cost = bConfig?.cost || 0;
    const canAffordCount = cost > 0 ? Math.floor(useGameStore.getState().coins / cost) : Infinity;
    const rotDegrees = (placingRotation || 0) * 90;

    return (
      <div
        className="fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 sm:gap-3.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-3xl shadow-2xl animate-pop-in"
        style={{
          background: 'linear-gradient(180deg, rgba(45, 23, 5, 0.98) 0%, rgba(26, 12, 4, 0.99) 100%)',
          border: '3px solid #F59E0B',
          boxShadow: '0 16px 40px rgba(0,0,0,0.85), inset 0 1px 2px rgba(255,255,255,0.2)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-2xl sm:text-3xl animate-bounce">{bConfig?.icon || '🔨'}</span>
          <div>
            <div className="text-xs sm:text-sm font-black text-yellow-200">
              {bConfig?.name || 'Строительство'}
            </div>
            <div className="text-[10px] sm:text-xs text-amber-400 font-semibold">
              {cost > 0 ? `🪙 ${cost} за шт.` : 'Бесплатно'} {canAffordCount !== Infinity && `(ещё ${canAffordCount} шт.)`}
            </div>
          </div>
        </div>

        {/* Rotate Button */}
        <button
          onClick={() => {
            sounds.playClick();
            rotatePlacingBuilding();
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl font-bold text-xs text-white shadow-lg active:scale-95 transition-all cursor-pointer border border-amber-400 animate-pulse"
          style={{
            background: 'linear-gradient(180deg, #D97706 0%, #B45309 100%)',
          }}
          title="Повернуть объект на 90 градусов (Клавиша R)"
        >
          <RotateCw size={15} />
          <span>{rotDegrees}°</span>
        </button>

        {/* Finish / Done Placing Button */}
        <button
          onClick={() => {
            sounds.playClick();
            setPlacingBuilding(null);
          }}
          className="flex items-center gap-1 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl font-bold text-xs text-white shadow active:scale-95 transition-all cursor-pointer border border-red-500 bg-red-700 hover:bg-red-600"
        >
          <X size={15} />
          <span>Готово</span>
        </button>
      </div>
    );
  }

  /* ── 3. Active Tool Floating Banner (Swipe to Plant / Harvest / Feed) ── */
  if (activeTool) {
    const emoji = activeTool.type === 'plant' ? '🌱' : activeTool.type === 'harvest' ? '🌾' : activeTool.type === 'feed' ? '🌽' : '🥚';
    const label = activeTool.type === 'plant' ? `Посев: ${CROPS[activeTool.configId || '']?.name || 'Семена'}` :
                  activeTool.type === 'harvest' ? 'Сбор созревшего урожая серпом' :
                  activeTool.type === 'feed' ? 'Кормление голодных животных' : 'Сбор продуктов';

    return (
      <div 
        className="fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-2.5 rounded-3xl shadow-2xl border-2 border-amber-500 animate-pop-in"
        style={{
          background: 'linear-gradient(180deg, rgba(45, 23, 5, 0.95) 0%, rgba(26, 12, 4, 0.98) 100%)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
        }}
      >
        <span className="text-2xl">{emoji}</span>
        <span className="text-xs sm:text-sm font-bold text-yellow-300">{label}</span>
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTool(null);
          }}
          className="px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-500 border border-green-300 text-white font-bold text-xs shadow active:scale-90 transition-transform cursor-pointer"
        >
          ✓ Готово
        </button>
      </div>
    );
  }

  /* ── 4. Selected Field Radial Wheel (Seed Picker & Harvesting) ── */
  if (selectedEntity?.type === 'field') {
    const isPlanted = !!selectedEntity.cropId;
    const availableCrops = Object.values(CROPS).filter(c => c.unlockLevel <= level);

    return (
      <div 
        className="fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-30 flex flex-col gap-2.5 p-3.5 sm:p-4 rounded-3xl shadow-2xl border-3 border-amber-600 animate-pop-in max-w-[95vw] sm:max-w-xl"
        style={{
          background: 'linear-gradient(180deg, rgba(45, 23, 5, 0.97) 0%, rgba(26, 12, 4, 0.99) 100%)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.85), inset 0 1px 2px rgba(255,255,255,0.2)',
        }}
      >
        <div className="flex items-center justify-between px-1">
          <span className="text-xs sm:text-sm font-black text-yellow-300 tracking-wide">
            {isPlanted ? '🌾 Поле — Сбор урожая' : '🌱 Выберите семена для посадки:'}
          </span>
          <button
            onClick={() => setSelectedEntity(null)}
            className="w-7 h-7 rounded-full bg-red-800 hover:bg-red-700 text-white flex items-center justify-center text-xs active:scale-90 transition-transform cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 px-1">
          {isPlanted ? (
            <button
              onClick={() => {
                sounds.playHarvest();
                harvestCrop(selectedEntity.id);
                setActiveTool({ type: 'harvest' });
              }}
              className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 border-2 border-green-200 text-white shadow-xl active:scale-95 transition-all cursor-pointer font-black text-sm"
            >
              <span className="text-2xl animate-bounce">🌾</span>
              <span>Собрать серпом</span>
            </button>
          ) : (
            availableCrops.map(crop => {
              const count = inventory[crop.id] || 0;
              return (
                <button
                  key={crop.id}
                  onClick={() => {
                    sounds.playPlant();
                    plantCrop(selectedEntity.id, crop.id);
                    setActiveTool({ type: 'plant', configId: crop.id });
                  }}
                  className="relative flex flex-col items-center gap-1 p-2 sm:p-2.5 rounded-2xl bg-amber-950/80 hover:bg-amber-900 border border-amber-600/70 shadow-md active:scale-90 transition-all cursor-pointer min-w-[64px] sm:min-w-[72px]"
                >
                  {/* Stock Quantity Badge */}
                  <span 
                    className={`absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-black border ${
                      count > 0 ? 'bg-amber-700 text-yellow-200 border-yellow-400' : 'bg-red-800 text-red-200 border-red-400'
                    }`}
                  >
                    {count}
                  </span>
                  <span className="text-2xl sm:text-3xl">{crop.icon}</span>
                  <span className="text-[11px] font-bold text-amber-200 truncate max-w-[58px]">
                    {crop.name}
                  </span>
                  <span className="text-[9px] text-yellow-400 font-semibold">
                    ⏱ {fmtSec(crop.growTimeSeconds)}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  }

  /* ── 5. Selected Production Building (Bakery / Feed Mill / Sugar Press) ── */
  if (selectedEntity?.type === 'production') {
    const bConfig = BUILDINGS[selectedEntity.configId];
    const availableRecipes = Object.values(RECIPES).filter(r => r.buildingId === selectedEntity.configId && r.unlockLevel <= level);
    const queue = selectedEntity.productionQueue || [];
    const completed = selectedEntity.completedProducts || [];
    const maxSlots = bConfig?.maxQueueSlots || 5;

    return (
      <div 
        className="fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-30 flex flex-col gap-2.5 p-3.5 sm:p-4 rounded-3xl shadow-2xl border-3 border-amber-600 animate-pop-in max-w-[95vw] sm:max-w-xl"
        style={{
          background: 'linear-gradient(180deg, rgba(45, 23, 5, 0.97) 0%, rgba(26, 12, 4, 0.99) 100%)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.85), inset 0 1px 2px rgba(255,255,255,0.2)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{bConfig?.icon}</span>
            <span className="text-xs sm:text-sm font-black text-yellow-300">
              {bConfig?.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {queue.length > 0 && (
              <button
                onClick={() => {
                  sounds.playLevelUp();
                  speedUpProductionWithGems(selectedEntity.id);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 border border-cyan-300 text-white font-bold text-[10px] sm:text-xs shadow active:scale-95 transition-transform cursor-pointer"
              >
                <Zap size={13} />
                <span>1 💎</span>
              </button>
            )}
            <button
              onClick={() => setSelectedEntity(null)}
              className="w-7 h-7 rounded-full bg-red-800 hover:bg-red-700 text-white flex items-center justify-center text-xs active:scale-90 transition-transform cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Ready Completed Products */}
        {completed.length > 0 && (
          <div className="flex items-center gap-2 p-2 bg-green-950/80 rounded-2xl border border-green-600/70 overflow-x-auto">
            <span className="text-[10px] sm:text-xs font-black text-green-300 shrink-0">ГОТОВО:</span>
            {completed.map((prod, idx) => {
              const item = PRODUCTS[prod.itemId];
              return (
                <button
                  key={idx}
                  onClick={() => {
                    sounds.playCoin();
                    collectProduct(selectedEntity.id, idx);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-black text-xs shadow active:scale-90 transition-transform cursor-pointer border border-green-300"
                >
                  <span className="text-lg">{item?.icon}</span>
                  <span>+{prod.count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Production Queue Slots */}
        <div className="flex items-center gap-2 p-2 bg-amber-950/70 rounded-2xl border border-amber-700/60 overflow-x-auto">
          <span className="text-[10px] sm:text-xs font-bold text-amber-300 shrink-0">ОЧЕРЕДЬ:</span>
          {Array.from({ length: maxSlots }).map((_, i) => {
            const slot = queue[i];
            const recipe = slot ? RECIPES[slot.recipeId] : null;
            const outputItem = recipe ? PRODUCTS[recipe.outputItemId] : null;
            return (
              <div 
                key={i}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-900/60 border border-amber-600/60 flex items-center justify-center text-xl shrink-0 relative"
              >
                {outputItem ? (
                  <>
                    <span>{outputItem.icon}</span>
                    {i === 0 && (
                      <div className="absolute inset-0 border-2 border-cyan-400 rounded-xl animate-pulse" />
                    )}
                  </>
                ) : (
                  <span className="text-amber-800 text-sm">🔒</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Available Recipes to Craft */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 px-1">
          {availableRecipes.map(recipe => {
            const outItem = PRODUCTS[recipe.outputItemId];
            const canCraft = recipe.ingredients.every(ing => (inventory[ing.itemId] || 0) >= ing.count);
            return (
              <button
                key={recipe.id}
                onClick={() => {
                  if (canCraft) {
                    sounds.playClick();
                    startProduction(selectedEntity.id, recipe.id);
                  }
                }}
                className={`relative flex flex-col items-center gap-1 p-2 sm:p-2.5 rounded-2xl border shadow-md active:scale-95 transition-all cursor-pointer min-w-[70px] sm:min-w-[80px] ${
                  canCraft ? 'bg-amber-950/80 hover:bg-amber-900 border-amber-500' : 'bg-stone-900/80 border-stone-700 opacity-60'
                }`}
              >
                <span className="text-2xl sm:text-3xl">{outItem?.icon}</span>
                <span className="text-[10px] sm:text-xs font-bold text-yellow-200 truncate max-w-[65px]">
                  {recipe.name}
                </span>
                <span className="text-[9px] text-amber-400">
                  ⏱ {fmtSec(recipe.craftTimeSeconds)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};
