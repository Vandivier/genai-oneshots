import type { GameMap, MapCell, City } from '../../types/mapTypes';
import {
  TerrainType,
  PREVIOUS_MAP_SENTINEL,
  PRIMARY_WORLD_MAP_ID,
} from '../../types/mapTypes';
import { createNoise2D } from 'simplex-noise';
import { predefinedCitiesMetadata, predefinedCityMaps } from './predefinedMaps'; // Import new metadata and maps

// Our custom SeededRandom for seeding simplex-noise
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Method to be used by simplex-noise, must return 0-1
  public next(): number {
    this.seed = this.seed * 1664525 + 1013904223;
    return (this.seed >>> 0) / Math.pow(2, 32);
  }

  public nextInt(min: number, max: number): number {
    if (min > max) [min, max] = [max, min];
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

interface WorldGenerationParams {
  seed: string;
  width: number;
  height: number;
  numTowns?: number | undefined;
}

function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// Convert SimplexNoise value (0-1) to our terrain types
function getTerrainFromPerlinValue(value: number): {
  terrain: TerrainType;
  walkable: boolean;
} {
  if (value < 0.35) return { terrain: TerrainType.water, walkable: false }; // Deep water
  if (value < 0.4) return { terrain: TerrainType.grass, walkable: true }; // Shallow water / beach transition
  if (value < 0.65) return { terrain: TerrainType.grass, walkable: true }; // Grassland
  if (value < 0.8) return { terrain: TerrainType.forest, walkable: true }; // Forest
  return { terrain: TerrainType.mountain, walkable: false }; // Mountains
}

function initializeMap(
  width: number,
  height: number,
  defaultTerrain: TerrainType = TerrainType.water,
): MapCell[][] {
  const cells: MapCell[][] = [];
  for (let y = 0; y < height; y++) {
    cells[y] = [];
    for (let x = 0; x < width; x++) {
      cells[y][x] = {
        terrain: defaultTerrain,
        walkable:
          defaultTerrain !== TerrainType.water &&
          defaultTerrain !== TerrainType.mountain &&
          defaultTerrain !== TerrainType.building_wall,
        blocksSight:
          defaultTerrain === TerrainType.mountain ||
          defaultTerrain === TerrainType.building_wall ||
          defaultTerrain === TerrainType.forest,
      };
    }
  }
  return cells;
}

function placeTown(
  cells: MapCell[][],
  rng: SeededRandom,
  width: number,
  height: number,
): boolean {
  const townWidth = rng.nextInt(8, 15);
  const townHeight = rng.nextInt(8, 15);
  let placed = false;

  const TOWN_INTERIOR_MAP_ID = 'town_interior_default'; // Standard ID for default town interiors
  const TOWN_ENTRY_X = 5; // Standard entry point X for default town interiors
  const TOWN_ENTRY_Y = 5; // Standard entry point Y for default town interiors

  for (let attempts = 0; attempts < 10; attempts++) {
    // Try 10 times to find a spot
    const startX = rng.nextInt(1, width - townWidth - 2);
    const startY = rng.nextInt(1, height - townHeight - 2);

    if (
      startX < 1 ||
      startY < 1 ||
      startX + townWidth >= width - 1 ||
      startY + townHeight >= height - 1
    )
      continue;

    // Check if area is relatively flat and not water/mountain
    let suitable = true;
    for (let y = startY - 1; y < startY + townHeight + 1; y++) {
      for (let x = startX - 1; x < startX + townWidth + 1; x++) {
        if (
          x < 0 ||
          x >= width ||
          y < 0 ||
          y >= height ||
          cells[y][x].terrain === TerrainType.water ||
          cells[y][x].terrain === TerrainType.mountain
        ) {
          suitable = false;
          break;
        }
      }
      if (!suitable) break;
    }

    if (suitable) {
      // Place town floor
      for (let y = startY; y < startY + townHeight; y++) {
        for (let x = startX; x < startX + townWidth; x++) {
          cells[y][x].terrain = TerrainType.town_floor;
          cells[y][x].walkable = true;
        }
      }
      // Place some buildings (simple rectangles)
      const numBuildings = rng.nextInt(2, 5);
      for (let i = 0; i < numBuildings; i++) {
        const buildingX = startX + rng.nextInt(1, townWidth - 5);
        const buildingY = startY + rng.nextInt(1, townHeight - 5);
        const buildingWidth = rng.nextInt(3, 5);
        const buildingHeight = rng.nextInt(3, 5);
        let doorPlaced = false;
        for (
          let y = buildingY;
          y < Math.min(startY + townHeight - 1, buildingY + buildingHeight);
          y++
        ) {
          for (
            let x = buildingX;
            x < Math.min(startX + townWidth - 1, buildingX + buildingWidth);
            x++
          ) {
            if (x >= startX + townWidth - 1 || y >= startY + townHeight - 1)
              continue; // bounds check
            cells[y][x].terrain = TerrainType.building_wall;
            cells[y][x].walkable = false;
            // Place a door on one side of the building
            if (
              !doorPlaced &&
              (y === buildingY ||
                x === buildingX ||
                y === buildingY + buildingHeight - 1 ||
                x === buildingX + buildingWidth - 1)
            ) {
              const potentialDoorPositions = [
                { r: y, c: x - 1 },
                { r: y, c: x + 1 },
                { r: y - 1, c: x },
                { r: y + 1, c: x },
              ];

              for (const p of potentialDoorPositions) {
                if (
                  p.r >= startY &&
                  p.r < startY + townHeight &&
                  p.c >= startX &&
                  p.c < startX + townWidth &&
                  cells[p.r]?.[p.c]?.terrain === TerrainType.town_floor
                ) {
                  cells[p.r][p.c].terrain = TerrainType.building_door;
                  cells[p.r][p.c].walkable = true;
                  cells[p.r][p.c].leadsTo = {
                    mapId: TOWN_INTERIOR_MAP_ID,
                    targetX: TOWN_ENTRY_X,
                    targetY: TOWN_ENTRY_Y,
                  };
                  doorPlaced = true;
                  break;
                }
              }
              if (doorPlaced) break;
            }
          }
          if (doorPlaced) break;
        }
      }
      placed = true;
      break;
    }
  }
  return placed;
}

// Updated function to generate the main geography layer using SimplexNoise
function generateMainGeographyLayer(
  width: number,
  height: number,
  seed: number, // Use the numeric seed to create a SeededRandom instance
): Pick<GameMap, 'grid' | 'width' | 'height'> {
  const mapCells: MapCell[][] = Array(height)
    .fill(null)
    .map((_, y) =>
      Array(width)
        .fill(null)
        .map(
          (_, x) =>
            ({
              terrain: TerrainType.grass,
              walkable: true,
              x,
              y,
              blocksSight: false,
            }) as MapCell,
        ),
    );

  const prng = new SeededRandom(seed);
  const noise2D = createNoise2D(prng.next.bind(prng)); // Pass the bound .next method
  const noiseScale = 0.05;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const rawValue = noise2D(x * noiseScale, y * noiseScale);
      const normalizedValue = (rawValue + 1) / 2;
      const { terrain, walkable } = getTerrainFromPerlinValue(normalizedValue);
      mapCells[y][x].terrain = terrain;
      mapCells[y][x].walkable = walkable;
      mapCells[y][x].blocksSight =
        terrain === TerrainType.mountain ||
        terrain === TerrainType.forest ||
        terrain === TerrainType.building_wall;
    }
  }
  return { grid: mapCells, width, height };
}

