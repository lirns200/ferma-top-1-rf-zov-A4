import { create } from 'zustand';
import { 
  WorldEntity, 
  MapChunkExpansion, 
  FarmOrder, 
  RoadsideSaleSlot, 
  MarketListing, 
  SeasonType, 
  WeatherType, 
  LevelConfig,
  FishSpecies,
  ProductionQueueItem
} from '../types';
import { CROPS, TREES_BUSHES } from '../config/crops';
import { PRODUCTS } from '../config/products';
import { RECIPES } from '../config/recipes';
import { BUILDINGS } from '../config/buildings';
import { ANIMALS } from '../config/animals';
import { LEVELS } from '../config/levels';
import { DECORATIONS } from '../config/decorations';
import { OBSTACLES } from '../config/obstacles';
import { FISH_SPECIES } from '../config/fishing';
import { GAME_EVENTS, GameEventConfig, getCurrentRealSeason, getRealCalendarMonthName, SEASONS_INFO } from '../config/events';
import { 
  INITIAL_ENTITIES, 
  INITIAL_MAP_EXPANSIONS, 
  INITIAL_INVENTORY, 
  INITIAL_SHOP_SLOTS, 
  generateRandomOrders, 
  generateMarketListings 
} from './defaultState';
import { StorageService, SavedGameState } from '../save/StorageService';
import { sounds } from '../audio/SoundManager';
import confetti from 'canvas-confetti';

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
}

export interface ActiveTool {
  type: 'plant' | 'harvest' | 'feed' | 'collect' | 'tool_clear';
  configId?: string; // cropId or feedItemId or toolId
}

export interface GameStore {
  // Player
  playerName: string;
  level: number;
  xp: number;
  coins: number;
  gems: number;
  
  // Storage
  siloCapacity: number;
  barnCapacity: number;
  inventory: Record<string, number>;
  
  // World Entities & Grid
  entities: WorldEntity[];
  selectedEntityId: string | null;
  activeTool: ActiveTool | null;
  placingBuildingConfigId: string | null;
  placingRotation: 0 | 1 | 2 | 3;
  movingEntityId: string | null;
  movingPos: { x: number; z: number } | null;
  movingRotation: 0 | 1 | 2 | 3;
  
  // Expansions
  expansions: MapChunkExpansion[];
  
  // Orders & Truck
  orders: FarmOrder[];
  truckState: {
    isDelivering: boolean;
    deliveringUntil: number;
    deliveredOrder?: FarmOrder;
  };
  
  // Roadside Shop & Market
  shopSlots: RoadsideSaleSlot[];
  marketListings: MarketListing[];
  
  // Seasons & Weather
  activeSeason: SeasonType;
  activeEvent: GameEventConfig | null;
  eventEndsAt: number;
  
  // Fishing
  fishingStats: {
    fishCaughtCount: number;
    biggestCatch: Record<string, number>;
  };
  
  // Tutorial
  tutorialStep: number;
  tutorialCompleted: boolean;
  
  // UI & Notifications
  activeModal: 'shop' | 'silo' | 'barn' | 'orders' | 'roadside' | 'market' | 'fishing' | 'events' | 'settings' | 'levelup' | 'expansion' | null;
  unlockedLevelInfo: LevelConfig | null;
  floatingTexts: FloatingText[];
  soundMuted: boolean;
  
  // Actions
  initGame: () => void;
  tickGameLoop: () => void;
  setSoundMuted: (muted: boolean) => void;
  openModal: (modal: GameStore['activeModal']) => void;
  closeModal: () => void;
  addFloatingText: (text: string, x: number, y: number, color?: string) => void;
  
  // Economy & Inventory
  addCoins: (amount: number) => void;
  addGems: (amount: number) => void;
  addXP: (amount: number) => void;
  getStorageUsed: (type: 'silo' | 'barn') => number;
  canAddItem: (itemId: string, count: number) => boolean;
  addItem: (itemId: string, count: number) => boolean;
  removeItem: (itemId: string, count: number) => boolean;
  upgradeStorage: (type: 'silo' | 'barn') => boolean;
  
  // Grid & Building Placement
  setSelectedEntity: (id: string | null) => void;
  setActiveTool: (tool: ActiveTool | null) => void;
  setPlacingBuilding: (configId: string | null) => void;
  rotatePlacingBuilding: () => void;
  isAreaAvailable: (x: number, z: number, width: number, depth: number, ignoreId?: string) => boolean;
  isAreaInsideUnlockedTerritory: (x: number, z: number, width: number, depth: number) => boolean;
  placeBuilding: (configId: string, x: number, z: number, rotation: 0 | 1 | 2 | 3) => boolean;
  moveEntity: (id: string, x: number, z: number, rotation: 0 | 1 | 2 | 3) => boolean;
  startMovingEntity: (id: string) => void;
  setMovingPos: (x: number, z: number) => void;
  rotateMovingEntity: () => void;
  confirmMoveEntity: () => boolean;
  cancelMoveEntity: () => void;
  deleteEntity: (id: string) => boolean;
  storeDecoration: (id: string) => boolean;
  
  // Crops & Farming Actions
  plantCrop: (fieldEntityId: string, cropId: string) => boolean;
  harvestCrop: (fieldEntityId: string) => boolean;
  harvestTreeBush: (treeEntityId: string) => boolean;
  
  // Animal Actions
  feedAnimal: (penEntityId: string, animalId: string) => boolean;
  collectAnimalProduct: (penEntityId: string, animalId: string) => boolean;
  
  // Production Actions
  startProduction: (buildingEntityId: string, recipeId: string) => boolean;
  collectProduct: (buildingEntityId: string, index: number) => boolean;
  speedUpProductionWithGems: (buildingEntityId: string) => boolean;
  
  // Obstacles & Expansions
  clearObstacle: (obstacleEntityId: string) => boolean;
  unlockExpansionChunk: (chunkId: string) => boolean;
  
  // Orders & Truck
  fulfillOrder: (orderId: string) => boolean;
  trashOrder: (orderId: string) => void;
  
  // Roadside Shop & Market
  createRoadsideSale: (slotId: string, itemId: string, count: number, price: number) => boolean;
  collectRoadsideCoins: (slotId: string) => boolean;
  buyFromMarket: (listingId: string) => boolean;
  refreshMarket: () => void;
  
  // Fishing
  onCatchFish: (speciesId: string, weight: number) => void;
  
