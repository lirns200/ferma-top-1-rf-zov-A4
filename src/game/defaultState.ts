import { 
  WorldEntity, 
  MapChunkExpansion, 
  FarmOrder, 
  RoadsideSaleSlot, 
  MarketListing 
} from '../types';
import { CROPS } from '../config/crops';
import { PRODUCTS } from '../config/products';

export const INITIAL_MAP_EXPANSIONS: MapChunkExpansion[] = [
  // Center main farm territory (Unlocked by default) - 30x30 tiles centered at (-15 to 15)
  {
    id: 'chunk_center',
    x: -12,
    z: -12,
    width: 24,
    depth: 24,
    isUnlocked: true,
    costCoins: 0,
    costDeeds: 0,
    costMallets: 0,
    costStakes: 0,
    unlockLevel: 1,
  },
  // Expansion North
  {
    id: 'chunk_north',
    x: -12,
    z: -24,
    width: 24,
    depth: 12,
    isUnlocked: false,
    costCoins: 350,
    costDeeds: 1,
    costMallets: 1,
    costStakes: 1,
    unlockLevel: 8,
  },
  // Expansion South
  {
    id: 'chunk_south',
    x: -12,
    z: 12,
    width: 24,
    depth: 12,
    isUnlocked: false,
    costCoins: 500,
    costDeeds: 2,
    costMallets: 2,
    costStakes: 2,
    unlockLevel: 10,
  },
  // Expansion East (Near Fishing River)
  {
    id: 'chunk_east',
    x: 12,
    z: -12,
    width: 12,
    depth: 24,
    isUnlocked: false,
    costCoins: 750,
    costDeeds: 3,
    costMallets: 3,
    costStakes: 3,
    unlockLevel: 12,
  },
  // Expansion West
  {
    id: 'chunk_west',
    x: -24,
    z: -12,
    width: 12,
    depth: 24,
    isUnlocked: false,
    costCoins: 1000,
    costDeeds: 4,
    costMallets: 4,
    costStakes: 4,
    unlockLevel: 15,
  },
];

