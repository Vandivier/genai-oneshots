import type { GameMap } from '../../types/mapTypes';
import { PRIMARY_WORLD_MAP_ID } from '../../types/mapTypes'; // Import canonical world map ID
import { generateWorldMap, generateTownInteriorMap } from './worldGenerator';
import { predefinedCityMaps } from './predefinedMaps';

const activePredefinedMaps: Record<string, GameMap> = predefinedCityMaps;

const loadedMaps: Map<string, GameMap> = new Map();

const TOWN_INTERIOR_DEFAULT_ID = 'town_interior_default';

export function getMap(mapId: string, seed?: string): GameMap | undefined {
  // For the primary world map, always use its canonical ID for requests and caching,
  // but ensure a seed is provided for its first generation.
  if (mapId === PRIMARY_WORLD_MAP_ID) {
    if (loadedMaps.has(PRIMARY_WORLD_MAP_ID)) {
      return loadedMaps.get(PRIMARY_WORLD_MAP_ID);
    }
    if (!seed) {
      console.error(
        `[MapManager] Seed is required to generate the primary world map (${PRIMARY_WORLD_MAP_ID}) for the first time.`,
      );
      return undefined;
    }
    // Generate world map with fixed dimensions for now
    const worldMap = generateWorldMap({ seed, width: 100, height: 100 });
    loadedMaps.set(PRIMARY_WORLD_MAP_ID, worldMap); // Cache using canonical ID
    console.log(
      `[MapManager] Generated and cached ${PRIMARY_WORLD_MAP_ID} with seed: ${seed}, map ID: ${worldMap.id}`,
    );
    return worldMap;
  }

  // Handle other maps (predefined, interiors, etc.)
  if (loadedMaps.has(mapId)) {
    return loadedMaps.get(mapId);
  }

  if (activePredefinedMaps[mapId]) {
    const map = activePredefinedMaps[mapId];
    loadedMaps.set(mapId, map);
    return map;
  }

  // Generic town interiors (might also need a consistent seed if they are to be persistent beyond one entry)
  if (mapId === TOWN_INTERIOR_DEFAULT_ID) {
    // For generic town interiors, the seed could be derived from the town on the world map
    // or passed if it needs to be consistent. For now, use provided seed or mapId.
    const townInteriorMap = generateTownInteriorMap(mapId, seed || mapId);
    loadedMaps.set(townInteriorMap.id, townInteriorMap);
    return townInteriorMap;
  }

  // Old worldmap ID logic, should be deprecated by PRIMARY_WORLD_MAP_ID usage
  // if (mapId.startsWith('worldmap_') && seed) { ... }

  console.warn(
    `[MapManager] Map with id "${mapId}" not found or type not handled for generation.`,
  );
  return undefined;
}

export function loadMap(mapData: GameMap): void {
  loadedMaps.set(mapData.id, mapData);
}