  // Tutorial
  advanceTutorial: (stepToComplete?: number) => void;
  skipTutorial: () => void;
  
  // Seasons & Weather Actions
  setSeason: (season: SeasonType) => void;
  setWeather: (weatherEventId: string) => void;
  cycleSeason: () => void;
  cycleWeather: () => void;
  syncWithRealCalendar: () => void;

  // Save & Reset
  saveCurrentState: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  playerName: 'Фермер',
  level: 1,
  xp: 0,
  coins: 150,
  gems: 15,
  
  siloCapacity: 50,
  barnCapacity: 50,
  inventory: { ...INITIAL_INVENTORY },
  
  entities: [...INITIAL_ENTITIES],
  selectedEntityId: null,
  activeTool: null,
  placingBuildingConfigId: null,
  placingRotation: 0,
  movingEntityId: null,
  movingPos: null,
  movingRotation: 0,
  
  expansions: [...INITIAL_MAP_EXPANSIONS],
  
  orders: generateRandomOrders(1),
  truckState: {
    isDelivering: false,
    deliveringUntil: 0,
  },
  
  shopSlots: [...INITIAL_SHOP_SLOTS],
  marketListings: generateMarketListings(),
  
  activeSeason: getCurrentRealSeason(),
  activeEvent: GAME_EVENTS.sunny_day,
  eventEndsAt: Date.now() + 300000,
  
  fishingStats: {
    fishCaughtCount: 0,
    biggestCatch: {},
  },
  
  tutorialStep: 1,
  tutorialCompleted: false,
  
  activeModal: null,
  unlockedLevelInfo: null,
  floatingTexts: [],
  soundMuted: false,

  initGame: () => {
    const saved = StorageService.loadGame();
    if (saved) {
      const now = Date.now();
      const elapsedMs = now - saved.savedAt;

      // Reconcile entities offline progress (crops growing, production running, animals producing)
      const reconciledEntities = saved.entities.map(ent => {
        const copy = { ...ent };
        
        // Progress crops
        if (copy.type === 'field' && copy.cropId && copy.plantedAt) {
          // Crop timer already continued naturally by timestamp
        }

        // Progress production
        if (copy.type === 'production' && copy.productionQueue && copy.productionQueue.length > 0) {
          const completed: { itemId: string; count: number }[] = copy.completedProducts ? [...copy.completedProducts] : [];
          const remainingQueue: typeof copy.productionQueue = [];

          let simTime = copy.productionQueue[0].startedAt;
          for (const item of copy.productionQueue) {
            const recipe = RECIPES[item.recipeId];
            const durationMs = recipe ? recipe.craftTimeSeconds * 1000 : 10000;
            if (now >= simTime + durationMs) {
              if (recipe) {
                completed.push({ itemId: recipe.outputItemId, count: recipe.outputCount });
              }
              simTime += durationMs;
            } else {
              remainingQueue.push({ ...item, startedAt: simTime });
              simTime += durationMs;
            }
          }
          copy.completedProducts = completed;
          copy.productionQueue = remainingQueue;
        }

        // Progress animals
        if (copy.type === 'animal_pen' && copy.animals) {
          copy.animals = copy.animals.map(a => {
            const animalCfg = ANIMALS[a.animalConfigId];
            if (!a.isHungry && a.fedAt && animalCfg) {
              const produceDurationMs = animalCfg.produceTimeSeconds * 1000;
              if (now >= a.fedAt + produceDurationMs) {
                return { ...a, isHungry: false, hasProduct: true, animState: 'idle' };
              }
            }
            return a;
          });
        }

        return copy;
      });

      // Reconcile truck delivery
      let truck = saved.truckState;
      let newCoins = saved.coins;
      let newXp = saved.xp;
      if (truck.isDelivering && now >= truck.deliveringUntil) {
        truck = { isDelivering: false, deliveringUntil: 0 };
      }

      set({
        playerName: saved.playerName || 'Фермер',
        level: saved.level,
        xp: saved.xp,
        coins: saved.coins,
        gems: saved.gems,
        siloCapacity: saved.siloCapacity,
        barnCapacity: saved.barnCapacity,
        inventory: saved.inventory,
        entities: reconciledEntities,
        expansions: saved.expansions || INITIAL_MAP_EXPANSIONS,
        orders: saved.orders && saved.orders.length > 0 ? saved.orders : generateRandomOrders(saved.level),
        truckState: truck,
        shopSlots: saved.shopSlots || INITIAL_SHOP_SLOTS,
        fishingStats: saved.fishingStats || { fishCaughtCount: 0, biggestCatch: {} },
        tutorialStep: saved.tutorialStep || 1,
        tutorialCompleted: saved.tutorialCompleted ?? false,
        soundMuted: saved.soundMuted ?? false,
        activeSeason: getCurrentRealSeason(),
      });
      sounds.setMuted(saved.soundMuted ?? false);
    }
  },

  tickGameLoop: () => {
    const state = get();
    const now = Date.now();

    // Check truck delivery completion
    if (state.truckState.isDelivering && now >= state.truckState.deliveringUntil) {
      if (state.truckState.deliveredOrder) {
        state.addCoins(state.truckState.deliveredOrder.coinReward);
        state.addXP(state.truckState.deliveredOrder.xpReward);
        sounds.playCoin();
        state.addFloatingText(`+${state.truckState.deliveredOrder.coinReward} 💰`, 0, 0, '#FACC15');
      }
      set({
        truckState: { isDelivering: false, deliveringUntil: 0 },
        orders: state.orders.filter(o => o.id !== state.truckState.deliveredOrder?.id).concat(generateRandomOrders(state.level).slice(0, 1)),
      });
    }

    // Check production queue progression
    let entitiesChanged = false;
    const updatedEntities = state.entities.map(ent => {
      if (ent.type === 'production' && ent.productionQueue && ent.productionQueue.length > 0) {
        const firstItem = ent.productionQueue[0];
        const recipe = RECIPES[firstItem.recipeId];
        const durationMs = recipe ? recipe.craftTimeSeconds * 1000 : 10000;
        
        if (now >= firstItem.startedAt + durationMs) {
          entitiesChanged = true;
          const completed = ent.completedProducts ? [...ent.completedProducts] : [];
          if (recipe) {
            completed.push({ itemId: recipe.outputItemId, count: recipe.outputCount });
          }
          const remainingQueue = ent.productionQueue.slice(1).map((q, idx) => {
            if (idx === 0) {
              return { ...q, startedAt: now };
            }
            return q;
          });
          return {
            ...ent,
            productionQueue: remainingQueue,
            completedProducts: completed,
          };
        }
      }

      // Check animal readiness
      if (ent.type === 'animal_pen' && ent.animals) {
        let animalChanged = false;
        const updatedAnimals = ent.animals.map(a => {
          const cfg = ANIMALS[a.animalConfigId];
          if (!a.isHungry && !a.hasProduct && a.fedAt && cfg) {
            if (now >= a.fedAt + cfg.produceTimeSeconds * 1000) {
              animalChanged = true;
              return { ...a, hasProduct: true, animState: 'idle' as const };
            }
          }
          return a;
        });
        if (animalChanged) {
          entitiesChanged = true;
          return { ...ent, animals: updatedAnimals };
        }
      }

      return ent;
    });

    if (entitiesChanged) {
      set({ entities: updatedEntities });
    }

    // Check weather event rotation
    if (now >= state.eventEndsAt) {
      const eventKeys = Object.keys(GAME_EVENTS);
      const nextEventKey = eventKeys[Math.floor(Math.random() * eventKeys.length)];
      const nextEvent = GAME_EVENTS[nextEventKey];
      set({
        activeEvent: nextEvent,
        eventEndsAt: now + nextEvent.durationSeconds * 1000,
      });
      state.addFloatingText(`Погода: ${nextEvent.name}`, 0, 0, nextEvent.color);
    }
  },