export const INITIAL_ENTITIES: WorldEntity[] = [
  // Special Core Buildings
  {
    id: 'ent_farmhouse',
    type: 'special',
    configId: 'farmhouse',
    x: -5,
    z: -6,
    width: 3,
    depth: 3,
    rotation: 0,
  },
  {
    id: 'ent_silo',
    type: 'storage',
    configId: 'silo',
    x: -9,
    z: -6,
    width: 2,
    depth: 2,
    rotation: 0,
  },
  {
    id: 'ent_barn',
    type: 'storage',
    configId: 'barn',
    x: -9,
    z: -3,
    width: 3,
    depth: 3,
    rotation: 0,
  },
  {
    id: 'ent_order_board',
    type: 'special',
    configId: 'order_board',
    x: -1,
    z: -6,
    width: 2,
    depth: 1,
    rotation: 0,
  },
  {
    id: 'ent_roadside_shop',
    type: 'special',
    configId: 'roadside_shop',
    x: -1,
    z: -9,
    width: 2,
    depth: 2,
    rotation: 0,
  },
  {
    id: 'ent_fishing_dock',
    type: 'special',
    configId: 'fishing_dock',
    x: 8,
    z: -7,
    width: 3,
    depth: 2,
    rotation: 0,
  },

  // Starter Production
  {
    id: 'ent_feed_mill',
    type: 'production',
    configId: 'feed_mill',
    x: -5,
    z: -2,
    width: 2,
    depth: 2,
    rotation: 0,
    productionQueue: [],
    completedProducts: [],
  },
  {
    id: 'ent_bakery',
    type: 'production',
    configId: 'bakery',
    x: -2,
    z: -2,
    width: 2,
    depth: 2,
    rotation: 0,
    productionQueue: [],
    completedProducts: [],
  },

  // Starter Chicken Coop with 3 Chickens
  {
    id: 'ent_chicken_coop',
    type: 'animal_pen',
    configId: 'chicken_coop',
    x: -8,
    z: 2,
    width: 3,
    depth: 3,
    rotation: 0,
    animals: [
      {
        id: 'chk_1',
        animalConfigId: 'chicken',
        isHungry: true,
        hasProduct: false,
        animState: 'idle',
        posX: 0.5,
        posZ: 0.5,
      },
      {
        id: 'chk_2',
        animalConfigId: 'chicken',
        isHungry: true,
        hasProduct: false,
        animState: 'walk',
        posX: 1.8,
        posZ: 1.2,
      },
      {
        id: 'chk_3',
        animalConfigId: 'chicken',
        isHungry: true,
        hasProduct: false,
        animState: 'idle',
        posX: 1.0,
        posZ: 2.2,
      },
    ],
  },

  // 6 Starting Crop Plots
  {
    id: 'ent_field_1',
    type: 'field',
    configId: 'field_plot',
    x: 0,
    z: 2,
    width: 1,
    depth: 1,
    rotation: 0,
    cropId: 'wheat',
    plantedAt: Date.now() - 20000, // Ready to harvest!
  },
  {
    id: 'ent_field_2',
    type: 'field',
    configId: 'field_plot',
    x: 1,
    z: 2,
    width: 1,
    depth: 1,
    rotation: 0,
    cropId: 'wheat',
    plantedAt: Date.now() - 20000, // Ready to harvest!
  },
  {
    id: 'ent_field_3',
    type: 'field',
    configId: 'field_plot',
    x: 2,
    z: 2,
    width: 1,
    depth: 1,
    rotation: 0,
    cropId: 'wheat',
    plantedAt: Date.now() - 20000, // Ready to harvest!
  },
  {
    id: 'ent_field_4',
    type: 'field',
    configId: 'field_plot',
    x: 0,
    z: 3,
    width: 1,
    depth: 1,
    rotation: 0,
    cropId: null,
    plantedAt: undefined,
  },
  {
    id: 'ent_field_5',
    type: 'field',
    configId: 'field_plot',
    x: 1,
    z: 3,
    width: 1,
    depth: 1,
    rotation: 0,
    cropId: null,
    plantedAt: undefined,
  },
  {
    id: 'ent_field_6',
    type: 'field',
    configId: 'field_plot',
    x: 2,
    z: 3,
    width: 1,
    depth: 1,
    rotation: 0,
    cropId: null,
    plantedAt: undefined,
  },

  // Fruit Trees Starter Grove (Apples, Cherries)
  {
    id: 'ent_apple_tree_1',
    type: 'fruit_tree',
    configId: 'apple_tree',
    x: 5,
    z: 2,
    width: 2,
    depth: 2,
    rotation: 0,
    harvestsLeft: 4,
    treePlantedAt: Date.now() - 600000, // Ready to harvest
  },
  {
    id: 'ent_cherry_tree_1',
    type: 'fruit_tree',
    configId: 'cherry_tree',
    x: 5,
    z: 5,
    width: 2,
    depth: 2,
    rotation: 0,
    harvestsLeft: 4,
    treePlantedAt: Date.now() - 600000, // Ready to harvest
  },
  {
    id: 'ent_apple_tree_2',
    type: 'fruit_tree',
    configId: 'apple_tree',
    x: 7,
    z: 2,
    width: 2,
    depth: 2,
    rotation: 0,
    harvestsLeft: 4,
    treePlantedAt: Date.now() - 600000, // Ready to harvest
  },

  // Map Trees & Obstacles
  {
    id: 'ent_obs_1',
    type: 'obstacle',
    configId: 'small_tree',
    x: -11,
    z: 7,
    width: 1,
    depth: 1,
    rotation: 0,
  },
  {
    id: 'ent_obs_pine_1',
    type: 'obstacle',
    configId: 'pine_tree',
    x: -10,
    z: -11,
    width: 1,
    depth: 1,
    rotation: 0,
  },
  {
    id: 'ent_obs_oak_1',
    type: 'obstacle',
    configId: 'big_tree',
    x: -2,
    z: -11,
    width: 1,
    depth: 1,
    rotation: 0,
  },
  {
    id: 'ent_obs_pine_2',
    type: 'obstacle',
    configId: 'pine_tree',
    x: 6,
    z: -11,
    width: 1,
    depth: 1,
    rotation: 0,
  },
  {
    id: 'ent_obs_tree_2',
    type: 'obstacle',
    configId: 'small_tree',
    x: 8,
    z: 7,
    width: 1,
    depth: 1,
    rotation: 0,
  },
  {
    id: 'ent_obs_2',
    type: 'obstacle',
    configId: 'small_rock',
    x: 6,
    z: 8,
    width: 1,
    depth: 1,
    rotation: 0,
  },
  {
    id: 'ent_obs_3',
    type: 'obstacle',
    configId: 'tree_stump',
    x: -8,
    z: 8,
    width: 1,
    depth: 1,
    rotation: 0,
  },
  {
    id: 'ent_obs_4',
    type: 'obstacle',
    configId: 'wild_bush',
    x: 3,
    z: 8,
    width: 1,
    depth: 1,
    rotation: 0,
  },

  // Initial starter decorations
  {
    id: 'ent_deco_bench',
    type: 'decoration',
    configId: 'wooden_bench',
    x: -4,
    z: -3,
    width: 1,
    depth: 1,
    rotation: 0,
  },
  {
    id: 'ent_deco_flowers',
    type: 'decoration',
    configId: 'red_tulips',
    x: -1,
    z: -5,
    width: 1,
    depth: 1,
    rotation: 0,
  },
];

