export type VehicleModelId =
  | 'classic_pickup'
  | 'american_semi'
  | 'super_sportscar'
  | 'tesla_cybertruck'
  | 'tesla_semi'
  | 'golden_hypercar';

export interface VehicleConfig {
  id: VehicleModelId;
  name: string;
  category: 'pickup' | 'semi' | 'sportscar' | 'cyber' | 'hypercar';
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
    icon: '🚗',
    perkDescription: 'Базовая скорость доставки',
    speedMultiplier: 1.0,
    bonusCoinPercent: 0,
    bonusXpPercent: 0,
    accentColor: '#DC2626',
    description: 'Винтажный фермерский пикап с деревянным кузовом и ящиками спелых фруктов.',
  },
  american_semi: {
    id: 'american_semi',
    name: 'Американская Фура',
    category: 'semi',
    unlockLevel: 3,
    costCoins: 1200,
    costGems: 0,
    icon: '🚛',
    perkDescription: '💰 +25% монет с каждого заказа',
    speedMultiplier: 1.2,
    bonusCoinPercent: 25,
    bonusXpPercent: 10,
    accentColor: '#1E40AF',
    description: 'Легендарный мощный тягач с гигантскими хромированными трубами и спальной кабиной.',
  },
  super_sportscar: {
    id: 'super_sportscar',
    name: 'Гоночный Спорткар',
    category: 'sportscar',
    unlockLevel: 5,
    costCoins: 2500,
    costGems: 0,
    icon: '🏎️',
    perkDescription: '⚡ Скорость доставки +80%',
    speedMultiplier: 1.8,
    bonusCoinPercent: 10,
    bonusXpPercent: 20,
    accentColor: '#EF4444',
    description: 'Низкий аэродинамичный суперкар с карбоновым спойлером и спортивным выхлопом.',
  },
  tesla_cybertruck: {
    id: 'tesla_cybertruck',
    name: 'Тесла Cybertruck',
    category: 'cyber',
    unlockLevel: 8,
    costCoins: 0,
    costGems: 35,
    icon: '⚡',
    perkDescription: '⚡ Скорость +60% · Монеты +20%',
    speedMultiplier: 1.6,
    bonusCoinPercent: 20,
    bonusXpPercent: 20,
    accentColor: '#94A3B8',
    description: 'Бронированный электро-пикап из титановой стали с лазерной LED полосой.',
  },
  tesla_semi: {
    id: 'tesla_semi',
    name: 'Тесла Semi (Фура будущего)',
    category: 'semi',
    unlockLevel: 11,
    costCoins: 0,
    costGems: 75,
    icon: '⚡',
    perkDescription: '⚡ Скорость +100% · Монеты +35%',
    speedMultiplier: 2.0,
    bonusCoinPercent: 35,
    bonusXpPercent: 30,
    accentColor: '#0284C7',
    description: 'Футуристичная электрическая фура с аэродинамической кабиной и автопилотом.',
  },
  golden_hypercar: {
    id: 'golden_hypercar',
    name: 'Золотой Гиперкар Магната',
    category: 'hypercar',
    unlockLevel: 15,
    costCoins: 0,
    costGems: 150,
    icon: '👑',
    perkDescription: '👑 +50% монет и +50% опыта со всех заказов',
    speedMultiplier: 2.2,
    bonusCoinPercent: 50,
    bonusXpPercent: 50,
    accentColor: '#F59E0B',
    description: 'Эксклюзивный гиперкар из чистого золота с алмазными фарами и максимальным бонусом.',
  },
};