  setSoundMuted: (muted) => {
    sounds.setMuted(muted);
    set({ soundMuted: muted });
  },

  openModal: (modal) => {
    sounds.playClick();
    set({ activeModal: modal });
  },

  closeModal: () => {
    sounds.playClick();
    set({ activeModal: null });
  },

  addFloatingText: (text, x, y, color = '#FACC15') => {
    const id = `ft_${Date.now()}_${Math.random()}`;
    set(s => ({
      floatingTexts: [...s.floatingTexts, { id, text, x, y, color }],
    }));
    setTimeout(() => {
      set(s => ({
        floatingTexts: s.floatingTexts.filter(ft => ft.id !== id),
      }));
    }, 1800);
  },

  addCoins: (amount) => {
    set(s => ({ coins: s.coins + amount }));
  },

  addGems: (amount) => {
    set(s => ({ gems: s.gems + amount }));
  },

  addXP: (amount) => {
    const state = get();
    const multiplier = state.activeEvent?.xpMultiplier || 1.0;
    const finalAmount = Math.round(amount * multiplier);
    
    let currentXp = state.xp + finalAmount;
    let currentLevel = state.level;
    let leveledUp = false;
    let lastUnlockedInfo: LevelConfig | null = null;

    while (currentLevel < 50) {
      const nextLevelConfig = LEVELS[currentLevel - 1];
      if (nextLevelConfig && currentXp >= nextLevelConfig.xpRequired) {
        currentXp -= nextLevelConfig.xpRequired;
        currentLevel++;
        leveledUp = true;
        lastUnlockedInfo = LEVELS[currentLevel - 1] || null;
      } else {
        break;
      }
    }

    if (leveledUp && lastUnlockedInfo) {
      sounds.playLevelUp();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      set({
        level: currentLevel,
        xp: currentXp,
        coins: state.coins + lastUnlockedInfo.coinReward,
        gems: state.gems + lastUnlockedInfo.gemReward,
        unlockedLevelInfo: lastUnlockedInfo,
        activeModal: 'levelup',
      });
      state.addFloatingText(`УРОВЕНЬ ${currentLevel}! 🎉`, 0, 0, '#38BDF8');
    } else {
      set({ xp: currentXp });
      sounds.playXP();
    }
  },

  getStorageUsed: (type) => {
    const inv = get().inventory;
    let sum = 0;
    for (const [itemId, count] of Object.entries(inv)) {
      const item = PRODUCTS[itemId];
      if (item && item.storage === type) {
        sum += count;
      }
    }
    return sum;
  },

  canAddItem: (itemId, count) => {
    const item = PRODUCTS[itemId];
    if (!item) return false;
    const used = get().getStorageUsed(item.storage);
    const cap = item.storage === 'silo' ? get().siloCapacity : get().barnCapacity;
    return used + count <= cap;
  },

  addItem: (itemId, count) => {
    const item = PRODUCTS[itemId];
    if (!item) return false;
    const state = get();
    const used = state.getStorageUsed(item.storage);
    const cap = item.storage === 'silo' ? state.siloCapacity : state.barnCapacity;

    if (used + count > cap) {
      state.addFloatingText(`Склад полон! (${item.storage === 'silo' ? 'Силос' : 'Амбар'})`, 0, 0, '#EF4444');
      return false;
    }

    const current = state.inventory[itemId] || 0;
    set({
      inventory: {
        ...state.inventory,
        [itemId]: current + count,
      },
    });
    return true;
  },

  removeItem: (itemId, count) => {
    const state = get();
    const current = state.inventory[itemId] || 0;
    if (current < count) return false;
    
    const newInv = { ...state.inventory };
    if (current === count) {
      delete newInv[itemId];
    } else {
      newInv[itemId] = current - count;
    }
    set({ inventory: newInv });
    return true;
  },

  upgradeStorage: (type) => {
    const state = get();
    if (type === 'silo') {
      const nails = state.inventory.nail || 0;
      const screws = state.inventory.screw || 0;
      const panels = state.inventory.wood_panel || 0;
      const required = Math.floor(state.siloCapacity / 25);

      if (nails >= required && screws >= required && panels >= required) {
        state.removeItem('nail', required);
        state.removeItem('screw', required);
        state.removeItem('wood_panel', required);
        set(s => ({ siloCapacity: s.siloCapacity + 25 }));
        sounds.playLevelUp();
        state.addFloatingText('Силос улучшен! +25 мест', 0, 0, '#22C55E');
        return true;
      }
    } else {
      const bolts = state.inventory.bolt || 0;
      const planks = state.inventory.plank || 0;
      const tapes = state.inventory.duct_tape || 0;
      const required = Math.floor(state.barnCapacity / 25);

      if (bolts >= required && planks >= required && tapes >= required) {
        state.removeItem('bolt', required);
        state.removeItem('plank', required);
        state.removeItem('duct_tape', required);
        set(s => ({ barnCapacity: s.barnCapacity + 25 }));
        sounds.playLevelUp();
        state.addFloatingText('Амбар улучшен! +25 мест', 0, 0, '#22C55E');
        return true;
      }
    }
    state.addFloatingText('Не хватает стройматериалов!', 0, 0, '#EF4444');
    return false;
  },

