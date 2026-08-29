export type { FishSpecies } from '../types';
import { FishSpecies } from '../types';

export const FISH_SPECIES: Record<string, FishSpecies> = {
  perch: {
    id: 'perch',
    name: 'Речной окунь',
    rarity: 'common',
    weightMin: 0.4,
    weightMax: 1.8,
    sellPrice: 65,
    xpGain: 15,
    icon: '🐟',
    description: 'Обычная речная рыба с полосатым окрасом.',
  },
  trout: {
    id: 'trout',
    name: 'Радужная форель',
    rarity: 'rare',
    weightMin: 1.2,
    weightMax: 3.5,
    sellPrice: 115,
    xpGain: 28,
    icon: '🐟',
    description: 'Благородная форель с переливающимся окрасом.',
  },
  carp: {
    id: 'carp',
    name: 'Зеркальный карп',
    rarity: 'common',
    weightMin: 2.0,
    weightMax: 6.5,
    sellPrice: 160,
    xpGain: 36,
    icon: '🐟',
    description: 'Крупный прудовой карп с золотистой чешуей.',
  },
  salmon: {
    id: 'salmon',
    name: 'Дикий лосось',
    rarity: 'epic',
    weightMin: 3.0,
    weightMax: 8.5,
    sellPrice: 220,
    xpGain: 50,
    icon: '🐟',
    description: 'Сильная и быстрая рыба горных рек.',
  },
  pike: {
    id: 'pike',
    name: 'Речная щука',
    rarity: 'epic',
    weightMin: 2.5,
    weightMax: 9.0,
    sellPrice: 280,
    xpGain: 65,
    icon: '🦈',
    description: 'Грозный хищник озерных глубин.',
  },
  golden_tench: {
    id: 'golden_tench',
    name: 'Золотой линь',
    rarity: 'legendary',
    weightMin: 4.0,
    weightMax: 12.0,
    sellPrice: 420,
    xpGain: 95,
    icon: '✨',
    description: 'Легендарная сияющая рыба, приносящая удачу и богатство!',
  },
};

export interface LureConfig {
  id: string;
  name: string;
  costCoins: number;
  costGems: number;
  luckBonus: number;
  icon: string;
  description: string;
  color: string;
}

export const LURES: Record<string, LureConfig> = {
  worm_lure: {
    id: 'worm_lure',
    name: 'Обычный червячок',
    costCoins: 20,
    costGems: 0,
    luckBonus: 1.0,
    icon: '🪱',
    description: 'Базовая наживка для ловли обычной речной рыбы.',
    color: '#F97316',
  },
  silver_spinner: {
    id: 'silver_spinner',
    name: 'Серебряная блесна',
    costCoins: 80,
    costGems: 0,
    luckBonus: 1.5,
    icon: '🪙',
    description: 'Привлекает редкую и крупную форель и щуку.',
    color: '#94A3B8',
  },
  golden_fly: {
    id: 'golden_fly',
    name: 'Золотая мушка',
    costCoins: 0,
    costGems: 2,
    luckBonus: 2.5,
    icon: '🪰',
    description: 'Магическая приманка с шансом поймать Золотого Линя!',
    color: '#FACC15',
  },
};
