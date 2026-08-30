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
    level, coins, gems, inventory,
    activeTool, setActiveTool,
    isActionStripOpen, toggleActionStrip, setActionStripOpen,
    setSelectedEntity,
    setPlacingBuilding, rotatePlacingBuilding,
    startMovingEntity, rotateMovingEntity, confirmMoveEntity, cancelMoveEntity, deleteEntity,
    plantCrop, harvestCrop, speedUpCrop, waterField, harvestTreeBush,
    feedAllAnimalsInPen, collectAllAnimalProductsInPen, collectProduct,
    openModal, activeEvent,
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

  // ── Calculate State & Context for Selected Entity ──
  let cropName = 'Объект';
  let cropIcon = '🌱';
  let statusText = '';
  let growthPercent = 0;
  let waterPercent = 100;
  let isCropReady = false;
  let isCropGrowing = false;
  let isEmptyField = false;
  let isAnimalPen = false;
  let hasAnimalProducts = false;
  let hasHungryAnimals = false;
  let isProductionBuilding = false;
  let hasCompletedProducts = false;
  let isFruitTree = false;
  let isFruitTreeReady = false;
  let isSpecialBuilding = false;
  let isCoreBuilding = false;
  let entityBuildingConfig = selectedEntity ? (BUILDINGS[selectedEntity.configId] || DECORATIONS[selectedEntity.configId] || TREES_BUSHES[selectedEntity.configId]) : null;

  if (selectedEntity) {
    if (selectedEntity.type === 'field') {
      if (selectedEntity.cropId && selectedEntity.plantedAt) {
        const crop = CROPS[selectedEntity.cropId];
        if (crop) {
          cropName = crop.name;
          cropIcon = crop.icon;
          const weatherMult = activeEvent?.growthSpeedMultiplier || 1.0;
          const growMs = (crop.growTimeSeconds * 1000) / weatherMult;
          const elapsed = Date.now() - selectedEntity.plantedAt;
          growthPercent = Math.min(100, Math.round((elapsed / growMs) * 100));
          waterPercent = Math.max(20, Math.round(100 - (growthPercent * 0.4)));
          isCropReady = growthPercent >= 100;
          isCropGrowing = !isCropReady;
          const remainSec = Math.max(0, Math.ceil((growMs - elapsed) / 1000));
          statusText = isCropReady ? 'Урожай созрел! ✨' : `Созреет через ${remainSec}с`;
        }
      } else {
        cropName = 'Свободная грядка';
        cropIcon = '🟫';
        isEmptyField = true;
        statusText = 'Выберите семена для посадки';
      }
    } else if (selectedEntity.type === 'animal_pen') {
      isAnimalPen = true;
      const b = BUILDINGS[selectedEntity.configId];
      cropName = b?.name || 'Загон для животных';
      cropIcon = b?.icon || '🐔';
      hasAnimalProducts = (selectedEntity.animals || []).some(a => a.hasProduct);
      hasHungryAnimals = (selectedEntity.animals || []).some(a => a.isHungry);
      statusText = hasAnimalProducts 
        ? 'Продукция готова к сбору! 🧺' 
        : hasHungryAnimals 
        ? 'Животные хотят есть! 🥣' 
        : 'Животные сыты и отдыхают 💤';
    } else if (selectedEntity.type === 'production') {
      isProductionBuilding = true;
      const b = BUILDINGS[selectedEntity.configId];
      cropName = b?.name || 'Производство';
      cropIcon = b?.icon || '🏭';
      const completedCount = selectedEntity.completedProducts?.length || 0;
      const queueCount = selectedEntity.productionQueue?.length || 0;
      hasCompletedProducts = completedCount > 0;
      statusText = hasCompletedProducts
        ? `Готово к сбору: ${completedCount} шт. 🧺`
        : queueCount > 0
        ? `В процессе: ${queueCount} в очереди ⏳`
        : 'Производство ожидает заказов';
    } else if (selectedEntity.type === 'fruit_tree') {
      isFruitTree = true;
      const cfg = TREES_BUSHES[selectedEntity.configId];
      cropName = cfg?.name || 'Дерево';
      cropIcon = cfg?.icon || '🌳';
      const growMs = (cfg?.growTimeSeconds || 60) * 1000;
      isFruitTreeReady = selectedEntity.treePlantedAt ? Date.now() >= selectedEntity.treePlantedAt + growMs : true;
      statusText = isFruitTreeReady ? 'Плоды созрели! 🍎' : 'Плоды ещё наливаются...';
    } else if (selectedEntity.type === 'storage' || selectedEntity.type === 'special') {
      isSpecialBuilding = true;
      isCoreBuilding = true;
      const b = BUILDINGS[selectedEntity.configId];
      cropName = b?.name || 'Постройка';
      cropIcon = b?.icon || '🏡';
      statusText = 'Нажмите, чтобы открыть меню здания';
    } else {
      cropName = entityBuildingConfig?.name || 'Декорация';
      cropIcon = entityBuildingConfig?.icon || '⛲';
      statusText = 'Уютное украшение вашей фермы';
    }
  }

  const availableCropsList = Object.values(CROPS);

  return (
    <div className="fixed bottom-20 sm:bottom-24 left-0 right-0 z-30 pointer-events-none select-none flex flex-col items-center gap-2 p-2 max-w-lg mx-auto">
      
      {/* ── 1. SELECTED ENTITY INTERACTIVE HUB ── */}
      {selectedEntity && (
        <div className="pointer-events-auto w-full p-3 sm:p-3.5 rounded-3xl game-dock-tray border-2 border-amber-500/80 shadow-2xl shadow-black/95 text-amber-100 flex flex-col gap-2.5 animate-pop-in">
          
          {/* Header Row: Icon, Title, Status & Close */}
          <div className="flex items-center justify-between gap-2.5 border-b border-amber-900/60 pb-2 px-0.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-black/40 border border-amber-700/60 flex items-center justify-center text-2xl shadow-inner shrink-0">
                {cropIcon}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="font-black text-xs sm:text-sm text-yellow-300 game-text-gold truncate">
                  {cropName}
                </div>
                <div className="text-[10.5px] font-bold text-amber-200/80 truncate">
                  {statusText}
                </div>
              </div>
            </div>

            {/* Deselect / Close Button */}
            <button
              onClick={() => {
                sounds.playClick();
                triggerTelegramHaptic('light');
                setSelectedEntity(null);
              }}
              className="w-7 h-7 rounded-xl game-dock-btn text-amber-200 hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer active:scale-90 transition-all shadow shrink-0"
              title="Снять выделение"
            >
              <X size={15} strokeWidth={2.5} />
            </button>
          </div>

          {/* Progress Bars (For Growing Field Crop) */}
          {selectedEntity.type === 'field' && selectedEntity.cropId && (
            <div className="flex items-center gap-3 px-0.5">
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
          )}

          {/* Contextual Action Buttons Row */}
          <div className="flex items-center gap-2 pt-0.5 overflow-x-auto scrollbar-none snap-x">
            
            {/* ── 1. Empty Field -> Quick Seeds Plant Row ── */}
            {isEmptyField && (
              <div className="flex items-center gap-1.5 w-full overflow-x-auto pb-0.5 scrollbar-none">
                <span className="text-[10px] font-black text-yellow-300 uppercase tracking-tight shrink-0 mr-0.5 game-text-gold">Посадить:</span>
                {availableCropsList.map(crop => {
                  const seedCount = inventory[crop.id] || 0;
                  const isUnlocked = level >= crop.unlockLevel;
                  const canPlant = seedCount > 0 && isUnlocked;

                  return (
                    <button
                      key={crop.id}
                      onClick={() => {
                        if (canPlant) {
                          sounds.playClick();
                          triggerTelegramHaptic('medium');
                          plantCrop(selectedEntity.id, crop.id);
                          setActiveTool({ type: 'plant', configId: crop.id });
                          setSelectedEntity(null);
                        } else if (!isUnlocked) {
                          sounds.playClick();
                          triggerTelegramHaptic('warning');
                        } else {
                          sounds.playClick();
                          openModal('shop');
                        }
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl game-dock-btn text-xs font-black shrink-0 transition-all cursor-pointer ${
                        canPlant 
                          ? 'hover:border-yellow-400 active:scale-95 text-amber-100' 
                          : 'opacity-55 grayscale cursor-not-allowed'
                      }`}
                      title={!isUnlocked ? `Открывается на ${crop.unlockLevel} уровне` : seedCount === 0 ? 'Купить семена в магазине' : `Посадить ${crop.name}`}
                    >
                      <span className="text-base">{crop.icon}</span>
                      <span className="text-yellow-300 game-text-gold">{crop.name}</span>
                      <span className="text-[9.5px] bg-black/50 border border-amber-800/60 px-1.5 py-0.5 rounded text-amber-200 font-black">
                        {isUnlocked ? `x${seedCount}` : `Ур.${crop.unlockLevel}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── 2. Ready Field -> Big Harvest Button ── */}
            {isCropReady && (
              <button
                onClick={() => {
                  sounds.playClick();
                  triggerTelegramHaptic('success');
                  harvestCrop(selectedEntity.id);
                  setActiveTool({ type: 'harvest' });
                  setSelectedEntity(null);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl game-btn-plus text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg animate-pulse cursor-pointer shrink-0"
              >
                <span>🌾 Собрать урожай</span>
              </button>
            )}

            {/* ── 3. Growing Field -> Speed Up & Water Buttons ── */}
            {isCropGrowing && (
              <>
                <button
                  onClick={() => {
                    sounds.playClick();
                    triggerTelegramHaptic('medium');
                    speedUpCrop(selectedEntity.id);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl game-btn-gold text-xs font-black flex items-center justify-center gap-1.5 shadow active:scale-95 cursor-pointer shrink-0"
                >
                  <span>⚡ Ускорить (1 💎)</span>
                </button>
                
                <button
                  onClick={() => {
                    sounds.playClick();
                    triggerTelegramHaptic('light');
                    waterField(selectedEntity.id);
                  }}
                  className="py-2 px-3 rounded-xl game-dock-btn text-sky-300 hover:text-white text-xs font-black flex items-center justify-center gap-1.5 shadow active:scale-95 cursor-pointer shrink-0"
                >
                  <span>💧 Полить (+35%)</span>
                </button>
              </>
            )}

            {/* ── 4. Animal Pen -> Feed & Collect Buttons ── */}
            {isAnimalPen && (
              <>
                {hasAnimalProducts && (
                  <button
                    onClick={() => {
                      sounds.playClick();
                      triggerTelegramHaptic('success');
                      collectAllAnimalProductsInPen(selectedEntity.id);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl game-btn-plus text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg animate-pulse cursor-pointer shrink-0"
                  >
                    <span>🧺 Собрать продукцию</span>
                  </button>
                )}

                {hasHungryAnimals && (
                  <button
                    onClick={() => {
                      sounds.playClick();
                      triggerTelegramHaptic('medium');
                      feedAllAnimalsInPen(selectedEntity.id);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl game-btn-gold text-xs font-black flex items-center justify-center gap-1.5 shadow active:scale-95 cursor-pointer shrink-0"
                  >
                    <span>🥣 Покормить животных</span>
                  </button>
                )}
              </>
            )}

            {/* ── 5. Production Building -> Collect & Open Recipes ── */}
            {isProductionBuilding && (
              <>
                {hasCompletedProducts && (
                  <button
                    onClick={() => {
                      sounds.playClick();
                      triggerTelegramHaptic('success');
                      if (selectedEntity.completedProducts) {
                        selectedEntity.completedProducts.forEach((_, idx) => collectProduct(selectedEntity.id, 0));
                      }
                    }}
                    className="flex-1 py-2 px-3 rounded-xl game-btn-plus text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg animate-pulse cursor-pointer shrink-0"
                  >
                    <span>🧺 Забрать готовое ({selectedEntity.completedProducts?.length})</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    sounds.playClick();
                    triggerTelegramHaptic('medium');
                    openModal('shop');
                  }}
                  className="flex-1 py-2 px-3 rounded-xl game-btn-gold text-xs font-black flex items-center justify-center gap-1.5 shadow active:scale-95 cursor-pointer shrink-0"
                >
                  <span>👨‍🍳 Рецепты</span>
                </button>
              </>
            )}

            {/* ── 6. Fruit Tree -> Harvest ── */}
            {isFruitTree && (
              <button
                onClick={() => {
                  sounds.playClick();
                  triggerTelegramHaptic('success');
                  harvestTreeBush(selectedEntity.id);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl game-btn-plus text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg animate-pulse cursor-pointer shrink-0"
              >
                <span>🍎 Собрать плоды ({selectedEntity.harvestsLeft || 4} сборов)</span>
              </button>
            )}

            {/* ── 7. Special Buildings (Silo, Barn, Orders, Market, Dock) ── */}
            {isSpecialBuilding && (
              <button
                onClick={() => {
                  sounds.playClick();
                  triggerTelegramHaptic('medium');
                  if (selectedEntity.configId === 'silo') openModal('silo');
                  else if (selectedEntity.configId === 'barn') openModal('barn');
                  else if (selectedEntity.configId === 'order_board') openModal('orders');
                  else if (selectedEntity.configId === 'roadside_shop') openModal('roadside');
                  else if (selectedEntity.configId === 'fishing_dock') openModal('fishing');
                  else openModal('settings');
                }}
                className="flex-1 py-2.5 px-4 rounded-xl game-btn-gold text-xs font-black flex items-center justify-center gap-1.5 shadow active:scale-95 cursor-pointer shrink-0"
              >
                <span>🚪 Открыть меню</span>
              </button>
            )}

            {/* Move Button (Available for all placable entities) */}
            <button
              onClick={() => {
                sounds.playClick();
                triggerTelegramHaptic('light');
                startMovingEntity(selectedEntity.id);
              }}
              className="py-2 px-2.5 rounded-xl game-dock-btn text-amber-200 hover:text-white text-xs font-black flex items-center justify-center gap-1 shadow active:scale-95 cursor-pointer shrink-0"
              title="Переместить объект"
            >
              <RotateCw size={13} />
              <span className="hidden sm:inline">Переместить</span>
            </button>

            {/* Delete / Clear Button (for non-essential structures) */}
            {!isCoreBuilding && (
              <button
                onClick={() => {
                  sounds.playClick();
                  triggerTelegramHaptic('warning');
                  deleteEntity(selectedEntity.id);
                }}
                className="w-8 h-8 rounded-xl game-dock-btn text-rose-300 hover:text-white hover:border-rose-500 flex items-center justify-center text-xs font-bold active:scale-90 transition-all shadow shrink-0"
                title="Удалить / снести"
              >
                <Trash2 size={14} />
              </button>
            )}

          </div>
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

      {/* ── 3. ACTIVE CONTINUOUS SWIPE TOOL BANNER ── */}
      {activeTool && !selectedEntity && !isActionStripOpen && (
        <div className="pointer-events-auto px-4 py-2 rounded-2xl game-dock-tray border-2 border-amber-500/90 shadow-2xl shadow-black/80 flex items-center gap-3 text-amber-100 animate-pop-in">
          <span className="text-2xl animate-bounce filter drop-shadow">
            {activeTool.type === 'harvest' ? '🌾' : CROPS[activeTool.configId || '']?.icon || '🌱'}
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-black text-yellow-300 game-text-gold">
              {activeTool.type === 'harvest' ? 'Режим сбора урожая' : `Посадка: ${CROPS[activeTool.configId || '']?.name || 'Семена'}`}
            </span>
            <span className="text-[10px] text-amber-200/90 font-bold">
              Проведите пальцем / мышкой по грядкам
            </span>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              triggerTelegramHaptic('light');
              setActiveTool(null);
            }}
            className="w-7 h-7 rounded-xl game-dock-btn text-amber-200 hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer active:scale-90 shadow ml-1"
            title="Завершить режим"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>
      )}

    </div>
  );
};