  setSelectedEntity: (id) => {
    set({ selectedEntityId: id });
  },

  setActiveTool: (tool) => {
    set({ activeTool: tool });
  },

  setPlacingBuilding: (configId) => {
    set({ placingBuildingConfigId: configId, placingRotation: 0 });
  },

  rotatePlacingBuilding: () => {
    set(s => ({ placingRotation: ((s.placingRotation + 1) % 4) as 0 | 1 | 2 | 3 }));
  },

  isAreaAvailable: (x, z, width, depth, ignoreId) => {
    const entities = get().entities;
    for (const ent of entities) {
      if (ent.id === ignoreId) continue;
      // Axis-aligned bounding box collision
      const overlapX = x < ent.x + ent.width && x + width > ent.x;
      const overlapZ = z < ent.z + ent.depth && z + depth > ent.z;
      if (overlapX && overlapZ) {
        return false;
      }
    }
    return true;
  },

  isAreaInsideUnlockedTerritory: (x, z, width, depth) => {
    const expansions = get().expansions.filter(e => e.isUnlocked);
    // Every corner of the bounding box must be inside at least one unlocked expansion chunk
    const corners = [
      { cx: x, cz: z },
      { cx: x + width, cz: z },
      { cx: x, cz: z + depth },
      { cx: x + width, cz: z + depth },
    ];

    for (const { cx, cz } of corners) {
      const isInside = expansions.some(chunk => 
        cx >= chunk.x && cx <= chunk.x + chunk.width &&
        cz >= chunk.z && cz <= chunk.z + chunk.depth
      );
      if (!isInside) return false;
    }
    return true;
  },

  placeBuilding: (configId, x, z, rotation) => {
    const state = get();
    const bConfig = BUILDINGS[configId] || DECORATIONS[configId] || TREES_BUSHES[configId];
    if (!bConfig) return false;

    const rawW = ('width' in bConfig && typeof bConfig.width === 'number') ? bConfig.width : 2;
    const rawD = ('depth' in bConfig && typeof bConfig.depth === 'number') ? bConfig.depth : 2;
    const width = (rotation % 2 === 1) ? rawD : rawW;
    const depth = (rotation % 2 === 1) ? rawW : rawD;

    if (!state.isAreaAvailable(x, z, width, depth)) {
      state.addFloatingText('Место занято!', 0, 0, '#EF4444');
      return false;
    }

    if (!state.isAreaInsideUnlockedTerritory(x, z, width, depth)) {
      state.addFloatingText('Земля ещё не открыта!', 0, 0, '#EF4444');
      return false;
    }

    // Check cost
    const cost = bConfig.cost || 0;
    const gemsCost = (bConfig as { gemsCost?: number }).gemsCost || 0;
    if (state.coins < cost || state.gems < gemsCost) {
      state.addFloatingText('Недостаточно монет или алмазов!', 0, 0, '#EF4444');
      return false;
    }

    let newEntityType: WorldEntity['type'] = 'production';
    if (BUILDINGS[configId]) {
      if (configId === 'field_plot') newEntityType = 'field';
      else if (BUILDINGS[configId].category === 'animal_pen') newEntityType = 'animal_pen';
      else if (BUILDINGS[configId].category === 'storage') newEntityType = 'storage';
      else if (BUILDINGS[configId].category === 'special') newEntityType = 'special';
      else newEntityType = 'production';
    } else if (DECORATIONS[configId]) {
      newEntityType = 'decoration';
    } else if (TREES_BUSHES[configId]) {
      newEntityType = 'fruit_tree';
    }

    const newEntity: WorldEntity = {
      id: `ent_${configId}_${Date.now()}`,
      type: newEntityType,
      configId,
      x,
      z,
      width,
      depth,
      rotation,
      productionQueue: newEntityType === 'production' ? [] : undefined,
      completedProducts: newEntityType === 'production' ? [] : undefined,
      animals: newEntityType === 'animal_pen' ? [
        {
          id: `an_${Date.now()}_1`,
          animalConfigId: BUILDINGS[configId].associatedAnimalId || 'chicken',
          isHungry: true,
          hasProduct: false,
          animState: 'idle',
          posX: 0.5,
          posZ: 0.5,
        },
        {
          id: `an_${Date.now()}_2`,
          animalConfigId: BUILDINGS[configId].associatedAnimalId || 'chicken',
          isHungry: true,
          hasProduct: false,
          animState: 'walk',
          posX: 1.5,
          posZ: 1.5,
        },
      ] : undefined,
      harvestsLeft: newEntityType === 'fruit_tree' ? 4 : undefined,
      treePlantedAt: newEntityType === 'fruit_tree' ? Date.now() : undefined,
    };

    const remainingCoins = state.coins - cost;
    const remainingGems = state.gems - gemsCost;
    const canAffordAnother = remainingCoins >= cost && remainingGems >= gemsCost;

    set(s => ({
      coins: remainingCoins,
      gems: remainingGems,
      entities: [...s.entities, newEntity],
      // Keep placement mode active if player can afford another one!
      placingBuildingConfigId: canAffordAnother ? configId : null,
    }));

    sounds.playCraftStart();
    state.addXP(10);
    if (canAffordAnother) {
      state.addFloatingText('Построено! Можно ставить ещё 🔨', 0, 0, '#22C55E');
    } else {
      state.addFloatingText('Построено! Больше нет монет', 0, 0, '#F59E0B');
    }

    if (state.tutorialStep === 5 && (configId === 'bakery' || configId === 'feed_mill')) {
      state.advanceTutorial(5);
    }

    return true;
  },

  moveEntity: (id, x, z, rotation) => {
    const state = get();
    const ent = state.entities.find(e => e.id === id);
    if (!ent) return false;

    const width = (rotation % 2 === 1) ? ent.depth : ent.width;
    const depth = (rotation % 2 === 1) ? ent.width : ent.depth;

    if (!state.isAreaAvailable(x, z, width, depth, id)) {
      state.addFloatingText('Место занято!', 0, 0, '#EF4444');
      return false;
    }

    if (!state.isAreaInsideUnlockedTerritory(x, z, width, depth)) {
      state.addFloatingText('Нельзя ставить вне фермы!', 0, 0, '#EF4444');
      return false;
    }

    set(s => ({
      entities: s.entities.map(e => e.id === id ? { ...e, x, z, rotation, width, depth } : e),
      selectedEntityId: null,
      movingEntityId: null,
      movingPos: null,
    }));
    sounds.playClick();
    return true;
  },

