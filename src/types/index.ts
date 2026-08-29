// Core Game Types

export type GridPosition = {
  x: number;
  z: number;
};

export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';

export type WeatherType = 'sunny' | 'windy' | 'rain' | 'thunderstorm' | 'snow' | 'fog' | 'rainbow' | 'meteor_shower' | 'butterflies';

export type StorageType = 'silo' | 'barn';

export type ItemCategory = 
  | 'crop' 
  | 'fruit'
  | 'animal_product' 
  | 'feed' 
  | 'processed' 
  | 'dish' 
  | 'fish' 
  | 'tool' 
  | 'material';

export interface GameItem {
  id: string;
  name: string;
  category: ItemCategory;
  storage: StorageType;
  basePrice: number;
  xpGain: number;
  icon: string;
  description: string;
  unlockLevel: number;
  color: string;
}

export interface CropConfig {
  id: string;
  name: string;
  growTimeSeconds: number;
  cost: number;
  harvestYield: number;
  xpGain: number;
  unlockLevel: number;
  icon: string;
  color: string;
  description: string;
}

export interface TreeBushConfig {
  id: string;
  name: string;
  isTree: boolean;
  produceItemId: string;
  growTimeSeconds: number;
  cost: number;
  maxHarvests: number;
  harvestYield: number;
  xpGain: number;
  unlockLevel: number;
  icon: string;
  color: string;
}

export interface RecipeConfig {
  id: string;
  buildingId: string;
  name: string;
  outputItemId: string;
  outputCount: number;
  craftTimeSeconds: number;
  ingredients: { itemId: string; count: number }[];
  unlockLevel: number;
  xpGain: number;
}

export interface BuildingConfig {
  id: string;
  name: string;
  category: 'production' | 'storage' | 'animal_pen' | 'special';
  cost: number;
  buildTimeSeconds: number;
  width: number;
  depth: number;
  unlockLevel: number;
  icon: string;
  description: string;
  maxQueueSlots?: number;
  associatedAnimalId?: string;
  maxAnimals?: number;
}

export interface AnimalConfig {
  id: string;
  name: string;
  penBuildingId: string;
  feedItemId: string;
  produceItemId: string;
  produceTimeSeconds: number;
  cost: number;
  xpGain: number;
  unlockLevel: number;
  icon: string;
  color: string;
}

export interface DecorationConfig {
  id: string;
  name: string;
  category: 'fence' | 'path' | 'flower' | 'tree' | 'lighting' | 'statue' | 'water' | 'furniture' | 'seasonal';
  cost: number;
  gemsCost?: number;
  width: number;
  depth: number;
  unlockLevel: number;
  icon: string;
  color: string;
}

export interface ObstacleConfig {
  id: string;
  name: string;
  toolRequired: string;
  width: number;
  depth: number;
  xpReward: number;
  dropItemId?: string;
  color: string;
}

export interface LevelConfig {
  level: number;
  xpRequired: number;
  coinReward: number;
  gemReward: number;
  unlocks: {
    crops?: string[];
    buildings?: string[];
    animals?: string[];
    recipes?: string[];
    decorations?: string[];
    features?: string[];
  };
}

export interface OrderItem {
  itemId: string;
  count: number;
}

export interface FarmOrder {
  id: string;
  customerName: string;
  customerAvatar: string;
  items: OrderItem[];
  coinReward: number;
  xpReward: number;
  expiresAt?: number;
}

export interface RoadsideSaleSlot {
  id: string;
  itemId: string | null;
  count: number;
  price: number;
  isSold: boolean;
  advertised: boolean;
}

export interface MarketListing {
  id: string;
  sellerName: string;
  sellerAvatar: string;
  itemId: string;
  count: number;
  price: number;
  sold: boolean;
}

export interface FishSpecies {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  weightMin: number;
  weightMax: number;
  sellPrice: number;
  xpGain: number;
  icon: string;
  color: string;
}

// Placed entities in the world
export type EntityType = 'field' | 'production' | 'animal_pen' | 'fruit_tree' | 'obstacle' | 'decoration' | 'special';

export interface WorldEntity {
  id: string;
  type: EntityType;
  configId: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  rotation: 0 | 1 | 2 | 3; // in 90 deg steps
  
  // Field state
  cropId?: string | null;
  plantedAt?: number;
  
  // Fruit Tree / Bush state
  harvestsLeft?: number;
  treePlantedAt?: number;
  isDead?: boolean;

  // Production state
  productionQueue?: { recipeId: string; startedAt: number; duration: number }[];
  completedProducts?: { itemId: string; count: number }[];
  
  // Animal pen state
  animals?: {
    id: string;
    animalConfigId: string;
    isHungry: boolean;
    fedAt?: number;
    hasProduct: boolean;
    animState: 'idle' | 'walk' | 'eat' | 'sleep';
    posX: number;
    posZ: number;
  }[];

  // Obstacle state
  obstacleCleared?: boolean;

  // Construction state
  isBuilding?: boolean;
  buildStartedAt?: number;
  buildDuration?: number;
}

export interface MapChunkExpansion {
  id: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  isUnlocked: boolean;
  costCoins: number;
  costDeeds: number;
  costMallets: number;
  costStakes: number;
  unlockLevel: number;
}

export interface TutorialStep {
  id: number;
  title: string;
  instruction: string;
  targetUI?: string;
  targetAction?: string;
  targetConfigId?: string;
}
