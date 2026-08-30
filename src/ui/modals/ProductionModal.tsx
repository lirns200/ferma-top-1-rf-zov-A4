import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../game/gameState';
import { BUILDINGS } from '../../config/buildings';
import { PRODUCTS } from '../../config/products';
import { RECIPES } from '../../config/recipes';
import { sounds } from '../../audio/SoundManager';
import { triggerTelegramHaptic } from '../../utils/telegram';
import { X, Zap, Clock, CheckCircle2, Lock, ChevronRight, Sparkles } from 'lucide-react';
import { Building3DThumbnail } from '../Building3DThumbnail';
import { Item3DThumbnail } from '../Item3DThumbnail';

export const ProductionModal: React.FC = () => {
  const {
    activeModal,
    selectedProductionEntityId,
    selectedEntityId,
    entities,
    inventory,
    level,
    gems,
    startProduction,
    collectProduct,
    speedUpProductionWithGems,
    closeModal,
  } = useGameStore();

  // Local re-render ticker every 250ms for buttery smooth countdowns and progress bars
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (activeModal !== 'production') return;
    const interval = window.setInterval(() => {
      setTick(t => t + 1);
    }, 250);
    return () => clearInterval(interval);
  }, [activeModal]);

  if (activeModal !== 'production') return null;

  const targetId = selectedProductionEntityId || selectedEntityId;
  const building = entities.find(e => e.id === targetId && e.type === 'production');

  if (!building) {
    return null;
  }

  const bConfig = BUILDINGS[building.configId] || {
    id: building.configId,
    name: 'Мастерская',
    icon: '⚙️',
    description: 'Фермерское производство',
    maxQueueSlots: 5,
    unlockLevel: 1,
  };

  const maxSlots = bConfig.maxQueueSlots || 5;
  const queue = building.productionQueue || [];
  const completed = building.completedProducts || [];
  const now = Date.now();

  // Get all recipes for this building
  const availableRecipes = Object.values(RECIPES)
    .filter(r => r.buildingId === building.configId)
    .sort((a, b) => a.unlockLevel - b.unlockLevel);

  // Active crafting item calculation
  const activeQueueItem = queue.length > 0 ? queue[0] : null;
  const activeRecipe = activeQueueItem ? RECIPES[activeQueueItem.recipeId] : null;
  const activeProduct = activeRecipe ? PRODUCTS[activeRecipe.outputItemId] : null;

  let activeProgressPercent = 0;
  let remainingSeconds = 0;

  if (activeQueueItem && activeRecipe) {
    const totalMs = activeRecipe.craftTimeSeconds * 1000;
    const elapsedMs = Math.max(0, now - activeQueueItem.startedAt);
    activeProgressPercent = Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)));
    remainingSeconds = Math.max(0, Math.ceil((totalMs - elapsedMs) / 1000));
  }

  return (
    <div className="fixed inset-0 pt-12 sm:pt-14 pb-16 sm:pb-20 z-40 flex flex-col select-none animate-pop-in overflow-hidden game-screen-bg text-amber-100">
      
      {/* ── TOP HEADER ── */}
      <div className="px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between game-screen-header shrink-0 border-b border-amber-900/60 shadow-lg">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-black/40 border border-amber-600/60 flex items-center justify-center text-2xl shadow-inner shrink-0 overflow-hidden">
            <Building3DThumbnail configId={building.configId} size={48} fallbackIcon={bConfig.icon} />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm sm:text-base tracking-wide text-yellow-300 game-text-gold truncate">
                {bConfig.name}
              </span>
              <span className="text-[10px] bg-amber-950/90 border border-amber-600/60 px-2 py-0.5 rounded-full text-amber-200 font-bold shrink-0">
                Очередь: {queue.length}/{maxSlots}
              </span>
            </div>
            <span className="text-[11px] text-amber-200/80 font-medium truncate">
              {bConfig.description}
            </span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            triggerTelegramHaptic('light');
            closeModal();
          }}
          className="w-8 h-8 rounded-xl game-dock-btn text-amber-200 hover:text-white flex items-center justify-center cursor-pointer active:scale-90 transition-all shadow shrink-0"
          title="Закрыть"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* ── PRODUCTION STATUS & LIVE QUEUE BAR ── */}
      <div className="px-3 sm:px-6 py-3 bg-black/50 border-b border-amber-900/60 flex flex-col gap-2.5 shrink-0 shadow-inner">
        
        {/* Completed Products Ready for Pickup */}
        {completed.length > 0 && (
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-emerald-900/90 to-emerald-950/90 border-2 border-emerald-500/80 shadow-lg animate-pulse">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-800/80 border border-emerald-400 flex items-center justify-center text-lg shadow shrink-0">
                🧺
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black text-emerald-200 game-text-shadow truncate">
                  Готово к сбору: {completed.reduce((acc, c) => acc + c.count, 0)} шт.
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  {completed.map((comp, cIdx) => {
                    const cItem = PRODUCTS[comp.itemId];
                    return (
                      <span key={cIdx} className="text-[10.5px] font-bold text-emerald-100 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-md border border-emerald-600/50 shrink-0">
                        <span>{cItem?.icon || '📦'}</span>
                        <span>{cItem?.name || comp.itemId} x{comp.count}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playHarvest();
                triggerTelegramHaptic('success');
                // Collect all ready items into barn
                completed.forEach((_, idx) => {
                  collectProduct(building.id, 0);
                });
              }}
              className="px-3.5 py-1.5 rounded-xl game-btn-plus text-white font-black text-xs shadow-md shrink-0 cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 size={14} />
              <span>Забрать</span>
            </button>
          </div>
        )}

        {/* Currently Crafting & Queue Slots */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          {/* Active Crafting Progress Bar */}
          <div className="flex-1 w-full flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-black">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-amber-300 uppercase tracking-tight game-text-shadow">
                  {activeQueueItem ? 'В процессе:' : 'Производство ожидает:'}
                </span>
                {activeProduct && (
                  <span className="text-yellow-200 flex items-center gap-1 truncate game-text-gold">
                    <span>{activeProduct.icon}</span>
                    <span>{activeRecipe?.name}</span>
                  </span>
                )}
              </div>

              {activeQueueItem && (
                <div className="flex items-center gap-1.5 shrink-0 text-amber-200 font-mono text-[11px] bg-black/50 px-2 py-0.5 rounded-lg border border-amber-700/60">
                  <Clock size={12} className="text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>{remainingSeconds}с</span>
                </div>
              )}
            </div>

            {/* Glowing Progress Bar */}
            <div className="w-full h-3.5 game-badge-slot p-[2px] overflow-hidden rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(250,204,21,0.7)]"
                style={{ width: `${activeQueueItem ? activeProgressPercent : 0}%` }}
              />
            </div>
          </div>

          {/* Speed Up Button with 1 Gem */}
          {activeQueueItem && (
            <button
              onClick={() => {
                if (gems >= 1) {
                  sounds.playLevelUp();
                  triggerTelegramHaptic('medium');
                  speedUpProductionWithGems(building.id);
                } else {
                  sounds.playClick();
                  triggerTelegramHaptic('warning');
                }
              }}
              disabled={gems < 1}
              className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all shrink-0 ${
                gems >= 1
                  ? 'game-btn-gold text-amber-950 hover:brightness-110 active:scale-95'
                  : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed opacity-60'
              }`}
              title="Моментально завершить за 1 алмаз"
            >
              <Zap size={14} className="text-cyan-400 fill-cyan-400" />
              <span>Ускорить (1 💎)</span>
            </button>
          )}
        </div>

        {/* 5 Queue Slots Visualizer */}
        <div className="flex items-center gap-1.5 sm:gap-2 pt-1 overflow-x-auto scrollbar-none">
          <span className="text-[10.5px] font-black text-amber-400/90 uppercase tracking-tight shrink-0 mr-1 game-text-shadow">
            Слоты:
          </span>
          {Array.from({ length: maxSlots }).map((_, slotIdx) => {
            const queueItem = queue[slotIdx];
            const qRecipe = queueItem ? RECIPES[queueItem.recipeId] : null;
            const qProd = qRecipe ? PRODUCTS[qRecipe.outputItemId] : null;
            const isActive = slotIdx === 0 && queueItem;

            return (
              <div
                key={slotIdx}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 text-lg transition-all shadow ${
                  isActive
                    ? 'bg-amber-500/30 border-2 border-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)] animate-pulse'
                    : queueItem
                    ? 'bg-amber-950/70 border border-amber-600/70'
                    : 'bg-black/30 border border-amber-900/40 text-stone-600'
                }`}
                title={queueItem ? `${qRecipe?.name || 'В очереди'} (#${slotIdx + 1})` : `Свободный слот #${slotIdx + 1}`}
              >
                {queueItem ? (
                  <span className="text-xl filter drop-shadow">{qProd?.icon || '📦'}</span>
                ) : (
                  <span className="text-xs font-bold text-amber-800">+</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RECIPES LIST ── */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-3 pb-8">
          
          <div className="flex items-center justify-between px-1">
            <span className="text-xs sm:text-sm font-black text-yellow-300 uppercase tracking-wide game-text-gold flex items-center gap-1.5">
              <Sparkles size={14} className="text-yellow-400" />
              <span>Доступные рецепты</span>
            </span>
            <span className="text-[11px] font-bold text-amber-300/70">
              Нажмите «Приготовить», чтобы запустить крафт
            </span>
          </div>

          {availableRecipes.map(recipe => {
            const outputProduct = PRODUCTS[recipe.outputItemId];
            const isUnlocked = level >= recipe.unlockLevel;
            const isQueueFull = queue.length >= maxSlots;

            // Check if player has all ingredients
            const ingredientsStatus = recipe.ingredients.map(ing => {
              const have = inventory[ing.itemId] || 0;
              const prod = PRODUCTS[ing.itemId];
              return {
                ...ing,
                have,
                name: prod?.name || ing.itemId,
                icon: prod?.icon || '📦',
                isEnough: have >= ing.count,
              };
            });

            const hasAllIngredients = ingredientsStatus.every(ing => ing.isEnough);
            const canCraft = isUnlocked && !isQueueFull && hasAllIngredients;

            return (
              <div
                key={recipe.id}
                className={`p-3 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg ${
                  !isUnlocked
                    ? 'bg-black/40 border-stone-800/80 opacity-60'
                    : canCraft
                    ? 'game-card border-amber-600/80 hover:border-yellow-400'
                    : 'bg-black/50 border-amber-900/60'
                }`}
              >
                {/* Left: Product Icon & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-black/50 border border-amber-600/50 flex items-center justify-center text-2xl sm:text-3xl shadow-inner shrink-0 overflow-hidden">
                    <Item3DThumbnail itemId={recipe.outputItemId} size={48} fallbackIcon={outputProduct?.icon || '🍞'} />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm sm:text-base text-yellow-200 game-text-gold truncate">
                        {recipe.name}
                      </span>
                      {recipe.outputCount > 1 && (
                        <span className="text-[10px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-1.5 py-0.5 rounded font-black">
                          x{recipe.outputCount}
                        </span>
                      )}
                    </div>

                    {/* Duration & XP Badges */}
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10.5px] font-bold text-amber-200/80 flex items-center gap-1">
                        <Clock size={11} className="text-amber-400" />
                        <span>{recipe.craftTimeSeconds} сек</span>
                      </span>
                      <span className="text-[10.5px] font-bold text-emerald-300 flex items-center gap-0.5">
                        <span>⭐ +{recipe.xpGain} XP</span>
                      </span>
                    </div>

                    {/* Ingredients List */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {ingredientsStatus.map(ing => (
                        <div
                          key={ing.itemId}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-black border transition-all ${
                            ing.isEnough
                              ? 'bg-emerald-950/80 text-emerald-200 border-emerald-700/60'
                              : 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                          }`}
                          title={`${ing.name}: есть ${ing.have} из ${ing.count}`}
                        >
                          <span>{ing.icon}</span>
                          <span>{ing.name}:</span>
                          <span>{ing.have}/{ing.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Craft Action Button or Lock Status */}
                <div className="w-full sm:w-auto flex items-center justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-900/40 shrink-0">
                  {!isUnlocked ? (
                    <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900/90 text-stone-400 border border-stone-700/80 text-xs font-black">
                      <Lock size={13} />
                      <span>Уровень {recipe.unlockLevel}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (canCraft) {
                          sounds.playCraftStart();
                          triggerTelegramHaptic('medium');
                          startProduction(building.id, recipe.id);
                        } else if (isQueueFull) {
                          sounds.playClick();
                          triggerTelegramHaptic('warning');
                        } else {
                          sounds.playClick();
                          triggerTelegramHaptic('warning');
                        }
                      }}
                      disabled={!canCraft}
                      className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                        canCraft
                          ? 'game-btn-plus text-white hover:brightness-110 active:scale-95 animate-pulse'
                          : isQueueFull
                          ? 'bg-stone-800 text-stone-400 border border-stone-700 cursor-not-allowed opacity-70'
                          : 'bg-rose-950/90 text-rose-300 border border-rose-700 cursor-not-allowed opacity-80'
                      }`}
                    >
                      <span>👨‍🍳</span>
                      <span>
                        {isQueueFull ? 'Очередь полна' : !hasAllIngredients ? 'Нет ингредиентов' : 'Приготовить'}
                      </span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}

        </div>
      </div>

    </div>
  );
};