export const INITIAL_INVENTORY: Record<string, number> = {
  // Silo
  wheat: 12,
  corn: 6,
  carrot: 4,
  apple_fruit: 3,

  // Barn
  egg: 3,
  bread: 2,
  chicken_feed: 4,
  axe: 3,
  saw: 2,
  dynamite: 1,
  shovel: 2,
  pickaxe: 2,
  nail: 2,
  screw: 1,
  wood_panel: 1,
  bolt: 1,
  plank: 1,
  duct_tape: 1,
  land_deed: 1,
  mallet: 1,
  marker_stake: 1,
};

export const INITIAL_SHOP_SLOTS: RoadsideSaleSlot[] = [
  { id: 'slot_1', itemId: null, count: 0, price: 0, isSold: false, advertised: false },
  { id: 'slot_2', itemId: null, count: 0, price: 0, isSold: false, advertised: false },
  { id: 'slot_3', itemId: null, count: 0, price: 0, isSold: false, advertised: false },
  { id: 'slot_4', itemId: null, count: 0, price: 0, isSold: false, advertised: false },
  { id: 'slot_5', itemId: null, count: 0, price: 0, isSold: false, advertised: false },
  { id: 'slot_6', itemId: null, count: 0, price: 0, isSold: false, advertised: false },
];

export function generateRandomOrders(playerLevel: number): FarmOrder[] {
  const customerNames = [
    'Мэр Томас', 'Бабушка Мэри', 'Лесник Боб', 'Пекарь Грег', 
    'Учительница Эмма', 'Рыбак Майк', 'Доктор Лиза', 'Почтальон Сэм'
  ];
  const customerAvatars = ['👨‍🌾', '👵', '🧔', '🧑‍🍳', '👩‍🏫', '🎣', '👩‍⚕️', '📫'];

  const availableCropIds = Object.keys(CROPS).filter(id => CROPS[id].unlockLevel <= playerLevel);
  const availableProductIds = Object.keys(PRODUCTS).filter(id => PRODUCTS[id].unlockLevel <= playerLevel && PRODUCTS[id].category !== 'material' && PRODUCTS[id].category !== 'tool');

  const orders: FarmOrder[] = [];
  for (let i = 0; i < 6; i++) {
    const custIdx = i % customerNames.length;
    const itemsCount = Math.min(3, 1 + Math.floor(Math.random() * 2));
    const items = [];
    let totalCoins = 0;
    let totalXp = 0;

    for (let j = 0; j < itemsCount; j++) {
      const isCrop = Math.random() > 0.4;
      const pool = isCrop ? availableCropIds : availableProductIds;
      const chosenId = pool[Math.floor(Math.random() * pool.length)] || 'wheat';
      const itemConfig = PRODUCTS[chosenId] || PRODUCTS.wheat;
      const count = Math.max(1, Math.floor(4 / Math.max(1, itemConfig.unlockLevel * 0.5)));

      items.push({ itemId: chosenId, count });
      totalCoins += itemConfig.basePrice * count * 1.4;
      totalXp += itemConfig.xpGain * count * 1.6;
    }

    orders.push({
      id: `ord_${Date.now()}_${i}`,
      customerName: customerNames[custIdx],
      customerAvatar: customerAvatars[custIdx],
      items,
      coinReward: Math.round(totalCoins + 10),
      xpReward: Math.round(totalXp + 8),
    });
  }

  return orders;
}

export function generateMarketListings(): MarketListing[] {
  const sellers = [
    { name: 'Ферма Люси', avatar: '👩‍🌾' },
    { name: 'Долина Ветров', avatar: '👨‍🌾' },
    { name: 'Солнечные Холмы', avatar: '👧' },
    { name: 'Дубовая Роща', avatar: '🧔' },
    { name: 'Медовый Луг', avatar: '👵' },
    { name: 'Берег Озера', avatar: '🧑‍🌾' },
  ];

  const marketItemPool = [
    'wheat', 'corn', 'carrot', 'egg', 'milk', 'bread', 'butter', 'brown_sugar',
    'apple_fruit', 'nail', 'screw', 'wood_panel', 'bacon'
  ];

  return sellers.map((seller, i) => {
    const itemId = marketItemPool[Math.floor(Math.random() * marketItemPool.length)];
    const item = PRODUCTS[itemId] || PRODUCTS.wheat;
    const count = 3 + Math.floor(Math.random() * 5);
    const price = Math.round(item.basePrice * count * (0.8 + Math.random() * 0.4));

    return {
      id: `mkt_${Date.now()}_${i}`,
      sellerName: seller.name,
      sellerAvatar: seller.avatar,
      itemId,
      count,
      price,
      sold: false,
    };
  });
}
