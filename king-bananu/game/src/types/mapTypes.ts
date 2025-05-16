// src/types/mapTypes.ts

export enum TerrainType {
  grass = 'grass',
  water = 'water',
  forest = 'forest',
  mountain = 'mountain',
  building_wall = 'building_wall',
  building_door = 'building_door',
  road = 'road',
  town_floor = 'town_floor', // Used for town areas
  empty = 'empty', // For interior maps or explicitly empty areas
}

export type MapCell = {
  x?: number; // Optional, as position is often implicit from grid
  y?: number; // Optional
  terrain: TerrainType;
  walkable: boolean;
  blocksSight?: boolean; // True if vision is blocked through this cell
  interaction?: {
    type: string; // e.g., "door", "npc", "item", "sign"
    // properties specific to interaction type
  };
  leadsTo?: {
    // For doors or portals that transition maps
    mapId: string;
    targetX: number;
    targetY: number;
  };
  encounterTrigger?: string; // ID or type of encounter (e.g., 'goblin_fight', 'treasure_chest')
  // NpcId?: string; // Potential future use for quick NPC lookup
};

export type GameMap = {
  id: string;
  name?: string; // Optional display name for the map
  seed: string; // Seed used for procedural generation
  width: number;
  height: number;
  grid: MapCell[][]; // The 2D array of map cells
  type: 'world' | 'interior'; // Distinguishes overworld maps from interiors
  entryPoints?: { [key: string]: { x: number; y: number } }; // Predefined entry points
  // musicTrack?: string; // Suggested music for this map
};

export const PREVIOUS_MAP_SENTINEL = 'PREVIOUS_MAP'; // Sentinel value for map transitions