// New function for the CityPlanner layer
function generateCityPlannerLayer(
  gameMap: GameMap, // Pass the whole GameMap to modify its grid and cities list
  _rng: SeededRandom, // RNG might be used later for dynamic aspects
  citiesMetadata: City[],
): void {
  gameMap.cities = []; // Initialize or clear existing cities

  for (const cityMeta of citiesMetadata) {
    const { id, name, x, y, population, race, religion } = cityMeta;

    // Ensure coordinates are within map bounds
    if (x >= 0 && x < gameMap.width && y >= 0 && y < gameMap.height) {
      const cell = gameMap.grid[y][x];

      cell.terrain = TerrainType.city_marker;
      cell.walkable = true; // Typically, you can walk onto a city marker
      cell.blocksSight = false; // City markers usually don't block sight

      // Determine the mapId for leadsTo (e.g., port_pescado from city_port_pescado)
      // This assumes a convention like cityMeta.id = "city_actualmapid"
      const targetMapId = id.replace(/^city_/, '');
      const cityMapDefinition = predefinedCityMaps[targetMapId];

      let targetX = 0;
      let targetY = 0;

      if (cityMapDefinition && cityMapDefinition.entryPoints?.main) {
        targetX = cityMapDefinition.entryPoints.main.x;
        targetY = cityMapDefinition.entryPoints.main.y;
      } else if (cityMapDefinition) {
        // Fallback if no main entry point, e.g. center of the city map
        targetX = Math.floor(cityMapDefinition.width / 2);
        targetY = Math.floor(cityMapDefinition.height / 2);
        console.warn(
          `[CityPlanner] City ${name} (map: ${targetMapId}) is missing a main entry point. Defaulting to ${targetX},${targetY}`,
        );
      }

      cell.leadsTo = {
        mapId: targetMapId,
        targetX: targetX,
        targetY: targetY,
      };
      cell.interaction = {
        type: 'city_entrance', // Custom interaction type for city entrances
        cityId: id, // Link to the City metadata id
      };

      // Add to the GameMap's list of cities
      gameMap.cities.push({
        id,
        name,
        x, // World map x
        y, // World map y
        population,
        race,
        religion,
      });
    } else {
      console.warn(
        `[CityPlanner] City ${name} (${id}) at ${x},${y} is outside map bounds (${gameMap.width}x${gameMap.height}). Skipping.`,
      );
    }
  }
}

