export type VehicleModelId =
  | 'classic_pickup'
  | 'offroad_4x4'
  | 'retro_van'
  | 'farm_tractor'
  | 'cyber_truck'
  | 'golden_truck';

export interface VehicleConfig {
  id: VehicleModelId;
  name: string;
  category: 'pickup' | 'suv' | 'van' | 'tractor' | 'special';
  unlockLevel: number;
  costCoins: number;
  costGems: number;
  icon: string;
  perkDescription: string;
  speedMultiplier: number;
  bonusCoinPercent: number;
  bonusXpPercent: number;
  accentColor: string;
  description: string;
}

export const VEHICLE_CONFIGS: Record<VehicleModelId, VehicleConfig> = {
  classic_pickup: {
    id: 'classic_pickup',
    name: 'Классический Пикап',
    category: 'pickup',
    unlockLevel: 1,
    costCoins: 0,
    costGems: 0,
    icon: '🛻',
    perkDescription: 'Базовая скорость доставки',
    speedMultiplier: 1.0,
    bonusCoinPercent: 0,
    bonusXpPercent: 0,
    accentColor: '#DC2626',
    description: 'Надёжный винтажный пикап с деревянным кузовом и ящиками спелых фруктов.',
  },
  offroad_4x4: {
    id: 'offroad_4x4',
    name: 'Внедорожник 4x4',
    category: 'suv',
    unlockLevel: 3,
    costCoins: 800,
    costGems: 0,
    icon: '🚙',
    perkDescription: '⚡ Скорость доставки +25%',
    speedMultiplier: 1.25,
    bonusCoinPercent: 0,
    bonusXpPercent: 5,
    accentColor: '#16A34A',
    description: 'Мощный полноприводный джип с кенгурятником, запаской на крыше и прожекторами.',
  },
  retro_van: {
    id: 'retro_van',
    name: 'Ретро-Фургончик',
    category: 'van',
    unlockLevel: 5,
    costCoins: 1800,
    costGems: 0,
    icon: '🚐',
    perkDescription: '⚡ Скорость +40% · Опыт +10%',
    speedMultiplier: 1.40,
    bonusCoinPercent: 5,
    bonusXpPercent: 10,
    accentColor: '#0EA5E9',
    description: 'Стильный двухцветный бусик в стиле хиппи с хромированными колпаками.',
  },
  farm_tractor: {
    id: 'farm_tractor',
    name: 'Фермерский Трактор',
    category: 'tractor',
    unlockLevel: 8,
    costCoins: 3500,
    costGems: 0,
    icon: '🚜',
    perkDescription: '💰 +20% монет с каждого заказа',
    speedMultiplier: 1.15,
    bonusCoinPercent: 20,
    bonusXpPercent: 15,
    accentColor: '#EAB308',
    description: 'Деревенский трудяга с огромными грунтозацепами, вертикальной трубой и мощным мотором.',
  },
  cyber_truck: {
    id: 'cyber_truck',
    name: 'Кибер-Пикап Долины',
    category: 'special',
    unlockLevel: 10,
    costCoins: 0,
    costGems: 45,
    icon: '⚡',
    perkDescription: '⚡ Скорость +65% · Монеты +25%',
    speedMultiplier: 1.65,
    bonusCoinPercent: 25,
    bonusXpPercent: 20,
    accentColor: '#06B6D4',
    description: 'Футуристичный титановый электро-пикап с неоновой оптикой и турбо-ускорением.',
  },
  golden_truck: {
    id: 'golden_truck',
    name: 'Золотой Пикап Магната',
    category: 'special',
    unlockLevel: 14,
    costCoins: 0,
    costGems: 120,
    icon: '👑',
    perkDescription: '👑 +40% монет и +40% опыта со всех заказов',
    speedMultiplier: 1.50,
    bonusCoinPercent: 40,
    bonusXpPercent: 40,
    accentColor: '#F59E0B',
    description: 'Роскошный пикап из чистого полированного золота с обсидиановой отделкой и сиянием.',
  },
};
