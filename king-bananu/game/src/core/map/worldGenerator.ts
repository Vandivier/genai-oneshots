import type { GameMap, MapCell, TerrainType } from '../../types/mapTypes';

// Simple seedable pseudo-random number generator (PRNG)
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
}

interface WorldGenerationParams {
  seed: string; // Use a string seed that can be converted to a number
  width: number;
  height: number;
}

function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export function generateWorldMap({
  seed,
  width,
  height,
}: WorldGenerationParams): GameMap {
  const numericSeed = stringToSeed(seed);
  const random = new SeededRandom(numericSeed);
  const cells: MapCell[][] = [];

  for (let y = 0; y < height; y++) {
    cells[y] = [];
    for (let x = 0; x < width; x++) {
      // Basic placeholder generation logic
      const rVal = random.next();
      let terrain: TerrainType = 'grass';
      let isWalkable = true;

      if (rVal < 0.1) {
        terrain = 'water';
        isWalkable = false;
      } else if (rVal < 0.3) {
        terrain = 'forest';
      } else if (rVal < 0.4) {
        terrain = 'mountain';
        isWalkable = false;
      }

      cells[y][x] = {
        x,
        y,
        terrain,
        isWalkable,
      };
    }
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