export function generateWorldMap({
  seed,
  width,
  height,
  numTowns,
}: WorldGenerationParams): GameMap {
  const numericSeed = stringToSeed(seed);
  const rng = new SeededRandom(numericSeed); // Still useful for things like numTowns calculation and town placement

  // 1. Generate the base geography using the numericSeed for SimplexNoise
  const {
    grid: mapCellsFromGeoLayer,
    width: mapWidth,
    height: mapHeight,
  } = generateMainGeographyLayer(width, height, numericSeed);

  const gameMap: GameMap = {
    id: PRIMARY_WORLD_MAP_ID,
    seed: seed,
    type: 'world',
    width: mapWidth,
    height: mapHeight,
    grid: mapCellsFromGeoLayer,
    cities: [],
  };

  // 2. Place predefined cities (CityPlanner Layer)
  generateCityPlannerLayer(gameMap, rng, predefinedCitiesMetadata);

  // 3. Place procedurally generated towns
  let targetTownCount: number;
  if (numTowns !== undefined) {
    targetTownCount = numTowns;
  } else {
    const maxPossibleTargetTowns = Math.floor(0.1 * width * height);
    const actualMaxTarget = Math.max(0, maxPossibleTargetTowns);
    targetTownCount = rng.nextInt(0, actualMaxTarget);
    if (
      targetTownCount > 20 ||
      (width * height > 1000 && targetTownCount > width * height * 0.01)
    ) {
      console.warn(
        `[worldGenerator] Target town count is ${targetTownCount} (up to 10% of ${width}x${height}=${width * height} cells, based on seed). The generator will attempt to place up to this many towns within 50 total placement tries.`,
      );
    }
  }

  let townsPlaced = 0;
  const MAX_TOTAL_PLACEMENT_ATTEMPTS = 50;
  for (
    let i = 0;
    i < MAX_TOTAL_PLACEMENT_ATTEMPTS && townsPlaced < targetTownCount;
    i++
  ) {
    if (placeTown(gameMap.grid, rng, width, height)) {
      townsPlaced++;
    }
  }

  if (targetTownCount > 0 && townsPlaced === 0) {
    console.log(
      `[worldGenerator] Targeted ${targetTownCount} towns, but failed to place any within ${MAX_TOTAL_PLACEMENT_ATTEMPTS} attempts on map '${seed}'.`,
    );
  } else if (townsPlaced < targetTownCount && targetTownCount > 0) {
    console.log(
      `[worldGenerator] Targeted ${targetTownCount} towns, successfully placed ${townsPlaced} on map '${seed}' within ${MAX_TOTAL_PLACEMENT_ATTEMPTS} attempts.`,
    );
  } else if (
    townsPlaced > 0 &&
    targetTownCount > 0 &&
    townsPlaced === targetTownCount
  ) {
    console.log(
      `[worldGenerator] Successfully placed all targeted ${townsPlaced} towns on map '${seed}'.`,
    );
  }

  return gameMap;
}

export function generateTownInteriorMap(mapId: string, seed?: string): GameMap {
  const interiorWidth = 15;
  const interiorHeight = 10;
  const interiorCells = initializeMap(
    interiorWidth,
    interiorHeight,
    TerrainType.empty,
  );
  const rng = new SeededRandom(stringToSeed(seed || mapId));

  for (let y = 1; y < interiorHeight - 1; y++) {
    for (let x = 1; x < interiorWidth - 1; x++) {
      interiorCells[y][x].terrain = TerrainType.town_floor;
      interiorCells[y][x].walkable = true;
    }
  }

  for (let y = 0; y < interiorHeight; y++) {
    interiorCells[y][0].terrain = TerrainType.building_wall;
    interiorCells[y][0].walkable = false;
    interiorCells[y][interiorWidth - 1].terrain = TerrainType.building_wall;
    interiorCells[y][interiorWidth - 1].walkable = false;
  }
  for (let x = 0; x < interiorWidth; x++) {
    interiorCells[0][x].terrain = TerrainType.building_wall;
    interiorCells[0][x].walkable = false;
    interiorCells[interiorHeight - 1][x].terrain = TerrainType.building_wall;
    interiorCells[interiorHeight - 1][x].walkable = false;
  }

  const doorX = Math.floor(interiorWidth / 2);
  const doorY = interiorHeight - 2;
  if (interiorCells[doorY]?.[doorX]) {
    interiorCells[doorY][doorX].terrain = TerrainType.building_door;
    interiorCells[doorY][doorX].walkable = true;
    interiorCells[doorY][doorX].leadsTo = {
      mapId: PREVIOUS_MAP_SENTINEL,
      targetX: 0,
      targetY: 0,
    };
  }

  if (rng.next() > 0.5) {
    const npcX = rng.nextInt(2, interiorWidth - 3);
    const npcY = rng.nextInt(2, interiorHeight - 3);
    if (interiorCells[npcY]?.[npcX]?.terrain === TerrainType.town_floor) {
      interiorCells[npcY][npcX].interaction = { type: 'npc' };
    }
  }

  return {
    id: mapId,
    name: 'Building Interior',
    seed: seed || mapId,
    width: interiorWidth,
    height: interiorHeight,
    grid: interiorCells,
    type: 'interior',
  };
}

// TODO: Add more sophisticated generation algorithms (e.g., Perlin noise, cellular automata)
// TODO: Add functions to generate town maps and dungeon maps (could be procedural or pre-defined)
