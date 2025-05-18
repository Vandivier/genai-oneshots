// src/types/mapTypes.ts

export enum TerrainType {
  grass = 'grass',
  water = 'water',
  forest = 'forest',
  mountain = 'mountain',
  desert = 'desert',
  building_wall = 'building_wall',
  building_door = 'building_door',
  road = 'road',
  town_floor = 'town_floor', // Used for town areas
  empty = 'empty', // For interior maps or explicitly empty areas
  city_marker = 'city_marker', // For marking city locations on the map grid
}

export interface City {
  id: string;
  name: string;
  x?: number; // World map x - Now optional
  y?: number; // World map y - Now optional
  population: number;
  race: string; // e.g., 'Humans', 'Elves', 'Gorillas', 'Mixed' - can be an enum later
  religion: string; // e.g., 'Sun Worship', 'Ancestor Veneration', 'None' - can be an enum later
  // Other potential properties: faction, notable buildings, available services, etc.
}

export type MapCell = {
  x?: number; // Optional, as position is often implicit from grid
  y?: number; // Optional
  terrain: TerrainType;
  walkable: boolean;
  blocksSight?: boolean; // True if vision is blocked through this cell
  interaction?: {
    type: string; // e.g., "door", "npc", "item", "sign"
    cityId?: string; // Link to a city if this cell is a city marker or part of it
  };
  leadsTo?: {
    // For doors or portals that transition maps
    mapId: string;
    targetX: number;
    targetY: number;
    exitToWorldDirection?: 'N' | 'E' | 'S' | 'W'; // Added for specific exit points to world map
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
  cities?: City[]; // Added list of cities
  // musicTrack?: string; // Suggested music for this map
};

export const PREVIOUS_MAP_SENTINEL = 'PREVIOUS_MAP'; // Sentinel value for map transitions

export const PRIMARY_WORLD_MAP_ID = 'the_known_world'; // Canonical ID for the main world map
