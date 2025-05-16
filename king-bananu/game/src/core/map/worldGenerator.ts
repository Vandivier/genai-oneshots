import type { GameMap, MapCell, TerrainType } from '../../types/mapTypes';
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
  isWalkable: boolean;
} {
  if (value < 0.35) return { terrain: 'water', isWalkable: false }; // Deep water
  if (value < 0.4) return { terrain: 'grass', isWalkable: true }; // Shallow water / beach transition (rendered as grass for now)
  if (value < 0.65) return { terrain: 'grass', isWalkable: true }; // Grassland
  if (value < 0.8) return { terrain: 'forest', isWalkable: true }; // Forest
  return { terrain: 'mountain', isWalkable: false }; // Mountains
}

function initializeMap(
  width: number,
  height: number,
  defaultTerrain: TerrainType = 'water',
): MapCell[][] {
  const cells: MapCell[][] = [];
  for (let y = 0; y < height; y++) {
    cells[y] = [];
    for (let x = 0; x < width; x++) {
      cells[y][x] = {
        x,
        y,
        terrain: defaultTerrain,
        isWalkable:
          defaultTerrain !== 'water' &&
          defaultTerrain !== 'mountain' &&
          defaultTerrain !== 'building_wall',
      };
    }
  }
  return cells;
}

function createLandmasses(
  cells: MapCell[][],
  rng: SeededRandom,
  width: number,
  height: number,
) {
  const numLandSources = rng.nextInt(5, 10);
  for (let i = 0; i < numLandSources; i++) {
    let sx = rng.nextInt(0, width - 1);
    let sy = rng.nextInt(0, height - 1);
    const landSize = rng.nextInt(
      Math.floor(width * height * 0.05),
      Math.floor(width * height * 0.15),
    );

    for (let j = 0; j < landSize; j++) {
      if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
        if (cells[sy][sx].terrain === 'water') {
          // Only convert water to grass
          cells[sy][sx].terrain = 'grass';
          cells[sy][sx].isWalkable = true;
        }
      }
      // Random walk
      const move = rng.nextInt(0, 3);
      if (move === 0 && sx < width - 1) sx++;
      else if (move === 1 && sx > 0) sx--;
      else if (move === 2 && sy < height - 1) sy++;
      else if (move === 3 && sy > 0) sy--;
    }
  }
}

