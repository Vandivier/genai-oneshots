// src/types/mapTypes.ts

export type TerrainType =
  | 'grass'
  | 'forest'
  | 'mountain'
  | 'water'
  | 'town_floor'
  | 'dungeon_wall'
  | 'dungeon_floor'
  | 'building_wall'
  | 'building_door'
  | 'road';

export interface MapCell {
  x: number;
  y: number;
  terrain: TerrainType;
  isWalkable: boolean;
  encounterTrigger?: string; // ID or type of encounter (e.g., 'goblin_fight', 'treasure_chest')
  // eventTrigger?: string; // For scripted events
  // NpcId?: string;
}

export interface GameMap {
  id: string;
  name: string;
  seed: string;
  width: number;
  height: number;
  cells: MapCell[][]; // 2D array of map cells
  // entryPoints?: { [key: string]: { x: number; y: number } };
  // musicTrack?: string;
}
