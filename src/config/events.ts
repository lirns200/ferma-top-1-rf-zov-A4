import { SeasonType, WeatherType } from '../types';

export interface GameEventConfig {
  id: string;
  name: string;
  description: string;
  type: WeatherType | 'festival';
  durationSeconds: number;
  bonusEffect: string;
  xpMultiplier?: number;
  growthSpeedMultiplier?: number;
  coinMultiplier?: number;
  icon: string;
  color: string;
}

export const GAME_EVENTS: Record<string, GameEventConfig> = {
  sunny_day: {
    id: 'sunny_day',
    name: 'Ясный солнечный день',
    description: 'Тёплые лучи солнца согревают поля. Прекрасное время для фермерства!',
    type: 'sunny',
    durationSeconds: 300,
    bonusEffect: 'Обычный стабильный рост',
    growthSpeedMultiplier: 1.0,
    icon: '☀️',
    color: '#FACC15',
  },
  warm_rain: {
    id: 'warm_rain',
    name: 'Тёплый грибной дождь',
    description: 'Благодатные капли дождя ускоряют рост всех растений на полях!',
    type: 'rain',
    durationSeconds: 180,
    bonusEffect: 'Рост растений быстрее на +50%',
    growthSpeedMultiplier: 1.5,
    icon: '🌧️',
    color: '#38BDF8',
  },
  thunderstorm: {
    id: 'thunderstorm',
    name: 'Летняя гроза',
    description: 'Освежающая гроза насыщает почву влагой и азотом.',
    type: 'thunderstorm',
    durationSeconds: 120,
    bonusEffect: 'Рост растений быстрее на +80%',
    growthSpeedMultiplier: 1.8,
    icon: '⛈️',
    color: '#6366F1',
  },
  rainbow: {
    id: 'rainbow',
    name: 'Радужное сияние',
    description: 'Над долиной раскинулась яркая семицветная радуга! Удача на вашей стороне.',
    type: 'rainbow',
    durationSeconds: 150,
    bonusEffect: 'Двойной опыт за все действия (x2 XP)',
    xpMultiplier: 2.0,
    icon: '🌈',
    color: '#EC4899',
  },
  butterflies: {
    id: 'butterflies',
    name: 'Нашествие бабочек',
    description: 'Стайки волшебных бабочек опыляют цветущие сады и кусты.',
    type: 'butterflies',
    durationSeconds: 180,
    bonusEffect: 'Дополнительные монеты с заказов (+30%)',
    coinMultiplier: 1.3,
    icon: '🦋',
    color: '#A855F7',
  },
  meteor_shower: {
    id: 'meteor_shower',
    name: 'Звездопад желаний',
    description: 'Ночной небосвод озаряется падающими метеорами. Загадывайте желания!',
    type: 'meteor_shower',
    durationSeconds: 120,
    bonusEffect: 'Шанс найти алмазы и ценные материалы',
    xpMultiplier: 1.5,
    icon: '🌠',
    color: '#818CF8',
  },
  windy: {
    id: 'windy',
    name: 'Свежий ветер и листопад',
    description: 'Озорной ветер колышет кроны деревьев, кружит листву и разгоняет мельницы!',
    type: 'windy',
    durationSeconds: 180,
    bonusEffect: 'Ускорение мельниц и производства (+50%)',
    growthSpeedMultiplier: 1.2,
    icon: '💨',
    color: '#34D399',
  },
  snow: {
    id: 'snow',
    name: 'Мягкий снегопад',
    description: 'Пушистые белые снежинки медленно кружатся и ложатся на крыши и поля.',
    type: 'snow',
    durationSeconds: 200,
    bonusEffect: 'Зимний уют и удвоенный опыт (+100% XP)',
    xpMultiplier: 2.0,
    icon: '❄️',
    color: '#93C5FD',
  },
  morning_fog: {
    id: 'morning_fog',
    name: 'Утренний туман',
    description: 'Густой таинственный туман окутал реку и низины.',
    type: 'fog',
    durationSeconds: 140,
    bonusEffect: 'Повышенный клев редкой рыбы на причале',
    icon: '🌫️',
    color: '#94A3B8',
  },
};

export interface SeasonInfo {
  type: SeasonType;
  name: string;
  themeColor: string;
  groundColor: string;
  foliageColor: string;
  description: string;
  icon: string;
}

export const SEASONS_INFO: Record<SeasonType, SeasonInfo> = {
  spring: {
    type: 'spring',
    name: 'Весна',
    themeColor: '#22C55E',
    groundColor: '#65A30D',
    foliageColor: '#84CC16',
    description: 'Пора возрождения, цветущих яблонь и свежих ростков.',
    icon: '🌸',
  },
  summer: {
    type: 'summer',
    name: 'Лето',
    themeColor: '#EAB308',
    groundColor: '#4D7C0F',
    foliageColor: '#15803D',
    description: 'Жаркое солнце, изобилие спелых ягод и золотых колосьев.',
    icon: '☀️',
  },
  autumn: {
    type: 'autumn',
    name: 'Осень',
    themeColor: '#EA580C',
    groundColor: '#854D0E',
    foliageColor: '#D97706',
    description: 'Богатый урожай тыкв, оранжевая листва и тёплые пироги.',
    icon: '🍂',
  },
  winter: {
    type: 'winter',
    name: 'Зима',
    themeColor: '#38BDF8',
    groundColor: '#CBD5E1',
    foliageColor: '#E2E8F0',
    description: 'Белоснежные шапки снега на крышах и морозная свежесть.',
    icon: '❄️',
  },
};

export const MONTH_NAMES_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

export function getRealCalendarMonthName(): string {
  return MONTH_NAMES_RU[new Date().getMonth()];
}

export function getCurrentRealSeason(): SeasonType {
  const month = new Date().getMonth(); // 0 = Jan, 11 = Dec
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}
