import type { GameMap } from '../../types/mapTypes';
import { generateWorldMap } from './worldGenerator';

// In a real game, you might fetch this from an API, a file, or generate it.
const predefinedMaps: Record<string, GameMap> = {
  // Example: town_1: { id: 'town_1', name: 'Starting Village', ...cells }
};

const loadedMaps: Map<string, GameMap> = new Map();

export function getMap(mapId: string, seed?: string): GameMap | undefined {
  if (loadedMaps.has(mapId)) {
    return loadedMaps.get(mapId);
  }

  if (predefinedMaps[mapId]) {
    const map = predefinedMaps[mapId];
    loadedMaps.set(mapId, map);
    return map;
  }

  // Example: Procedurally generate world map if requested and not found
  // A more robust system would be needed for various procedural map types.
  if (mapId.startsWith('worldmap_') && seed) {
    const existingWorldMap = Array.from(loadedMaps.values()).find(
      (m) => m.id === mapId && m.name === 'World Map',
    );
    if (existingWorldMap) return existingWorldMap;

    // Dimensions for the world map - can be configured elsewhere
    const worldMap = generateWorldMap({ seed, width: 100, height: 100 });
    loadedMaps.set(worldMap.id, worldMap);
    return worldMap;
  }

  // TODO: Implement loading for dungeon maps, town maps (could be predefined or procedural)
  console.warn(`Map with id "${mapId}" not found.`);
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