  startMovingEntity: (id) => {
    const state = get();
    const ent = state.entities.find(e => e.id === id);
    if (!ent) return;
    set({
      movingEntityId: id,
      movingPos: { x: ent.x, z: ent.z },
      movingRotation: ((ent.rotation || 0) % 4) as 0 | 1 | 2 | 3,
      selectedEntityId: id,
      activeTool: null,
      placingBuildingConfigId: null,
    });
    sounds.playLevelUp();
    state.addFloatingText('Режим перемещения 🔄', 0, 0, '#F59E0B');
  },

  setMovingPos: (x, z) => {
    set({ movingPos: { x, z } });
  },

  rotateMovingEntity: () => {
    const current = get().movingRotation;
    const next = ((current + 1) % 4) as 0 | 1 | 2 | 3;
    set({ movingRotation: next });
    sounds.playClick();
  },

  confirmMoveEntity: () => {
    const state = get();
    const { movingEntityId, movingPos, movingRotation } = state;
    if (!movingEntityId || !movingPos) return false;

    const ent = state.entities.find(e => e.id === movingEntityId);
    if (!ent) return false;

    const width = (movingRotation % 2 === 1) ? ent.depth : ent.width;
    const depth = (movingRotation % 2 === 1) ? ent.width : ent.depth;

    if (!state.isAreaAvailable(movingPos.x, movingPos.z, width, depth, movingEntityId)) {
      state.addFloatingText('Здесь нельзя поставить!', 0, 0, '#EF4444');
      sounds.playClick();
      return false;
    }

    if (!state.isAreaInsideUnlockedTerritory(movingPos.x, movingPos.z, width, depth)) {
      state.addFloatingText('Вне территории фермы!', 0, 0, '#EF4444');
      sounds.playClick();
      return false;
    }

    set(s => ({
      entities: s.entities.map(e => e.id === movingEntityId ? {
        ...e,
        x: movingPos.x,
        z: movingPos.z,
        rotation: movingRotation,
        width,
        depth
      } : e),
      movingEntityId: null,
      movingPos: null,
      selectedEntityId: null,
    }));

    sounds.playCraftStart();
    state.addFloatingText('Перемещено! ✨', 0, 0, '#22C55E');
    return true;
  },

  cancelMoveEntity: () => {
    set({
      movingEntityId: null,
      movingPos: null,
      selectedEntityId: null,
    });
    sounds.playClick();
  },

  deleteEntity: (id) => {
    const state = get();
    const ent = state.entities.find(e => e.id === id);
    if (!ent) return false;

    // Special central core building guard (farmhouse can be moved, but not deleted)
    if (ent.type === 'special' && (ent.configId === 'farmhouse' || ent.configId === 'order_board' || ent.configId === 'roadside_shop' || ent.configId === 'fishing_dock')) {
      state.addFloatingText('Главные здания нельзя удалить (только переместить)', 0, 0, '#EF4444');
      return false;
    }

    // Storage buildings guard
    if (ent.type === 'storage' && (ent.configId === 'silo' || ent.configId === 'barn')) {
      state.addFloatingText('Склады нельзя удалить (только переместить)', 0, 0, '#EF4444');
      return false;
    }

    // Refund 50% coins if building or decoration had a cost
    const bConfig = BUILDINGS[ent.configId] || DECORATIONS[ent.configId] || TREES_BUSHES[ent.configId];
    const refundCoins = bConfig ? Math.floor(bConfig.cost * 0.5) : 0;

    set(s => ({
      entities: s.entities.filter(e => e.id !== id),
      coins: s.coins + refundCoins,
      movingEntityId: null,
      movingPos: null,
      selectedEntityId: null,
    }));

    sounds.playCoin();
    if (refundCoins > 0) {
      state.addFloatingText(`Удалено (+🪙 ${refundCoins})`, 0, 0, '#F59E0B');
    } else {
      state.addFloatingText('Удалено 🗑️', 0, 0, '#94A3B8');
    }
    return true;
  },

  storeDecoration: (id) => {
    return get().deleteEntity(id);
  },

  plantCrop: (fieldEntityId, cropId) => {
    const state = get();
    const crop = CROPS[cropId];
    if (!crop) return false;

    const field = state.entities.find(e => e.id === fieldEntityId && e.type === 'field');
    if (!field || field.cropId) return false;

    // Check seed inventory
    const seedCount = state.inventory[cropId] || 0;
    if (seedCount < 1) {
      state.addFloatingText(`Нет семян: ${crop.name}`, 0, 0, '#EF4444');
      return false;
    }

    state.removeItem(cropId, 1);
    sounds.playPlant();

    set(s => ({
      entities: s.entities.map(e => 
        e.id === fieldEntityId 
          ? { ...e, cropId, plantedAt: Date.now() }
          : e
      ),
    }));

    state.addFloatingText(`Посажено: ${crop.name}`, 0, 0, crop.color);

    if (state.tutorialStep === 3) {
      state.advanceTutorial(3);
    }

    return true;
  },

  harvestCrop: (fieldEntityId) => {
    const state = get();
    const field = state.entities.find(e => e.id === fieldEntityId && e.type === 'field');
    if (!field || !field.cropId || !field.plantedAt) return false;

    const crop = CROPS[field.cropId];
    if (!crop) return false;

    const weatherMult = state.activeEvent?.growthSpeedMultiplier || 1.0;
    const growMs = (crop.growTimeSeconds * 1000) / weatherMult;
    const isReady = Date.now() >= field.plantedAt + growMs;

    if (!isReady) {
      state.addFloatingText('Ещё растёт...', 0, 0, '#F59E0B');
      return false;
    }

    if (!state.canAddItem(crop.id, crop.harvestYield)) {
      state.addFloatingText('Силос полон!', 0, 0, '#EF4444');
      return false;
    }

    state.addItem(crop.id, crop.harvestYield);
    state.addXP(crop.xpGain);
    sounds.playHarvest();

    set(s => ({
      entities: s.entities.map(e => 
        e.id === fieldEntityId 
          ? { ...e, cropId: null, plantedAt: undefined }
          : e
      ),
    }));

    state.addFloatingText(`+${crop.harvestYield} ${crop.icon} (+${crop.xpGain} XP)`, 0, 0, '#22C55E');

    if (state.tutorialStep === 4) {
      state.advanceTutorial(4);
    }

    return true;
  },

