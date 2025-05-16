import type { PlayerCharacter } from './characterTypes';
// import { GameMap } from './mapTypes'; // GameMap not used here directly yet
// import { Quest } from './questTypes'; // Example for future expansion

export interface GameState {
  playerCharacter: PlayerCharacter;
  currentMapId: string; // ID of the current map
  playerPosition: { x: number; y: number };
  // inventory: Item[]; // Defined in itemTypes.ts, could be part of player or global state
  // activeQuests: Quest[];
  // gameTime: number; // In-game time, e.g., number of days passed
  // worldSeed: string; // For procedural generation
  // discoveredMapAreas: string[]; // For fog of war or map discovery
}

export interface GameSaveSlot {
  id: number; // 1 to 5
  timestamp?: number; // Date of save
  gameName?: string; // Optional name for the save
  data?: GameState; // The actual game state, undefined if slot is empty
}

export interface GameSave {
  userId: string; // To associate with a logged-in user
  saveSlots: GameSaveSlot[];
} 