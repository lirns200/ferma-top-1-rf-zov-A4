import { create } from 'zustand';
import { 
  WorldEntity, 
  MapChunkExpansion, 
  FarmOrder, 
  RoadsideSaleSlot, 
  MarketListing, 
  MarketDeliveryTruck,
  SeasonType, 
  WeatherType, 
  LevelConfig,
  FishSpecies,
  ProductionQueueItem,
  DailyMission,
  MarketToastNotification,
  HourlyWeatherForecast,
  DailyBonusDay,
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
import { 
  GAME_EVENTS, 
  GameEventConfig, 
  getCurrentRealSeason, 
  getRealCalendarMonthName, 
  SEASONS_INFO,
  getMoscowTime,
  getGlobalSeason,
  getGlobalWeather,
  getGlobalWeatherForSlot,
  WEATHER_SLOT_DURATION_MS
} from '../config/events';
import { VEHICLE_CONFIGS, VehicleModelId } from '../config/vehicles';
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

export const DAILY_REWARDS_SCHEDULE = [
  { day: 1, coins: 500, gems: 5, tool: undefined },
  { day: 2, coins: 800, gems: 6, tool: { id: 'plank', name: 'Доски', icon: '🪵', count: 2 } },
  { day: 3, coins: 1200, gems: 8, tool: { id: 'bolt', name: 'Болты', icon: '🔩', count: 2 } },
  { day: 4, coins: 1500, gems: 8, tool: { id: 'saw', name: 'Пилы', icon: '🪚', count: 2 } },
  { day: 5, coins: 2000, gems: 10, tool: { id: 'duct_tape', name: 'Скотч', icon: '🩹', count: 2 } },
  { day: 6, coins: 2500, gems: 10, tool: { id: 'axe', name: 'Топоры', icon: '🪓', count: 3 } },
  { day: 7, coins: 6000, gems: 20, tool: { id: 'fountain', name: 'Фонтан', icon: '⛲', count: 1 } },
  { day: 8, coins: 3000, gems: 10, tool: { id: 'wood_panel', name: 'Панели', icon: '🪵', count: 3 } },
  { day: 9, coins: 3500, gems: 12, tool: { id: 'screw', name: 'Шурупы', icon: '🪛', count: 3 } },
  { day: 10, coins: 4000, gems: 12, tool: { id: 'nail', name: 'Гвозди', icon: '🔩', count: 3 } },
  { day: 11, coins: 4500, gems: 15, tool: { id: 'saw', name: 'Пилы', icon: '🪚', count: 3 } },
  { day: 12, coins: 5000, gems: 15, tool: { id: 'plank', name: 'Доски', icon: '🪵', count: 4 } },
  { day: 13, coins: 5500, gems: 15, tool: { id: 'bolt', name: 'Болты', icon: '🔩', count: 4 } },
  { day: 14, coins: 12000, gems: 30, tool: { id: 'tnt', name: 'Динамит', icon: '🧨', count: 5 } },
  { day: 15, coins: 6000, gems: 15, tool: { id: 'land_deed', name: 'Купчие', icon: '📜', count: 2 } },
  { day: 16, coins: 6500, gems: 18, tool: { id: 'mallet', name: 'Молотки', icon: '🔨', count: 2 } },
  { day: 17, coins: 7000, gems: 18, tool: { id: 'marking_stake', name: 'Колышки', icon: '📍', count: 2 } },
  { day: 18, coins: 7500, gems: 20, tool: { id: 'duct_tape', name: 'Скотч', icon: '🩹', count: 4 } },
  { day: 19, coins: 8000, gems: 20, tool: { id: 'axe', name: 'Топоры', icon: '🪓', count: 4 } },
  { day: 20, coins: 8500, gems: 22, tool: { id: 'shovel', name: 'Лопаты', icon: '⛏️', count: 3 } },
  { day: 21, coins: 20000, gems: 40, tool: { id: 'golden_egg', name: 'Золотое яйцо', icon: '🥚', count: 3 } },
  { day: 22, coins: 9000, gems: 22, tool: { id: 'plank', name: 'Доски', icon: '🪵', count: 5 } },
  { day: 23, coins: 9500, gems: 25, tool: { id: 'bolt', name: 'Болты', icon: '🔩', count: 5 } },
  { day: 24, coins: 10000, gems: 25, tool: { id: 'saw', name: 'Пилы', icon: '🪚', count: 5 } },
  { day: 25, coins: 11000, gems: 25, tool: { id: 'wood_panel', name: 'Панели', icon: '🪵', count: 5 } },
  { day: 26, coins: 12000, gems: 28, tool: { id: 'tnt', name: 'Динамит', icon: '🧨', count: 6 } },
  { day: 27, coins: 13000, gems: 28, tool: { id: 'land_deed', name: 'Купчие', icon: '📜', count: 3 } },
  { day: 28, coins: 30000, gems: 50, tool: { id: 'golden_statue', name: 'Золотая статуя', icon: '🏆', count: 1 } },
  { day: 29, coins: 35000, gems: 60, tool: { id: 'tnt', name: 'Динамит', icon: '🧨', count: 10 } },
  { day: 30, coins: 75000, gems: 100, tool: { id: 'royal_pavilion', name: 'Королевский Павильон', icon: '👑', count: 1 } },
];

export function generateWeatherForecast(currentEvent: GameEventConfig): HourlyWeatherForecast[] {
  const { hours: currentHour } = getMoscowTime();
  const season = getGlobalSeason();
  const utcMs = Date.now() + (new Date().getTimezoneOffset() * 60000);
  const moscowMs = utcMs + (3 * 3600 * 1000);
  const currentSlotIndex = Math.floor(moscowMs / WEATHER_SLOT_DURATION_MS);

  const slots: HourlyWeatherForecast[] = [];

  for (let i = 0; i < 8; i++) {
    const targetHour = (currentHour + i * 3) % 24;
    const timeLabel = i === 0 ? 'Сейчас' : `${String(targetHour).padStart(2, '0')}:00`;

    if (i === 0) {
      const isRainy = currentEvent.type === 'rain' || currentEvent.type === 'thunderstorm';
      slots.push({
        timeLabel: 'Сейчас',
        weatherName: currentEvent.name,
        icon: currentEvent.icon,
        tempCelsius: season === 'winter' ? -4 : season === 'summer' ? 24 : 14,
        precipChancePercent: isRainy ? 85 : currentEvent.type === 'snow' ? 90 : 10,
        growthBonusLabel: currentEvent.bonusEffect || 'Стабильный рост',
        isCurrent: true,
      });
    } else {
      const futureSlot = currentSlotIndex + i * 36;
      const futureEvent = getGlobalWeatherForSlot(futureSlot, season);
      const isRainy = futureEvent.type === 'rain' || futureEvent.type === 'thunderstorm';
      const baseTemp = season === 'winter' ? -5 : season === 'summer' ? 22 : 12;
      const hourOffset = ((targetHour >= 11 && targetHour <= 17) ? 5 : 0) - ((targetHour >= 0 && targetHour <= 5) ? 4 : 0);

      slots.push({
        timeLabel,
        weatherName: futureEvent.name,
        icon: futureEvent.icon,
        tempCelsius: baseTemp + hourOffset,
        precipChancePercent: isRainy ? 85 : futureEvent.type === 'snow' ? 90 : Math.round(10 + (futureSlot % 20)),
        growthBonusLabel: futureEvent.bonusEffect || 'Стабильный рост',
      });
    }
  }

  return slots;
}

export function generateDailyMissions(): DailyMission[] {
  const easyPool: Array<Omit<DailyMission, 'id' | 'currentCount' | 'isClaimed'>> = [
    {
      tier: 'easy',
      tierLabel: 'Легко',
      tierColor: '#22C55E',
      title: 'Собрать пшеницу',
      description: 'Соберите 12 снопов спелой пшеницы на полях',
      icon: '🌾',
      targetCount: 12,
      type: 'harvest',
      targetId: 'wheat',
      rewardCoins: 250,
      rewardXP: 50,
    },
    {
      tier: 'easy',
      tierLabel: 'Легко',
      tierColor: '#22C55E',
      title: 'Покормить домашних кур',
      description: 'Покормите кур на птичьем дворе 4 раза',
      icon: '🐔',
      targetCount: 4,
      type: 'feed',
      targetId: 'chicken',
      rewardCoins: 300,
      rewardXP: 60,
    },
    {
      tier: 'easy',
      tierLabel: 'Легко',
      tierColor: '#22C55E',
      title: 'Собрать кукурузу',
      description: 'Соберите 8 початков золотой кукурузы',
      icon: '🌽',
      targetCount: 8,
      type: 'harvest',
      targetId: 'corn',
      rewardCoins: 280,
      rewardXP: 55,
    },
  ];

  const mediumPool: Array<Omit<DailyMission, 'id' | 'currentCount' | 'isClaimed'>> = [
    {
      tier: 'medium',
      tierLabel: 'Средне',
      tierColor: '#F59E0B',
      title: 'Испечь свежий хлеб',
      description: 'Приготовьте 5 буханок свежего хлеба в пекарне',
      icon: '🍞',
      targetCount: 5,
      type: 'craft',
      targetId: 'bread',
      rewardCoins: 650,
      rewardXP: 120,
      rewardGems: 2,
    },
    {
      tier: 'medium',
      tierLabel: 'Средне',
      tierColor: '#F59E0B',
      title: 'Собрать коровье молоко',
      description: 'Соберите 6 кувшинов молока в коровнике',
      icon: '🥛',
      targetCount: 6,
      type: 'craft',
      targetId: 'cow_milk',
      rewardCoins: 700,
      rewardXP: 130,
      rewardGems: 2,
    },
    {
      tier: 'medium',
      tierLabel: 'Средне',
      tierColor: '#F59E0B',
      title: 'Выполнить заказы с доски',
      description: 'Отправьте 3 заказа жителям Долины',
      icon: '📜',
      targetCount: 3,
      type: 'order',
      rewardCoins: 850,
      rewardXP: 150,
      rewardGems: 3,
    },
  ];

  const hardPool: Array<Omit<DailyMission, 'id' | 'currentCount' | 'isClaimed'>> = [
    {
      tier: 'hard',
      tierLabel: 'Очень тяжело',
      tierColor: '#EF4444',
      title: 'Продать товары на рынке',
      description: 'Выставите и продайте 15 товаров на рынке',
      icon: '💰',
      targetCount: 15,
      type: 'sell',
      rewardCoins: 2500,
      rewardXP: 350,
      rewardGems: 5,
    },
    {
      tier: 'hard',
      tierLabel: 'Очень тяжело',
      tierColor: '#EF4444',
      title: 'Взбить сливочное масло',
      description: 'Произведите 5 пачек масла на маслобойне',
      icon: '🧈',
      targetCount: 5,
      type: 'craft',
      targetId: 'butter',
      rewardCoins: 2800,
      rewardXP: 380,
      rewardGems: 6,
    },
    {
      tier: 'hard',
      tierLabel: 'Очень тяжело',
      tierColor: '#EF4444',
      title: 'Поймать рыбу на причале',
      description: 'Выловите 4 рыбы в бурной реке',
      icon: '🎣',
      targetCount: 4,
      type: 'fish',
      rewardCoins: 3200,
      rewardXP: 420,
      rewardGems: 8,
    },
  ];

  const pickEasy = easyPool[Math.floor(Math.random() * easyPool.length)];
  const pickMedium = mediumPool[Math.floor(Math.random() * mediumPool.length)];
  const pickHard = hardPool[Math.floor(Math.random() * hardPool.length)];

  return [
    { ...pickEasy, id: `mission_${Date.now()}_1`, currentCount: 0, isClaimed: false },
    { ...pickMedium, id: `mission_${Date.now()}_2`, currentCount: 0, isClaimed: false },
    { ...pickHard, id: `mission_${Date.now()}_3`, currentCount: 0, isClaimed: false },
  ];
}

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
  lastPlantedCropId: string;
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
  
  // Mailbox & Neighbor Deals
  mailboxDeals: MailboxDeal[];
  mailboxGiftClaimed: boolean;
  mailboxGiftClaimedAt: number;
  
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
  
  // Vehicles
  selectedVehicleModel: VehicleModelId;
  unlockedVehicleModels: VehicleModelId[];
  equipVehicle: (modelId: VehicleModelId) => void;
  unlockVehicle: (modelId: VehicleModelId) => boolean;

  // UI & Notifications
  activeModal: 'shop' | 'silo' | 'barn' | 'orders' | 'roadside' | 'market' | 'fishing' | 'events' | 'settings' | 'levelup' | 'expansion' | 'friends' | 'daily_bonus' | 'weather_forecast' | 'production' | 'garage' | null;
  selectedProductionEntityId: string | null;
  openProductionModal: (buildingEntityId: string) => void;
  openModal: (modal: 'shop' | 'silo' | 'barn' | 'orders' | 'roadside' | 'market' | 'fishing' | 'events' | 'settings' | 'levelup' | 'expansion' | 'friends' | 'daily_bonus' | 'weather_forecast' | 'production' | 'garage') => void;
  closeModal: () => void;
  unlockedLevelInfo: LevelConfig | null;
  floatingTexts: FloatingText[];
  soundMuted: boolean;
  isActionStripOpen: boolean;
  isDesign2026: boolean;
  showClouds: boolean;
  
  // Daily Login Bonus & Market Toasts
  dailyBonusStreak: number;
  lastDailyBonusClaimTime: number;
  marketNotifications: MarketToastNotification[];
  claimDailyLoginBonus: () => boolean;
  dismissMarketNotification: (id: string) => void;
  pushMarketNotification: (toast: Omit<MarketToastNotification, 'id' | 'timestamp'>) => void;
  
  // Daily Missions (3 tier missions per 24 hours)
  dailyMissions: DailyMission[];
  dailyMissionsExpiresAt: number;
  claimDailyMission: (missionId: string) => boolean;
  updateDailyMissionProgress: (type: DailyMission['type'], targetId?: string, amount?: number) => void;

  // Actions
  initGame: () => void;
  tickGameLoop: () => void;
  setSoundMuted: (muted: boolean) => void;
  toggleActionStrip: () => void;
  setActionStripOpen: (open: boolean) => void;
  toggleDesign2026: () => void;
  setDesign2026: (enabled: boolean) => void;
  toggleClouds: () => void;
  setShowClouds: (show: boolean) => void;
  openModal: (modal: GameStore['activeModal']) => void;
  closeModal: () => void;
  addFloatingText: (text: string, x: number, y: number, color?: string) => void;
  // Cargo Semi-Truck (Фура для бартера, обмена и посылок)
  cargoTruckState: {
    isParkedWaiting: boolean;
    isDrivingIn: boolean;
    isDrivingOut: boolean;
    driveStartTime: number;
    driveDuration: number;
    loot?: {
      dealTitle?: string;
      coins?: number;
      gems?: number;
      xp?: number;
      items?: Record<string, number>;
    };
  };
  claimCargoTruckUnload: () => boolean;
  
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
  isAreaAvailable: (x: number, z: number, width: number, depth: number, ignoreId?: string, configId?: string) => boolean;
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
  speedUpCrop: (fieldEntityId: string) => boolean;
  waterField: (fieldEntityId: string) => boolean;
  harvestTreeBush: (treeEntityId: string) => boolean;
  
  // Animal Actions
  feedAnimal: (penEntityId: string, animalId: string) => boolean;
  collectAnimalProduct: (penEntityId: string, animalId: string) => boolean;
  feedAllAnimalsInPen: (penEntityId: string) => boolean;
  collectAllAnimalProductsInPen: (penEntityId: string) => boolean;
  
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
  marketDelivery: MarketDeliveryTruck | null;
  buyFromMarket: (listingId: string, customCount?: number, sellerName?: string, sellerAvatar?: string, pricePerUnit?: number) => boolean;
  claimMarketDelivery: () => boolean;
  refreshMarket: () => void;
  
  // Fishing
  onCatchFish: (speciesId: string, weight: number) => void;
  
  // Intro & Tutorial
  introStage: 'story' | 'dispersing' | 'completed';
  setIntroStage: (stage: 'story' | 'dispersing' | 'completed') => void;
  advanceTutorial: (stepToComplete?: number) => void;
  skipTutorial: () => void;
  restartTutorial: () => void;
  
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
  lastPlantedCropId: 'wheat',
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
  marketDelivery: null,
  dailyMissions: generateDailyMissions(),
  dailyMissionsExpiresAt: Date.now() + 86400000,
  cargoTruckState: {
    isParkedWaiting: false,
    isDrivingIn: false,
    isDrivingOut: false,
    driveStartTime: 0,
    driveDuration: 4000,
  },
  
  activeSeason: getGlobalSeason(),
  activeEvent: getGlobalWeather().event,
  eventEndsAt: getGlobalWeather().endsAt,
  
  fishingStats: {
    fishCaughtCount: 0,
    biggestCatch: {},
  },
  
  introStage: 'completed',
  setIntroStage: (stage) => set({ introStage: stage }),
  tutorialStep: 1,
  tutorialCompleted: false,
  
  dailyBonusStreak: 1,
  lastDailyBonusClaimTime: 0,
  marketNotifications: [],

  // Vehicles
  selectedVehicleModel: 'classic_pickup',
  unlockedVehicleModels: ['classic_pickup'],
  equipVehicle: (modelId: VehicleModelId) => {
    set({ selectedVehicleModel: modelId });
  },
  unlockVehicle: (modelId: VehicleModelId) => {
    const state = get();
    const cfg = VEHICLE_CONFIGS[modelId];
    if (!cfg) return false;
    if (state.unlockedVehicleModels.includes(modelId)) {
      set({ selectedVehicleModel: modelId });
      return true;
    }

    if (state.level < cfg.unlockLevel) return false;
    if (cfg.costCoins > 0 && state.coins < cfg.costCoins) return false;
    if (cfg.costGems > 0 && state.gems < cfg.costGems) return false;

    set(s => ({
      coins: s.coins - cfg.costCoins,
      gems: s.gems - cfg.costGems,
      unlockedVehicleModels: [...s.unlockedVehicleModels, modelId],
      selectedVehicleModel: modelId,
    }));
    return true;
  },

  activeModal: null,
  selectedProductionEntityId: null,
  unlockedLevelInfo: null,
  floatingTexts: [],
  soundMuted: false,
  isActionStripOpen: false,
  toggleActionStrip: () => set(state => ({ isActionStripOpen: !state.isActionStripOpen })),
  setActionStripOpen: (open: boolean) => set({ isActionStripOpen: open }),
  isDesign2026: typeof localStorage !== 'undefined' ? localStorage.getItem('farm_design_2026') === 'true' : false,
  toggleDesign2026: () => set(state => {
    const next = !state.isDesign2026;
    try { localStorage.setItem('farm_design_2026', String(next)); } catch {}
    return { isDesign2026: next };
  }),
  setDesign2026: (enabled: boolean) => {
    try { localStorage.setItem('farm_design_2026', String(enabled)); } catch {}
    set({ isDesign2026: enabled });
  },
  showClouds: typeof localStorage !== 'undefined' ? localStorage.getItem('farm_show_clouds') !== 'false' : true,
  toggleClouds: () => set(state => {
    const next = !state.showClouds;
    try { localStorage.setItem('farm_show_clouds', String(next)); } catch {}
    return { showClouds: next };
  }),
  setShowClouds: (show: boolean) => {
    try { localStorage.setItem('farm_show_clouds', String(show)); } catch {}
    set({ showClouds: show });
  },

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
        expansions: (saved.expansions || INITIAL_MAP_EXPANSIONS).map(chunk => {
          if (chunk.id === 'chunk_center') {
            return {
              ...chunk,
              x: -21,
              z: -11,
              width: 29,
              depth: 23,
              isUnlocked: true,
            };
          }
          return chunk;
        }),
        orders: saved.orders && saved.orders.length > 0 ? saved.orders : generateRandomOrders(saved.level),
        truckState: truck,
        shopSlots: saved.shopSlots || INITIAL_SHOP_SLOTS,
        fishingStats: saved.fishingStats || { fishCaughtCount: 0, biggestCatch: {} },
        selectedVehicleModel: (saved.selectedVehicleModel as VehicleModelId) || 'classic_pickup',
        unlockedVehicleModels: (saved.unlockedVehicleModels as VehicleModelId[]) || ['classic_pickup'],
        tutorialStep: saved.tutorialStep || 1,
        tutorialCompleted: saved.tutorialCompleted ?? false,
        introStage: (saved.tutorialCompleted || (saved.tutorialStep && saved.tutorialStep > 1)) ? 'completed' : 'story',
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

    // Check cargo semi truck state
    const cargoState = state.cargoTruckState;
    if (cargoState.isDrivingIn && now >= cargoState.driveStartTime + cargoState.driveDuration) {
      set(s => ({
        cargoTruckState: {
          ...s.cargoTruckState,
          isDrivingIn: false,
          isParkedWaiting: true,
        },
      }));
      sounds.playLevelUp();
      state.addFloatingText('📦 Фура прибыла на заезд 1! Нажмите на фуру, чтобы разгрузить!', 0, 0, '#F59E0B');
    } else if (cargoState.isDrivingOut && now >= cargoState.driveStartTime + cargoState.driveDuration) {
      set(s => ({
        cargoTruckState: {
          ...s.cargoTruckState,
          isDrivingOut: false,
          isParkedWaiting: false,
        },
      }));
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

    // Check global season rotation across all players
    const currentGlobalSeason = getGlobalSeason(now);
    if (state.activeSeason !== currentGlobalSeason) {
      set({ activeSeason: currentGlobalSeason });
    }

    // Check synchronized global weather rotation
    const globalWeather = getGlobalWeather(now);
    if (state.activeEvent?.id !== globalWeather.event.id || now >= state.eventEndsAt) {
      const prevId = state.activeEvent?.id;
      set({
        activeEvent: globalWeather.event,
        eventEndsAt: globalWeather.endsAt,
      });
      if (prevId && prevId !== globalWeather.event.id) {
        state.addFloatingText(`Погода: ${globalWeather.event.name}`, 0, 0, globalWeather.event.color);
      }
    }

    // Check roadside shop slot sales simulation & send toast notifications
    const hasAdvertised = state.shopSlots.some(slot => slot.itemId && !slot.isSold && (slot.isAdvertised || slot.advertised));
    if (hasAdvertised && Math.random() < 0.05) {
      const unsoldSlots = state.shopSlots.filter(s => s.itemId && !s.isSold && (s.isAdvertised || s.advertised));
      if (unsoldSlots.length > 0) {
        const targetSlot = unsoldSlots[Math.floor(Math.random() * unsoldSlots.length)];
        const prod = PRODUCTS[targetSlot.itemId!];
        const prodName = prod?.name || targetSlot.itemId!;
        const prodIcon = prod?.icon || '📦';

        const newToast: MarketToastNotification = {
          id: `toast_${Date.now()}_${Math.random()}`,
          type: 'sale_success',
          title: '🎉 Куплен ваш товар на рынке!',
          message: `Игрок купил ${prodName} ×${targetSlot.count} шт. за ${targetSlot.price} 🪙! Заберите выручку в Лавке.`,
          icon: prodIcon,
          coins: targetSlot.price,
          timestamp: Date.now(),
        };

        sounds.playCoin();
        set(s => ({
          shopSlots: s.shopSlots.map(sl => sl.id === targetSlot.id ? { ...sl, isSold: true, soldAt: Date.now() } : sl),
          marketNotifications: [newToast, ...s.marketNotifications.slice(0, 3)],
        }));
      }
    }

    // Check 24-hour Daily Missions expiration
    if (now >= state.dailyMissionsExpiresAt) {
      set({
        dailyMissions: generateDailyMissions(),
        dailyMissionsExpiresAt: now + 86400000,
      });
      state.addFloatingText('🎯 Новые ежедневные миссии доступны!', 0, 0, '#38BDF8');
    }
  },

  claimDailyLoginBonus: () => {
    const state = get();
    const now = Date.now();
    const currentDayIdx = Math.max(0, Math.min(29, (state.dailyBonusStreak || 1) - 1));
    const reward = DAILY_REWARDS_SCHEDULE[currentDayIdx];

    state.addCoins(reward.coins);
    state.addGems(reward.gems);
    if (reward.tool) {
      state.addItem(reward.tool.id, reward.tool.count);
    }

    sounds.playLevelUp();
    confetti({ particleCount: 75, spread: 80, origin: { y: 0.55 } });
    state.addFloatingText(`🎁 Получен бонус Дня ${reward.day}: +${reward.coins} 🪙 +${reward.gems} ⚡!`, 0, 0, '#22C55E');

    const nextStreak = (state.dailyBonusStreak || 1) >= 30 ? 1 : (state.dailyBonusStreak || 1) + 1;
    set({
      lastDailyBonusClaimTime: now,
      dailyBonusStreak: nextStreak,
    });
    return true;
  },

  dismissMarketNotification: (id) => {
    set(s => ({
      marketNotifications: s.marketNotifications.filter(n => n.id !== id),
    }));
  },

  pushMarketNotification: (toast) => {
    const newToast: MarketToastNotification = {
      ...toast,
      id: `toast_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
    };
    set(s => ({
      marketNotifications: [newToast, ...s.marketNotifications.slice(0, 3)],
    }));
  },

  setSoundMuted: (muted) => {
    sounds.setMuted(muted);
    set({ soundMuted: muted });
  },

  openProductionModal: (buildingEntityId) => {
    sounds.playClick();
    set({
      selectedProductionEntityId: buildingEntityId,
      selectedEntityId: buildingEntityId,
      activeModal: 'production',
    });
  },

  openModal: (modal) => {
    sounds.playClick();
    set({ activeModal: modal });
  },

  closeModal: () => {
    sounds.playClick();
    set({ activeModal: null, selectedProductionEntityId: null });
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

  claimCargoTruckUnload: () => {
    const state = get();
    if (!state.cargoTruckState.isParkedWaiting) return false;

    const loot = state.cargoTruckState.loot;
    if (loot) {
      if (loot.coins) state.addCoins(loot.coins);
      if (loot.gems) state.addGems(loot.gems);
      if (loot.xp) state.addXP(loot.xp);
      if (loot.items) {
        Object.entries(loot.items).forEach(([itemId, count]) => {
          state.addItem(itemId, count);
        });
      }
    }

    sounds.playCoin();
    sounds.playLevelUp();
    confetti({ particleCount: 65, spread: 80, origin: { y: 0.55 } });
    state.addFloatingText('📦 Фура выгружена! Товары получены ✨', 0, 0, '#22C55E');

    set(s => ({
      cargoTruckState: {
        ...s.cargoTruckState,
        isParkedWaiting: false,
        isDrivingIn: false,
        isDrivingOut: true,
        driveStartTime: Date.now(),
        driveDuration: 4500,
        loot: undefined,
      },
    }));
    return true;
  },

  updateDailyMissionProgress: (type, targetId, amount = 1) => {
    set(state => {
      let changed = false;
      const updated = state.dailyMissions.map(m => {
        if (m.isClaimed) return m;
        if (m.type === type) {
          if (!m.targetId || !targetId || m.targetId === targetId) {
            const newCount = Math.min(m.targetCount, m.currentCount + amount);
            if (newCount !== m.currentCount) {
              changed = true;
              if (newCount >= m.targetCount && m.currentCount < m.targetCount) {
                state.addFloatingText(`🎯 Миссия выполнена: ${m.title}!`, 0, 0, '#22C55E');
              }
              return { ...m, currentCount: newCount };
            }
          }
        }
        return m;
      });
      return changed ? { dailyMissions: updated } : {};
    });
  },

  claimDailyMission: (missionId) => {
    const state = get();
    const mission = state.dailyMissions.find(m => m.id === missionId);
    if (!mission || mission.isClaimed || mission.currentCount < mission.targetCount) {
      return false;
    }

    state.addCoins(mission.rewardCoins);
    state.addXP(mission.rewardXP);
    if (mission.rewardGems) {
      state.addGems(mission.rewardGems);
    }

    sounds.playLevelUp();
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.55 } });
    state.addFloatingText(`🎯 Награда за миссию: +${mission.rewardCoins} 🪙 +${mission.rewardXP} XP!`, 0, 0, '#22C55E');

    set(s => ({
      dailyMissions: s.dailyMissions.map(m => m.id === missionId ? { ...m, isClaimed: true } : m),
    }));
    return true;
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

  isAreaAvailable: (x, z, width, depth, ignoreId, configId) => {
    const entities = get().entities;

    // 1. Collision with any existing entity (buildings, crops, trees, obstacles, animal pens, decorations)
    for (const ent of entities) {
      if (ent.id === ignoreId) continue;
      const overlapX = x < ent.x + ent.width && x + width > ent.x;
      const overlapZ = z < ent.z + ent.depth && z + depth > ent.z;
      if (overlapX && overlapZ) {
        return false;
      }
    }

    // 2. Allow fishing dock on the river bank
    if (configId === 'fishing_dock') {
      return true;
    }

    // 3. Prohibit placing directly ON the Main Road or Bridge (x in [-8.5, 24.0], z in [-11.0, -7.2])
    const overlapMainRoad = (x + width > -8.5 && x < 24.0) && (z < -7.2 && z + depth > -11.0);
    if (overlapMainRoad) {
      return false;
    }

    // 4. Prohibit placing directly on Driveway 1 path (x in [-7.8, -4.8], z in [-7.2, -2.0])
    const overlapDriveway1 = (x < -4.8 && x + width > -7.8) && (z < -2.0 && z + depth > -7.2);
    if (overlapDriveway1) {
      return false;
    }

    // 5. Prohibit placing directly on Driveway 2 path (x in [2.0, 4.2], z in [-7.2, -2.5])
    const overlapDriveway2 = (x < 4.2 && x + width > 2.0) && (z < -2.5 && z + depth > -7.2);
    if (overlapDriveway2) {
      return false;
    }

    // 6. Prohibit placing on the boundary wooden fences
    // North fence: z around -11.7 (x from -24 to -10)
    if (z < -10.8 && (x < -9.5)) return false;
    // West fence: x around -22.0 (z from -12 to 12)
    if (x < -20.6) return false;
    // South fence: z around 12.5 (x from -24 to 9)
    if (z + depth > 11.8) return false;
    // East river bank: x around 8.5
    if (x + width > 8.2) return false;

    // 7. Prohibit placing directly on Expansion For-Sale Signs
    const signs = [
      { minX: -16.0, maxX: -13.0, minZ: -16.5, maxZ: -13.5 },
      { minX: -14.0, maxX: -10.0, minZ: 13.0, maxZ: 16.5 },
      { minX: -27.5, maxX: -24.0, minZ: -1.5, maxZ: 1.5 },
      { minX: 13.5, maxX: 17.0, minZ: -1.5, maxZ: 1.5 },
    ];
    for (const sign of signs) {
      if (x < sign.maxX && x + width > sign.minX && z < sign.maxZ && z + depth > sign.minZ) {
        return false;
      }
    }

    // 8. Prohibit placing directly on Scenery Trees & Pinetrees
    const sceneryTrees = [
      [-30, -25], [-27, -19], [-22, -26], [-17, -22], [-11, -25], [-5, -21],
      [3, -24], [8, -20], [24, -28], [28, -23], [32, -26], [-14, -28], [1, -28],
      [-28, 22], [-25, 27], [-20, 18], [-16, 26], [-10, 20], [-4, 25],
      [2, 19], [7, 26], [24, 18], [28, 26], [32, 22], [-22, 29], [0, 28],
      [-31, -14], [-28, -6], [-32, 2], [-27, 9], [-31, 15], [-29, -1], [-33, 7], [-30, 20],
      [26, -16], [30, -10], [26, 2], [31, 8], [26, 14], [30, 20], [32, 1],
      [8.4, -20], [8.2, 17], [8.5, 23],
      [-32, -28], [-25, -29], [-19, -27], [-7, -29], [6, -29], [25, -24], [31, -29],
      [-29, -21], [-13, -23], [27, -19], [33, -14], [-33, 11], [-30, 25],
      [25, 24], [31, 28], [27, -5], [33, 16], [-21, 24], [5, 27], [-9, 28]
    ];
    for (const [tx, tz] of sceneryTrees) {
      const closestX = Math.max(x, Math.min(tx, x + width));
      const closestZ = Math.max(z, Math.min(tz, z + depth));
      const dX = tx - closestX;
      const dZ = tz - closestZ;
      if (dX * dX + dZ * dZ < 1.44) {
        return false;
      }
    }

    // 9. Prohibit placing inside the river water channel (x in [10.2, 21.8])
    const overlapRiver = x < 21.8 && x + width > 10.2;
    if (overlapRiver) {
      return false;
    }

    return true;
  },

  isAreaInsideUnlockedTerritory: (x, z, width, depth) => {
    const expansions = get().expansions.filter(e => e.isUnlocked);
    
    // Check points across the entire bounding box
    const step = 0.5;
    for (let ix = x + 0.05; ix < x + width; ix += step) {
      for (let iz = z + 0.05; iz < z + depth; iz += step) {
        const isInside = expansions.some(chunk => 
          ix >= chunk.x && ix <= chunk.x + chunk.width &&
          iz >= chunk.z && iz <= chunk.z + chunk.depth
        );
        if (!isInside) return false;
      }
    }
    const corners = [
      [x + 0.05, z + 0.05],
      [x + width - 0.05, z + 0.05],
      [x + 0.05, z + depth - 0.05],
      [x + width - 0.05, z + depth - 0.05],
    ];
    for (const [cx, cz] of corners) {
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

    if (!state.isAreaAvailable(x, z, width, depth, undefined, configId)) {
      state.addFloatingText('Здесь нельзя ставить объект! 🚫', 0, 0, '#EF4444');
      return false;
    }

    if (!state.isAreaInsideUnlockedTerritory(x, z, width, depth)) {
      state.addFloatingText('Земля ещё не открыта или это горы! ⛰️', 0, 0, '#EF4444');
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

    if (!state.isAreaAvailable(x, z, width, depth, id, ent.configId)) {
      state.addFloatingText('Здесь нельзя ставить объект! 🚫', 0, 0, '#EF4444');
      return false;
    }

    if (!state.isAreaInsideUnlockedTerritory(x, z, width, depth)) {
      state.addFloatingText('Земля ещё не открыта или это горы! ⛰️', 0, 0, '#EF4444');
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
      lastPlantedCropId: cropId,
      entities: s.entities.map(e => 
        e.id === fieldEntityId 
          ? { ...e, cropId, plantedAt: Date.now() }
          : e
      ),
    }));

    state.addFloatingText(`Посажено: ${crop.name}`, 0, 0, crop.color);

    if (state.tutorialStep === 2) {
      state.advanceTutorial(2);
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
    state.updateDailyMissionProgress('harvest', crop.id, crop.harvestYield);
    sounds.playHarvest();

    set(s => ({
      entities: s.entities.map(e => 
        e.id === fieldEntityId 
          ? { ...e, cropId: null, plantedAt: undefined }
          : e
      ),
    }));

    state.addFloatingText(`+${crop.harvestYield} ${crop.icon} (+${crop.xpGain} XP)`, 0, 0, '#22C55E');

    if (state.tutorialStep === 1) {
      state.advanceTutorial(1);
    }

    return true;
  },

  speedUpCrop: (fieldEntityId) => {
    const state = get();
    const field = state.entities.find(e => e.id === fieldEntityId && e.type === 'field');
    if (!field || !field.cropId || !field.plantedAt) return false;

    if (state.gems < 1) {
      state.addFloatingText('Не хватает алмазов! 💎', 0, 0, '#EF4444');
      return false;
    }

    const crop = CROPS[field.cropId];
    if (!crop) return false;

    const growMs = crop.growTimeSeconds * 1000;
    set(s => ({
      gems: s.gems - 1,
      entities: s.entities.map(e =>
        e.id === fieldEntityId
          ? { ...e, plantedAt: Date.now() - (growMs + 1000) }
          : e
      ),
    }));

    sounds.playLevelUp();
    state.addFloatingText(`⚡ ${crop.name} созрела моментально!`, 0, 0, '#38BDF8');
    return true;
  },

  waterField: (fieldEntityId) => {
    const state = get();
    const field = state.entities.find(e => e.id === fieldEntityId && e.type === 'field');
    if (!field || !field.cropId || !field.plantedAt) return false;

    const crop = CROPS[field.cropId];
    const growMs = crop ? crop.growTimeSeconds * 1000 : 10000;
    const bonusTime = growMs * 0.35;

    set(s => ({
      entities: s.entities.map(e =>
        e.id === fieldEntityId
          ? { ...e, plantedAt: (e.plantedAt || Date.now()) - bonusTime }
          : e
      ),
    }));

    sounds.playCraftStart();
    state.addFloatingText('💧 Грядка полита! (+35% к созреванию)', 0, 0, '#38BDF8');
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
    state.updateDailyMissionProgress('harvest', cfg.produceItemId, cfg.harvestYield);
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
    state.updateDailyMissionProgress('feed', animal.animalConfigId, 1);
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
    if (state.tutorialStep === 3) {
      state.advanceTutorial(3);
    }
    return true;
  },

  feedAllAnimalsInPen: (penEntityId) => {
    const state = get();
    const pen = state.entities.find(e => e.id === penEntityId && e.type === 'animal_pen');
    if (!pen || !pen.animals) return false;

    const hungryAnimals = pen.animals.filter(a => a.isHungry);
    if (hungryAnimals.length === 0) {
      state.addFloatingText('Все животные уже сыты!', 0, 0, '#F59E0B');
      return false;
    }

    let fedCount = 0;
    for (const animal of hungryAnimals) {
      if (state.feedAnimal(penEntityId, animal.id)) {
        fedCount++;
      }
    }
    return fedCount > 0;
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
    state.updateDailyMissionProgress('craft', cfg.produceItemId, 1);
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
    if (state.tutorialStep === 4) {
      state.advanceTutorial(4);
    }
    return true;
  },

  collectAllAnimalProductsInPen: (penEntityId) => {
    const state = get();
    const pen = state.entities.find(e => e.id === penEntityId && e.type === 'animal_pen');
    if (!pen || !pen.animals) return false;

    const readyAnimals = pen.animals.filter(a => a.hasProduct);
    if (readyAnimals.length === 0) {
      state.addFloatingText('Продукция ещё зреет...', 0, 0, '#F59E0B');
      return false;
    }

    let collectedCount = 0;
    for (const animal of readyAnimals) {
      if (state.collectAnimalProduct(penEntityId, animal.id)) {
        collectedCount++;
      }
    }
    return collectedCount > 0;
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

    if (state.tutorialStep === 5) {
      state.advanceTutorial(5);
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
    state.updateDailyMissionProgress('craft', product.itemId, product.count);
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
    state.updateDailyMissionProgress('order', undefined, 1);

    const vCfg = VEHICLE_CONFIGS[state.selectedVehicleModel] || VEHICLE_CONFIGS.classic_pickup;
    const coinBonusMult = 1 + (vCfg.bonusCoinPercent || 0) / 100;
    const xpBonusMult = 1 + (vCfg.bonusXpPercent || 0) / 100;
    const modifiedOrder: FarmOrder = {
      ...order,
      coinReward: Math.round(order.coinReward * coinBonusMult),
      xpReward: Math.round(order.xpReward * xpBonusMult),
    };
    const deliveryDurationMs = Math.round(8000 / (vCfg.speedMultiplier || 1.0));

    set({
      truckState: {
        isDelivering: true,
        deliveringUntil: Date.now() + deliveryDurationMs,
        deliveredOrder: modifiedOrder,
      },
      activeModal: null,
    });

    state.addFloatingText('Грузовик уехал доставлять заказ!', 0, 0, '#38BDF8');

    if (state.tutorialStep === 6) {
      state.advanceTutorial(6);
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
    state.updateDailyMissionProgress('sell', undefined, count);
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

  buyFromMarket: (listingId: string, customCount?: number, sellerName?: string, sellerAvatar?: string, pricePerUnit?: number) => {
    const state = get();
    if (state.marketDelivery) {
      state.addFloatingText('К вам уже едет машина с товаром! Разгрузите её.', 0, 0, '#EF4444');
      return false;
    }

    const listing = state.marketListings.find(l => l.id === listingId);
    const count = customCount || listing?.count || 1;
    const unitPrice = pricePerUnit || (listing ? Math.round(listing.price / listing.count) : 10);
    const totalPrice = count * unitPrice;
    const seller = sellerName || listing?.sellerName || '@valley_trader';
    const avatar = sellerAvatar || listing?.sellerAvatar || '👨‍🌾';
    const itemId = listing?.itemId || 'wheat';

    if (state.coins < totalPrice) {
      state.addFloatingText('Не хватает монет!', 0, 0, '#EF4444');
      return false;
    }

    // Deduct coins
    set(s => ({ coins: s.coins - totalPrice }));
    sounds.playCoin();

    // Mark listing as sold or reduce
    if (listing) {
      set(s => ({
        marketListings: s.marketListings.map(l => l.id === listingId ? { ...l, sold: true } : l),
      }));
    }

    // Dispatch seller's delivery vehicle (6.5s travel time)
    const travelTime = 6500;
    set(s => ({
      marketDelivery: {
        id: `del_${Date.now()}`,
        sellerName: seller,
        sellerAvatar: avatar,
        itemId,
        count,
        totalPrice,
        orderedAt: Date.now(),
        arrivedAt: Date.now() + travelTime,
        isArrived: false,
      },
      cargoTruckState: {
        ...s.cargoTruckState,
        isDrivingOut: false,
        isDrivingIn: false,
        isParkedWaiting: false,
      }
    }));

    sounds.playTruckHonk();
    state.addFloatingText(`🚚 Фура ${seller} выехала к вашей ферме!`, 0, 0, '#38BDF8');
    return true;
  },

  claimMarketDelivery: () => {
    const state = get();
    const delivery = state.marketDelivery;
    if (!delivery) return false;

    const prod = PRODUCTS[delivery.itemId];
    const itemName = prod?.name || delivery.itemId;

    if (!state.canAddItem(delivery.itemId, delivery.count)) {
      state.addFloatingText('Склад полон! Освободите место.', 0, 0, '#EF4444');
      return false;
    }

    state.addItem(delivery.itemId, delivery.count);
    sounds.playTruckHonk();
    sounds.playLevelUp();
    confetti({ particleCount: 65, spread: 75, origin: { y: 0.55 } });

    // Smooth departure: reverses onto the road, turns east and drives across the bridge into mountain tunnel
    set(s => ({
      marketDelivery: null,
      cargoTruckState: {
        ...s.cargoTruckState,
        isParkedWaiting: false,
        isDrivingIn: false,
        isDrivingOut: true,
        driveStartTime: Date.now(),
        driveDuration: 4800,
        loot: undefined,
      },
    }));

    state.addFloatingText(`📦 Разгружено: +${delivery.count} ${itemName}! Фура уехала в город 🚚`, 0, 0, '#22C55E');
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
    state.updateDailyMissionProgress('fish', speciesId, 1);
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
    if (next > 6) {
      set({ tutorialStep: 7, tutorialCompleted: true, introStage: 'completed' });
      sounds.playLevelUp();
      confetti({ particleCount: 150, spread: 90 });
      state.addFloatingText('🎉 Обучение завершено! +500 🪙 +25 💎 ✨', 0, 0, '#22C55E');
      state.addCoins(500);
      state.addGems(25);
      state.addXP(150);
    } else {
      set({ tutorialStep: next });
      sounds.playLevelUp();
      confetti({ particleCount: 35, spread: 60 });
    }
  },

  skipTutorial: () => {
    set({ tutorialStep: 7, tutorialCompleted: true, introStage: 'completed' });
    sounds.playClick();
  },

  restartTutorial: () => {
    set({ tutorialStep: 1, tutorialCompleted: false, introStage: 'completed' });
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
      selectedVehicleModel: s.selectedVehicleModel,
      unlockedVehicleModels: s.unlockedVehicleModels,
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

if (typeof window !== 'undefined') {
  (window as any).__FARM_STORE__ = useGameStore;
}