  harvestTreeBush: (treeEntityId) => {
    const state = get();
    const tree = state.entities.find(e => e.id === treeEntityId && e.type === 'fruit_tree');
    if (!tree || tree.isDead || (tree.harvestsLeft && tree.harvestsLeft <= 0)) return false;

    const cfg = TREES_BUSHES[tree.configId];
    if (!cfg) return false;

    const growMs = cfg.growTimeSeconds * 1000;
    const isReady = tree.treePlantedAt ? Date.now() >= tree.treePlantedAt + growMs : true;

    if (!isReady) {
      state.addFloatingText('Плоды зреют...', 0, 0, '#F59E0B');
      return false;
    }

    if (!state.canAddItem(cfg.produceItemId, cfg.harvestYield)) {
      state.addFloatingText('Силос полон!', 0, 0, '#EF4444');
      return false;
    }

    state.addItem(cfg.produceItemId, cfg.harvestYield);
    state.addXP(cfg.xpGain);
    sounds.playHarvest();

    const remainingHarvests = (tree.harvestsLeft || 4) - 1;
    const isDead = remainingHarvests <= 0;

    set(s => ({
      entities: s.entities.map(e => 
        e.id === treeEntityId 
          ? { 
              ...e, 
              harvestsLeft: remainingHarvests, 
              isDead, 
              treePlantedAt: isDead ? undefined : Date.now() 
            }
          : e
      ),
    }));

    state.addFloatingText(`+${cfg.harvestYield} ${cfg.icon} (+${cfg.xpGain} XP)`, 0, 0, '#22C55E');
    return true;
  },

  feedAnimal: (penEntityId, animalId) => {
    const state = get();
    const pen = state.entities.find(e => e.id === penEntityId && e.type === 'animal_pen');
    if (!pen || !pen.animals) return false;

    const animal = pen.animals.find(a => a.id === animalId);
    if (!animal || !animal.isHungry) return false;

    const cfg = ANIMALS[animal.animalConfigId];
    if (!cfg) return false;

    const feedCount = state.inventory[cfg.feedItemId] || 0;
    if (feedCount < 1) {
      state.addFloatingText('Нет корма!', 0, 0, '#EF4444');
      return false;
    }

    state.removeItem(cfg.feedItemId, 1);
    sounds.playAnimalSound(animal.animalConfigId);

    set(s => ({
      entities: s.entities.map(e => {
        if (e.id !== penEntityId || !e.animals) return e;
        return {
          ...e,
          animals: e.animals.map(a => a.id === animalId ? {
            ...a,
            isHungry: false,
            fedAt: Date.now(),
            hasProduct: false,
            animState: 'eat' as const,
          } : a),
        };
      }),
    }));

    state.addFloatingText('Животное накормлено', 0, 0, '#22C55E');
    return true;
  },

  collectAnimalProduct: (penEntityId, animalId) => {
    const state = get();
    const pen = state.entities.find(e => e.id === penEntityId && e.type === 'animal_pen');
    if (!pen || !pen.animals) return false;

    const animal = pen.animals.find(a => a.id === animalId);
    if (!animal || !animal.hasProduct) return false;

    const cfg = ANIMALS[animal.animalConfigId];
    if (!cfg) return false;

    if (!state.canAddItem(cfg.produceItemId, 1)) {
      state.addFloatingText('Амбар полон!', 0, 0, '#EF4444');
      return false;
    }

    state.addItem(cfg.produceItemId, 1);
    state.addXP(cfg.xpGain);
    sounds.playHarvest();

    set(s => ({
      entities: s.entities.map(e => {
        if (e.id !== penEntityId || !e.animals) return e;
        return {
          ...e,
          animals: e.animals.map(a => a.id === animalId ? {
            ...a,
            isHungry: true,
            hasProduct: false,
            fedAt: undefined,
            animState: 'idle' as const,
          } : a),
        };
      }),
    }));

    const prod = PRODUCTS[cfg.produceItemId];
    state.addFloatingText(`+1 ${prod?.icon || '🥚'} (+${cfg.xpGain} XP)`, 0, 0, '#22C55E');
    return true;
  },

  startProduction: (buildingEntityId, recipeId) => {
    const state = get();
    const recipe = RECIPES[recipeId];
    if (!recipe) return false;

    const building = state.entities.find(e => e.id === buildingEntityId && e.type === 'production');
    if (!building) return false;

    const bConfig = BUILDINGS[building.configId];
    const maxSlots = bConfig?.maxQueueSlots || 5;
    const currentQueue = building.productionQueue || [];

    if (currentQueue.length >= maxSlots) {
      state.addFloatingText('Очередь заполнена!', 0, 0, '#EF4444');
      return false;
    }

    // Check ingredients
    for (const ing of recipe.ingredients) {
      const have = state.inventory[ing.itemId] || 0;
      if (have < ing.count) {
        const item = PRODUCTS[ing.itemId];
        state.addFloatingText(`Не хватает: ${item?.name || ing.itemId}`, 0, 0, '#EF4444');
        return false;
      }
    }

    // Deduct ingredients
    for (const ing of recipe.ingredients) {
      state.removeItem(ing.itemId, ing.count);
    }

    sounds.playCraftStart();

    const isFirstInQueue = currentQueue.length === 0;
    const newQueueItem: ProductionQueueItem = {
      id: `q_${Date.now()}_${Math.random()}`,
      recipeId,
      startedAt: isFirstInQueue ? Date.now() : currentQueue[currentQueue.length - 1].startedAt + recipe.craftTimeSeconds * 1000,
      durationSeconds: recipe.craftTimeSeconds,
      duration: recipe.craftTimeSeconds,
    };

    set(s => ({
      entities: s.entities.map(e => e.id === buildingEntityId ? {
        ...e,
        productionQueue: [...(e.productionQueue || []), newQueueItem],
      } : e),
    }));

    state.addFloatingText(`Производство: ${recipe.name}`, 0, 0, '#38BDF8');

    if (state.tutorialStep === 6) {
      state.advanceTutorial(6);
    }

    return true;
  },

