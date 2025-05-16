import type { PlayerCharacter } from './characterTypes';
// import { GameMap } from './mapTypes'; // GameMap not used here directly yet
// import { Quest } from './questTypes'; // Example for future expansion

// Defined PlayerPosition here
export interface PlayerPosition {
  x: number;
  y: number;
}

export interface GameState {
  // saveVersion: number; // Removed - specific to save/load
  player: PlayerCharacter;
  playerPosition: PlayerPosition; // Now uses the local PlayerPosition
  mapId: string; // ID of the current map (can be useful for generation)
  mapSeed: string; // Seed for the current map (can be useful for generation)
  // inventory: Item[]; // Defined in itemTypes.ts, could be part of player or global state
  // activeQuests: Quest[];
  // gameTime: number; // In-game time, e.g., number of days passed
  // worldSeed: string; // For procedural generation
  // discoveredMapAreas: string[]; // For fog of war or map discovery
}

// Removed GameSaveSlot interface as it was for save/load feature
// export interface GameSaveSlot { ... }

// The GameSave interface and related comments below are obsolete
// as the saveLoad.ts file and save/load feature have been removed.
