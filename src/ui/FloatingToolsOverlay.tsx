import React, { useEffect, useState } from 'react';
import { useGameStore } from '../game/gameState';
import { CROPS, TREES_BUSHES } from '../config/crops';
import { BUILDINGS } from '../config/buildings';
import { DECORATIONS } from '../config/decorations';
import { RECIPES } from '../config/recipes';
import { ANIMALS } from '../config/animals';
import { PRODUCTS } from '../config/products';

function fmtSec(s: number): string {
  if (s <= 0) return '0s';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m${sec > 0 ? `${sec}s` : ''}` : `${sec}s`;
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

const QueueSlotTimer: React.FC<{ startedAt: number; durationSec: number }> = ({ startedAt, durationSec }) => {
  const endsAt = startedAt + durationSec * 1000;
  const remaining = useCountdown(endsAt);
  const segments = 5;
  const progress = 1 - Math.max(0, Math.min(1, (endsAt - Date.now()) / (durationSec * 1000)));
  const filled = Math.round(progress * segments);
  return (
    <div className="flex flex-col items-center gap-0.5 w-full">
      <div className="flex gap-[2px] w-full" style={{ border: '1px solid #000', background: '#0a0400', padding: 1 }}>
        {Array.from({ length: segments }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, background: i < filled ? '#60a5fa' : '#1a0800' }} />
        ))}
      </div>
      <span className="px-font text-[6px] text-blue-300">{remaining > 0 ? fmtSec(remaining) : 'DONE'}</span>
    </div>
  );
};

/** Shared pixel popup container */
const PixelPopup: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`absolute bottom-24 left-1/2 -translate-x-1/2 z-30 px-panel ${className}`}
    style={{ padding: '10px 12px' }}>
    {children}
  </div>
);

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

  /* ── Moving / Relocating Mode ── */
  if (movingEntityId && movingEntity) {
    const bConfig = BUILDINGS[movingEntity.configId] || DECORATIONS[movingEntity.configId] || TREES_BUSHES[movingEntity.configId];
    const isSpecialCore = movingEntity.type === 'special' || movingEntity.type === 'storage';
    const refundCoins = bConfig?.cost ? Math.floor(bConfig.cost * 0.5) : 0;

    return (
      <div
        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl animate-bounce-short"
        style={{
          background: 'rgba(26, 12, 4, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '2px solid #F59E0B',
          boxShadow: '0 12px 36px rgba(0,0,0,0.75)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 26 }}>{bConfig?.icon || '📦'}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#FEF08A' }}>
              {bConfig?.name || 'Перемещение'}
            </div>
            <div style={{ fontSize: 11, color: '#FBBF24' }}>
              Перетащите на зеленую клетку
            </div>
          </div>
        </div>

        {/* Rotate Button */}
        <button
          onClick={rotateMovingEntity}
          style={{
            padding: '8px 14px',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            color: '#FFF',
            background: 'linear-gradient(180deg, #D97706 0%, #B45309 100%)',
            border: '1px solid #78350F',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}
          title="Повернуть на 90 градусов"
        >
          <span>↻</span> Повернуть
        </button>

        {/* Delete / Refund Button (If not core special building) */}
        {!isSpecialCore && (
          <button
            onClick={() => deleteEntity(movingEntityId)}
            style={{
              padding: '8px 12px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              color: '#FFF',
              background: 'linear-gradient(180deg, #DC2626 0%, #991B1B 100%)',
              border: '1px solid #7F1D1D',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
            title={refundCoins > 0 ? `Удалить и вернуть 🪙 ${refundCoins}` : 'Удалить'}
          >
            <span>🗑️</span> {refundCoins > 0 ? `+🪙${refundCoins}` : 'Удалить'}
          </button>
        )}

        {/* Confirm Placement Button */}
        <button
          onClick={() => confirmMoveEntity()}
          style={{
            padding: '8px 16px',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 800,
            color: '#FFF',
            background: 'linear-gradient(180deg, #22C55E 0%, #15803D 100%)',
            border: '1px solid #14532D',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            boxShadow: '0 2px 8px rgba(34,197,94,0.4)',
          }}
        >
          <span>✓</span> Поставить
        </button>

        {/* Cancel Button */}
        <button
          onClick={cancelMoveEntity}
          style={{
            padding: '8px 12px',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            color: '#CBD5E1',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            cursor: 'pointer',
          }}
          title="Отменить перемещение"
        >
          ✕
        </button>
      </div>
    );
  }

  /* ── Placing building ── */
  if (placingBuildingConfigId) {
    const bConfig = BUILDINGS[placingBuildingConfigId] || DECORATIONS[placingBuildingConfigId] || TREES_BUSHES[placingBuildingConfigId];
    const cost = bConfig?.cost || 0;
    const canAffordCount = cost > 0 ? Math.floor(useGameStore.getState().coins / cost) : Infinity;

    return (
      <div
        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2.5 rounded-xl shadow-2xl"
        style={{
          background: '#231206',
          border: '2px solid #F59E0B',
          boxShadow: '0 10px 30px rgba(0,0,0,0.65)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>{bConfig?.icon || '🔨'}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#FEF08A' }}>
              {bConfig?.name || 'Строительство'}
            </div>
            <div style={{ fontSize: 11, color: '#D97706', fontWeight: 500 }}>
              {cost > 0 && `🪙 ${cost} за шт.`} {canAffordCount !== Infinity && `(осталось на ${canAffordCount} шт.)`}
            </div>
          </div>
        </div>

        <button
          onClick={rotatePlacingBuilding}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            color: '#FFF',
            background: 'linear-gradient(180deg, #D97706 0%, #B45309 100%)',
            border: '1px solid #78350F',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}
        >
          ↻ Повернуть
        </button>

        <button
          onClick={() => setPlacingBuilding(null)}
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            color: '#FFF',
            background: 'linear-gradient(180deg, #EF4444 0%, #DC2626 100%)',
            border: '1px solid #991B1B',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}
        >
          ✕ Завершить
        </button>
      </div>
    );
  }

  if (!selectedEntity && !activeTool) return null;

  /* ── Active Tool ── */
  if (activeTool) {
    const emoji = activeTool.type === 'plant' ? '🌱' : activeTool.type === 'harvest' ? '🌾' : activeTool.type === 'feed' ? '🌽' : '🥚';
    const label = activeTool.type === 'plant' ? `PLANT: ${CROPS[activeTool.configId || '']?.name || 'SEEDS'}` :
                  activeTool.type === 'harvest' ? 'SWIPE RIPE FIELDS' :
                  activeTool.type === 'feed'    ? 'SWIPE HUNGRY ANIMALS' : 'COLLECT PRODUCTS';
    return (
      <PixelPopup className="flex items-center gap-3">
        <span style={{ fontSize: 18 }}>{emoji}</span>
        <span className="px-font text-[7px] text-amber-300 uppercase">{label}</span>
        <button onClick={() => setActiveTool(null)} className="px-btn px-btn-green" style={{ padding: '5px 10px', fontSize: 8 }}>
          ✓ DONE
        </button>
      </PixelPopup>
    );
  }

  /* ── Field ── */
  if (selectedEntity?.type === 'field') {
    const isPlanted = !!selectedEntity.cropId;
    const availableCrops = Object.values(CROPS).filter(c => c.unlockLevel <= level);
    return (
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 px-panel flex flex-col gap-2"
        style={{ padding: '10px 12px', maxWidth: '92vw' }}>
        <span className="px-font text-[7px] text-amber-400 uppercase">
          {isPlanted ? '🌾 Field — Select action' : '🌱 Field — Select seed'}
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {isPlanted ? (
            <button
              onClick={() => { harvestCrop(selectedEntity.id); setActiveTool({ type: 'harvest' }); }}
              className="px-btn px-btn-green flex flex-col items-center gap-1"
              style={{ minWidth: 60, padding: '8px 12px' }}
            >
              <span style={{ fontSize: 22 }}>🌾</span>
              <span className="px-font text-[6px] text-green-300">HARVEST</span>
            </button>
          ) : (
            availableCrops.map(crop => {
              const count = inventory[crop.id] || 0;
              return (
                <button
                  key={crop.id}
                  onClick={() => { plantCrop(selectedEntity.id, crop.id); setActiveTool({ type: 'plant', configId: crop.id }); }}
                  className="px-btn px-btn-amber flex flex-col items-center gap-0.5 relative"
                  style={{ minWidth: 56, padding: '6px 8px' }}
                >
                  <span style={{ fontSize: 20 }}>{crop.icon}</span>
                  <span className="px-font text-[5px] text-amber-200 truncate" style={{ maxWidth: 48 }}>{crop.name}</span>
                  <span className="px-font text-[5px] text-amber-400">⏱{fmtSec(crop.growTimeSeconds)}</span>
                  <span className="px-font text-[5px] text-yellow-400">💰{crop.cost}</span>
                  {/* Count badge */}
                  <div
                    className="absolute -top-1.5 -right-1.5 px-badge"
                    style={{ background: count > 0 ? '#92400e' : '#7f1d1d', color: count > 0 ? '#fde68a' : '#fca5a5', fontSize: 7 }}
                  >
                    {count}
                  </div>
                </button>
              );
            })
          )}
          <button onClick={() => setSelectedEntity(null)} className="px-btn px-btn-red" style={{ width: 30, height: 30, fontSize: 12 }}>
            ✕
          </button>
        </div>
      </div>
    );
  }

  /* ── Production ── */
  if (selectedEntity?.type === 'production') {
    const bConfig = BUILDINGS[selectedEntity.configId];
    const availableRecipes = Object.values(RECIPES).filter(r => r.buildingId === selectedEntity.configId && r.unlockLevel <= level);
    const queue    = selectedEntity.productionQueue || [];
    const completed = selectedEntity.completedProducts || [];
    const maxSlots = bConfig?.maxQueueSlots || 5;
    const activeItem = queue[0];
    const activeRecipe = activeItem ? RECIPES[activeItem.recipeId] : null;

    return (
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 px-panel flex flex-col gap-2"
        style={{ padding: '10px 12px', minWidth: 320, maxWidth: '94vw' }}>

        {/* Header */}
        <div className="flex items-center justify-between" style={{ borderBottom: '2px solid #000', paddingBottom: 6, marginBottom: 2 }}>
          <span className="px-font text-[8px] text-amber-300 uppercase">{bConfig?.icon} {bConfig?.name}</span>
          <div className="flex items-center gap-2">
            {queue.length > 0 && (
              <button
                onClick={() => speedUpProductionWithGems(selectedEntity.id)}
                className="px-btn px-btn-cyan"
                style={{ padding: '4px 8px', fontSize: 7 }}
              >
                ✦ SPEED (1💎)
              </button>
            )}
            <button onClick={() => setSelectedEntity(null)} className="px-btn px-btn-red" style={{ width: 26, height: 26, fontSize: 11 }}>
              ✕
            </button>
          </div>
        </div>

        {/* Completed */}
        {completed.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto"
            style={{ border: '2px solid #000', background: '#0d2b0d', padding: 6, boxShadow: 'inset 1px 1px 0 #1a5c1a, 2px 2px 0 #000' }}>
            <span className="px-font text-[6px] text-green-400 uppercase shrink-0">▶ READY:</span>
            {completed.map((prod, idx) => {
              const item = PRODUCTS[prod.itemId];
              return (
                <button key={idx} onClick={() => collectProduct(selectedEntity.id, idx)}
                  className="px-btn px-btn-green flex items-center gap-1" style={{ padding: '4px 8px', fontSize: 8 }}>
                  <span style={{ fontSize: 14 }}>{item?.icon}</span>
                  <span className="px-font text-[6px]">+{prod.count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Queue slots */}
        <div className="flex items-center gap-1.5"
          style={{ border: '2px solid #000', background: '#1a0800', padding: 6, boxShadow: 'inset 1px 1px 0 #000' }}>
          <span className="px-font text-[6px] text-amber-400 uppercase shrink-0">QUEUE:</span>
          {Array.from({ length: maxSlots }).map((_, i) => {
            const slotItem = queue[i];
            const slotRecipe = slotItem ? RECIPES[slotItem.recipeId] : null;
            const outItem = slotRecipe ? PRODUCTS[slotRecipe.outputItemId] : null;
            const isActive = i === 0 && !!slotItem;
            return (
              <div key={i}
                className="flex flex-col items-center justify-center"
                style={{
                  width: 44, minHeight: 44, padding: 3,
                  border: isActive ? '2px solid #60a5fa' : '2px solid #000',
                  background: isActive ? '#0d1f3c' : '#2a1000',
                  boxShadow: isActive ? 'inset 0 0 6px rgba(96,165,250,0.3)' : 'inset 1px 1px 0 #000',
                }}>
                {outItem ? (
                  <>
                    <span style={{ fontSize: 18 }}>{outItem.icon}</span>
                    {isActive && activeItem && (
                      <QueueSlotTimer
                        startedAt={activeItem.startedAt}
                        durationSec={activeItem.durationSeconds ?? activeItem.duration ?? activeRecipe?.craftTimeSeconds ?? 60}
                      />
                    )}
                  </>
                ) : (
                  <span className="px-font text-[6px] text-amber-800">{i + 1}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Recipes */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          {availableRecipes.map(recipe => {
            const output = PRODUCTS[recipe.outputItemId];
            const canCraft = recipe.ingredients.every(ing => (inventory[ing.itemId] || 0) >= ing.count);
            const full = queue.length >= maxSlots;
            return (
              <button
                key={recipe.id}
                onClick={() => startProduction(selectedEntity.id, recipe.id)}
                disabled={!canCraft || full}
                className={`px-btn flex flex-col items-center gap-0.5 ${canCraft && !full ? 'px-btn-amber' : ''}`}
                style={{
                  minWidth: 72, padding: '6px 6px',
                  opacity: canCraft && !full ? 1 : 0.45,
                  cursor: canCraft && !full ? 'pointer' : 'not-allowed',
                  background: canCraft && !full ? undefined : '#1a0800',
                }}
              >
                <span style={{ fontSize: 22 }}>{output?.icon || '📦'}</span>
                <span className="px-font text-[5px] text-amber-200 text-center" style={{ maxWidth: 66 }}>{recipe.name}</span>
                <div className="flex flex-col gap-0 w-full mt-0.5">
                  {recipe.ingredients.map(ing => {
                    const have = inventory[ing.itemId] || 0;
                    const item = PRODUCTS[ing.itemId];
                    return (
                      <span key={ing.itemId} className="px-font text-[5px] text-center"
                        style={{ color: have >= ing.count ? '#fde68a' : '#f87171' }}>
                        {item?.icon}{have}/{ing.count}
                      </span>
                    );
                  })}
                </div>
                <span className="px-font text-[5px] text-amber-500 mt-0.5">⏱{fmtSec(recipe.craftTimeSeconds)}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── Animal Pen ── */
  if (selectedEntity?.type === 'animal_pen') {
    const bConfig = BUILDINGS[selectedEntity.configId];
    const animalCfg = ANIMALS[bConfig?.associatedAnimalId || 'chicken'];
    const feedCount  = animalCfg ? inventory[animalCfg.feedItemId] || 0 : 0;
    const animals    = selectedEntity.animals || [];
    const hungry     = animals.filter(a => a.isHungry).length;
    const ready      = animals.filter(a => a.hasProduct).length;

    return (
      <PixelPopup className="flex items-center gap-3">
        {/* Stats */}
        <div className="flex flex-col gap-0.5" style={{ borderRight: '2px solid #000', paddingRight: 8 }}>
          <span className="px-font text-[6px] text-amber-300">TOTAL: {animals.length}</span>
          <span className="px-font text-[6px]" style={{ color: hungry > 0 ? '#f87171' : '#6b7280' }}>HUNGRY: {hungry}</span>
          <span className="px-font text-[6px]" style={{ color: ready > 0 ? '#4ade80' : '#6b7280' }}>READY: {ready}</span>
        </div>
        <button
          onClick={() => { const h = selectedEntity.animals?.find(a => a.isHungry); if (h) feedAnimal(selectedEntity.id, h.id); setActiveTool({ type: 'feed', configId: animalCfg?.feedItemId }); }}
          disabled={feedCount === 0}
          className="px-btn px-btn-amber flex flex-col items-center gap-0.5"
          style={{ minWidth: 56, padding: '6px 8px', opacity: feedCount === 0 ? 0.4 : 1 }}
        >
          <span style={{ fontSize: 18 }}>🌽</span>
          <span className="px-font text-[5px] text-amber-200">FEED</span>
          <span className="px-font text-[5px] text-amber-400">({feedCount})</span>
        </button>
        <button
          onClick={() => { const r = selectedEntity.animals?.find(a => a.hasProduct); if (r) collectAnimalProduct(selectedEntity.id, r.id); setActiveTool({ type: 'collect' }); }}
          disabled={ready === 0}
          className="px-btn px-btn-green flex flex-col items-center gap-0.5"
          style={{ minWidth: 56, padding: '6px 8px', opacity: ready === 0 ? 0.4 : 1 }}
        >
          <span style={{ fontSize: 18 }}>{animalCfg?.icon || '🥚'}</span>
          <span className="px-font text-[5px] text-green-200">COLLECT</span>
          <span className="px-font text-[5px] text-green-400">({ready})</span>
        </button>
        <button onClick={() => setSelectedEntity(null)} className="px-btn px-btn-red" style={{ width: 28, height: 28, fontSize: 12 }}>✕</button>
      </PixelPopup>
    );
  }

  /* ── Decoration ── */
  if (selectedEntity?.type === 'decoration') {
    return (
      <PixelPopup className="flex items-center gap-3">
        <span className="px-font text-[7px] text-amber-300 uppercase">🌸 Decoration</span>
        <button onClick={() => storeDecoration(selectedEntity.id)} className="px-btn px-btn-red" style={{ padding: '5px 10px', fontSize: 8 }}>
          REMOVE
        </button>
        <button onClick={() => setSelectedEntity(null)} className="px-btn px-btn-amber" style={{ width: 28, height: 28, fontSize: 12 }}>✕</button>
      </PixelPopup>
    );
  }

  return null;
};