  collectProduct: (buildingEntityId, index) => {
    const state = get();
    const building = state.entities.find(e => e.id === buildingEntityId && e.type === 'production');
    if (!building || !building.completedProducts || !building.completedProducts[index]) return false;

    const product = building.completedProducts[index];
    const item = PRODUCTS[product.itemId];
    if (!item) return false;

    if (!state.canAddItem(product.itemId, product.count)) {
      state.addFloatingText('Амбар полон!', 0, 0, '#EF4444');
      return false;
    }

    state.addItem(product.itemId, product.count);
    state.addXP(item.xpGain * product.count);
    sounds.playHarvest();

    const updatedCompleted = building.completedProducts.filter((_, idx) => idx !== index);

    set(s => ({
      entities: s.entities.map(e => e.id === buildingEntityId ? {
        ...e,
        completedProducts: updatedCompleted,
      } : e),
    }));

    state.addFloatingText(`+${product.count} ${item.icon} (+${item.xpGain * product.count} XP)`, 0, 0, '#22C55E');
    return true;
  },

  speedUpProductionWithGems: (buildingEntityId) => {
    const state = get();
    const building = state.entities.find(e => e.id === buildingEntityId && e.type === 'production');
    if (!building || !building.productionQueue || building.productionQueue.length === 0) return false;

    if (state.gems < 1) {
      state.addFloatingText('Не хватает алмазов!', 0, 0, '#EF4444');
      return false;
    }

    const firstItem = building.productionQueue[0];
    const recipe = RECIPES[firstItem.recipeId];

    set(s => ({
      gems: s.gems - 1,
      entities: s.entities.map(e => {
        if (e.id !== buildingEntityId) return e;
        const completed = e.completedProducts ? [...e.completedProducts] : [];
        if (recipe) {
          completed.push({ itemId: recipe.outputItemId, count: recipe.outputCount });
        }
        return {
          ...e,
          productionQueue: (e.productionQueue || []).slice(1).map((q, idx) => idx === 0 ? { ...q, startedAt: Date.now() } : q),
          completedProducts: completed,
        };
      }),
    }));

    sounds.playHarvest();
    state.addFloatingText('Ускорено за 1 💎', 0, 0, '#38BDF8');
    return true;
  },

  clearObstacle: (obstacleEntityId) => {
    const state = get();
    const obstacle = state.entities.find(e => e.id === obstacleEntityId && e.type === 'obstacle');
    if (!obstacle) return false;

    const cfg = OBSTACLES[obstacle.configId];
    if (!cfg) return false;

    const toolCount = state.inventory[cfg.toolRequired] || 0;
    if (toolCount < 1) {
      const toolItem = PRODUCTS[cfg.toolRequired];
      state.addFloatingText(`Нужен инструмент: ${toolItem?.name || cfg.toolRequired}`, 0, 0, '#EF4444');
      return false;
    }

    state.removeItem(cfg.toolRequired, 1);
    state.addXP(cfg.xpReward);
    if (cfg.dropItemId) {
      state.addItem(cfg.dropItemId, 1);
    }

    sounds.playCraftStart();

    set(s => ({
      entities: s.entities.filter(e => e.id !== obstacleEntityId),
      selectedEntityId: null,
    }));

    state.addFloatingText(`Расчищено! +${cfg.xpReward} XP`, 0, 0, '#22C55E');
    return true;
  },

  unlockExpansionChunk: (chunkId) => {
    const state = get();
    const chunk = state.expansions.find(c => c.id === chunkId);
    if (!chunk || chunk.isUnlocked) return false;

    if (state.level < chunk.unlockLevel) {
      state.addFloatingText(`Нужен уровень ${chunk.unlockLevel}!`, 0, 0, '#EF4444');
      return false;
    }

    const deeds = state.inventory.land_deed || 0;
    const mallets = state.inventory.mallet || 0;
    const stakes = state.inventory.marker_stake || 0;

    if (state.coins < chunk.costCoins || deeds < chunk.costDeeds || mallets < chunk.costMallets || stakes < chunk.costStakes) {
      state.addFloatingText('Не хватает ресурсов для расширения!', 0, 0, '#EF4444');
      return false;
    }

    set(s => ({ coins: s.coins - chunk.costCoins }));
    state.removeItem('land_deed', chunk.costDeeds);
    state.removeItem('mallet', chunk.costMallets);
    state.removeItem('marker_stake', chunk.costStakes);

    set(s => ({
      expansions: s.expansions.map(e => e.id === chunkId ? { ...e, isUnlocked: true } : e),
    }));

    sounds.playLevelUp();
    confetti({ particleCount: 80, spread: 60 });
    state.addXP(100);
    state.addFloatingText('Земля разблокирована! +100 XP', 0, 0, '#22C55E');
    return true;
  },

  fulfillOrder: (orderId) => {
    const state = get();
    const order = state.orders.find(o => o.id === orderId);
    if (!order || state.truckState.isDelivering) return false;

    // Verify all items
    for (const req of order.items) {
      const count = state.inventory[req.itemId] || 0;
      if (count < req.count) {
        state.addFloatingText('Не хватает товаров!', 0, 0, '#EF4444');
        return false;
      }
    }

    // Deduct items
    for (const req of order.items) {
      state.removeItem(req.itemId, req.count);
    }

    sounds.playTruckHonk();

    set({
      truckState: {
        isDelivering: true,
        deliveringUntil: Date.now() + 8000,
        deliveredOrder: order,
      },
      activeModal: null,
    });

    state.addFloatingText('Грузовик уехал доставлять заказ!', 0, 0, '#38BDF8');

    if (state.tutorialStep === 7) {
      state.advanceTutorial(7);
    }

    return true;
  },

  trashOrder: (orderId) => {
    const state = get();
    sounds.playClick();
    set({
      orders: state.orders.map(o => o.id === orderId ? generateRandomOrders(state.level)[0] : o),
    });
    state.addFloatingText('Заказ удален', 0, 0, '#94A3B8');
  },

  createRoadsideSale: (slotId, itemId, count, price) => {
    const state = get();
    const have = state.inventory[itemId] || 0;
    if (have < count) {
      state.addFloatingText('Не хватает товара!', 0, 0, '#EF4444');
      return false;
    }

    state.removeItem(itemId, count);
    sounds.playClick();

    set(s => ({
      shopSlots: s.shopSlots.map(slot => 
        slot.id === slotId 
          ? { ...slot, itemId, count, price, isSold: false, advertised: true } 
          : slot
      ),
    }));

    state.addFloatingText('Товар выставлен на продажу!', 0, 0, '#22C55E');

    // Simulate buyer purchase after 15-30 seconds
    setTimeout(() => {
      set(s => ({
        shopSlots: s.shopSlots.map(slot => 
          slot.id === slotId && slot.itemId === itemId && !slot.isSold 
            ? { ...slot, isSold: true } 
            : slot
        ),
      }));
    }, 15000 + Math.random() * 15000);

    return true;
  },

