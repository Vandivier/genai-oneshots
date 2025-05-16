import type { GameMap, MapCell } from '../../types/mapTypes';
import { TerrainType, PREVIOUS_MAP_SENTINEL } from '../../types/mapTypes';
import LABY from 'labyrinthos'; // Import Labyrinthos

// Our custom SeededRandom might still be useful for non-Labyrinthos specific RNG
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  public next(): number {
    // Calculate next seed value using LCG parameters
    this.seed = this.seed * 1664525 + 1013904223;
    // Convert to an unsigned 32-bit integer and divide by 2^32 to get a float in [0, 1)
    return (this.seed >>> 0) / Math.pow(2, 32);
  }

  public nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

interface WorldGenerationParams {
  seed: string; // Use a string seed that can be converted to a number
  width: number;
  height: number;
  numTowns?: number;
}

function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash); // Ensure positive seed for PRNG consistency
}

// Convert Labyrinthos Perlin noise value (0-1) to our terrain types
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

  for (let attempts = 0; attempts < 50; attempts++) {
    // Try 50 times to find a spot
    const startX = rng.nextInt(1, width - townWidth - 2);
    const startY = rng.nextInt(1, height - townHeight - 2);

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
            if (!doorPlaced && (y === buildingY || x === buildingX)) {
              let doorX = -1,
                doorY = -1;
              // Prioritize doors leading to town_floor and not blocked
              // Check bottom side of building (player enters from below)
              if (
                y === buildingY + buildingHeight - 1 && // bottom edge of building
                buildingY + buildingHeight < startY + townHeight && // ensure not on town border
                cells[y + 1]?.[x]?.terrain === TerrainType.town_floor // space below is town_floor
              ) {
                doorY = y + 1;
                doorX = x;
              }
              // Check right side of building (player enters from right)
              else if (
                x === buildingX + buildingWidth - 1 && // right edge of building
                buildingX + buildingWidth < startX + townWidth && // ensure not on town border
                cells[y]?.[x + 1]?.terrain === TerrainType.town_floor // space to right is town_floor
              ) {
                doorY = y;
                doorX = x + 1;
              }
              // Check top side of building (player enters from above)
              else if (
                y === buildingY &&
                buildingY > startY && // ensure not on town border
                cells[y - 1]?.[x]?.terrain === TerrainType.town_floor
              ) {
                doorY = y - 1;
                doorX = x;
              }
              // Check left side of building (player enters from left)
              else if (
                x === buildingX &&
                buildingX > startX && // ensure not on town border
                cells[y]?.[x - 1]?.terrain === TerrainType.town_floor
              ) {
                doorY = y - 1; // This was y - 1, should be just y for door cell
                doorX = x - 1; // Door is placed on town_floor adjacent to wall
              }

              if (
                doorX !== -1 &&
                doorY !== -1 &&
                cells[doorY]?.[doorX]?.terrain === TerrainType.town_floor
              ) {
                cells[doorY][doorX].terrain = TerrainType.building_door;
                cells[doorY][doorX].walkable = true;
                cells[doorY][doorX].leadsTo = {
                  mapId: TOWN_INTERIOR_MAP_ID,
                  targetX: TOWN_ENTRY_X,
                  targetY: TOWN_ENTRY_Y,
                };
                doorPlaced = true;
              }
            }
          }
        }
        // Fallback door placement if the above failed (e.g. building against town edge)
        if (!doorPlaced) {
          // Attempt to place door on first available town_floor adjacent to building wall
          for (let by = buildingY; by < buildingY + buildingHeight; by++) {
            if (
              cells[by]?.[buildingX - 1]?.terrain === TerrainType.town_floor
            ) {
              cells[by][buildingX].terrain = TerrainType.building_door;
              cells[by][buildingX].walkable = true;
              doorPlaced = true;
              break;
            }
            if (
              cells[by]?.[buildingX + buildingWidth]?.terrain ===
              TerrainType.town_floor
            ) {
              cells[by][buildingX + buildingWidth - 1].terrain =
                TerrainType.building_door;
              cells[by][buildingX + buildingWidth - 1].walkable = true;
              doorPlaced = true;
              break;
            }
          }
          if (!doorPlaced) {
            for (let bx = buildingX; bx < buildingX + buildingWidth; bx++) {
              if (
                cells[buildingY - 1]?.[bx]?.terrain === TerrainType.town_floor
              ) {
                cells[buildingY][bx].terrain = TerrainType.building_door;
                cells[buildingY][bx].walkable = true;
                doorPlaced = true;
                break;
              }
              if (
                cells[buildingY + buildingHeight]?.[bx]?.terrain ===
                TerrainType.town_floor
              ) {
                cells[buildingY + buildingHeight - 1][bx].terrain =
                  TerrainType.building_door;
                cells[buildingY + buildingHeight - 1][bx].walkable = true;
                doorPlaced = true;
                break;
              }
            }
          }
        }
      }
      placed = true;
      break;
    }
  }
  return placed;
}

