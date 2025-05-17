import type { GameMap } from '../../types/mapTypes';
import { PRIMARY_WORLD_MAP_ID } from '../../types/mapTypes'; // Import canonical world map ID
import { generateWorldMap, generateTownInteriorMap } from './worldGenerator';
import { predefinedCityMaps } from './predefinedMaps';

const activePredefinedMaps: Record<string, GameMap> = predefinedCityMaps;

const loadedMaps: Map<string, GameMap> = new Map();

const TOWN_INTERIOR_DEFAULT_ID = 'town_interior_default';

export function getMap(mapId: string, seed?: string): GameMap | undefined {
  if (mapId === PRIMARY_WORLD_MAP_ID) {
    if (!seed) {
      console.error(
        `[MapManager] Seed is required to request or generate ${PRIMARY_WORLD_MAP_ID}.`,
      );
      return undefined;
    }

    const cachedMap = loadedMaps.get(PRIMARY_WORLD_MAP_ID);

    if (cachedMap && cachedMap.seed === seed) {
      console.log(
        `[MapManager] Returning cached ${PRIMARY_WORLD_MAP_ID} for matching seed: ${seed}`,
      );
      return cachedMap;
    }

    if (cachedMap && cachedMap.seed !== seed) {
      console.log(
        `[MapManager] Stale seed for ${PRIMARY_WORLD_MAP_ID}. Cached: ${cachedMap.seed}, Requested: ${seed}. Regenerating.`,
      );
    } else if (!cachedMap) {
      console.log(
        `[MapManager] No cached ${PRIMARY_WORLD_MAP_ID} found. Generating with seed: ${seed}.`,
      );
    }
    // If cachedMap exists but seed is undefined on it (should not happen for worldmap), it would also lead to regeneration.

    const worldMap = generateWorldMap({ seed, width: 100, height: 100 });

    if (!worldMap) {
      console.error(
        `[MapManager] Failed to generate ${PRIMARY_WORLD_MAP_ID} with seed: ${seed}. worldGenerator returned undefined.`,
      );
      return undefined;
    }

    // Assuming generateWorldMap correctly sets worldMap.id and worldMap.seed
    if (worldMap.seed !== seed) {
      console.warn(
        `[MapManager] Generated ${PRIMARY_WORLD_MAP_ID} has seed '${worldMap.seed}' which differs from requested seed '${seed}'. Using generated map's seed for caching consistency check.`,
      );
      // This case indicates an issue in `generateWorldMap` if it doesn't use the provided seed.
      // However, the map is generated, so we proceed with it.
    }

    loadedMaps.set(PRIMARY_WORLD_MAP_ID, worldMap);
    console.log(
      `[MapManager] Generated and cached ${PRIMARY_WORLD_MAP_ID} (Map ID: ${worldMap.id}) with seed: ${worldMap.seed}`,
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