function addTerrainFeatures(
  cells: MapCell[][],
  rng: SeededRandom,
  width: number,
  height: number,
) {
  // Add forests
  const numForestPatches = rng.nextInt(10, 20);
  for (let i = 0; i < numForestPatches; i++) {
    let fx = rng.nextInt(0, width - 1);
    let fy = rng.nextInt(0, height - 1);
    const forestPatchSize = rng.nextInt(20, 100);
    for (let j = 0; j < forestPatchSize; j++) {
      if (
        fx >= 0 &&
        fx < width &&
        fy >= 0 &&
        fy < height &&
        cells[fy][fx].terrain === 'grass'
      ) {
        cells[fy][fx].terrain = 'forest'; // Forests are walkable
      }
      const move = rng.nextInt(0, 3);
      if (move === 0 && fx < width - 1) fx++;
      else if (move === 1 && fx > 0) fx--;
      else if (move === 2 && fy < height - 1) fy++;
      else if (move === 3 && fy > 0) fy--;
    }
  }

  // Add mountains
  const numMountainRanges = rng.nextInt(5, 10);
  for (let i = 0; i < numMountainRanges; i++) {
    let mx = rng.nextInt(0, width - 1);
    let my = rng.nextInt(0, height - 1);
    const mountainRangeSize = rng.nextInt(30, 150);
    for (let j = 0; j < mountainRangeSize; j++) {
      if (
        mx >= 0 &&
        mx < width &&
        my >= 0 &&
        my < height &&
        cells[my][mx].terrain !== 'water'
      ) {
        cells[my][mx].terrain = 'mountain';
        cells[my][mx].isWalkable = false;
      }
      const move = rng.nextInt(0, 7); // More spread for mountains
      if (move === 0 && mx < width - 1) mx++;
      else if (move === 1 && mx > 0) mx--;
      else if (move === 2 && my < height - 1) my++;
      else if (move === 3 && my > 0) my--;
      else if (move === 4 && mx < width - 1 && my < height - 1) {
        mx++;
        my++;
      } else if (move === 5 && mx > 0 && my > 0) {
        mx--;
        my--;
      } else if (move === 6 && mx < width - 1 && my > 0) {
        mx++;
        my--;
      } else if (move === 7 && mx > 0 && my < height - 1) {
        mx--;
        my++;
      }
    }
  }
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
          cells[y][x].terrain === 'water' ||
          cells[y][x].terrain === 'mountain'
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
          cells[y][x].terrain = 'town_floor';
          cells[y][x].isWalkable = true;
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
            cells[y][x].terrain = 'building_wall';
            cells[y][x].isWalkable = false;
            // Place a door on one side of the building
            if (!doorPlaced && (y === buildingY || x === buildingX)) {
              let doorX = -1,
                doorY = -1;
              if (rng.next() > 0.5) {
                if (
                  x === buildingX &&
                  cells[y]?.[x - 1]?.terrain === 'town_floor'
                ) {
                  doorX = x;
                  doorY = y;
                } else if (
                  x === buildingX + buildingWidth - 1 &&
                  cells[y]?.[x + 1]?.terrain === 'town_floor'
                ) {
                  doorX = x;
                  doorY = y;
                }
              } else {
                if (
                  y === buildingY &&
                  cells[y - 1]?.[x]?.terrain === 'town_floor'
                ) {
                  doorX = x;
                  doorY = y;
                } else if (
                  y === buildingY + buildingHeight - 1 &&
                  cells[y + 1]?.[x]?.terrain === 'town_floor'
                ) {
                  doorX = x;
                  doorY = y;
                }
              }
              if (doorX !== -1) {
                cells[doorY][doorX].terrain = 'building_door';
                cells[doorY][doorX].isWalkable = true;
                doorPlaced = true;
              }
            }
          }
        }
        // Fallback door placement if the above failed (e.g. building against town edge)
        if (!doorPlaced) {
          // Attempt to place door on first available town_floor adjacent to building wall
          for (let by = buildingY; by < buildingY + buildingHeight; by++) {
            if (cells[by]?.[buildingX - 1]?.terrain === 'town_floor') {
              cells[by][buildingX].terrain = 'building_door';
              cells[by][buildingX].isWalkable = true;
              doorPlaced = true;
              break;
            }
            if (
              cells[by]?.[buildingX + buildingWidth]?.terrain === 'town_floor'
            ) {
              cells[by][buildingX + buildingWidth - 1].terrain =
                'building_door';
              cells[by][buildingX + buildingWidth - 1].isWalkable = true;
              doorPlaced = true;
              break;
            }
          }
          if (!doorPlaced) {
            for (let bx = buildingX; bx < buildingX + buildingWidth; bx++) {
              if (cells[buildingY - 1]?.[bx]?.terrain === 'town_floor') {
                cells[buildingY][bx].terrain = 'building_door';
                cells[buildingY][bx].isWalkable = true;
                doorPlaced = true;
                break;
              }
              if (
                cells[buildingY + buildingHeight]?.[bx]?.terrain ===
                'town_floor'
              ) {
                cells[buildingY + buildingHeight - 1][bx].terrain =
                  'building_door';
                cells[buildingY + buildingHeight - 1][bx].isWalkable = true;
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
  const rng = new SeededRandom(numericSeed);
  const cells = initializeMap(width, height, 'water');

  createLandmasses(cells, rng, width, height);
  addTerrainFeatures(cells, rng, width, height);

  // 1. Initialize Labyrinthos TileMap
  const labyMap = new LABY.TileMap({
    width: width,
    height: height,
  });

  // 2. Generate Perlin Noise using Labyrinthos
  // Labyrinthos's PerlinNoise modifies the labyMap.data in place with values 0-1
  LABY.terrains.PerlinNoise(labyMap, { seed: numericSeed });
  // Note: Labyrinthos PerlinNoise might directly fill with tile IDs if a tileSet is provided.
  // We are using its raw 0-1 output for now.

  // 3. Convert Labyrinthos map data to our GameMap cell structure
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const perlinValue = labyMap.data[y * width + x]; // Labyrinthos stores 2D data in a 1D array
      const { terrain, isWalkable } = getTerrainFromPerlinValue(perlinValue);
      cells[y][x] = {
        x,
        y,
        terrain,
        isWalkable,
      };
    }
  }

  // 4. Place towns using our existing function (which now uses our SeededRandom)
  const townRng = new SeededRandom(numericSeed + 1); // Use a slightly different seed for town placement details
  for (let i = 0; i < numTowns; i++) {
    placeTown(cells, townRng, width, height);
  }

  return {
    id: `worldmap_${seed}`,
    name: 'World Map',
    width,
    height,
    cells,
  };
}

// TODO: Add more sophisticated generation algorithms (e.g., Perlin noise, cellular automata)
// TODO: Add functions to generate town maps and dungeon maps (could be procedural or pre-defined)