export function generateWorldMap({
  seed,
  width,
  height,
  numTowns = 1,
}: WorldGenerationParams): GameMap {
  const numericSeed = stringToSeed(seed);
  const gridCells: MapCell[][] = initializeMap(
    width,
    height,
    TerrainType.water,
  );

  // 1. Initialize Labyrinthos TileMap
  const labyMap = new LABY.TileMap({
    width: width,
    height: height,
  });

  // 2. Generate Perlin Noise using Labyrinthos, modifying labyMap.data in place
  // Labyrinthos PerlinNoise takes a numeric seed.
  LABY.terrains.PerlinNoise(labyMap, { seed: numericSeed });

  // 3. Convert Labyrinthos map data to our GameMap cell structure
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const perlinValue = labyMap.data[y * width + x]; // Labyrinthos stores 2D data in a 1D array
      const { terrain, walkable } = getTerrainFromPerlinValue(perlinValue);
      gridCells[y][x] = {
        x,
        y,
        terrain,
        walkable,
        blocksSight:
          terrain === TerrainType.mountain || terrain === TerrainType.forest,
        leadsTo: gridCells[y][x]?.leadsTo, // Preserve leadsTo if already set (e.g. by pre-init steps, though not current)
      };
    }
  }

  // 4. Place towns. Use a new SeededRandom instance for town placement details based on the original seed.
  const townRng = new SeededRandom(numericSeed + 1); // Offset seed for variety in town details
  for (let i = 0; i < numTowns; i++) {
    placeTown(gridCells, townRng, width, height);
  }

  return {
    id: `worldmap_${seed}`,
    name: `World Map (Seed: ${seed})`,
    width,
    height,
    grid: gridCells,
    seed: seed, // Ensure the original string seed is part of the GameMap object
    type: 'world', // Added map type
  };
}

export function generateTownInteriorMap(mapId: string, seed?: string): GameMap {
  const width = 20;
  const height = 15;
  const gridCells: MapCell[][] = initializeMap(
    width,
    height,
    TerrainType.town_floor,
  );

  // Add surrounding walls
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        gridCells[y][x].terrain = TerrainType.building_wall;
        gridCells[y][x].walkable = false;
        gridCells[y][x].blocksSight = true; // Walls block sight
      }
    }
  }

  // Place an exit door
  const exitDoorX = Math.floor(width / 2);
  const exitDoorY = height - 1;
  if (gridCells[exitDoorY]?.[exitDoorX]) {
    gridCells[exitDoorY][exitDoorX].terrain = TerrainType.building_door;
    gridCells[exitDoorY][exitDoorX].walkable = true;
    gridCells[exitDoorY][exitDoorX].blocksSight = false; // Doors don't block sight
    gridCells[exitDoorY][exitDoorX].leadsTo = {
      mapId: PREVIOUS_MAP_SENTINEL,
      targetX: 0,
      targetY: 0,
    };
  }

  const numericSeedForInterior = stringToSeed(seed || `${mapId}_fixed_seed`);

  return {
    id: mapId,
    name: 'Town Interior',
    width,
    height,
    grid: gridCells,
    seed: numericSeedForInterior.toString(), // Use the generated numeric seed string
    type: 'interior', // Added map type
  };
}

// TODO: Add more sophisticated generation algorithms (e.g., Perlin noise, cellular automata)
// TODO: Add functions to generate town maps and dungeon maps (could be procedural or pre-defined)
