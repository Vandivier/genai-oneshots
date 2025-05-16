import type { GameMap } from '../../types/mapTypes';
import { generateWorldMap, generateTownInteriorMap } from './worldGenerator';
import { allPredefinedMaps } from './predefinedMaps'; // Import the predefined maps

// Use the imported predefined maps
const predefinedMaps: Record<string, GameMap> = allPredefinedMaps;

const loadedMaps: Map<string, GameMap> = new Map();

const TOWN_INTERIOR_DEFAULT_ID = 'town_interior_default';

export function getMap(mapId: string, seed?: string): GameMap | undefined {
  if (loadedMaps.has(mapId)) {
    return loadedMaps.get(mapId);
  }

  if (predefinedMaps[mapId]) {
    const map = predefinedMaps[mapId];
    loadedMaps.set(mapId, map);
    return map;
  }

  // Handle specific procedural map types
  if (mapId.startsWith('worldmap_') && seed) {
    // Check cache again specifically for world maps based on full ID if it includes seed, or just mapId if seed is only for generation.
    // The current worldMap.id is `worldmap_${seed}`.
    if (loadedMaps.has(mapId)) {
      // This check might be redundant if the first one catches it.
      return loadedMaps.get(mapId);
    }
    const worldMap = generateWorldMap({ seed, width: 100, height: 100 });
    loadedMaps.set(worldMap.id, worldMap); // Cache by its full generated ID
    return worldMap;
  }

  if (mapId === TOWN_INTERIOR_DEFAULT_ID) {
    const townInteriorMap = generateTownInteriorMap(mapId, seed);
    loadedMaps.set(townInteriorMap.id, townInteriorMap);
    return townInteriorMap;
  }

  console.warn(
    `Map with id "${mapId}" not found or type not handled for generation.`,
  );
  return undefined;
}

export function loadMap(mapData: GameMap): void {
  loadedMaps.set(mapData.id, mapData);
}

// Example of how to get the initial world map
// export function getInitialWorldMap(seed: string): GameMap {
//   const mapId = `worldmap_${seed}`;
//   let map = loadedMaps.get(mapId);
//   if (!map) {
//     map = generateWorldMap({ seed, width: 100, height: 100 });
//     loadedMaps.set(map.id, map);
//   }
//   return map;
// }
