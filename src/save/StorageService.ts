import { 
  WorldEntity, 
  FarmOrder, 
  RoadsideSaleSlot, 
  MapChunkExpansion, 
  TutorialStep 
} from '../types';

export interface SavedGameState {
  version: number;
  savedAt: number;
  playerName: string;
  level: number;
  xp: number;
  coins: number;
  gems: number;
  
  // Storages
  siloCapacity: number;
  barnCapacity: number;
  inventory: Record<string, number>;
  
  // Entities in the world
  entities: WorldEntity[];
  
  // Map expansions
  expansions: MapChunkExpansion[];
  
  // Orders & Truck
  orders: FarmOrder[];
  truckState: {
    isDelivering: boolean;
    deliveringUntil: number;
    lastDeliveredOrderId?: string;
  };

  // Roadside shop
  shopSlots: RoadsideSaleSlot[];

  // Fishing stats
  fishingStats: {
    fishCaughtCount: number;
    biggestCatch: Record<string, number>;
  };

  // Tutorial
  tutorialStep: number;
  tutorialCompleted: boolean;

  // Settings
  soundMuted: boolean;
}

const SAVE_KEY = 'sunnyside_farm_save_v1';

export class StorageService {
  public static saveGame(state: SavedGameState): void {
    try {
      const dataToSave = {
        ...state,
        savedAt: Date.now(),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Failed to save game state to localStorage:', e);
    }
  }

  public static loadGame(): SavedGameState | null {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const state = JSON.parse(raw) as SavedGameState;
      return state;
    } catch (e) {
      console.error('Failed to load game state from localStorage:', e);
      return null;
    }
  }

  public static clearSave(): void {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) {
      console.error('Failed to clear save:', e);
    }
  }
}
