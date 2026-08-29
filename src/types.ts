export type EntityType = 
  | 'field' 
  | 'production' 
  | 'animal_pen' 
  | 'fruit_tree' 
  | 'obstacle' 
  | 'decoration' 
  | 'storage'
  | 'special';

export interface ProductionQueueItem {
  id?: string;
  recipeId: string;
  startedAt: number;
  durationSeconds?: number;
  duration?: number;
}

export interface AnimalInstance {
  id: string;
  animalConfigId?: string;
  fedAt?: number | null;
  isHungry: boolean;
  hasProduct: boolean;
  readyAt?: number | null;
  posX?: number;
  posZ?: number;
  animState?: string;
  positionOffset?: { x: number; z: number };
}

export interface WorldEntity {
  id: string;
  type: EntityType;
  configId: string;
  gridX?: number;
  gridZ?: number;
  x?: number;
  z?: number;
  width?: number;
  depth?: number;
  rotation: number;
  
  // Field specific
  cropId?: string | null;
  plantedAt?: number;
  isRipe?: boolean;
  growthStage?: number; // 0..3

  // Production specific
  productionQueue?: ProductionQueueItem[];
  completedProducts?: { itemId: string; count: number }[];

  // Animal pen specific
  animals?: AnimalInstance[];

  // Fruit tree specific
  harvestsLeft?: number;
  fruitGrownAt?: number;
  hasFruit?: boolean;
  treePlantedAt?: number;
  isDead?: boolean;
}

export interface MapChunkExpansion {
  id: string;
  gridX?: number;
  gridZ?: number;
  x?: number;
  z?: number;
  width: number;
  depth: number;
  isUnlocked: boolean;
  costCoins: number;
  reqLevel?: number;
  unlockLevel?: number;
  requiredLandDeeds?: number;
  requiredMallets?: number;
  requiredMarkingStakes?: number;
  costDeeds?: number;
  costMallets?: number;
  costStakes?: number;
}

export interface FarmOrder {
  id: string;
  customerName: string;
  customerAvatar: string;
  items: { itemId: string; count: number }[];
  coinReward: number;
  xpReward: number;
  expiresAt?: number;
}

export interface RoadsideSaleSlot {
  id: string;
  itemId: string | null;
  count: number;
  price: number;
  isAdvertised?: boolean;
  advertised?: boolean;
  isSold: boolean;
  soldAt?: number | null;
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

export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';
export type WeatherType = 
  | 'sunny' 
  | 'rain' 
  | 'snow' 
  | 'rainbow' 
  | 'blossom' 
  | 'thunderstorm' 
  | 'festival' 
  | 'butterflies' 
  | 'meteor_shower' 
  | 'fog'
  | string;

export interface LevelConfig {
  level: number;
  xpRequired: number;
  coinReward: number;
  gemReward: number;
  unlocks: {
    crops: string[];
    buildings: string[];
    animals: string[];
    recipes: string[];
    features: string[];
    decorations?: string[];
  };
}

export interface FishSpecies {
  id: string;
  name: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  weightMin: number;
  weightMax: number;
  sellPrice: number;
  xpGain: number;
  description: string;
  color?: string;
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
  width?: number;
  depth?: number;
}

export interface BuildingConfig {
  id: string;
  name: string;
  category: 'production' | 'storage' | 'animal_pen' | 'special';
  cost: number;
  gemsCost?: number;
  buildTimeSeconds: number;
  unlockLevel: number;
  width: number;
  depth: number;
  icon: string;
  color?: string;
  maxQueueSlots?: number;
  associatedAnimalId?: string;
  maxAnimals?: number;
  capacity?: number;
  description?: string;
}

export interface DecorationConfig {
  id: string;
  name: string;
  category: 'fence' | 'path' | 'nature' | 'statue' | 'lighting' | 'water' | 'flower' | 'furniture' | string;
  cost: number;
  gemsCost?: number;
  unlockLevel: number;
  width: number;
  depth: number;
  icon: string;
  color: string;
}

export interface ProductConfig {
  id: string;
  name: string;
  category: 'crop' | 'animal' | 'bakery' | 'dairy' | 'feed' | 'sugar' | 'grill' | 'sauce' | 'candy' | 'loom' | 'tailor' | 'pie' | 'jam' | 'juice' | 'soup' | 'coffee' | 'fish' | 'material' | 'tool' | 'processed' | 'dish' | string;
  storage: 'silo' | 'barn';
  basePrice: number;
  unlockLevel: number;
  icon: string;
  xpGain?: number;
  description?: string;
  color?: string;
}

export type GameItem = ProductConfig;

export interface RecipeConfig {
  id: string;
  name: string;
  buildingId: string;
  craftTimeSeconds: number;
  xpGain: number;
  unlockLevel: number;
  ingredients: { itemId: string; count: number }[];
  outputItemId: string;
  outputCount: number;
}

export interface AnimalConfig {
  id: string;
  name: string;
  penBuildingId: string;
  cost: number;
  unlockLevel: number;
  feedItemId: string;
  productItemId?: string;
  produceItemId?: string;
  produceTimeSeconds: number;
  xpGain: number;
  icon: string;
  color: string;
}

export interface ObstacleConfig {
  id: string;
  name: string;
  type?: 'tree' | 'rock' | 'swamp' | 'pond' | string;
  width: number;
  depth: number;
  requiredTool?: string;
  toolRequired?: string;
  requiredToolCount?: number;
  clearingTimeSeconds?: number;
  xpReward: number;
  dropItemId?: string;
  droppedItems?: { itemId: string; count: number }[];
  icon?: string;
  color: string;
}

export type TutorialStep = number;

export interface MailboxDeal {
  id: string;
  senderName: string;
  senderAvatar: string;
  letterTitle: string;
  letterMessage: string;
  requiredItemId: string;
  requiredCount: number;
  rewardItemId?: string;
  rewardCount?: number;
  rewardCoins?: number;
  rewardXP?: number;
  isCompleted: boolean;
  expiresAt: number;
}
