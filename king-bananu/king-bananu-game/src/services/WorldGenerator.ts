import { createNoise2D } from "simplex-noise";
import Alea from "alea";

export interface TileData {
  x: number;
  y: number;
  tileIndex: number; // Index corresponding to our placeholder tiles
  terrainType: string; // e.g., 'water', 'land', 'grass', 'forest', 'hills', 'mountains', 'road'
}

export interface WorldGenerationParams {
  width: number; // in tiles
  height: number; // in tiles
  seed: string;
  scale: number; // Noise scale factor for base elevation
  octaves: number;
  persistence: number;
  lacunarity: number;
  waterThreshold: number; // Noise value < waterThreshold = water
  landThreshold: number; // waterThreshold <= Noise value < landThreshold = land
  grassThreshold: number; // landThreshold <= Noise value < grassThreshold = grass (plains)
  hillsThreshold: number; // grassThreshold <= Noise value < hillsThreshold = hills
  // Noise value >= hillsThreshold = mountains

  // For features like forests, we might use a second noise map or different parameters
  forestScale?: number;
  forestThreshold?: number;
}

export class WorldGenerator {
  private noise2D: (x: number, y: number) => number;
  private featureNoise2D?: (x: number, y: number) => number; // For things like forests
  private params: WorldGenerationParams;

  constructor(params: WorldGenerationParams) {
    this.params = params;
    const prng = Alea(params.seed || undefined);
    this.noise2D = createNoise2D(prng);

    if (params.forestScale && params.forestThreshold) {
      // Use a different seed or variant for feature noise to make it distinct
      const featurePrng = Alea((params.seed || "default") + "_features");
      this.featureNoise2D = createNoise2D(featurePrng);
    }
  }

  public generateWorld(): TileData[][] {
    const worldData: TileData[][] = [];
    const { width, height, scale, octaves, persistence, lacunarity } =
      this.params;

    for (let y = 0; y < height; y++) {
      worldData[y] = [];
      for (let x = 0; x < width; x++) {
        const nx = x / scale;
        const ny = y / scale;

        let amplitude = 1;
        let frequency = 1;
        let elevationNoiseValue = 0;

        // Calculate base elevation noise
        for (let i = 0; i < octaves; i++) {
          elevationNoiseValue +=
            this.noise2D(nx * frequency, ny * frequency) * amplitude;
          amplitude *= persistence;
          frequency *= lacunarity;
        }
        const normalizedElevation =
          (Math.max(-1, Math.min(1, elevationNoiseValue)) + 1) / 2;

        let tileIndex = 0; // Default to water
        let terrainType = "water";

        // Determine base terrain type from elevation
        if (normalizedElevation < this.params.waterThreshold) {
          tileIndex = 0; // Water
          terrainType = "water";
        } else if (normalizedElevation < this.params.landThreshold) {
          tileIndex = 1; // Land (e.g., sand, bare earth)
          terrainType = "land";
        } else if (normalizedElevation < this.params.grassThreshold) {
          tileIndex = 2; // Grass (Plains)
          terrainType = "grass";
        } else if (normalizedElevation < this.params.hillsThreshold) {
          tileIndex = 4; // Hills (using index 4 for hills, 3 will be forest)
          terrainType = "hills";
        } else {
          tileIndex = 5; // Mountains
          terrainType = "mountains";
        }

        // Add features like forests on top of suitable base terrain (e.g., grass or land)
        if (
          this.featureNoise2D &&
          this.params.forestScale &&
          this.params.forestThreshold &&
          (terrainType === "grass" || terrainType === "land")
        ) {
          const fx = x / this.params.forestScale;
          const fy = y / this.params.forestScale;
          // Using a simpler noise calculation for features for now
          const forestNoiseValue = (this.featureNoise2D(fx, fy) + 1) / 2; // Normalized 0-1

          if (forestNoiseValue < this.params.forestThreshold) {
            tileIndex = 3; // Forest
            terrainType = "forest";
          }
        }

        // Roads are complex and typically not done with simple noise like this.
        // We will add a placeholder texture for roads but not generate them procedurally here.

        worldData[y][x] = {
          x,
          y,
          tileIndex,
          terrainType,
        };
      }
    }
    return worldData;
  }
}