  collectRoadsideCoins: (slotId) => {
    const state = get();
    const slot = state.shopSlots.find(s => s.id === slotId);
    if (!slot || !slot.isSold || !slot.itemId) return false;

    state.addCoins(slot.price);
    sounds.playCoin();

    set(s => ({
      shopSlots: s.shopSlots.map(sl => 
        sl.id === slotId 
          ? { ...sl, itemId: null, count: 0, price: 0, isSold: false, advertised: false } 
          : sl
      ),
    }));

    state.addFloatingText(`+${slot.price} 💰`, 0, 0, '#FACC15');
    return true;
  },

  buyFromMarket: (listingId) => {
    const state = get();
    const listing = state.marketListings.find(l => l.id === listingId);
    if (!listing || listing.sold) return false;

    if (state.coins < listing.price) {
      state.addFloatingText('Не хватает монет!', 0, 0, '#EF4444');
      return false;
    }

    if (!state.canAddItem(listing.itemId, listing.count)) {
      state.addFloatingText('Склад полон!', 0, 0, '#EF4444');
      return false;
    }

    set(s => ({ coins: s.coins - listing.price }));
    state.addItem(listing.itemId, listing.count);
    sounds.playCoin();

    set(s => ({
      marketListings: s.marketListings.map(l => l.id === listingId ? { ...l, sold: true } : l),
    }));

    state.addFloatingText(`Куплено: +${listing.count} шт!`, 0, 0, '#22C55E');
    return true;
  },

  refreshMarket: () => {
    sounds.playClick();
    set({ marketListings: generateMarketListings() });
    get().addFloatingText('Газета объявлений обновлена 📰', 0, 0, '#38BDF8');
  },

  onCatchFish: (speciesId, weight) => {
    const state = get();
    const fish = FISH_SPECIES[speciesId];
    if (!fish) return;

    if (!state.canAddItem(speciesId, 1)) {
      state.addFloatingText('Амбар полон!', 0, 0, '#EF4444');
      return;
    }

    state.addItem(speciesId, 1);
    state.addXP(fish.xpGain);
    sounds.playHarvest();

    const curBiggest = state.fishingStats.biggestCatch[speciesId] || 0;
    const newRecord = weight > curBiggest;

    set(s => ({
      fishingStats: {
        fishCaughtCount: s.fishingStats.fishCaughtCount + 1,
        biggestCatch: {
          ...s.fishingStats.biggestCatch,
          [speciesId]: Math.max(curBiggest, weight),
        },
      },
    }));

    state.addFloatingText(`Поймана: ${fish.name} (${weight.toFixed(1)} кг)${newRecord ? ' 🌟 РЕКОРД!' : ''}`, 0, 0, fish.color);
  },

  advanceTutorial: (expectedStep) => {
    const state = get();
    if (expectedStep !== undefined && state.tutorialStep !== expectedStep) return;
    const next = state.tutorialStep + 1;
    if (next > 8) {
      set({ tutorialStep: 9, tutorialCompleted: true });
      sounds.playLevelUp();
      confetti({ particleCount: 150, spread: 90 });
      state.addFloatingText('Обучение завершено! Награда: 100 💰 5 💎', 0, 0, '#FACC15');
      state.addCoins(100);
      state.addGems(5);
    } else {
      set({ tutorialStep: next });
      sounds.playClick();
    }
  },

  skipTutorial: () => {
    set({ tutorialStep: 9, tutorialCompleted: true });
    sounds.playClick();
  },

  setSeason: (season) => {
    set({ activeSeason: season });
    const sInfo = SEASONS_INFO[season];
    get().addFloatingText(`Сезон: ${sInfo.name} ${sInfo.icon}`, 0, 0, sInfo.themeColor);
    sounds.playLevelUp();
  },

  setWeather: (weatherEventId) => {
    const event = GAME_EVENTS[weatherEventId] || GAME_EVENTS.sunny_day;
    set({
      activeEvent: event,
      eventEndsAt: Date.now() + event.durationSeconds * 1000,
    });
    get().addFloatingText(`Погода: ${event.name} ${event.icon}`, 0, 0, event.color);
    sounds.playClick();
  },

  cycleSeason: () => {
    const seasons: SeasonType[] = ['spring', 'summer', 'autumn', 'winter'];
    const curIdx = seasons.indexOf(get().activeSeason);
    const nextSeason = seasons[(curIdx + 1) % seasons.length];
    get().setSeason(nextSeason);
  },

  cycleWeather: () => {
    const eventKeys = Object.keys(GAME_EVENTS);
    const curKey = get().activeEvent?.id || 'sunny_day';
    const curIdx = eventKeys.indexOf(curKey);
    const nextKey = eventKeys[(curIdx + 1) % eventKeys.length];
    get().setWeather(nextKey);
  },

  syncWithRealCalendar: () => {
    const realSeason = getCurrentRealSeason();
    const monthName = getRealCalendarMonthName();
    set({ activeSeason: realSeason });
    const sInfo = SEASONS_INFO[realSeason];
    get().addFloatingText(`Календарь: ${monthName} (${sInfo.name} ${sInfo.icon})`, 0, 0, sInfo.themeColor);
    sounds.playLevelUp();
  },

  saveCurrentState: () => {
    const s = get();
    const stateToSave: SavedGameState = {
      version: 1,
      savedAt: Date.now(),
      playerName: s.playerName,
      level: s.level,
      xp: s.xp,
      coins: s.coins,
      gems: s.gems,
      siloCapacity: s.siloCapacity,
      barnCapacity: s.barnCapacity,
      inventory: s.inventory,
      entities: s.entities,
      expansions: s.expansions,
      orders: s.orders,
      truckState: {
        isDelivering: s.truckState.isDelivering,
        deliveringUntil: s.truckState.deliveringUntil,
        lastDeliveredOrderId: s.truckState.deliveredOrder?.id,
      },
      shopSlots: s.shopSlots,
      fishingStats: s.fishingStats,
      tutorialStep: s.tutorialStep,
      tutorialCompleted: s.tutorialCompleted,
      soundMuted: s.soundMuted,
    };
    StorageService.saveGame(stateToSave);
  },

  resetGame: () => {
    StorageService.clearSave();
    window.location.reload();
  },
}));
